'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface Variation {
    id: string;
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    originPrice: number;
    brand: string;
    description: string;
    images: string; // JSON string
    variations: Variation[];
    sizes: string; // Comma separated or single
    slug: string;
    category: string;
    type: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const images = JSON.parse(product.images) as string[];
    const sizes = product.sizes ? product.sizes.split(',') : [];

    const [activeImage, setActiveImage] = useState(images[0]);
    const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(product.variations[0] || null);
    const [quantity, setQuantity] = useState(1);

    const handleVariationChange = (v: Variation) => {
        setSelectedVariation(v);
        setActiveImage(v.image);
    };

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: selectedVariation ? selectedVariation.image : images[0],
            quantity: quantity,
            selectedSize: selectedSize,
            selectedColor: selectedVariation?.color,
            slug: product.slug
        });
    };

    const handleWishlist = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: images[0],
                slug: product.slug
            });
        }
    };

    return (
        <div className="product-detail-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="flex max-md:flex-wrap gap-y-10">
                    <div className="left-content md:w-1/2 w-full md:pr-10">
                        <div className="image-main relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100">
                            <Image
                                src={activeImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="list-images grid grid-cols-4 gap-4 mt-4">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`item aspect-square rounded-xl overflow-hidden cursor-pointer border-2 ${activeImage === img ? 'border-black' : 'border-transparent'}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <Image src={img} alt={`Thumb ${i}`} width={200} height={200} className="object-cover w-full h-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="right-content md:w-1/2 w-full">
                        <div className="product-brand caption2 text-secondary font-semibold uppercase">{product.brand}</div>
                        <div className="product-name heading4 mt-2">{product.name}</div>

                        <div className="product-price flex items-center gap-3 mt-4">
                            <div className="price heading4">₹{product.price}</div>
                            {product.originPrice > product.price && (
                                <del className="origin-price heading6 text-secondary">₹{product.originPrice}</del>
                            )}
                        </div>

                        <div className="description body1 text-secondary mt-6 line-clamp-3">
                            {product.description}
                        </div>

                        {/* Variations */}
                        {product.variations.length > 0 && (
                            <div className="variation-block mt-8">
                                <div className="caption1 font-semibold underline uppercase">Color: {selectedVariation?.color}</div>
                                <div className="list-variation flex items-center gap-3 mt-3">
                                    {product.variations.map((v) => (
                                        <div
                                            key={v.id}
                                            className={`item w-10 h-10 rounded-full border-2 cursor-pointer ${selectedVariation?.id === v.id ? 'border-black' : 'border-line'}`}
                                            style={{ backgroundColor: v.colorCode }}
                                            onClick={() => handleVariationChange(v)}
                                            title={v.color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="size-block mt-8">
                                <div className="caption1 font-semibold underline uppercase">Size: {selectedSize}</div>
                                <div className="list-size flex items-center gap-3 mt-3">
                                    {sizes.map((s) => (
                                        <div
                                            key={s}
                                            className={`item px-5 py-2 border rounded-lg cursor-pointer font-semibold ${selectedSize === s ? 'bg-black text-white border-black' : 'border-line hover:border-black'}`}
                                            onClick={() => setSelectedSize(s)}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="action-block mt-10 flex items-center gap-5">
                            <div className="quantity-block flex items-center border border-line rounded-lg px-4 py-2">
                                <div
                                    className="cursor-pointer text-xl select-none"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >-</div>
                                <div className="px-5 font-semibold text-lg w-12 text-center">{quantity}</div>
                                <div
                                    className="cursor-pointer text-xl select-none"
                                    onClick={() => setQuantity(quantity + 1)}
                                >+</div>
                            </div>
                            <button
                                className="button-main flex-1 bg-black text-white py-4 rounded-xl hover:bg-purple text-white duration-300 font-bold uppercase transition-colors"
                                onClick={handleAddToCart}
                            >
                                Add To Cart
                            </button>
                        </div>

                        <div className="other-actions mt-6 flex items-center gap-8 border-t border-line pt-6">
                            <div className="item flex items-center gap-2 cursor-pointer hover:underline" onClick={handleWishlist}>
                                <i className={`ph-bold text-xl ${isInWishlist(product.id) ? 'ph-heart-fill text-red-500' : 'ph-heart'}`}></i>
                                <span className="caption1 font-semibold">{isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
                            </div>
                            <div className="item flex items-center gap-2 cursor-pointer hover:underline">
                                <i className="ph ph-arrow-counter-clockwise text-xl"></i>
                                <span className="caption1 font-semibold">Compare</span>
                            </div>
                        </div>

                        <div className="product-info-more mt-10 bg-zinc-50 p-6 rounded-2xl space-y-3">
                            <div className="item flex items-center justify-between">
                                <span className="caption1 text-secondary">SKU:</span>
                                <span className="caption1 font-semibold uppercase">ANS-{product.id.substring(0, 6)}</span>
                            </div>
                            <div className="item flex items-center justify-between">
                                <span className="caption1 text-secondary">Category:</span>
                                <span className="caption1 font-semibold capitalize">{product.category}</span>
                            </div>
                            <div className="item flex items-center justify-between">
                                <span className="caption1 text-secondary">Tags:</span>
                                <span className="caption1 font-semibold capitalize">{product.type}, {product.brand}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
