/**
 * Delhivery API Integration Service
 * Handles shipment creation, tracking, and status updates
 */

const DELHIVERY_API_BASE = process.env.DELHIVERY_API_URL || 'https://track.delhivery.com';
const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN || '';

// Status mapping from Delhivery to internal order status
export const DELHIVERY_STATUS_MAP: Record<string, string> = {
    'Manifested': 'PROCESSING',
    'In Transit': 'SHIPPED',
    'Dispatched': 'SHIPPED',
    'Out For Delivery': 'OUT_FOR_DELIVERY',
    'Delivered': 'DELIVERED',
    'RTO': 'RTO',
    'RTO-Delivered': 'RTO_DELIVERED',
    'Pending': 'PENDING',
    'Cancelled': 'CANCELLED',
};

interface DelhiveryShipment {
    name: string;
    add: string;
    pin: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    order: string; // Order ID
    payment_mode: 'Prepaid' | 'COD';
    return_pin: string;
    return_city: string;
    return_phone: string;
    return_add: string;
    return_state: string;
    return_country: string;
    return_name: string;
    products_desc: string;
    hsn_code?: string;
    cod_amount: number;
    order_date: string;
    total_amount: number;
    seller_add: string;
    seller_name: string;
    seller_inv?: string;
    quantity: number;
    waybill?: string;
    shipment_width?: number;
    shipment_height?: number;
    weight?: number;
    seller_gst_tin?: string;
    shipping_mode?: 'Surface' | 'Express';
    address_type?: string;
}

interface DelhiveryCreateResponse {
    success: boolean;
    rmk?: string;
    upload_wbn: string;
    packages: Array<{
        waybill: string;
        refnum: string;
        status: string;
        remarks?: string;
    }>;
}

interface DelhiveryTrackingResponse {
    ShipmentData: Array<{
        Shipment: {
            Status: {
                Status: string;
                StatusDateTime: string;
                StatusLocation: string;
                Instructions?: string;
            };
            Destination: string;
            DestRecievedDate?: string;
            ExpectedDeliveryDate?: string;
            PickUpDate?: string;
            Origin: string;
            AWB: string;
            ChargedWeight?: string;
            Scans: Array<{
                ScanDetail: {
                    Scan: string;
                    ScanDateTime: string;
                    ScannedLocation: string;
                    Instructions?: string;
                };
            }>;
        };
    }>;
}

/**
 * Create a shipment in Delhivery
 */
