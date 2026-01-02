import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clientId = process.env.ZOHO_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIENT_SECRET;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
const organizationId = process.env.ZOHO_ORGANIZATION_ID;

const logFile = 'zoho-debug.txt';
function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

fs.writeFileSync(logFile, 'Starting Test (Invoices)...\n');

log('Testing Zoho Connectivity...');
log(`Client ID: ${clientId ? 'Set' : 'Missing'}`);
log(`Client Secret: ${clientSecret ? 'Set' : 'Missing'}`);
log(`Refresh Token: ${refreshToken ? 'Set' : 'Missing'}`);
log(`Org ID: ${organizationId}`);

async function testConnection() {
    try {
        // 1. Refresh Token
        log('\n1. Refreshing Access Token...');
        const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
        const params = new URLSearchParams({
            refresh_token: refreshToken!,
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'refresh_token',
        });

        const tokenRes = await fetch(`${tokenUrl}?${params.toString()}`, { method: 'POST' });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            log(`❌ Token Refresh Failed: ${JSON.stringify(tokenData, null, 2)}`);
            return;
        }

        log('✅ Access Token Obtained');
        const accessToken = tokenData.access_token;

        // 2. Fetch Invoices
        log('\n2. Fetching Invoices...');
        const invoiceUrl = `https://www.zohoapis.in/invoice/v3/invoices`;

        const invoiceRes = await fetch(invoiceUrl, {
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'X-com-zoho-invoice-organizationid': organizationId!,
                'Content-Type': 'application/json',
            }
        });

        const invoiceData = await invoiceRes.json();

        if (invoiceData.code !== 0) {
            log(`❌ API Call Failed: ${JSON.stringify(invoiceData, null, 2)}`);
        } else {
            log(`✅ Success! Found ${invoiceData.invoices.length} invoices.`);
            if (invoiceData.invoices.length > 0) {
                log(`First Invoice: ${invoiceData.invoices[0].invoice_number}`);
            }
        }

    } catch (error: any) {
        log(`❌ Fatal Error: ${error.toString()}`);
    }
}

testConnection();
