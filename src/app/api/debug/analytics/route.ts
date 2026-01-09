import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Debug endpoint to check Google Analytics configuration (no auth required)
export async function GET() {
    const result: any = {
        config: {
            GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID ? 'set' : 'missing',
            GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'set' : 'missing',
            GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'set (length: ' + process.env.GOOGLE_PRIVATE_KEY.length + ')' : 'missing',
        },
        authTest: null,
        error: null
    };

    // Only attempt auth test if all config is present
    if (process.env.GA4_PROPERTY_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        try {
            const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            let privateKey = process.env.GOOGLE_PRIVATE_KEY;
            privateKey = privateKey.replace(/\\n/g, '\n');

            // Create JWT
            const header = Buffer.from(JSON.stringify({
                alg: 'RS256',
                typ: 'JWT'
            })).toString('base64url');

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

            // Exchange JWT for token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                result.authTest = 'FAILED';
                result.error = tokenData.error_description || tokenData.error;
            } else if (tokenData.access_token) {
                result.authTest = 'SUCCESS';

                // Try a simple GA4 query
                const propertyId = process.env.GA4_PROPERTY_ID;
                const gaResponse = await fetch(
                    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${tokenData.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            metrics: [{ name: 'activeUsers' }]
                        })
                    }
                );

                const gaData = await gaResponse.json();

                if (gaData.error) {
                    result.gaTest = 'FAILED';
                    result.gaError = gaData.error.message;
                } else {
                    result.gaTest = 'SUCCESS';
                    result.realtimeUsers = gaData.rows?.[0]?.metricValues?.[0]?.value || '0';
                }
            }
        } catch (error: any) {
            result.authTest = 'ERROR';
            result.error = error.message;
        }
    }

    return NextResponse.json(result);
}
