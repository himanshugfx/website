import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Luxury Skincare & Herbal Beauty Collection | Anose Beauty",
    description: "Discover Anose Beauty's premium range of dermatologically tested herbal face washes, sunscreen lotions, and revitalizing face creams. Free shipping over ₹199.",
    keywords: ["herbal skincare", "sunscreen lotion", "face wash", "dermatologically tested skincare", "organic beauty products India", "Anose Beauty shop"],
    alternates: {
        canonical: "https://anosebeauty.com/shop",
    },
};

export default async function ShopPage() {
    let products: unknown[] = [];
    let categories: { category: string }[] = [];
    let types: { type: string }[] = [];
    let brands: { brand: string }[] = [];

    let timeoutId: NodeJS.Timeout | undefined;
    try {
        const timeout = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Database timeout')), 5000);
        });

        const [productsData, categoriesData, typesData, brandsData] = await Promise.race([
            Promise.all([
                prisma.product.findMany({
                    orderBy: [
                        { priority: 'desc' },
                        { createdAt: 'desc' },
                    ],
                }).catch(err => { console.error("Shop products error:", err); return []; }),
                prisma.product.findMany({
                    select: { category: true },
                    distinct: ['category'],
                }).catch(err => { console.error("Shop categories error:", err); return []; }),
                prisma.product.findMany({
                    select: { type: true },
                    distinct: ['type'],
                }).catch(err => { console.error("Shop types error:", err); return []; }),
                prisma.product.findMany({
                    select: { brand: true },
                    distinct: ['brand'],
                }).catch(err => { console.error("Shop brands error:", err); return []; })
            ]),
            timeout
        ]) as any;

        if (timeoutId) clearTimeout(timeoutId);

        products = productsData || [];
        categories = categoriesData || [];
        types = typesData;
        brands = brandsData;
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("Shop page data fetch error or timeout:", error);
    }

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
                "name": "Shop",
                "item": "https://anosebeauty.com/shop"
            }
        ]
    };

    // ItemList Schema for Google Merchant Center & Traditional SEO
    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Luxury Skincare & Herbal Beauty Collection",
        "numberOfItems": (products as any[]).length,
        "itemListElement": (products as any[]).map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://anosebeauty.com/product/${p.slug}`,
            "name": p.name,
            "image": p.thumbImage ? (p.thumbImage.startsWith('http') ? p.thumbImage : `https://anosebeauty.com/api/media/${p.thumbImage}`) : 'https://anosebeauty.com/assets/images/product/1000x1000.webp',
            "offers": {
                "@type": "Offer",
                "price": p.price,
                "priceCurrency": "INR",
                "availability": p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": "Anose Beauty"
                }
            }
        }))
    };

    // FAQPage Schema for GEO (AI Search Engines) & AEO
    const faqPageLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What makes Anose Beauty skincare products suitable for Indian skin?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Anose Beauty products are formulated with authentic Indian botanicals specifically designed to tackle Indian climatic conditions—providing oil control, UV protection, and deep hydration without clogging pores."
                }
            },
            {
                "@type": "Question",
                "name": "Are Anose Beauty products dermatologically tested and chemical-free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all Anose Beauty skincare products are 100% dermatologically tested, paraben-free, sulfate-free, and cruelty-free."
                }
            },
            {
                "@type": "Question",
                "name": "How do I qualify for free shipping on Anose Beauty?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Anose Beauty offers free shipping across India on all orders over ₹199. Orders below ₹199 carry a flat delivery fee of ₹49."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
            />
            <ShopClient
                initialProducts={products as any}
                categories={categories.map(c => c.category)}
                types={types.map(t => t.type)}
                brands={brands.map(b => b.brand)}
            />
        </>
    );
}
