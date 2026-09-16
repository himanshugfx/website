'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
    const pathname = usePathname();
    const isInitialMount = useRef(true);

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

        // Skip duplicate Meta Pixel PageView on initial mount (already fired by layout.tsx inline snippet)
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Track Meta Pixel PageView on SPA navigation
        if (typeof window !== 'undefined' && (window as any).fbq) {
            try {
                (window as any).fbq('track', 'PageView');
            } catch (e) {
                // Silently ignore tracking errors
            }
        }
    }, [pathname]);

    return null; // This component doesn't render anything
}
