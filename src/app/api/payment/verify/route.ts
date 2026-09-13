import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { finalizeOrder } from '@/lib/order';


export async function POST(request: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Internal order ID
        } = await request.json();

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            console.error("RAZORPAY_KEY_SECRET is not configured");
            return NextResponse.json({ error: "Payment verification unavailable" }, { status: 500 });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
        }

        // Verify signature with timingSafeEqual to prevent side-channel timing attacks
        const generated_signature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const sigA = Buffer.from(generated_signature, 'utf-8');
        const sigB = Buffer.from(razorpay_signature, 'utf-8');
        const isValid = sigA.length === sigB.length && crypto.timingSafeEqual(sigA, sigB);

        if (isValid) {
            // Payment successful
            await finalizeOrder(orderId);


            return NextResponse.json({ success: true, message: "Payment verified successfully" });
        } else {
            // Payment verification failed
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }, // Or handle as failed attempt
            });
            return NextResponse.json(
                { success: false, message: "Payment verification failed" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
