'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Don't track admin pages
        if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
            return;
        }

        // Track page view
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: pathname,
                referrer: document.referrer || null,
            }),
        }).catch(() => {
            // Silently fail - analytics shouldn't break the page
        });
    }, [pathname]);

    return null; // This component doesn't render anything
}
