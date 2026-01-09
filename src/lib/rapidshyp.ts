
/**
 * RapidShyp API Integration Service
 * Handles order creation, tracking, and shipping labels
 */

const RAPIDSHYP_API_BASE = process.env.RAPIDSHYP_API_URL || 'https://api.rapidshyp.com/api/v1';
const RAPIDSHYP_TOKEN = process.env.RAPIDSHYP_API_TOKEN || '';

// Status mapping from RapidShyp to internal order status
export const RAPIDSHYP_STATUS_MAP: Record<string, string> = {
    'NEW': 'PROCESSING',
    'MANIFESTED': 'PROCESSING',
    'PICKUP_SCHEDULED': 'SHIPPED',
    'IN_TRANSIT': 'SHIPPED',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'RTO': 'RTO',
    'RTO_DELIVERED': 'RTO_DELIVERED',
    'CANCELLED': 'CANCELLED',
};

/**
 * Create an order in RapidShyp
 */
export async function createRapidShypOrder(orderData: {
    orderNumber: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: string;
    total: number;
    weight?: number;
    products: Array<{ name: string; quantity: number; price: number; sku?: string }>;
}) {
    try {
        if (!RAPIDSHYP_TOKEN) {
            return { success: false, error: 'RapidShyp API token not configured' };
        }

        const payload = {
            order_id: `ANS-${orderData.orderNumber}`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_pincode: process.env.RAPIDSHYP_PICKUP_PINCODE || '110001', // Should be configured in env
            delivery_pincode: orderData.pincode,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone,
            shipping_address: orderData.address,
            shipping_city: orderData.city,
            shipping_state: orderData.state,
            payment_mode: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
            total_order_value: orderData.total,
            weight: orderData.weight || 0.5,
            items: orderData.products.map(p => ({
                name: p.name,
                sku: p.sku || p.name,
                units: p.quantity,
                unit_price: p.price
            }))
        };

        const response = await fetch(`${RAPIDSHYP_API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RAPIDSHYP_TOKEN}`,
                'rapidshyp-token': RAPIDSHYP_TOKEN // Some docs mention this header explicitly
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return {
                success: true,
                awbNumber: result.data?.awb_number || result.data?.waybill,
                orderId: result.data?.id
            };
        }

        return { success: false, error: result.message || 'Failed to create RapidShyp order' };
    } catch (error) {
        console.error('RapidShyp order creation error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Track a shipment by AWB/Tracking number
 */
export async function trackRapidShypShipment(awbNumber: string) {
    try {
        if (!RAPIDSHYP_TOKEN) {
            return { success: false, error: 'RapidShyp API token not configured' };
        }

        const response = await fetch(`${RAPIDSHYP_API_BASE}/tracking/${awbNumber}`, {
            headers: {
                'Authorization': `Bearer ${RAPIDSHYP_TOKEN}`,
                'rapidshyp-token': RAPIDSHYP_TOKEN
            },
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return {
                success: true,
                status: result.data?.status,
                location: result.data?.location,
                expectedDelivery: result.data?.edd,
                scans: result.data?.scans || []
            };
        }

        return { success: false, error: result.message || 'Tracking info not available' };
    } catch (error) {
        console.error('RapidShyp tracking error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Map RapidShyp status to internal order status
 */
export function mapRapidShypStatus(status: string): string {
    return RAPIDSHYP_STATUS_MAP[status.toUpperCase()] || 'PROCESSING';
}

/**
 * Get Tracking URL
 */
export function getRapidShypTrackingUrl(awbNumber: string): string {
    return `https://www.rapidshyp.com/tracking?awb=${awbNumber}`;
}
