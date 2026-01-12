import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import whatsappService from '@/lib/whatsapp';
import nodemailer from 'nodemailer';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

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

            // Generate recovery link
            const recoveryLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout?orderId=${order.id}`;
            const message = `Hi ${customerName}, you left some items in your cart at Anose Beauty! 🛍️\n\nComplete your purchase here: ${recoveryLink}\n\nWe've reserved these items for you!`;

            const result = await whatsappService.sendTextMessage(customerPhone, message);

            if (!result.success) {
                return NextResponse.json({ error: result.error || 'Failed to send WhatsApp message' }, { status: 500 });
            }
        }

        if (type === 'email') {
            if (!customerEmail) {
                return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
            }

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_PORT === '465', // true for 465, false for 587 (STARTTLS)
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const mailOptions = {
                from: `"Anose Beauty" <${process.env.SMTP_USER}>`,
                to: customerEmail,
                subject: 'You left something behind! 🛍️',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; }
                            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                            .header { background: #9333ea; padding: 30px 20px; text-align: center; }
                            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
                            .content { padding: 40px 30px; }
                            .message { font-size: 16px; color: #555; margin-bottom: 30px; }
                            .cart-items { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
                            .item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                            .item:last-child { border-bottom: none; }
                            .item-name { font-weight: 600; color: #1e293b; }
                            .item-price { color: #64748b; }
                            .cta-button { display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: bold; font-size: 16px; transition: background 0.3s ease; }
                            .cta-button:hover { background: #333333; }
                            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>ANOSE BEAUTY</h1>
                            </div>
                            <div class="content">
                                <h2 style="color: #1a1a1a; margin-top: 0;">Hi ${customerName},</h2>
                                <p class="message">
                                    We noticed you left some great items in your cart. They're reserved for you, but they won't last long!
                                    <br><br>
                                    Complete your purchase now and get them shipped to you right away.
                                </p>
                                
                                <div class="cart-items">
                                    ${order.items.map(item => `
                                        <div class="item">
                                            <span class="item-name">${item.product.name} (x${item.quantity})</span>
                                            <span class="item-price">₹${item.price.toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                    <div class="item" style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #cbd5e1;">
                                        <span class="item-name" style="font-size: 18px;">Total</span>
                                        <span class="item-name" style="font-size: 18px;">₹${order.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style="text-align: center;">
                                    <a href="${process.env.NEXTAUTH_URL}/checkout?orderId=${order.id}" class="cta-button">Complete My Order</a>
                                </div>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Anose Beauty. All rights reserved.</p>
                                <p>If you have any questions, simply reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            };

            await transporter.sendMail(mailOptions);
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
