import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const COLLAB_SHIPPING_FEE = 49; // ₹49

const PHONEPE_API_URL = process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

export async function POST(request: Request) {
    try {
        const { name, email, phone, platform, profileId, paymentMethod } = await request.json();

        if (!name || !email || !phone || !platform || !profileId) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const amount = COLLAB_SHIPPING_FEE;
        const transactionId = `COLLAB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        if (paymentMethod === 'phonepe') {
            const merchantId = process.env.PHONEPE_MERCHANT_ID;
            const saltKey = process.env.PHONEPE_SALT_KEY;
            const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

            if (!merchantId || !saltKey || merchantId === 'your_merchant_id') {
                return NextResponse.json(
                    { error: 'PhonePe is not configured' },
                    { status: 500 }
                );
            }

            // Encode form data in the callback URL so we can create the application after payment
            const collabData = encodeURIComponent(JSON.stringify({ name, email, phone, platform, profileId }));

            const payloadData = {
                merchantId,
                merchantTransactionId: transactionId,
                merchantUserId: `COLLAB_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
                amount: Math.round(amount * 100),
                redirectUrl: `${baseUrl}/api/collab/callback?transactionId=${transactionId}&collabData=${collabData}`,
                redirectMode: 'REDIRECT',
                callbackUrl: `${baseUrl}/api/payment/webhook`,
                paymentInstrument: { type: 'PAY_PAGE' },
            };

            const base64Payload = Buffer.from(JSON.stringify(payloadData)).toString('base64');
            const checksum = crypto
                .createHash('sha256')
                .update(base64Payload + '/pg/v1/pay' + saltKey)
                .digest('hex') + '###' + saltIndex;

            const response = await fetch(PHONEPE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                },
                body: JSON.stringify({ request: base64Payload }),
            });

            const data = await response.json();

            if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
                return NextResponse.json({
                    success: true,
                    redirectUrl: data.data.instrumentResponse.redirectInfo.url,
                    transactionId,
                    method: 'phonepe'
                });
            } else {
                return NextResponse.json(
                    { error: data.message || 'Payment initiation failed', details: data },
                    { status: 400 }
                );
            }
        } else {
            // Default to Razorpay
            const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpayKeyId || !razorpayKeySecret) {
                return NextResponse.json(
                    { error: 'Razorpay is not configured' },
                    { status: 500 }
                );
            }

            const instance = new Razorpay({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            });

            const razorpayOrder = await instance.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `collab_${transactionId}`,
                notes: {
                    type: 'collab_shipping',
                    name,
                    email,
                    platform,
                    profileId,
                },
            });

            if (!razorpayOrder) {
                return NextResponse.json(
                    { error: 'Failed to create Razorpay order' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: razorpayKeyId,
                transactionId,
                method: 'razorpay'
            });
        }

    } catch (error) {
        console.error('Collab payment initiation error:', error);
        return NextResponse.json(
            { error: 'Failed to initiate payment' },
            { status: 500 }
        );
    }
}
