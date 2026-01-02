import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clientId = process.env.ZOHO_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIENT_SECRET;
const redirectUri = 'https://www.anosebeauty.com/api/auth/callback/zoho';
const code = '1000.583380b4e0caa2c2c5b1d250c393078c.74455d0ac66737fc3eefc1243d85f403';

async function exchangeToken() {
    console.log('Client ID:', clientId);
    // console.log('Client Secret:', clientSecret); // Keep secret hidden
    console.log('Code:', code);

    const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
    const params = new URLSearchParams({
        code: code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    });

    console.log('Exchanging code for tokens...');
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            body: params, // Send as form-urlencoded body
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.refresh_token) {
            console.log('\n✅ SUCCESS! New Refresh Token:', data.refresh_token);
        } else {
            console.error('\n❌ FAILED to get refresh token. Check if code is expired or client details wrong.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

exchangeToken();
