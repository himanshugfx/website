import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        await requireAdmin(request);
        const { target } = await request.json();

        if (typeof target !== 'number') {
            return NextResponse.json({ error: 'Invalid target value' }, { status: 400 });
        }

        const settings = await prisma.analyticsSettings.upsert({
            where: { id: 'default' },
            update: { monthlyRevenueTarget: target },
            create: { id: 'default', monthlyRevenueTarget: target }
        });

        return NextResponse.json({ success: true, target: settings.monthlyRevenueTarget });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
