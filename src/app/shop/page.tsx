import prisma from "@/lib/prisma";
import ShopClient from "./ShopClient";

export default async function ShopPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
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
            initialProducts={products as any}
            categories={categories.map(c => c.category)}
            types={types.map(t => t.type)}
            brands={brands.map(b => b.brand)}
        />
    );
}
