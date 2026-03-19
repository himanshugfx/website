import type { Metadata } from 'next';
import AmenitiesClient from './AmenitiesClient';

export const metadata: Metadata = {
    title: "Premium Hotel Amenities & Hospitality Solutions",
    description: "Anose provides high-quality, customizable cosmetic and hygiene solutions for luxury hotels and resorts. Bulk supply with custom branding available.",
    keywords: ["hotel amenities", "luxury hotel supplies", "toiletries manufacturer", "bulk shampoo supplier", "custom hotel branding"],
};

export default function AmenitiesPage() {
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
                "name": "Hotel Amenities",
                "item": "https://anosebeauty.com/amenities"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <AmenitiesClient />
        </>
    );
}
