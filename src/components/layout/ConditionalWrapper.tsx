'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Marquee from "@/components/layout/Marquee";
import dynamic from 'next/dynamic';

const CartPopup = dynamic(() => import('@/components/CartPopup'), {
    ssr: false,
});

const AnoseAssistant = dynamic(() => import('@/components/AnoseAssistant'), {
    ssr: false,
});

const WelcomeOfferPopup = dynamic(() => import('@/components/WelcomeOfferPopup'), {
    ssr: false,
});

export default function ConditionalWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/print');

    if (isAdminPath) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <Marquee />
            {children}
            <CartPopup />
            <AnoseAssistant />
            <WelcomeOfferPopup />
            <Footer />
        </>
    );
}
