const https = require('https');

/**
 * Anose Abandoned Cart Ping Script
 * This script pings the automation API to trigger WhatsApp alerts.
 * You can run this locally or via a system cron job.
 */

const API_URL = 'https://anose.in/api/admin/automation/abandoned-cart';

console.log(`[${new Date().toISOString()}] Triggering abandoned cart check...`);

https.get(API_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        console.log(`[${new Date().toISOString()}] Task completed.`);
    });
}).on('error', (err) => {
    console.error('Error triggering automation:', err.message);
});
