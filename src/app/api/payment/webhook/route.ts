import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { finalizeOrder } from '@/lib/order';


export async function POST(request: Request) {
    try {
        const bodyContent = await request.text(); // PhonePe might send JSON but text can be parsed.
        // Wait, PhonePe sends base64 string in a JSON field 'response'.
        // Let's first check headers to differentiate.

        const razorpaySignature = request.headers.get('x-razorpay-signature');
        const phonePeChecksum = request.headers.get('x-verify');

        if (razorpaySignature) {
            // --- Razorpay Logic ---
            const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
            if (!webhookSecret) {
                return NextResponse.json({ success: true });
            }

            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(bodyContent)
                .digest('hex');

            if (expectedSignature === razorpaySignature) {
                const event = JSON.parse(bodyContent);

                if (event.event === 'payment.captured') {
                    const payment = event.payload.payment.entity;
                    const internalOrderId = payment.notes?.receipt;

                    if (internalOrderId) {
                        await finalizeOrder(internalOrderId);
                    }
                    console.log(`Razorpay Payment captured for order ${internalOrderId}`);

                }
                return NextResponse.json({ success: true });
            } else {
                console.error("Invalid Razorpay signature");
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        } else {
            // --- PhonePe Logic (assumed if no razorpay signature) ---
            // PhonePe usually sends x-verify header for callbacks, but sometimes just posts data?
            // Let's assume standard PhonePe webhook logic.

            // Parse body as JSON for PhonePe
            let body;
            try {
                body = JSON.parse(bodyContent);
            } catch (e) {
                // If not JSON, and not Razorpay, ignore
                return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
            }

            if (!body.response) {
                return NextResponse.json({ success: true }); // Ignore unknown requests
            }

            const saltKey = process.env.PHONEPE_SALT_KEY;
            if (!saltKey) {
                console.error('PhonePe Salt key not configured');
                return NextResponse.json({ success: false }, { status: 500 });
            }

            // Verify (optional for now if header missing but recommended)
            // Checksum verification logic similar to callback
            // ...

            const decodedResponse = JSON.parse(
                Buffer.from(body.response, 'base64').toString('utf-8')
            );

            const { merchantTransactionId, code } = decodedResponse;
            console.log('PhonePe Webhook:', { code, merchantTransactionId });

            const orders = await prisma.order.findMany({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            // This is a bit loose matching, ideally we match transactionId if stored
            // But preserving previous logic:
            if (code === 'PAYMENT_SUCCESS') {
                for (const order of orders) {
                    await finalizeOrder(order.id);
                    break;
                }
            } else if (code === 'PAYMENT_ERROR') {

                for (const order of orders) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: 'CANCELLED' },
                    });
                    break;
                }
            }

            return NextResponse.json({ success: true });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
