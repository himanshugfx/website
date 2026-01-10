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

    if (!serviceAccountEmail) {
        return { token: null, error: 'GOOGLE_SERVICE_ACCOUNT_EMAIL not configured' };
    }

    if (!privateKey) {
        return { token: null, error: 'GOOGLE_PRIVATE_KEY not configured' };
    }

    // Handle environment variable formatting issues
    let cleanedKey = privateKey.trim();

    // Remove surrounding quotes
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
        cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
    } else if (cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) {
        cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
    }

    // Replace literal \n and also handle actual newlines if present
    cleanedKey = cleanedKey.replace(/\\n/g, '\n');

    // Last resort: if it's missing the actual newlines (some environments strip them)
    // and it doesn't have any actual newlines, we might need to add them.
    // However, usually the \n replace is enough.

    try {
        // Create JWT header
        const header = Buffer.from(JSON.stringify({
            alg: 'RS256',
            typ: 'JWT'
        })).toString('base64url');

        // Create JWT payload
        const now = Math.floor(Date.now() / 1000);
        const payload = Buffer.from(JSON.stringify({
            iss: serviceAccountEmail,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
        })).toString('base64url');

        // Validate key format
        if (!cleanedKey.includes('-----BEGIN PRIVATE KEY-----') || !cleanedKey.includes('-----END PRIVATE KEY-----')) {
            return { token: null, error: 'GOOGLE_PRIVATE_KEY is malformed (missing BEGIN/END headers)' };
        }

        // Sign JWT with private key
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(`${header}.${payload}`);
        const signature = sign.sign(cleanedKey, 'base64url');

        const jwt = `${header}.${payload}.${signature}`;

        // Exchange JWT for access token
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
            console.error('Token exchange error:', tokenData);
            return { token: null, error: `Token error: ${tokenData.error_description || tokenData.error}` };
        }

        if (!tokenData.access_token) {
            return { token: null, error: 'No access token in response' };
        }

        return { token: tokenData.access_token, error: null };
    } catch (error: any) {
        console.error('Error getting access token:', error);
        return { token: null, error: `Auth error: ${error.message}` };
    }
}

// Helper to run GA4 reports
async function runReport(
    accessToken: string,
    propertyId: string,
    dateRanges: { startDate: string; endDate: string }[],
    metrics: { name: string }[],
    dimensions?: { name: string }[],
    orderBys?: any[],
    limit?: number
): Promise<{ data: GAResponse | null; error: string | null }> {
    try {
        const body: any = {
            dateRanges,
            metrics
        };

        if (dimensions) body.dimensions = dimensions;
        if (orderBys) body.orderBys = orderBys;
        if (limit) body.limit = limit;

        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('GA Report Error:', data.error);
            return { data: null, error: data.error.message || 'Unknown GA error' };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Error running GA report:', error);
        return { data: null, error: error.message };
    }
}

// Helper to get realtime data
async function getRealtimeData(accessToken: string, propertyId: string): Promise<number> {
    try {
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metrics: [{ name: 'activeUsers' }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Realtime Error:', data.error);
            return 0;
        }

        return parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    } catch (error) {
        console.error('Error getting realtime data:', error);
        return 0;
    }
}

