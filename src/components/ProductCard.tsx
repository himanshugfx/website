'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductProps {
    product: {
        id: string;
        name: string;
        price: number;
        originPrice: number;
        thumbImage: string;
        slug: string;
        brand: string;
    };
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

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md duration-300 ${isInWishlist(product.id) ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                        onClick={handleWishlist}
                    >
                        <i className={`ph-bold ${isInWishlist(product.id) ? 'ph-heart-fill text-red-500' : 'ph-heart'}`}></i>
                    </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                    <button
                        className="w-full bg-white text-purple-600 py-2 rounded-full text-sm font-bold shadow-md hover:bg-black hover:text-white duration-300 uppercase border border-purple-600"
                        onClick={handleAddToCart}
                    >
                        Add To Cart
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
        </div>
    );
}
