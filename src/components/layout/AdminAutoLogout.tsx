'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Component that automatically logs out an admin if they navigate away from the admin dashboard.
 */
export default function AdminAutoLogout() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const prevPathname = useRef(pathname);

    useEffect(() => {
        const checkNavigation = async () => {
            // Only relevant if the user is an admin
            if (session?.user && (session.user as any).role === 'admin') {
                const wasInAdmin = prevPathname.current.startsWith('/admin');
                const isNowInAdmin = pathname.startsWith('/admin');

                // If they were in admin and now they are NOT in admin, log them out
                if (wasInAdmin && !isNowInAdmin) {
                    console.log('Admin left dashboard, logging out...');
                    await signOut({ callbackUrl: '/login' });
                }
            }
            prevPathname.current = pathname;
        };

        checkNavigation();
    }, [pathname, session]);

    return null;
}
