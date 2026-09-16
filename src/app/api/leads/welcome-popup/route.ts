import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMetaCapiEvent } from '@/lib/metaCapi';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';
import { sendAdminPushNotification } from '@/lib/notifications';

const popupLimiter = createRateLimiter('welcome-popup', {
    intervalMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,             // 5 submissions per IP max
});

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);
        const limitResult = popupLimiter.check(clientIp);
        if (!limitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a few moments.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { name, phone } = body || {};

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'Please enter a valid name.' },
                { status: 400 }
            );
        }

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json(
                { error: 'Please enter a valid phone number.' },
                { status: 400 }
            );
        }

        // Clean and normalize Indian 10-digit mobile number
        const cleanPhoneDigits = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhoneDigits)) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit Indian mobile number.' },
                { status: 400 }
            );
        }

        const formattedPhone = `+91${cleanPhoneDigits}`;
        const cleanName = name.trim();

        // Ensure default 10% promo code exists in database
        try {
            await prisma.promoCode.upsert({
                where: { code: 'WELCOME10' },
                update: { isActive: true },
                create: {
                    code: 'WELCOME10',
                    discountType: 'PERCENTAGE',
                    discountValue: 10,
                    isActive: true,
                    minOrderValue: 0,
                },
            });
        } catch (promoErr) {
            console.error('Failed to upsert WELCOME10 promo code:', promoErr);
        }

        // Save lead in CRM Funnel
        try {
            let stage = await prisma.funnelStage.findFirst({
                where: { name: { equals: 'NEW', mode: 'insensitive' } },
            });

            if (!stage) {
                stage = await prisma.funnelStage.findFirst({
                    orderBy: { order: 'asc' },
                });
            }

            if (stage) {
                const lead = await prisma.lead.create({
                    data: {
                        name: cleanName,
                        phone: formattedPhone,
                        source: 'WEBSITE',
                        stageId: stage.id,
                        notes: 'Claimed 10% Extra Off Welcome Popup (Code: WELCOME10)',
                        value: 1200,
                    },
                });

                await prisma.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        type: 'NOTE',
                        content: `Lead captured via Welcome 10% Off Popup. Mobile: ${formattedPhone}`,
                    },
                }).catch(() => {});
            }
        } catch (leadErr) {
            console.error('Failed to create lead from welcome popup:', leadErr);
        }

        // Send Push Notification to admin devices
        sendAdminPushNotification(
            '🎁 10% Off Welcome Lead',
            `${cleanName} — ${formattedPhone}`,
            { type: 'welcome_lead', phone: formattedPhone }
        ).catch(err => console.error('Push notification error:', err));

        // Send Meta CAPI Lead conversion
        sendMetaCapiEvent({
            eventName: 'Lead',
            userData: {
                firstName: cleanName,
                phone: formattedPhone,
            },
            customData: {
                content_name: 'Welcome 10% Off Popup',
                currency: 'INR',
                value: 10,
            },
            req: request,
        }).catch(err => console.error('Meta CAPI Lead error:', err));

        return NextResponse.json({
            success: true,
            promoCode: 'WELCOME10',
            discountPercentage: 10,
            message: 'Coupon code unlocked successfully!',
        });
    } catch (error) {
        console.error('Error handling welcome popup submission:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
