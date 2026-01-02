import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
// import { sendWhatsAppMessage } from '@/lib/whatsapp'; // Assuming this will be implemented

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session || (session.user as { role?: string })?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, type } = await req.json();

        if (!orderId || !type) {
            return NextResponse.json({ error: 'Order ID and Type are required' }, { status: 400 });
        }

        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const customerName = order.user?.name || 'Customer';
        const customerEmail = order.user?.email;

        // Try to extract phone from address if it's a JSON string
        let customerPhone = '';
        if (order.address) {
            try {
                const addr = JSON.parse(order.address);
                customerPhone = addr.phone || '';
            } catch (e) {
                // If it's not JSON, it's just a string, no phone detectable easily
            }
        }


        // In a real implementation, we would send the message here
        // For now, we'll log it and return success
        console.log(`Recovering order ${orderId} via ${type} for ${customerName}`);

        if (type === 'whatsapp') {
            if (!customerPhone) {
                return NextResponse.json({ error: 'Customer phone number not found' }, { status: 400 });
            }
            // Add WhatsApp sending logic here
        }

        if (type === 'email') {
            if (!customerEmail) {
                return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
            }
            // Add Email sending logic here
        }

        // Record the recovery attempt in a log (could use LeadActivity or a new model)
        // For now, let's assume we use LeadActivity if it's a lead, but here it's an Order

        return NextResponse.json({ message: `Recovery ${type} sent successfully` });
    } catch (error) {
        console.error('Abandoned cart recovery error:', error);
        return NextResponse.json(
            { error: 'Failed to process recovery' },
            { status: 500 }
        );
    }
}
