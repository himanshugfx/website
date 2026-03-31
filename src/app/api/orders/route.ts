import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { sendAdminPushNotification } from '@/lib/notifications';

const SHIPPING_FEE = 49;
const SHIPPING_THRESHOLD = 199;

interface CartItem {
    id: string;
    quantity: number;
    name?: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cart, shippingInfo, userId, paymentMethod, promoCode } = body;

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
                console.warn(`Order creation: User ID ${finalUserId} not found. Falling back to guest checkout.`);
                finalUserId = null;
            }
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
        const total = postDiscountSubtotal + shippingFee;

        // Create order in database with items included for email
        const order = await prisma.order.create({
            data: {
                userId: finalUserId,
                total,
                shippingFee,
                discountAmount,
                promoCode: validatedPromoCode,
                status: 'PENDING',
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL',
                paymentMethod: paymentMethod || 'ONLINE',
                address: shippingInfo ? JSON.stringify(shippingInfo) : null,
                items: {
                    create: validatedCart.map((item: { id: string; quantity: number; price: number }) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price * item.quantity,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        // Update product quantities
        for (const item of validatedCart) {
            await prisma.product.update({
                where: { id: item.id },
                data: { quantity: { decrement: item.quantity } },
            });
        }

        // Send order notification email (fire-and-forget)
        emailService.sendOrderNotification({
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: order.items,
            total: order.total,
            shippingFee: order.shippingFee || 0,
            discountAmount: order.discountAmount || 0,
            paymentMethod: order.paymentMethod || 'ONLINE',
            shippingInfo: shippingInfo || null,
        }).catch(err => console.error('Failed to send order notification:', err));

        // Send push notification to admin devices
        sendAdminPushNotification(
            '🛒 New Order',
            `Order #${order.orderNumber} — ₹${order.total.toLocaleString('en-IN')} (${order.paymentMethod})`,
            { type: 'new_order', orderId: order.id, orderNumber: order.orderNumber }
        ).catch(err => console.error('Failed to send push notification:', err));

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully',
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Require authentication — users can only see their own orders
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const requestedUserId = searchParams.get('userId');

        // Enforce that the authenticated user can only fetch their own orders
        // Admins may pass any userId
        const isAdmin = (session.user as any).role === 'admin';
        const userId = isAdmin && requestedUserId ? requestedUserId : session.user.id;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                thumbImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const ordersWithTracking = orders.map(order => ({
            ...order,
            awbNumber: (order as any).awbNumber || null,
            shippingStatus: (order as any).shippingStatus || null,
            shippedAt: (order as any).shippedAt || null,
            deliveredAt: (order as any).deliveredAt || null,
            estimatedDelivery: (order as any).estimatedDelivery || null,
            trackingUrl: (order as any).trackingUrl || null,
            shippingProvider: (order as any).shippingProvider || null,
        }));

        return NextResponse.json({ orders: ordersWithTracking });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
