import crypto from 'crypto';

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
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

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
    } catch (error) {
        console.error('Error getting access token:', error);
        return { token: null, error: `Auth error: ${(error as Error).message}` };
    }
}

// Helper to run GA4 reports
async function runReport(
    accessToken: string,
    propertyId: string,
    dateRanges: { startDate: string; endDate: string }[],
    metrics: { name: string }[],
    dimensions?: { name: string }[],
    orderBys?: unknown[],
    limit?: number
): Promise<{ data: GAResponse | null; error: string | null }> {
    try {
        const body: Record<string, unknown> = {
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
    } catch (error) {
        console.error('Error running GA report:', error);
        return { data: null, error: (error as Error).message };
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

export async function getAnalyticsData() {
    try {
        const propertyId = process.env.GA4_PROPERTY_ID;

        if (!propertyId) {
            return { error: 'GA4_PROPERTY_ID not configured' };
        }

        // Get access token
        const { token: accessToken, error: authError } = await getAccessToken();

        if (!accessToken) {
            return { error: authError || 'Failed to authenticate with Google Analytics' };
        }

        // Fetch all analytics data in parallel
        const [
            realtimeUsers,
            trafficSourcesRes,
            deviceRes
        ] = await Promise.all([
            // 1. Realtime users
            getRealtimeData(accessToken, propertyId),

            // 2. Traffic sources
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }, { name: 'totalUsers' }],
                [{ name: 'sessionDefaultChannelGroup' }],
                [{ metric: { metricName: 'sessions' }, desc: true }],
                5
            ),

            // 3. Device breakdown
            runReport(accessToken, propertyId,
                [{ startDate: '30daysAgo', endDate: 'today' }],
                [{ name: 'sessions' }],
                [{ name: 'deviceCategory' }]
            )
        ]);

        const trafficSourcesData = trafficSourcesRes.data;
        const deviceData = deviceRes.data;

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
        })).sort((a, b) => b.sessions - a.sessions);

        return {
            success: true,
            data: {
                realtimeUsers,
                trafficSources,
                devices,
                lastUpdated: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return { error: `Failed to fetch analytics: ${(error as Error).message}` };
    }
}
