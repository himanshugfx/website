import type { Metadata } from 'next';
import CollabClient from './CollabClient';

export const metadata: Metadata = {
    title: "Collaborate with Anose Beauty — Influencer Partnership Program",
    description: "Join the Anose Beauty influencer program. Earn 10% commission on every sale with your unique promo code. Apply now to become an Anose brand ambassador.",
    keywords: ["influencer program", "brand collaboration", "Anose ambassador", "beauty influencer", "earn commission", "promo code partnership"],
};

export default function CollabPage() {
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://anosebeauty.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Collaborate",
                "item": "https://anosebeauty.com/collab"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <CollabClient />
        </>
    );
}
