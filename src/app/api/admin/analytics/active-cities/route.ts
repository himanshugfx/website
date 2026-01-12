import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface GARow {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
}

interface GAResponse {
    rows?: GARow[];
    rowCount?: number;
    error?: {
        message: string;
        status: string;
    };
}

// Helper to get access token using service account
async function getAccessToken(): Promise<{ token: string | null; error: string | null }> {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail) return { token: null, error: 'GOOGLE_SERVICE_ACCOUNT_EMAIL not configured' };
    if (!privateKey) return { token: null, error: 'GOOGLE_PRIVATE_KEY not configured' };

    privateKey = privateKey.replace(/\\n/g, '\n');

    try {
        const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
        const now = Math.floor(Date.now() / 1000);
        const payload = Buffer.from(JSON.stringify({
            iss: serviceAccountEmail,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
        })).toString('base64url');

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(`${header}.${payload}`);
        const signature = sign.sign(privateKey, 'base64url');
        const jwt = `${header}.${payload}.${signature}`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
        });

        const tokenData = await tokenResponse.json();
        return tokenData.access_token ? { token: tokenData.access_token, error: null } : { token: null, error: tokenData.error_description || tokenData.error };
    } catch (error: any) {
        return { token: null, error: error.message };
    }
}

export async function GET() {
    try {
        await requireAdmin();
        const propertyId = process.env.GA4_PROPERTY_ID;
        if (!propertyId) return NextResponse.json({ error: 'GA4_PROPERTY_ID missing' }, { status: 500 });

        const { token: accessToken, error: authError } = await getAccessToken();
        if (!accessToken) return NextResponse.json({ error: authError }, { status: 500 });

        // Run report for city-wise active users
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateRanges: [{ startDate: 'today', endDate: 'today' }], // Real-time like today data
                    metrics: [{ name: 'activeUsers' }],
                    dimensions: [{ name: 'city' }, { name: 'country' }],
                    dimensionFilter: {
                        filter: {
                            fieldName: 'country',
                            stringFilter: { value: 'India' }
                        }
                    },
                    limit: 50
                })
            }
        );

        const data = await response.json();
        const cities = (data.rows || []).map((row: GARow) => ({
            city: row.dimensionValues?.[0]?.value || '',
            users: parseInt(row.metricValues?.[0]?.value || '0', 10)
        })).filter((c: any) => c.city !== '(not set)');

        return NextResponse.json({ success: true, cities });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
