import crypto from 'crypto';
import { cookies, headers } from 'next/headers';

export interface MetaCapiUserData {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    fbp?: string | null;
    fbc?: string | null;
}

export interface MetaCapiCustomData {
    currency?: string;
    value?: number;
    order_id?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
    contents?: Array<{
        id: string;
        quantity: number;
        item_price?: number;
    }>;
}

export interface MetaCapiEventParams {
    eventName: string;
    eventId?: string;
    eventSourceUrl?: string;
    userData?: MetaCapiUserData;
    customData?: MetaCapiCustomData;
    req?: Request;
}

/**
 * Normalization helpers according to Meta Conversions API specifications
 */
export function hashSha256(val: string): string {
    if (!val) return '';
    return crypto.createHash('sha256').update(val.trim()).digest('hex');
}

export function normalizeEmail(email?: string | null): string | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return clean ? hashSha256(clean) : null;
}

export function normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    // Strip non-digits
    let clean = phone.replace(/\D/g, '');
    if (!clean) return null;
    // Default to India country code 91 if 10 digits
    if (clean.length === 10) {
        clean = `91${clean}`;
    }
    return hashSha256(clean);
}

export function normalizeName(name?: string | null): string | null {
    if (!name) return null;
    const clean = name.trim().toLowerCase().replace(/[^a-z]/g, '');
    return clean ? hashSha256(clean) : null;
}

export function normalizeCity(city?: string | null): string | null {
    if (!city) return null;
    const clean = city.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean ? hashSha256(clean) : null;
}

export function normalizeState(state?: string | null): string | null {
    if (!state) return null;
    const clean = state.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean ? hashSha256(clean) : null;
}

export function normalizeZip(zip?: string | null): string | null {
    if (!zip) return null;
    const clean = zip.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean ? hashSha256(clean) : null;
}

export function normalizeCountry(country?: string | null): string | null {
    const clean = (country || 'in').trim().toLowerCase();
    return hashSha256(clean === 'india' ? 'in' : clean);
}

/**
 * Send server-side event to Meta Conversions API (CAPI)
 */
export async function sendMetaCapiEvent(params: MetaCapiEventParams) {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID || '1750405452420472';
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN || process.env.META_CONVERSIONS_API_TOKEN;

    if (!pixelId) {
        console.warn('Meta CAPI: PIXEL_ID not configured');
        return { success: false, error: 'PIXEL_ID missing' };
    }

    if (!accessToken) {
        // Log gracefully without throwing error when token is pending configuration
        console.log('Meta CAPI: META_CAPI_ACCESS_TOKEN not set in environment. Skipping server call.');
        return { success: false, error: 'META_CAPI_ACCESS_TOKEN not configured' };
    }

    try {
        // Extract headers & cookies if on Next.js server side
        let reqIp: string | null = null;
        let reqUserAgent: string | null = null;
        let reqFbp: string | null = null;
        let reqFbc: string | null = null;

        try {
            const h = await headers();
            reqIp = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null;
            reqUserAgent = h.get('user-agent') || null;
        } catch (e) {
            // Context might not have headers
        }

        try {
            const c = await cookies();
            reqFbp = c.get('_fbp')?.value || null;
            reqFbc = c.get('_fbc')?.value || null;
        } catch (e) {
            // Context might not have cookies
        }

        const userDataInput = params.userData || {};

        // Build hashed user_data object for maximum Event Match Quality (EMQ)
        const userDataPayload: Record<string, any> = {};

        const hashedEmail = normalizeEmail(userDataInput.email);
        if (hashedEmail) userDataPayload.em = [hashedEmail];

        const hashedPhone = normalizePhone(userDataInput.phone);
        if (hashedPhone) userDataPayload.ph = [hashedPhone];

        const hashedFn = normalizeName(userDataInput.firstName);
        if (hashedFn) userDataPayload.fn = [hashedFn];

        const hashedLn = normalizeName(userDataInput.lastName);
        if (hashedLn) userDataPayload.ln = [hashedLn];

        const hashedCity = normalizeCity(userDataInput.city);
        if (hashedCity) userDataPayload.ct = [hashedCity];

        const hashedState = normalizeState(userDataInput.state);
        if (hashedState) userDataPayload.st = [hashedState];

        const hashedZip = normalizeZip(userDataInput.zip);
        if (hashedZip) userDataPayload.zp = [hashedZip];

        const hashedCountry = normalizeCountry(userDataInput.country);
        if (hashedCountry) userDataPayload.country = [hashedCountry];

        // Unhashed parameters required by Meta CAPI
        userDataPayload.client_ip_address = userDataInput.clientIpAddress || reqIp || undefined;
        userDataPayload.client_user_agent = userDataInput.clientUserAgent || reqUserAgent || undefined;
        userDataPayload.fbp = userDataInput.fbp || reqFbp || undefined;
        userDataPayload.fbc = userDataInput.fbc || reqFbc || undefined;

        const eventTime = Math.floor(Date.now() / 1000);
        const eventId = params.eventId || `evt_${params.eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const eventDataPayload: Record<string, any> = {
            event_name: params.eventName,
            event_time: eventTime,
            event_id: eventId,
            action_source: 'website',
            event_source_url: params.eventSourceUrl || 'https://anosebeauty.com',
            user_data: userDataPayload,
            custom_data: params.customData || {},
        };

        const capiBody: Record<string, any> = {
            data: [eventDataPayload],
        };

        if (process.env.META_CAPI_TEST_EVENT_CODE) {
            capiBody.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
        }

        const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(capiBody),
        });

        const data = await res.json();

        if (data.error) {
            console.error('Meta CAPI Error Response:', data.error);
            return { success: false, error: data.error.message || 'Meta CAPI request failed' };
        }

        return { success: true, eventId, eventsReceived: data.events_received };
    } catch (error) {
        console.error('Error sending Meta CAPI event:', error);
        return { success: false, error: (error as Error).message };
    }
}