export async function createDelhiveryShipment(orderData: {
    orderId: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: string;
    total: number;
    products: Array<{ name: string; quantity: number }>;
}): Promise<{ success: boolean; awbNumber?: string; error?: string }> {
    try {
        if (!DELHIVERY_TOKEN) {
            return { success: false, error: 'Delhivery API token not configured' };
        }

        // Seller/Return address from environment
        const sellerName = process.env.DELHIVERY_SELLER_NAME || 'Anose Beauty';
        const sellerAddress = process.env.DELHIVERY_SELLER_ADDRESS || 'Your Business Address';
        const sellerCity = process.env.DELHIVERY_SELLER_CITY || 'Delhi';
        const sellerState = process.env.DELHIVERY_SELLER_STATE || 'Delhi';
        const sellerPincode = process.env.DELHIVERY_SELLER_PINCODE || '110001';
        const sellerPhone = process.env.DELHIVERY_SELLER_PHONE || '9999999999';
        const clientName = process.env.DELHIVERY_CLIENT_NAME || '';

        const productsDesc = orderData.products.map(p => `${p.name} x${p.quantity}`).join(', ');
        const totalQty = orderData.products.reduce((sum, p) => sum + p.quantity, 0);

        const shipmentData: DelhiveryShipment = {
            name: orderData.customerName,
            add: orderData.address,
            pin: orderData.pincode,
            city: orderData.city,
            state: orderData.state,
            country: 'India',
            phone: orderData.customerPhone,
            order: `ANS-${orderData.orderNumber}`,
            payment_mode: orderData.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
            return_pin: sellerPincode,
            return_city: sellerCity,
            return_phone: sellerPhone,
            return_add: sellerAddress,
            return_state: sellerState,
            return_country: 'India',
            return_name: sellerName,
            products_desc: productsDesc,
            cod_amount: orderData.paymentMethod === 'COD' ? orderData.total : 0,
            order_date: new Date().toISOString().split('T')[0],
            total_amount: orderData.total,
            seller_add: sellerAddress,
            seller_name: sellerName,
            quantity: totalQty,
            shipping_mode: 'Surface',
        };

        const formData = `format=json&data=${encodeURIComponent(JSON.stringify({ shipments: [shipmentData], pickup_location: { name: clientName } }))}`;

        const response = await fetch(`${DELHIVERY_API_BASE}/api/cmu/create.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${DELHIVERY_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Delhivery API Error:', errorText);
            return { success: false, error: `API Error: ${response.status}` };
        }

        const result: DelhiveryCreateResponse = await response.json();

        if (result.success && result.packages && result.packages.length > 0) {
            const pkg = result.packages[0];
            if (pkg.waybill) {
                return { success: true, awbNumber: pkg.waybill };
            } else {
                return { success: false, error: pkg.remarks || 'Failed to generate waybill' };
            }
        }

        return { success: false, error: result.rmk || 'Unknown error occurred' };
    } catch (error) {
        console.error('Delhivery shipment creation error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Track a shipment by AWB number
 */
export async function trackDelhiveryShipment(awbNumber: string): Promise<{
    success: boolean;
    status?: string;
    statusDateTime?: string;
    location?: string;
    expectedDelivery?: string;
    deliveredAt?: string;
    scans?: Array<{ status: string; dateTime: string; location: string; instructions?: string }>;
    error?: string;
}> {
    try {
        if (!DELHIVERY_TOKEN) {
            return { success: false, error: 'Delhivery API token not configured' };
        }

        const response = await fetch(
            `${DELHIVERY_API_BASE}/api/v1/packages/json/?waybill=${awbNumber}`,
            {
                headers: {
                    'Authorization': `Token ${DELHIVERY_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            return { success: false, error: `API Error: ${response.status}` };
        }

        const result: DelhiveryTrackingResponse = await response.json();

        if (result.ShipmentData && result.ShipmentData.length > 0) {
            const shipment = result.ShipmentData[0].Shipment;
            const status = shipment.Status;

            const scans = shipment.Scans?.map(scan => ({
                status: scan.ScanDetail.Scan,
                dateTime: scan.ScanDetail.ScanDateTime,
                location: scan.ScanDetail.ScannedLocation,
                instructions: scan.ScanDetail.Instructions,
            })) || [];

            return {
                success: true,
                status: status.Status,
                statusDateTime: status.StatusDateTime,
                location: status.StatusLocation,
                expectedDelivery: shipment.ExpectedDeliveryDate,
                deliveredAt: shipment.DestRecievedDate,
                scans,
            };
        }

        return { success: false, error: 'No tracking data found' };
    } catch (error) {
        console.error('Delhivery tracking error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Check if a pincode is serviceable by Delhivery
 */
export async function checkPincodeServiceability(pincode: string): Promise<{
    success: boolean;
    serviceable?: boolean;
    prepaid?: boolean;
    cod?: boolean;
    error?: string;
}> {
    try {
        if (!DELHIVERY_TOKEN) {
            return { success: false, error: 'Delhivery API token not configured' };
        }

        const response = await fetch(
            `${DELHIVERY_API_BASE}/c/api/pin-codes/json/?filter_codes=${pincode}`,
            {
                headers: {
                    'Authorization': `Token ${DELHIVERY_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            return { success: false, error: `API Error: ${response.status}` };
        }

        const result = await response.json();

        if (result.delivery_codes && result.delivery_codes.length > 0) {
            const delivery = result.delivery_codes[0].postal_code;
            return {
                success: true,
                serviceable: true,
                prepaid: delivery.pre_paid === 'Y',
                cod: delivery.cod === 'Y',
            };
        }

        return { success: true, serviceable: false, prepaid: false, cod: false };
    } catch (error) {
        console.error('Delhivery pincode check error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Generate tracking URL for customer
 */
export function getTrackingUrl(awbNumber: string): string {
    return `https://www.delhivery.com/track/package/${awbNumber}`;
}

/**
 * Map Delhivery status to internal order status
 */
export function mapDelhiveryStatus(delhiveryStatus: string): string {
    return DELHIVERY_STATUS_MAP[delhiveryStatus] || 'PROCESSING';
}
