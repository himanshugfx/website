import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            variations: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Related products
    const relatedProducts = await prisma.product.findMany({
        where: {
            category: product.category,
            NOT: { id: product.id },
        },
        take: 4,
    });

    return (
        <div className="product-detail-page">
            <div className="breadcrumb-block py-5 bg-zinc-50">
                <div className="container mx-auto">
                    <div className="flex items-center gap-1 caption1">
                        <a href="/">Home</a>
                        <i className="ph ph-caret-right text-xs"></i>
                        <a href="/shop">Shop</a>
                        <i className="ph ph-caret-right text-xs"></i>
                        <div className="text-secondary2 capitalize">{product.name}</div>
                    </div>
                </div>
            </div>

            <ProductDetailClient product={product as any} />

            {/* Related Products */}
            <div className="related-product-block md:py-20 py-10 border-t border-line mt-10">
                <div className="container mx-auto">
                    <div className="heading3 text-center">Related Products</div>
                    <div className="list-product grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-[30px] gap-[16px] md:mt-10 mt-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p as any} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
