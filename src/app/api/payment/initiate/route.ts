import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

interface CartItem {
    id: string;
    quantity: number;
    price: number;
}

const PHONEPE_API_URL = process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

export async function POST(request: Request) {
    try {
        const { cart, shippingInfo, userId, total, promoCode, discountAmount, paymentMethod, shippingFee } = await request.json();

        // Validate required fields
        if (!cart || !total) {
            return NextResponse.json(
                { error: 'Cart and total are required' },
                { status: 400 }
            );
        }

        // Create order in database first with PENDING status
        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                total: total,
                shippingFee: shippingFee || 0,
                discountAmount: discountAmount || 0,
                promoCode: promoCode || null,
                status: 'PENDING',
                address: shippingInfo ? JSON.stringify(shippingInfo) : null,
                items: {
                    create: cart.map((item: CartItem) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                    })),
                },
            },
        });

        if (paymentMethod === 'phonepe') {
            const merchantId = process.env.PHONEPE_MERCHANT_ID;
            const saltKey = process.env.PHONEPE_SALT_KEY;
            const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

            if (!merchantId || !saltKey || merchantId === 'your_merchant_id') {
                // PhonePe not configured
                console.log('PhonePe not configured');
                await prisma.order.delete({ where: { id: order.id } });
                return NextResponse.json(
                    { error: 'PhonePe not configured' },
                    { status: 500 }
                );
            }

            // Generate unique transaction ID
            const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            // PhonePe payload
            const payloadData = {
                merchantId: merchantId,
                merchantTransactionId: transactionId,
                merchantUserId: userId || `GUEST${Date.now()}`,
                amount: Math.round(total * 100), // Convert to paise
                redirectUrl: `${baseUrl}/api/payment/callback?orderId=${order.id}&transactionId=${transactionId}`,
                redirectMode: 'REDIRECT',
                callbackUrl: `${baseUrl}/api/payment/webhook`,
                paymentInstrument: {
                    type: 'PAY_PAGE',
                },
            };

            // Encode payload to base64
            const base64Payload = Buffer.from(JSON.stringify(payloadData)).toString('base64');

            // Generate checksum
            const checksum = crypto
                .createHash('sha256')
                .update(base64Payload + '/pg/v1/pay' + saltKey)
                .digest('hex') + '###' + saltIndex;

            // Make request to PhonePe
            const response = await fetch(PHONEPE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                },
                body: JSON.stringify({
                    request: base64Payload,
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
                return NextResponse.json({
                    success: true,
                    redirectUrl: data.data.instrumentResponse.redirectInfo.url,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    transactionId: transactionId,
                    method: 'phonepe'
                });
            } else {
                await prisma.order.delete({ where: { id: order.id } });
                return NextResponse.json(
                    {
                        error: data.message || 'Payment initiation failed',
                        details: data
                    },
                    { status: 400 }
                );
            }
        } else {
            // Default to Razorpay
            const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpayKeyId || !razorpayKeySecret) {
                console.log('Razorpay not configured, returning mock success for testing');
                // For testing without Razorpay keys, return a mock success response
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

            const options = {
                amount: Math.round(total * 100), // amount in the smallest currency unit
                currency: "INR",
                receipt: order.id,
            };

            const razorpayOrder = await instance.orders.create(options);

            if (!razorpayOrder) {
                await prisma.order.delete({
                    where: { id: order.id },
                });
                return NextResponse.json(
                    { error: 'Failed to create Razorpay order' },
                    { status: 500 }
                );
            }

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
