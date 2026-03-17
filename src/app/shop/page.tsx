import type { Metadata } from 'next';
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Shop Premium Skincare & Cosmetics",
    description: "Browse our collection of luxury skincare, hair care, and organic beauty products. High-quality ingredients for your daily routine.",
    keywords: ["buy skincare", "organic beauty products", "luxury cosmetics", "hair care products", "Anose shop"],
};
import prisma from "@/lib/prisma";
import ShopClient from "./ShopClient";

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
                }),
                prisma.product.findMany({
                    select: { category: true },
                    distinct: ['category'],
                }),
                prisma.product.findMany({
                    select: { type: true },
                    distinct: ['type'],
                }),
                prisma.product.findMany({
                    select: { brand: true },
                    distinct: ['brand'],
                })
            ]),
            timeout
        ]) as any;

        if (timeoutId) clearTimeout(timeoutId);

        products = productsData;
        categories = categoriesData;
        types = typesData;
        brands = brandsData;
    } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("Shop page data fetch error or timeout:", error);
    }

    return (
        <ShopClient
            initialProducts={products as any}
            categories={categories.map(c => c.category)}
            types={types.map(t => t.type)}
            brands={brands.map(b => b.brand)}
        />
    );
}
