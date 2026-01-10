import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Fetch active promo codes
        const promos = await prisma.promoCode.findMany({
            where: {
                isActive: true,
                expiresAt: {
                    gt: new Date()
                }
            },
            take: 3,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Current accurate info
        const info = {
            promo: {
                title: "Active Promo Codes",
                content: promos.length > 0
                    ? `🎉 **Current Active Promo Codes:**\n\n` +
                    promos.map(p => `• **${p.code}** - ${p.discountType === 'PERCENTAGE' ? p.discountValue + '% OFF' : '₹' + p.discountValue + ' OFF'}${p.minOrderValue ? ' on orders above ₹' + p.minOrderValue : ''}`).join('\n') +
                    `\n\n💡 Apply these codes at checkout to save big!`
                    : "😔 Currently there are no active promo codes. Check back later for exciting offers!"
            },
            shipping: {
                title: "Shipping Policy",
                content: `📦 **Shipping Policy:**

• **Free Shipping** on orders above ₹199 (Limited Time Offer!)
• **Standard Delivery**: 4-5 business days
• We ship to all major cities across India!
• Orders below ₹199 incur a flat ₹49 shipping fee.

🔔 You'll receive tracking details once your order is dispatched.`
            },
            refund: {
                title: "Refund & Return Policy",
                content: `💸 **Refund & Return Policy:**

• **7-Day Easy Returns** - Hassle-free returns!
• Products must be unused and in original packaging.
• Refunds processed within 5-7 business days after quality check.
• For damaged items, contact us within 48 hours with unboxing video/photos.

📧 Email us at wecare@anosebeauty.com for any issues!`
            },
            contact: {
                title: "Contact Information",
                content: `📱 **Contact Information:**

• **Email**: wecare@anosebeauty.com
• **Phone**: +91 9110134408
• **WhatsApp**: Chat with us at +91 9110134408
• **Office**: Noida, Uttar Pradesh, India (201301)
• **Hours**: Mon-Sat, 10:30 AM - 6:30 PM IST

Follow us on Instagram: @anosebeauty 💜`
            }
        };

        return NextResponse.json(info);
    } catch (error) {
        console.error('Ana info API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
