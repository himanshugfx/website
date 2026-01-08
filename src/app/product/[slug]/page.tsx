import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import type { ProductCardProduct } from "@/components/ProductCard";

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { slug },
    });

    if (!product) return { title: 'Product Not Found' };

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: product.name,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at Anose - Premium Skincare.`,
        openGraph: {
            images: [product.thumbImage || '', ...previousImages],
        },
    };
}

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

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.thumbImage,
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": "Anose"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://anose.in/product/${product.slug}`,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <div className="product-detail-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <div className="breadcrumb-block py-5 bg-zinc-50">
                <div className="container mx-auto">
                    <div className="flex items-center gap-1 caption1">
                        <Link href="/">Home</Link>
                        <i className="ph ph-caret-right text-xs"></i>
                        <Link href="/shop">Shop</Link>
                        <i className="ph ph-caret-right text-xs"></i>
                        <div className="text-secondary2 capitalize">{product.name}</div>
                    </div>
                </div>
            </div>

            <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} />

            {/* Customer Reviews */}
            <div className="container mx-auto px-4">
                <ProductReviews productId={product.id} productName={product.name} />
            </div>

            {/* Related Products */}
            <div className="related-product-block md:py-20 py-10 border-t border-line mt-10">
                <div className="container mx-auto">
                    <div className="heading3 text-center">Related Products</div>
                    <div className="list-product grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-[30px] gap-[16px] md:mt-10 mt-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p as ProductCardProduct} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

