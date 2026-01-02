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
}

interface ProductProps {
    product: ProductCardProduct;
}


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
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
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


                {/* Actions */}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md ${isInWishlist(product.id) ? 'bg-purple-600 text-white' : 'bg-black text-white'}`}
                    onClick={handleWishlist}
                >
                    <i className={`ph-bold ${isInWishlist(product.id) ? 'ph-heart-fill text-white' : 'ph-heart'}`}></i>
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

