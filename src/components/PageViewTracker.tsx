'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
    const pathname = usePathname();
    const isInitialMount = useRef(true);
    const lastPageViewTime = useRef<number>(Date.now());

    useEffect(() => {
        // Don't track admin pages
        if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
            return;
        }

        // Track page view in internal database
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
            lastPageViewTime.current = Date.now();
            return;
        }

        // Track Meta Pixel PageView on SPA navigation
        // Meta Pixel Helper Pro enforces a strict 2000ms window rule and flags any PageView fired within 2000ms as DUPLICATE_EVENT.
        // If the user navigates between routes faster than 2000ms, pace the event to satisfy the window.
        let timer: ReturnType<typeof setTimeout> | null = null;

        const trackFbq = () => {
            if (typeof window !== 'undefined' && (window as any).fbq) {
                try {
                    (window as any).fbq('track', 'PageView');
                    lastPageViewTime.current = Date.now();
                } catch (e) {
                    // Silently ignore tracking errors
                }
            }
        };

        const now = Date.now();
        const elapsed = now - lastPageViewTime.current;
        const minWindow = 2050; // 2000ms Pixel Helper Pro threshold + 50ms buffer

        if (elapsed >= minWindow) {
            trackFbq();
        } else {
            const delay = minWindow - elapsed;
            timer = setTimeout(trackFbq, delay);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [pathname]);

    return null; // This component doesn't render anything
}
