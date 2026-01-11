import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface OrderItem {
    product: {
        name: string;
        thumbImage: string;
        slug: string;
    };
    quantity: number;
    price: number;
}

interface OrderWithItems {
    id: string;
    orderNumber: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    total: number;
    shippingFee: number;
    discountAmount: number;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}

/**
 * Order lookup API for Ana chatbot
 * Supports lookup by orderNumber or phone number
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const phone = searchParams.get('phone');

    if (!orderNumber && !phone) {
        return NextResponse.json({
            success: false,
            error: 'Please provide an order number or phone number'
        }, { status: 400 });
    }

    try {
        let order: OrderWithItems | null = null;

        if (orderNumber) {
            // Look up by order number
            const orderNum = parseInt(orderNumber, 10);
            if (isNaN(orderNum)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid order number format'
                }, { status: 400 });
            }

            order = await prisma.order.findFirst({
                where: { orderNumber: orderNum },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    thumbImage: true,
                                    slug: true
                                }
                            }
                        }
                    }
                }
            }) as OrderWithItems | null;
        } else if (phone) {
            // Look up by phone number - stored in customerPhone field
            order = await prisma.order.findFirst({
                where: {
                    customerPhone: {
                        contains: phone
                    }
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    thumbImage: true,
                                    slug: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }) as OrderWithItems | null;
        }

        if (!order) {
            return NextResponse.json({
                success: false,
                error: orderNumber
                    ? `No order found with number #${orderNumber}`
                    : `No orders found for phone number ${phone}`
            });
        }

        // Parse address if it's JSON, otherwise use as-is
        let addressStr = order.address || '';
        let city = '';
        let pincode = '';

        try {
            const addressObj = JSON.parse(order.address || '{}');
            addressStr = addressObj.address || order.address || '';
            city = addressObj.city || '';
            pincode = addressObj.postalCode || addressObj.pincode || '';
        } catch {
            // address is plain string, not JSON
        }

        // Format response (hide sensitive data)
        const response = {
            success: true,
            order: {
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                total: order.total,
                shippingFee: order.shippingFee,
                discountAmount: order.discountAmount,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                items: order.items.map((item: OrderItem) => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.product.thumbImage,
                    slug: item.product.slug
                })),
                shipping: {
                    name: order.customerName || 'Customer',
                    city: city,
                    address: addressStr,
                    pincode: pincode
                }
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Order lookup error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to look up order. Please try again.'
        }, { status: 500 });
    }
}