export async function GET() {
    try {
        await requireAdmin();

        const propertyId = process.env.GA4_PROPERTY_ID;

        if (!propertyId) {
            return NextResponse.json({
                error: 'GA4_PROPERTY_ID not configured. Add it to your environment variables.',
                data: null,
                debug: { step: 'config_check' }
            }, { status: 500 });
        }

        // Get access token
        const { token: accessToken, error: authError } = await getAccessToken();

        if (!accessToken) {
            return NextResponse.json({
                error: authError || 'Failed to authenticate with Google Analytics',
                data: null,
                debug: { step: 'auth', propertyId }
            }, { status: 500 });
        }

        // Fetch all analytics data in parallel
        const [
            realtimeUsers,
            overviewRes,
            ecommerceRes,
            previousPeriodRes,
            topPagesRes,
            trafficSourcesRes,
            deviceRes,
            cityRes
        ] = await Promise.all([
            // 1. Realtime users
            getRealtimeData(accessToken, propertyId),

            // 2. Current period overview (last 30 days) - Basic Traffic
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [
                    { name: 'sessions' },
                    { name: 'totalUsers' },
                    { name: 'newUsers' },
                    { name: 'screenPageViews' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                    { name: 'engagementRate' }
                ]
            ),

            // 3. Current period overview (last 30 days) - eCommerce
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [
                    { name: 'ecommercePurchases' },
                    { name: 'purchaseRevenue' },
                    { name: 'transactions' },
                    { name: 'sessionConversionRate' }
                ]
            ),

            // 4. Previous period (for comparison)
            runReport(accessToken, propertyId,
                [{ startDate: '60daysAgo', endDate: '31daysAgo' }],
                [
                    { name: 'sessions' },
                    { name: 'totalUsers' },
                    { name: 'screenPageViews' }
                ]
            ),

            // 5. Top pages
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [
                    { name: 'screenPageViews' },
                    { name: 'averageSessionDuration' }
                ],
                [{ name: 'pagePath' }],
                [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                10
            ),

            // 6. Traffic sources
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }, { name: 'totalUsers' }],
                [{ name: 'sessionDefaultChannelGroup' }],
                [{ metric: { metricName: 'sessions' }, desc: true }]
            ),

            // 7. Device breakdown
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }],
                [{ name: 'deviceCategory' }]
            ),

            // 8. City-wise traffic
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }],
                [{ name: 'city' }],
                [{ metric: { metricName: 'sessions' }, desc: true }],
                10
            )
        ]);

        if (overviewRes.error) {
            return NextResponse.json({
                error: `GA Overview error: ${overviewRes.error}`,
                data: null
            }, { status: 500 });
        }

        if (ecommerceRes.error) {
            console.warn('GA eCommerce error:', ecommerceRes.error);
        }

        const overviewData = overviewRes.data;
        const ecommerceData = ecommerceRes.data;
        const previousPeriodData = previousPeriodRes.data;
        const topPagesData = topPagesRes.data;
        const trafficSourcesData = trafficSourcesRes.data;
        const deviceData = deviceRes.data;
        const cityData = cityRes.data;

        // Parse overview metrics
        const currentMetrics = overviewData?.rows?.[0]?.metricValues || [];
        const prevMetrics = previousPeriodData?.rows?.[0]?.metricValues || [];

        const sessions = parseInt(currentMetrics[0]?.value || '0', 10);
        const prevSessions = parseInt(prevMetrics[0]?.value || '0', 10);
        const sessionsGrowth = prevSessions > 0 ? ((sessions - prevSessions) / prevSessions) * 100 : 0;

        const users = parseInt(currentMetrics[1]?.value || '0', 10);
        const prevUsers = parseInt(prevMetrics[1]?.value || '0', 10);
        const usersGrowth = prevUsers > 0 ? ((users - prevUsers) / prevUsers) * 100 : 0;

        const pageViews = parseInt(currentMetrics[3]?.value || '0', 10);
        const prevPageViews = parseInt(prevMetrics[2]?.value || '0', 10);
        const pageViewsGrowth = prevPageViews > 0 ? ((pageViews - prevPageViews) / prevPageViews) * 100 : 0;

        const bounceRate = parseFloat(currentMetrics[4]?.value || '0') * 100;
        const avgSessionDuration = parseFloat(currentMetrics[5]?.value || '0');
        const engagementRate = parseFloat(currentMetrics[6]?.value || '0') * 100;
        const newUsers = parseInt(currentMetrics[2]?.value || '0', 10);

        // eCommerce Metrics
        const eMetrics = ecommerceData?.rows?.[0]?.metricValues || [];
        const purchases = parseInt(eMetrics[0]?.value || '0', 10);
        const revenue = parseFloat(eMetrics[1]?.value || '0');
        const transactions = parseInt(eMetrics[2]?.value || '0', 10);
        const conversionRate = parseFloat(eMetrics[3]?.value || '0') * 100;

        // Parse top pages
        const topPages = (topPagesData?.rows || []).map(row => ({
            path: row.dimensionValues?.[0]?.value || '',
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            avgDuration: parseFloat(row.metricValues?.[1]?.value || '0')
        }));

        // Parse traffic sources
        const trafficSources = (trafficSourcesData?.rows || []).map(row => ({
            source: row.dimensionValues?.[0]?.value || '',
            sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
            users: parseInt(row.metricValues?.[1]?.value || '0', 10)
        }));

        // Parse device breakdown
        const devices = (deviceData?.rows || []).map(row => ({
            device: row.dimensionValues?.[0]?.value || '',
            sessions: parseInt(row.metricValues?.[0]?.value || '0', 10)
        }));

        // Parse city breakdown
        const cities = (cityData?.rows || []).map(row => ({
            city: row.dimensionValues?.[0]?.value || '',
            sessions: parseInt(row.metricValues?.[0]?.value || '0', 10)
        }));

        return NextResponse.json({
            success: true,
            data: {
                realtimeUsers,
                sessions,
                sessionsGrowth,
                users,
                usersGrowth,
                newUsers,
                pageViews,
                pageViewsGrowth,
                bounceRate,
                avgSessionDuration,
                engagementRate,
                topPages,
                trafficSources,
                devices,
                cities,
                ecommerce: {
                    purchases,
                    revenue,
                    transactions,
                    conversionRate
                },
                period: 'Last 30 days',
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({
            error: `Failed to fetch analytics: ${error.message}`,
            data: null
        }, { status: 500 });
    }
}
