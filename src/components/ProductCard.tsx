'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export interface ProductCardProduct {
    id: string;
    name: string;
    price: number;
    originPrice: number;
    thumbImage: string;
    slug: string;
    brand: string;
    quantity: number;
    new?: boolean;
    sale?: boolean;
    bestSeller?: boolean;
    type?: string; // Add type to detect facewash
}

interface ProductProps {
    product: ProductCardProduct;
}

// Video path for facewash products
const FACEWASH_VIDEO_PATH = '/assets/images/product/facewash video.mp4';

export default function ProductCard({ product }: ProductProps) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    let imageUrl = product.thumbImage;
    try {
        if (product.thumbImage.startsWith('[') || product.thumbImage.startsWith('{') || product.thumbImage.startsWith('"')) {
            const parsed = JSON.parse(product.thumbImage);
            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch (e) {
        // Keep original string if parse fails
        imageUrl = product.thumbImage;
    }

    // Check if product is a BEADED facewash type (not herbal)
    const isBeadedFacewash = product.type?.toLowerCase() === 'facewash' &&
        product.name.toLowerCase().includes('beaded');

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: 1,
            slug: product.slug
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                slug: product.slug
            });
        }
    };

    return (
        <div className="product-item group bg-white p-4 rounded-2xl border border-line hover:shadow-lg transition-all duration-500">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Link href={`/product/${product.slug}`} className="block h-full w-full">
                    {isBeadedFacewash ? (
                        <video
                            src={FACEWASH_VIDEO_PATH}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    )}
                </Link>

                {/* Product Labels */}
                <div className="absolute top-3 left-0 right-0 flex flex-wrap justify-between items-start gap-1.5 px-3 z-10 pointer-events-none">
                    <div className="flex flex-wrap gap-1.5">
                        {product.bestSeller && (
                            <Link
                                href="/shop?filter=best"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = '/shop?filter=best';
                                }}
                                className="product-tag text-xs font-bold uppercase bg-black text-white px-3 py-1.5 rounded-full shadow-lg cursor-pointer pointer-events-auto"
                            >
                                BEST
                            </Link>
                        )}
                        {product.sale && (
                            <Link
                                href="/shop?filter=sale"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = '/shop?filter=sale';
                                }}
                                className="product-tag text-xs font-bold uppercase bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg cursor-pointer pointer-events-auto"
                            >
                                SALE
                            </Link>
                        )}
                    </div>
                    {product.new && (
                        <Link
                            href="/shop?filter=new"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = '/shop?filter=new';
                            }}
                            className="product-tag text-xs font-bold uppercase bg-black text-white px-3 py-1.5 rounded-full shadow-lg cursor-pointer pointer-events-auto"
                        >
                            NEW
                        </Link>
                    )}
                </div>

                {product.quantity <= 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-md z-10">
                        Out of Stock
                    </div>
                )}


                {/* Wishlist Button */}
                <div
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 z-10 ${isInWishlist(product.id) ? 'bg-purple-600 text-white' : 'bg-white/90 backdrop-blur-md text-zinc-900 hover:bg-white'}`}
                    onClick={handleWishlist}
                >
                    {isInWishlist(product.id) ? (
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 translate-y-0 opacity-100">
                    <button
                        className={`w-full py-2 rounded-full text-sm font-bold shadow-md uppercase border ${product.quantity <= 0 ? 'bg-gray-400 text-white border-gray-400 cursor-not-allowed' : 'bg-black text-white border-black hover:bg-gray-900'}`}
                        onClick={handleAddToCart}
                        disabled={product.quantity <= 0}
                    >
                        {product.quantity <= 0 ? 'Out of Stock' : 'Add To Cart'}
                    </button>
                </div>

            </div>

            <div className="product-infor mt-4 text-center">
                <div className="product-brand caption2 text-secondary font-semibold uppercase">{product.brand}</div>
                <Link href={`/product/${product.slug}`} className="product-name heading6 mt-1 line-clamp-1 hover:underline">
                    {product.name}
                </Link>
                <div className="product-price flex items-center justify-center gap-2 mt-2">
                    <div className="price heading6 text-black">₹{product.price}</div>
                    {product.originPrice > product.price && (
                        <del className="origin-price caption1 text-secondary">₹{product.originPrice}</del>
                    )}
                </div>
            </div>
            {product.quantity <= 0 && (
                <div className="text-[11px] text-red-500 font-medium mt-1 italic">
                    Will be back soon
                </div>
            )}
        </div>
    );
}

