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
    const products = await prisma.product.findMany({
        orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    const categories = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
    });

    const types = await prisma.product.findMany({
        select: { type: true },
        distinct: ['type'],
    });

    const brands = await prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
    });

    return (
        <ShopClient
            initialProducts={products as Parameters<typeof ShopClient>[0]['initialProducts']}
            categories={categories.map(c => c.category)}
            types={types.map(t => t.type)}
            brands={brands.map(b => b.brand)}
        />
    );
}
