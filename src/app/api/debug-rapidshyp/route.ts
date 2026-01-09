import { NextResponse } from 'next/server';

export async function GET() {
    const RAPIDSHYP_API_BASE = process.env.RAPIDSHYP_API_URL || 'https://api.rapidshyp.com/rapidshyp/apis/v1';
    const RAPIDSHYP_TOKEN = process.env.RAPIDSHYP_API_TOKEN || '';

    const testPayload = {
        order_id: `TEST-${Date.now()}`,
        order_date: new Date().toISOString().split('T')[0],
        pickup_pincode: process.env.RAPIDSHYP_PICKUP_PINCODE || '110001',
        delivery_pincode: '400001',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '9999999999',
        shipping_address: 'Test Address, City, State',
        shipping_city: 'Mumbai',
        shipping_state: 'Maharashtra',
        payment_mode: 'Prepaid',
        total_order_value: 100,
        weight: 0.5,
        items: [{
            name: 'Test Product',
            itemName: 'Test Product',
            sku: 'TEST-SKU',
            units: 1,
            unit_price: 100
        }]
    };

    const results: any = {};

    // Try multiple endpoints
    const endpoints = ['/orders', '/create_order', '/order/create'];

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(`${RAPIDSHYP_API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'rapidshyp-token': RAPIDSHYP_TOKEN
                },
                body: JSON.stringify(testPayload),
            });

            const text = await res.text();
            results[endpoint] = {
                status: res.status,
                ok: res.ok,
                body: text.slice(0, 500)
            };
        } catch (e) {
            results[endpoint] = { error: String(e) };
        }
    }

    return NextResponse.json(results);
}
