import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clientId = process.env.ZOHO_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIENT_SECRET;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
const organizationId = process.env.ZOHO_ORGANIZATION_ID;

console.log('Testing Zoho Configuration...');
console.log('Client ID:', clientId ? 'Set' : 'Missing');
console.log('Client Secret:', clientSecret ? 'Set' : 'Missing');
console.log('Refresh Token:', refreshToken ? 'Set' : 'Missing');
console.log('Organization ID:', organizationId);

async function testZoho() {
    try {
        // 1. Try to get Access Token
        console.log('\n1. Attempting to refresh access token...');
        const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
        const params = new URLSearchParams({
            refresh_token: refreshToken!,
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'refresh_token',
        });

        const tokenResponse = await fetch(`${tokenUrl}?${params.toString()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('❌ Token Refresh Failed:', tokenData);
            return;
        }

        console.log('✅ Access Token obtained successfully.');
        const accessToken = tokenData.access_token;

        // 2. Try to fetch Invoices
        console.log('\n2. Attempting to fetch invoices...');
        const apiDomain = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in';
        const invoiceUrl = `${apiDomain}/invoice/v3/invoices`;

        const invoiceResponse = await fetch(invoiceUrl, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'X-com-zoho-invoice-organizationid': organizationId!,
            }
        });

        const invoiceData = await invoiceResponse.json();

        if (invoiceData.code !== 0) {
            console.error('❌ Invoice Fetch Failed:', invoiceData);
        } else {
            console.log(`✅ Connection Successful! Found ${invoiceData.page_context?.total_count || 0} invoices.`);
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

testZoho();
