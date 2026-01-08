'use server';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

// Google Analytics Data API types
interface GAMetric {
    name: string;
    value: string;
}

interface GADimension {
    name: string;
    value: string;
}

interface GARow {
    dimensionValues?: { value: string }[];
    metricValues?: { value: string }[];
}

interface GAResponse {
    rows?: GARow[];
    rowCount?: number;
}

// Helper to get access token using service account
async function getAccessToken(): Promise<string | null> {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
        console.error('Missing service account credentials');
        return null;
    }

    try {
        // Create JWT for service account
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

        // Sign JWT with private key
        const crypto = await import('crypto');
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(`${header}.${payload}`);
        const signature = sign.sign(privateKey, 'base64url');

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
        return tokenData.access_token || null;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

// Helper to run GA4 reports
async function runReport(
    accessToken: string,
    propertyId: string,
    dateRanges: { startDate: string; endDate: string }[],
    metrics: { name: string }[],
    dimensions?: { name: string }[],
    orderBys?: any[]
): Promise<GAResponse | null> {
    try {
        const body: any = {
            dateRanges,
            metrics
        };

        if (dimensions) {
            body.dimensions = dimensions;
        }

        if (orderBys) {
            body.orderBys = orderBys;
        }

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

        if (!response.ok) {
            const error = await response.text();
            console.error('GA API Error:', error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error running GA report:', error);
        return null;
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

        if (!response.ok) {
            return 0;
        }

        const data = await response.json();
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
                error: 'GA4_PROPERTY_ID not configured',
                data: null
            }, { status: 500 });
        }

        const accessToken = await getAccessToken();

        if (!accessToken) {
            return NextResponse.json({
                error: 'Failed to authenticate with Google Analytics',
                data: null
            }, { status: 500 });
        }

        // Parallel fetch all analytics data
        const [
            realtimeUsers,
            overviewData,
            previousPeriodData,
            topPagesData,
            trafficSourcesData,
            deviceData,
            ecommerceData
        ] = await Promise.all([
            // 1. Realtime users
            getRealtimeData(accessToken, propertyId),

            // 2. Current period overview (last 30 days)
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

            // 3. Previous period (for comparison)
            runReport(accessToken, propertyId,
                [{ startDate: '60daysAgo', endDate: '31daysAgo' }],
                [
                    { name: 'sessions' },
                    { name: 'totalUsers' },
                    { name: 'screenPageViews' }
                ]
            ),

            // 4. Top pages
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [
                    { name: 'screenPageViews' },
                    { name: 'averageSessionDuration' }
                ],
                [{ name: 'pagePath' }],
                [{ metric: { metricName: 'screenPageViews' }, desc: true }]
            ),

            // 5. Traffic sources
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }, { name: 'totalUsers' }],
                [{ name: 'sessionDefaultChannelGroup' }],
                [{ metric: { metricName: 'sessions' }, desc: true }]
            ),

            // 6. Device breakdown
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }],
                [{ name: 'deviceCategory' }]
            ),

            // 7. E-commerce data (if configured)
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [
                    { name: 'ecommercePurchases' },
                    { name: 'purchaseRevenue' },
                    { name: 'transactions' },
                    { name: 'purchaserConversionRate' }
                ]
            )
        ]);

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

        // Parse top pages (limit to 10)
        const topPages = (topPagesData?.rows || []).slice(0, 10).map(row => ({
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

        // Parse e-commerce data
        const ecomMetrics = ecommerceData?.rows?.[0]?.metricValues || [];
        const ecommerce = {
            purchases: parseInt(ecomMetrics[0]?.value || '0', 10),
            revenue: parseFloat(ecomMetrics[1]?.value || '0'),
            transactions: parseInt(ecomMetrics[2]?.value || '0', 10),
            conversionRate: parseFloat(ecomMetrics[3]?.value || '0') * 100
        };

        return NextResponse.json({
            success: true,
            data: {
                // Realtime
                realtimeUsers,

                // Overview metrics
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

                // Breakdowns
                topPages,
                trafficSources,
                devices,

                // E-commerce
                ecommerce,

                // Metadata
                period: 'Last 30 days',
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch analytics data',
            data: null
        }, { status: 500 });
    }
}
