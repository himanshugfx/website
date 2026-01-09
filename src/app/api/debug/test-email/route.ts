import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST() {
    try {
        const result = await emailService.sendOrderNotification({
            orderId: 'test-order-id',
            orderNumber: 99999,
            items: [
                {
                    quantity: 1,
                    price: 499,
                    product: { name: 'Test Product' }
                }
            ],
            total: 549,
            shippingFee: 50,
            discountAmount: 0,
            paymentMethod: 'TEST',
            shippingInfo: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                phone: '9999999999',
                address: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001'
            }
        });

        return NextResponse.json({
            message: result.success ? 'Test email sent successfully!' : 'Failed to send email',
            result,
            config: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER ? '***' : 'missing',
                pass: process.env.SMTP_PASS ? '***' : 'missing'
            }
        }, { status: result.success ? 200 : 500 });
    } catch (error: any) {
        return NextResponse.json({
            message: 'Error sending test email',
            error: error.message
        }, { status: 500 });
    }
}
