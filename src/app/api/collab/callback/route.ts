import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const PHONEPE_STATUS_URL = process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/status'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transactionId');
        const collabDataStr = searchParams.get('collabData');

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        if (!transactionId || !collabDataStr) {
            return NextResponse.redirect(new URL('/collab?error=missing_data', baseUrl));
        }

        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

        if (!merchantId || !saltKey || merchantId === 'your_merchant_id') {
            return NextResponse.redirect(new URL('/collab?error=payment_not_configured', baseUrl));
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

        if (data.success && data.code === 'PAYMENT_SUCCESS') {
            // Payment successful — create the collab application
            try {
                const collabData = JSON.parse(decodeURIComponent(collabDataStr));

                // Check duplicate
                const existing = await prisma.collabApplication.findFirst({
                    where: { email: collabData.email.toLowerCase() },
                });

                if (!existing) {
                    await prisma.collabApplication.create({
                        data: {
                            name: collabData.name,
                            email: collabData.email.toLowerCase(),
                            phone: collabData.phone,
                            platform: collabData.platform,
                            profileId: collabData.profileId,
                            wantsProducts: true,
                            notes: `Shipping fee paid via PhonePe. Transaction: ${transactionId}`,
                        },
                    });

                    // Send push notification
                    try {
                        const { sendAdminPushNotification } = await import('@/lib/notifications');
                        sendAdminPushNotification(
                            '🤝 New Collab Application (Paid)',
                            `${collabData.name} (${collabData.platform}) paid ₹49 shipping!`,
                            { type: 'new_collab_paid' }
                        ).catch(() => {});
                    } catch (e) {}
                }

                return NextResponse.redirect(new URL('/collab?success=true', baseUrl));
            } catch (parseErr) {
                console.error('Error parsing collab data:', parseErr);
                return NextResponse.redirect(new URL('/collab?error=data_error', baseUrl));
            }
        } else {
            return NextResponse.redirect(new URL('/collab?error=payment_failed', baseUrl));
        }
    } catch (error) {
        console.error('Collab payment callback error:', error);
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        return NextResponse.redirect(new URL('/collab?error=callback_error', baseUrl));
    }
}

export async function POST(request: Request) {
    return GET(request);
}
