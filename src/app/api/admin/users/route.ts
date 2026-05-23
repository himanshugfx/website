import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};

        const users = await prisma.user.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        // Fetch all orders associated with these users either by userId or customerEmail
        const userIds = users.map(u => u.id);
        const userEmails = users.map(u => u.email).filter(Boolean) as string[];

        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { userId: { in: userIds } },
                    { customerEmail: { in: userEmails } }
                ]
            },
            select: {
                userId: true,
                customerEmail: true
            }
        });

        const usersWithCounts = users.map(user => {
            const orderCount = orders.filter(order => 
                order.userId === user.id || 
                (user.email && order.customerEmail === user.email)
            ).length;

            return {
                ...user,
                _count: {
                    orders: orderCount
                }
            };
        });

        return NextResponse.json({ users: usersWithCounts });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await requireAdmin(request);
        const { id, role } = await request.json();

        if (!id || !role) {
            return NextResponse.json(
                { error: 'User ID and role are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
