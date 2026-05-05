import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { finalizeOrder } from '@/lib/order';


export async function POST(request: Request) {
    try {
        const bodyContent = await request.text();

        const razorpaySignature = request.headers.get('x-razorpay-signature');

        if (razorpaySignature) {
            // --- Razorpay Logic ---
            const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
            if (!webhookSecret) {
                console.error('RAZORPAY_WEBHOOK_SECRET is not configured — cannot verify webhook');
                return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
            }

            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(bodyContent)
                .digest('hex');

            if (expectedSignature !== razorpaySignature) {
                console.error('Invalid Razorpay webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }

            const event = JSON.parse(bodyContent);

            if (event.event === 'payment.captured') {
                const payment = event.payload.payment.entity;
                const razorpayOrderId = payment.order_id;
                
                // Find order by razorpay order id (which was saved as transactionId during init)
                const order = await prisma.order.findFirst({
                    where: { transactionId: razorpayOrderId }
                });
                
                const internalOrderId = order?.id || payment.notes?.receipt;

                if (internalOrderId) {
                    await finalizeOrder(internalOrderId);
                    console.log(`Razorpay Payment captured for order ${internalOrderId}`);
                }
            }

            return NextResponse.json({ success: true });
        } else {
            // --- PhonePe Logic ---
            let body;
            try {
                body = JSON.parse(bodyContent);
            } catch (e) {
                return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
            }

            if (!body.response) {
                return NextResponse.json({ success: true });
            }

            const saltKey = process.env.PHONEPE_SALT_KEY;
            const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
            if (!saltKey) {
                console.error('PHONEPE_SALT_KEY is not configured — cannot verify webhook');
                return NextResponse.json({ success: false, error: 'Webhook not configured' }, { status: 500 });
            }

            // Verify PhonePe checksum
            const xVerify = request.headers.get('x-verify');
            if (!xVerify) {
                console.error('PhonePe webhook missing x-verify header');
                return NextResponse.json({ error: 'Missing verification header' }, { status: 400 });
            }

            const expectedChecksum = crypto
                .createHash('sha256')
                .update(body.response + saltKey)
                .digest('hex') + '###' + saltIndex;

            if (expectedChecksum !== xVerify) {
                console.error('Invalid PhonePe webhook checksum');
                return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 });
            }

            const decodedResponse = JSON.parse(
                Buffer.from(body.response, 'base64').toString('utf-8')
            );

            const { merchantTransactionId, code } = decodedResponse;
            console.log('PhonePe Webhook:', { code, merchantTransactionId });

            if (!merchantTransactionId) {
                return NextResponse.json({ success: false, error: 'Missing transaction ID' }, { status: 400 });
            }

            // Match order by stored transactionId
            const order = await prisma.order.findFirst({
                where: {
                    transactionId: merchantTransactionId,
                    status: 'PENDING',
                },
            });

            if (!order) {
                console.warn(`PhonePe webhook: no PENDING order found for transactionId ${merchantTransactionId}`);
                return NextResponse.json({ success: true });
            }

            if (code === 'PAYMENT_SUCCESS') {
                await finalizeOrder(order.id);
            } else if (code === 'PAYMENT_ERROR') {
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'CANCELLED' },
                });
            }

            return NextResponse.json({ success: true });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
