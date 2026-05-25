import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        // Get total revenue and total orders count
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const validOrdersWhere = {
            OR: [
                {
                    AND: [
                        { status: 'PENDING' },
                        {
                            NOT: {
                                AND: [
                                    { paymentStatus: 'PENDING' },
                                    { paymentMethod: { not: 'COD' } },
                                    { transactionId: null },
                                    { createdAt: { lt: oneDayAgo } }
                                ]
                            }
                        }
                    ]
                },
                { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } }
            ]
        };

        const [orders, invoices] = await Promise.all([
            prisma.order.findMany({
                where: validOrdersWhere,
                select: { total: true }
            }),
            prisma.invoice.findMany({
                where: {
                    status: { not: 'VOID' },
                    orderId: null
                },
                select: { total: true }
            })
        ]);

        const storeRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const invoiceRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalRevenue = storeRevenue + invoiceRevenue;

        // Get total orders count (excluding cancelled/abandoned)
        const totalOrders = await prisma.order.count({
            where: validOrdersWhere
        });

        // Get total products count
        const totalProducts = await prisma.product.count();

        // Get total users count
        const totalUsers = await prisma.user.count();

        // Get recent orders (last 7 days, excluding cancelled)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrdersCount = await prisma.order.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                },
                status: {
                    not: 'CANCELLED'
                }
            }
        });

        // Get revenue from last 7 days (including store orders and manual invoices, excluding cancelled)
        const [recentOrders, recentInvoices] = await Promise.all([
            prisma.order.findMany({
                where: {
                    createdAt: {
                        gte: sevenDaysAgo
                    },
                    status: {
                        not: 'CANCELLED'
                    }
                },
                select: { total: true }
            }),
            prisma.invoice.findMany({
                where: {
                    invoiceDate: {
                        gte: sevenDaysAgo
                    },
                    status: { not: 'VOID' },
                    orderId: null
                },
                select: { total: true }
            })
        ]);

        const recentStoreRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
        const recentInvoiceRevenue = recentInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const recentRevenue = recentStoreRevenue + recentInvoiceRevenue;

        return NextResponse.json({
            totalRevenue: totalRevenue || 0,
            totalOrders: totalOrders || 0,
            totalProducts: totalProducts || 0,
            totalUsers: totalUsers || 0,
            recentOrdersCount: recentOrdersCount || 0,
            recentRevenue: recentRevenue || 0,
            _debug: {
                counts: { orders: totalOrders, products: totalProducts, users: totalUsers },
                revenue_calc: { ordersLength: orders.length, total: totalRevenue }
            }
        });
    } catch (error: any) {
        console.error('Error fetching stats:', error);
        const msg = error?.message || String(error);
        if (msg.includes('Unauthorized') || msg.includes('Admin')) {
            return NextResponse.json({ error: msg }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Failed to fetch statistics', details: msg },
            { status: 500 }
        );
    }
}
