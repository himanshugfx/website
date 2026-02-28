import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        // Get total revenue
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    not: 'CANCELLED'
                }
            }
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Get total orders count
        const totalOrders = await prisma.order.count();

        // Get total products count
        const totalProducts = await prisma.product.count();

        // Get total users count
        const totalUsers = await prisma.user.count();

        // Get recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrdersCount = await prisma.order.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get revenue from last 7 days
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                },
                status: {
                    not: 'CANCELLED'
                }
            }
        });
        const recentRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers,
            recentOrdersCount,
            recentRevenue,
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
