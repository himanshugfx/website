import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const SHIPPING_FEE = 49;
const SHIPPING_THRESHOLD = 199;

interface CartItem {
    id: string;
    quantity: number;
}

const PHONEPE_API_URL = process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

export async function POST(request: Request) {
    try {
        const { cart, shippingInfo, userId, promoCode, paymentMethod, abandonedCheckoutId } = await request.json();

        // Validate required fields
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json(
                { error: 'Cart is required' },
                { status: 400 }
            );
        }

        // Validate userId if provided
        let finalUserId = userId || null;
        if (finalUserId) {
            const userExists = await prisma.user.findUnique({
                where: { id: finalUserId },
                select: { id: true }
            });
            if (!userExists) {
                console.warn(`Payment initiate: User ID ${finalUserId} not found. Falling back to guest checkout.`);
                finalUserId = null;
            }
        }

        // Require abandonedCheckoutId for guest checkouts to prevent trivial abuse
        if (!finalUserId && !abandonedCheckoutId) {
            return NextResponse.json({ error: 'Valid checkout session required' }, { status: 400 });
        }

        // Fetch product prices from DB — never trust client-supplied prices
        const productIds = cart.map((item: CartItem) => item.id);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true, name: true },
        });

        if (products.length !== productIds.length) {
            return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        // Calculate subtotal using DB prices
        let subtotal = 0;
        const validatedCart = cart.map((item: CartItem) => {
            const product = productMap.get(item.id);
            if (!product) throw new Error(`Product ${item.id} not found`);
            const quantity = Math.max(1, Math.floor(item.quantity));
            subtotal += product.price * quantity;
            return { id: item.id, quantity, price: product.price };
        });

        // Server-side promo code validation
        let discountAmount = 0;
        let validatedPromoCode: string | null = null;
        if (promoCode) {
            const promo = await prisma.promoCode.findUnique({
                where: { code: promoCode.toUpperCase() },
            });

            if (promo && promo.isActive &&
                (!promo.expiresAt || new Date(promo.expiresAt) >= new Date()) &&
                (!promo.minOrderValue || subtotal >= promo.minOrderValue)) {

                const usedCount = await prisma.order.count({
                    where: { promoCode: promo.code, paymentStatus: 'SUCCESSFUL' },
                });

                if (!promo.usageLimit || usedCount < promo.usageLimit) {
                    if (promo.discountType === 'PERCENTAGE') {
                        discountAmount = (subtotal * promo.discountValue) / 100;
                        if (promo.maxDiscount) discountAmount = Math.min(discountAmount, promo.maxDiscount);
                    } else {
                        discountAmount = promo.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                    validatedPromoCode = promo.code;
                }
            }
        }

        // Calculate shipping fee server-side
        const postDiscountSubtotal = subtotal - discountAmount;
        const shippingFee = postDiscountSubtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;

        // Final total
        const total = postDiscountSubtotal + shippingFee;

        // Create order in database first with PENDING status
        const order = await prisma.order.create({
            data: {
                userId: finalUserId,
                total,
                shippingFee,
                discountAmount,
                promoCode: validatedPromoCode,
                status: 'PENDING',
                customerName: shippingInfo ? `${shippingInfo.firstName} ${shippingInfo.lastName}` : null,
                customerEmail: shippingInfo?.email || null,
                customerPhone: shippingInfo?.phone || null,
                address: shippingInfo ? JSON.stringify(shippingInfo) : null,
                items: {
                    create: validatedCart.map((item: { id: string; quantity: number; price: number }) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                    })),
                },
            },
        });

        // 3. Link abandoned checkout if it exists
        if (abandonedCheckoutId) {
            await prisma.abandonedCheckout.updateMany({
                where: { id: abandonedCheckoutId },
                data: {
                    status: 'RECOVERED',
                },
            });
        }

        if (paymentMethod === 'phonepe') {
            const merchantId = process.env.PHONEPE_MERCHANT_ID;
            const saltKey = process.env.PHONEPE_SALT_KEY;
            const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

            if (!merchantId || !saltKey || merchantId === 'your_merchant_id') {
                console.log('PhonePe not configured');
                await prisma.order.delete({ where: { id: order.id } });
                return NextResponse.json(
                    { error: 'PhonePe not configured' },
                    { status: 500 }
                );
            }

            const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // Store transactionId on the order for webhook matching
            await prisma.order.update({
                where: { id: order.id },
                data: { transactionId },
            });

            const payloadData = {
                merchantId,
                merchantTransactionId: transactionId,
                merchantUserId: userId || `GUEST${Date.now()}`,
                amount: Math.round(total * 100),
                redirectUrl: `${baseUrl}/api/payment/callback?orderId=${order.id}&transactionId=${transactionId}`,
                redirectMode: 'REDIRECT',
                callbackUrl: `${baseUrl}/api/payment/webhook`,
                paymentInstrument: { type: 'PAY_PAGE' },
            };

            const base64Payload = Buffer.from(JSON.stringify(payloadData)).toString('base64');
            const checksum = crypto
                .createHash('sha256')
                .update(base64Payload + '/pg/v1/pay' + saltKey)
                .digest('hex') + '###' + saltIndex;

            const response = await fetch(PHONEPE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                },
                body: JSON.stringify({ request: base64Payload }),
            });

            const data = await response.json();

            if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
                return NextResponse.json({
                    success: true,
                    redirectUrl: data.data.instrumentResponse.redirectInfo.url,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    transactionId,
                    method: 'phonepe'
                });
            } else {
                await prisma.order.delete({ where: { id: order.id } });
                return NextResponse.json(
                    { error: data.message || 'Payment initiation failed', details: data },
                    { status: 400 }
                );
            }
        } else {
            // Default to Razorpay
            const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpayKeyId || !razorpayKeySecret) {
                console.log('Razorpay not configured, returning mock success for testing');
                return NextResponse.json({
                    success: true,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    razorpayOrderId: `order_mock_${Date.now()}`,
                    amount: Math.round(total * 100),
                    currency: 'INR',
                    key: 'mock_key',
                    method: 'razorpay'
                });
            }

            const instance = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            });

            const razorpayOrder = await instance.orders.create({
                amount: Math.round(total * 100),
                currency: 'INR',
                receipt: order.id,
            });

            if (!razorpayOrder) {
                await prisma.order.delete({ where: { id: order.id } });
                return NextResponse.json(
                    { error: 'Failed to create Razorpay order' },
                    { status: 500 }
                );
            }

            // Save Razorpay order ID to transactionId so it's not filtered out as "abandoned"
            await prisma.order.update({
                where: { id: order.id },
                data: { transactionId: razorpayOrder.id }
            });

            return NextResponse.json({
                success: true,
                orderId: order.id,
                orderNumber: order.orderNumber,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: razorpayKeyId,
                method: 'razorpay'
            });
        }

    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { error: 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
