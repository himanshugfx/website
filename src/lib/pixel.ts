'use client';

export interface FunnelItem {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    category?: string;
    slug?: string;
}

export interface FunnelOrder {
    orderId: string;
    orderNumber?: string | number;
    total: number;
    items?: FunnelItem[];
    currency?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface UserContext {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

/**
 * Generate a unique Event ID for Meta Pixel <-> CAPI Deduplication
 */
function generateEventId(prefix: string): string {
    return `evt_${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Relay event to server-side Meta Conversions API (CAPI) endpoint
 */
async function sendCapiRelay(eventName: string, eventId: string, userData: UserContext, customData: Record<string, any>) {
    if (typeof window === 'undefined') return;
    try {
        fetch('/api/analytics/capi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                eventId,
                eventSourceUrl: window.location.href,
                userData,
                customData,
            }),
        }).catch(() => {
            // Silently fail - analytics should not disrupt UX
        });
    } catch (e) {
        // Silently ignore
    }
}

/**
 * Robust helper to send events to Google Analytics via gtag or dataLayer fallback
 */
function sendGtag(eventName: string, params: Record<string, any>) {
    if (typeof window === 'undefined') return;
    try {
        if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', eventName, params);
        } else if ((window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
            (window as any).dataLayer.push({
                event: eventName,
                ...params,
            });
        }
    } catch (e) {
        console.error(`GA ${eventName} error:`, e);
    }
}

/**
 * 1. ViewContent event - Fired when viewing a product detail page
 */
export function trackViewContent(product: FunnelItem, userContext: UserContext = {}) {
    if (typeof window === 'undefined') return;

    const eventId = generateEventId('view_content');
    const payload = {
        content_name: product.name,
        content_category: product.category || 'Skincare',
        content_ids: [product.id || product.slug || 'product'],
        content_type: 'product',
        value: product.price,
        currency: 'INR',
    };

    // Meta Pixel (Browser) with eventID for deduplication
    if (typeof (window as any).fbq === 'function') {
        try {
            (window as any).fbq('track', 'ViewContent', payload, { eventID: eventId });
        } catch (e) {
            console.error('FB ViewContent error:', e);
        }
    }

    // Google Analytics 4 (Standard view_item & ViewContent alias)
    sendGtag('view_item', {
        currency: 'INR',
        value: product.price,
        items: [{
            item_id: product.id || product.slug,
            item_name: product.name,
            price: product.price,
            item_category: product.category || 'Skincare',
            quantity: 1,
        }],
    });
    sendGtag('ViewContent', payload);

    // Meta CAPI (Server-Side)
    sendCapiRelay('ViewContent', eventId, userContext, payload);
}

/**
 * 2. AddToCart event - Fired when an item is added to cart
 */
export function trackAddToCart(item: FunnelItem, userContext: UserContext = {}) {
    if (typeof window === 'undefined') return;

    const eventId = generateEventId('add_to_cart');
    const qty = item.quantity || 1;
    const value = item.price * qty;

    const payload = {
        content_name: item.name,
        content_ids: [item.id || item.slug || 'product'],
        content_type: 'product',
        value: value,
        currency: 'INR',
    };

    // Meta Pixel (Browser) with eventID for deduplication
    if (typeof (window as any).fbq === 'function') {
        try {
            (window as any).fbq('track', 'AddToCart', payload, { eventID: eventId });
        } catch (e) {
            console.error('FB AddToCart error:', e);
        }
    }

    // Google Analytics 4 (Standard add_to_cart & AddToCart alias)
    sendGtag('add_to_cart', {
        currency: 'INR',
        value: value,
        items: [{
            item_id: item.id || item.slug,
            item_name: item.name,
            price: item.price,
            item_category: item.category || 'Skincare',
            quantity: qty,
        }],
    });
    sendGtag('AddToCart', payload);

    // Meta CAPI (Server-Side)
    sendCapiRelay('AddToCart', eventId, userContext, payload);
}

/**
 * 3. InitiateCheckout event - Fired on checkout page entry
 */
export function trackInitiateCheckout(items: FunnelItem[], total: number, userContext: UserContext = {}) {
    if (typeof window === 'undefined') return;

    const eventId = generateEventId('initiate_checkout');
    const numItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const contentIds = items.map(item => item.id || item.slug || 'product');

    const payload = {
        content_ids: contentIds,
        content_type: 'product',
        num_items: numItems,
        value: total,
        currency: 'INR',
    };

    // Meta Pixel (Browser) with eventID for deduplication
    if (typeof (window as any).fbq === 'function') {
        try {
            (window as any).fbq('track', 'InitiateCheckout', payload, { eventID: eventId });
        } catch (e) {
            console.error('FB InitiateCheckout error:', e);
        }
    }

    // Google Analytics 4 (Standard begin_checkout & InitiateCheckout alias)
    sendGtag('begin_checkout', {
        currency: 'INR',
        value: total,
        items: items.map(item => ({
            item_id: item.id || item.slug,
            item_name: item.name,
            price: item.price,
            item_category: item.category || 'Skincare',
            quantity: item.quantity || 1,
        })),
    });
    sendGtag('InitiateCheckout', payload);

    // Meta CAPI (Server-Side)
    sendCapiRelay('InitiateCheckout', eventId, userContext, payload);
}

/**
 * 4. Purchase event - Fired STRICTLY on "Thank You" page load.
 * NEVER trigger on simple button clicks!
 */
export function trackPurchase(order: FunnelOrder) {
    if (typeof window === 'undefined') return;

    const orderIdStr = String(order.orderNumber || order.orderId || 'ORDER');
    const eventId = `purchase_${orderIdStr}`;

    // Deduplicate in sessionStorage so page reloads do not trigger duplicate Purchase events
    const storageKey = `anose_purchase_tracked_${orderIdStr}`;
    try {
        if (sessionStorage.getItem(storageKey)) {
            return;
        }
    } catch (e) {
        // Ignore storage access errors
    }

    const items = order.items || [];
    const contentIds = items.map(item => item.id || item.slug || 'product');

    const payload = {
        content_ids: contentIds.length > 0 ? contentIds : [orderIdStr],
        content_type: 'product',
        value: order.total,
        currency: order.currency || 'INR',
        order_id: orderIdStr,
    };

    // User context for High Event Match Quality (EMQ)
    const userContext: UserContext = {
        email: order.email,
        phone: order.phone,
        firstName: order.firstName,
        lastName: order.lastName,
        city: order.city,
        state: order.state,
        zip: order.zip,
        country: order.country,
    };

    // Meta Pixel (Browser) with eventID matching server CAPI eventID
    if (typeof (window as any).fbq === 'function') {
        try {
            (window as any).fbq('track', 'Purchase', payload, { eventID: eventId });
        } catch (e) {
            console.error('FB Purchase error:', e);
        }
    }

    // Google Analytics 4 (Standard purchase & Purchase alias)
    sendGtag('purchase', {
        transaction_id: orderIdStr,
        value: order.total,
        currency: order.currency || 'INR',
        tax: 0,
        shipping: 0,
        items: items.map(item => ({
            item_id: item.id || item.slug,
            item_name: item.name,
            price: item.price,
            item_category: item.category || 'Skincare',
            quantity: item.quantity || 1,
        })),
    });
    sendGtag('Purchase', {
        transaction_id: orderIdStr,
        ...payload,
    });

    // Meta CAPI (Server-Side Relay) with matching eventID
    sendCapiRelay('Purchase', eventId, userContext, payload);

    // Mark as tracked in session storage
    try {
        sessionStorage.setItem(storageKey, 'true');
    } catch (e) {
        // Ignore storage errors
    }
}

/**
 * 5. Lead / Form submission event (e.g. Newsletter, Contact, Collab)
 */
export function trackLead(leadType: string, userContext: UserContext = {}) {
    if (typeof window === 'undefined') return;

    const eventId = generateEventId('lead');
    const payload = {
        content_name: leadType,
    };

    // Meta Pixel (Browser)
    if (typeof (window as any).fbq === 'function') {
        try {
            (window as any).fbq('track', 'Lead', payload, { eventID: eventId });
        } catch (e) {
            console.error('FB Lead error:', e);
        }
    }

    // Google Analytics 4
    sendGtag('generate_lead', {
        currency: 'INR',
        lead_type: leadType,
    });

    // Meta CAPI (Server-Side Relay)
    sendCapiRelay('Lead', eventId, userContext, payload);
}
