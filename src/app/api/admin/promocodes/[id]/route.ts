
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+ (although this project says Next 16.1, so it likely follows async params pattern)
) {
    try {
        const { id } = await params;
        await prisma.promoCode.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Promo code deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { isActive } = body;
        const updated = await prisma.promoCode.update({
            where: { id },
            data: { isActive },
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
    }
}
