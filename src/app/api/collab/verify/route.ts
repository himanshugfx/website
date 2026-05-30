import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            collabData, // { name, email, phone, platform, profileId }
            transactionId,
        } = await request.json();

        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Verify signature
        const generated_signature = crypto
            .createHmac("sha256", keySecret || "")
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {
            // Payment verified — create the collab application
            const existing = await prisma.collabApplication.findFirst({
                where: { email: collabData.email.toLowerCase() },
            });

            if (existing) {
                return NextResponse.json({
                    success: true,
                    message: 'Application already exists. Payment received.',
                });
            }

            await prisma.collabApplication.create({
                data: {
                    name: collabData.name,
                    email: collabData.email.toLowerCase(),
                    phone: collabData.phone,
                    platform: collabData.platform,
                    profileId: collabData.profileId,
                    wantsProducts: true,
                    address: collabData.address || null,
                    notes: `Shipping fee ₹49 paid via Razorpay. Payment: ${razorpay_payment_id}, Transaction: ${transactionId}`,
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

            return NextResponse.json({ success: true, message: "Payment verified and application submitted" });
        } else {
            return NextResponse.json(
                { success: false, message: "Payment verification failed" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Collab payment verification error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
