import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: "Contact Us - We'd Love to Hear from You",
    description: "Get in touch with Anose Beauty for customer support, bulk inquiries for hotel amenities, or any questions about our premium organic skincare products.",
    keywords: ["contact Anose", "Anose customer care", "bulk hotel supplies India", "skincare support", "Noida cosmetic manufacturer"],
};

export default function ContactPage() {
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
                "name": "Contact Us",
                "item": "https://anosebeauty.com/contact"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ContactClient />
        </>
    );
}
