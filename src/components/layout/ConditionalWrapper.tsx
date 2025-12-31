'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Marquee from "@/components/layout/Marquee";
import CartPopup from "@/components/CartPopup";

export default function ConditionalWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith('/admin');

    if (isAdminPath) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <Marquee />
            {children}
            <CartPopup />
            <Footer />
        </>
    );
}
