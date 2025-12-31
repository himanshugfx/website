import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const PHONEPE_STATUS_URL = process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/status'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const transactionId = searchParams.get('transactionId');

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        if (!orderId) {
            return NextResponse.redirect(new URL('/checkout?error=missing_order', baseUrl));
        }

        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

        // If PhonePe not configured, just mark order as processing and redirect to success
        if (!merchantId || !saltKey || merchantId === 'your_merchant_id') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' },
            });
            return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, baseUrl));
        }

        if (!transactionId) {
            return NextResponse.redirect(new URL('/checkout?error=missing_transaction', baseUrl));
        }

        // Check payment status with PhonePe
        const statusPath = `/pg/v1/status/${merchantId}/${transactionId}`;
        const statusUrl = `${PHONEPE_STATUS_URL}/${merchantId}/${transactionId}`;

        const checksum = crypto
            .createHash('sha256')
            .update(statusPath + saltKey)
            .digest('hex') + '###' + saltIndex;

        const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId,
            },
        });

        const data = await response.json();

        console.log('PhonePe Status Response:', JSON.stringify(data, null, 2));

        if (data.success && data.code === 'PAYMENT_SUCCESS') {
            // Update order status to PROCESSING
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' },
            });

            // Redirect to success page
            return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, baseUrl));
        } else if (data.code === 'PAYMENT_PENDING') {
            // Payment still pending
            return NextResponse.redirect(new URL(`/checkout/pending?orderId=${orderId}`, baseUrl));
        } else {
            // Payment failed - update order status
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' },
            });

            return NextResponse.redirect(new URL('/checkout?error=payment_failed', baseUrl));
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return NextResponse.redirect(new URL('/checkout?error=callback_error', baseUrl));
    }
}

// Also handle POST method as some payment gateways use POST for callback
export async function POST(request: Request) {
    return GET(request);
}
