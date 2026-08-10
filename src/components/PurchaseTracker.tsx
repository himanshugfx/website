'use client';

import { useEffect } from 'react';
import { trackPurchase, FunnelOrder } from '@/lib/pixel';

interface PurchaseTrackerProps {
    order?: FunnelOrder | null;
    fallbackId?: string;
}

export default function PurchaseTracker({ order, fallbackId }: PurchaseTrackerProps) {
    useEffect(() => {
        if (order && (order.orderId || order.orderNumber)) {
            trackPurchase(order);
        } else if (fallbackId) {
            trackPurchase({
                orderId: fallbackId,
                total: 0,
                items: [],
            });
        }
    }, [order, fallbackId]);

    return null;
}
