import { NextResponse } from 'next/server';
import { sendMetaCapiEvent } from '@/lib/metaCapi';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventName, eventId, eventSourceUrl, userData, customData } = body;

        if (!eventName) {
            return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
        }

        const result = await sendMetaCapiEvent({
            eventName,
            eventId,
            eventSourceUrl: eventSourceUrl || request.headers.get('referer') || 'https://anosebeauty.com',
            userData,
            customData,
            req: request,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in /api/analytics/capi route:', error);
        return NextResponse.json({ error: 'Failed to process CAPI event' }, { status: 500 });
    }
}
