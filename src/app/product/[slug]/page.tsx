import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import type { ProductCardProduct } from "@/components/ProductCard";
import { getAbsoluteMediaUrl } from '@/lib/media';
export const revalidate = 60;

export async function generateStaticParams() {
    try {
        const products = await prisma.product.findMany({
            select: { slug: true },
        });
        return products.map((p) => ({ slug: p.slug }));
    } catch (error) {
        console.error("Error generating static params for products:", error);
        return [];
    }
}

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
    const absoluteThumb = getAbsoluteMediaUrl(product.thumbImage);

    return {
        title: product.name,
        description: product.description?.substring(0, 160) || `Buy ${product.name} at Anose - Premium Skincare.`,
        openGraph: {
            images: [absoluteThumb || '', ...previousImages],
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

    // Fetch real review stats
    const reviewStats = await prisma.productReview.aggregate({
        where: { productId: product.id, isApproved: true },
        _count: { id: true },
        _avg: { rating: true },
    });
    const reviewCount = reviewStats._count.id || 0;
    const avgRating = reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0;

    // Related products
    const relatedProducts = await prisma.product.findMany({
        where: {
            category: product.category,
            NOT: { id: product.id },
        },
        take: 4,
    });

    const isAvailable = (product.quantity && product.quantity > 0);
    const absoluteThumb = getAbsoluteMediaUrl(product.thumbImage);

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": absoluteThumb,
        "description": product.description,
        "sku": `ANS-${product.id.substring(0, 8)}`,
        "brand": {
            "@type": "Brand",
            "name": "Anose Beauty"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://anosebeauty.com/product/${product.slug}`,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceValidUntil": new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    return (
        <div className="product-detail-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <div className="breadcrumb-block py-3 bg-zinc-50 border-b border-zinc-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center gap-1.5 caption1 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-zinc-600">
                        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
                        <i className="ph ph-caret-right text-[10px] text-zinc-400"></i>
                        <Link href="/shop" className="hover:text-purple-600 transition-colors">Shop</Link>
                        <i className="ph ph-caret-right text-[10px] text-zinc-400"></i>
                        <div className="text-zinc-900 font-semibold capitalize truncate max-w-[160px] sm:max-w-none">{product.name}</div>
                    </div>
                </div>
            </div>

            <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} reviewCount={reviewCount} avgRating={avgRating} />

            {/* Customer Reviews */}
            <div className="container mx-auto px-4 max-w-7xl">
                <ProductReviews productId={product.id} productName={product.name} />
            </div>

            {/* Related Products */}
            <div className="related-product-block py-8 sm:py-10 md:py-12 border-t border-line mt-8 sm:mt-10 md:mt-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="heading3 text-center text-xl sm:text-2xl md:text-3xl font-bold font-primary">Related Products</div>
                    <div className="list-product grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p as ProductCardProduct} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

