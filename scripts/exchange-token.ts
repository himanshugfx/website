import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const clientId = process.env.ZOHO_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIENT_SECRET;
const redirectUri = 'https://www.google.com';
const code = '1000.33a73b1c2e0efbd31d3842d88113a0c0.003ca81a9d6279653da7b96581f37997';

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
        const fs = require('fs');
        fs.writeFileSync('zoho-tokens.json', JSON.stringify(data, null, 2));

        if (data.refresh_token) {
            console.log('\n✅ SUCCESS! Token saved to zoho-tokens.json');
        } else {
            console.error('\n❌ FAILED:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

exchangeToken();
