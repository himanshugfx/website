'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getMediaUrl, getMediaUrls } from '@/lib/media';
import RazorpayTrustBadge from '@/components/RazorpayTrustBadge';
import { trackViewContent } from '@/lib/pixel';
import { ChevronDown } from 'lucide-react';

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
    thumbImage: string; // Add thumbImage to interface
    variations: Variation[];
    sizes: string; // Comma separated or single
    slug: string;
    category: string;
    type: string;
    videoUrl?: string; // Optional video URL - if set, shows video
    ingredients?: string | null;
}

export default function ProductDetailClient({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const DEFAULT_IMAGE = '/assets/images/product/1000x1000.webp';

    // Use helper to get all gallery images as proper URLs
    let images: string[] = getMediaUrls(product.images);

    // Add thumbImage at the beginning if it exists
    const thumbUrl = getMediaUrl(product.thumbImage, '');
    if (thumbUrl && thumbUrl !== '' && !images.includes(thumbUrl)) {
        images.unshift(thumbUrl);
    }

    // Ensure at least one image
    if (images.length === 0) {
        images = [DEFAULT_IMAGE];
    }

    const sizes = product.sizes ? product.sizes.split(',') : [];

    // Get video URL using helper (supports both media IDs and legacy URLs)
    const videoUrl = product.videoUrl ? getMediaUrl(product.videoUrl, '') : '';
    const hasVideo = !!videoUrl;

    const [activeImage, setActiveImage] = useState(images[0]);
    const [showVideo, setShowVideo] = useState(hasVideo); // Show video by default if available
    const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(product.variations[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (product) {
            trackViewContent({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                slug: product.slug,
            });
        }
    }, [product]);

    const handleVariationChange = (v: Variation) => {
        setSelectedVariation(v);
        setActiveImage(v.image);
        setShowVideo(false); // Switch to image when selecting a variation
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
        <div className="product-detail-block md:py-16 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex max-md:flex-col gap-10 items-start">
                    {/* Left Column: Product Visuals with Drop-Shadow Contour */}
                    <div className="left-content md:w-1/2 w-full sticky top-24">
                        <div className="image-main relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-stone-50/80 to-stone-100/50 border border-gray-100/80 flex items-center justify-center p-8">
                            {showVideo && hasVideo ? (
                                <video
                                    src={videoUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="object-cover w-full h-full rounded-xl"
                                />
                            ) : (
                                <div className="relative w-full h-full transition-transform duration-500 hover:scale-[1.03]" style={{ filter: 'drop-shadow(0 15px 10px rgba(0,0,0,0.04))' }}>
                                    <Image
                                        src={activeImage}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        unoptimized={activeImage.startsWith('/uploads/') || activeImage.startsWith('/api/media/')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="list-images grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                            {hasVideo && (
                                <div
                                    className={`item aspect-square rounded-xl overflow-hidden cursor-pointer border-2 relative transition-all duration-200 ${
                                        showVideo ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setShowVideo(true)}
                                >
                                    <video
                                        src={videoUrl}
                                        muted
                                        className="object-cover w-full h-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                                            <svg className="w-3.5 h-3.5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`item aspect-square rounded-xl overflow-hidden cursor-pointer border-2 bg-stone-50/50 p-1 transition-all duration-200 ${
                                        !showVideo && activeImage === img ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => {
                                        setActiveImage(img);
                                        setShowVideo(false);
                                    }}
                                >
                                    <div className="relative w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.03))' }}>
                                        <Image
                                            src={img}
                                            alt={`Thumb ${i}`}
                                            fill
                                            className="object-contain"
                                            sizes="100px"
                                            unoptimized={img.startsWith('/uploads/') || img.startsWith('/api/media/')}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Three Rounded Rectangle Cards */}
                    <div className="right-content md:w-1/2 w-full space-y-6">

                        {/* CARD 1: Core Purchasing & Configuration Card */}
                        <div className="rounded-2xl shadow-sm p-6 border border-gray-100 bg-white space-y-6">
                            {/* Brand & Reviews */}
                            <div className="flex items-center justify-between">
                                <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                                    {product.brand || 'Anose Beauty'}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                    <span className="text-amber-500">★★★★★</span>
                                    <span>5.0</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-purple-600 hover:underline cursor-pointer">51 Reviews</span>
                                </div>
                            </div>

                            {/* Product Title & Category */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight font-primary">
                                    {product.name}
                                </h1>
                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                    Category: <span className="font-semibold text-gray-700">{product.category}</span>
                                </p>
                            </div>

                            {/* Price Block */}
                            <div className="flex items-baseline gap-3 pt-1 border-t border-gray-50">
                                <span className="text-3xl font-extrabold text-gray-900">
                                    ₹{product.price}
                                </span>
                                {product.originPrice > product.price && (
                                    <>
                                        <del className="text-base text-gray-400 line-through font-medium">
                                            ₹{product.originPrice}
                                        </del>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            {Math.round(((product.originPrice - product.price) / product.originPrice) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                                <span className="text-[11px] text-gray-400 ml-auto font-medium">Inclusive of all taxes</span>
                            </div>

                            {/* Size / Volume Variations */}
                            {product.variations.length > 0 && (
                                <div className="variation-block pt-3 border-t border-gray-50">
                                    <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                                        <span>Select Size / Volume</span>
                                        <span className="text-purple-600 font-extrabold">{selectedVariation?.color}</span>
                                    </div>
                                    <div className="list-variation flex flex-wrap items-center gap-2.5 mt-3">
                                        {product.variations.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                                                    selectedVariation?.id === v.id
                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/30 scale-[1.02]'
                                                        : 'bg-white text-gray-800 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                                                }`}
                                                onClick={() => handleVariationChange(v)}
                                            >
                                                {v.color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Sizes */}
                            {sizes.length > 0 && product.variations.length === 0 && (
                                <div className="size-block pt-3 border-t border-gray-50">
                                    <div className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                                        <span>Select Size</span>
                                        <span className="text-purple-600 font-extrabold">{selectedSize}</span>
                                    </div>
                                    <div className="list-size flex flex-wrap items-center gap-2.5 mt-3">
                                        {sizes.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                                                    selectedSize === s
                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/30 scale-[1.02]'
                                                        : 'bg-white text-gray-800 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                                                }`}
                                                onClick={() => setSelectedSize(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity and Primary Action */}
                            <div className="action-block flex items-center gap-4 pt-3 border-t border-gray-50">
                                <div className="quantity-block flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/60">
                                    <button
                                        type="button"
                                        aria-label="Decrease quantity"
                                        className="cursor-pointer text-lg font-bold text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center select-none"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >−</button>
                                    <span className="px-3 font-bold text-base w-10 text-center text-gray-900">{quantity}</span>
                                    <button
                                        type="button"
                                        aria-label="Increase quantity"
                                        className="cursor-pointer text-lg font-bold text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center select-none"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >+</button>
                                </div>
                                <button
                                    className="button-main flex-1 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                                    onClick={handleAddToCart}
                                >
                                    Add To Cart
                                </button>
                            </div>

                            {/* Trust Badge & Actions */}
                            <div className="pt-2">
                                <RazorpayTrustBadge />
                            </div>

                            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleWishlist}
                                    className="flex items-center gap-1.5 hover:text-purple-700 transition-colors cursor-pointer"
                                >
                                    <i className={`ph-bold text-base ${isInWishlist(product.id) ? 'ph-heart-fill text-red-500' : 'ph-heart'}`}></i>
                                    <span>{isInWishlist(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                                </button>
                                <span className="text-gray-400">⚡ In Stock • Ships within 24h</span>
                            </div>
                        </div>

                        {/* CARD 2: Product Overview & Specifications Card */}
                        <div className="rounded-2xl shadow-sm p-6 border border-gray-100 bg-white space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                    Product Overview
                                </h2>
                                <span className="text-[11px] font-semibold text-purple-700 uppercase">Description</span>
                            </div>

                            <div className="description-content">
                                <p className={`text-gray-700 text-sm leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                    {product.description}
                                </p>
                                {product.description && product.description.length > 80 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors uppercase tracking-wider focus:outline-none cursor-pointer"
                                    >
                                        <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </div>

                            {/* Specifications Key-Value List */}
                            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-stone-50/70 rounded-xl">
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-semibold">SKU</span>
                                    <span className="font-bold text-gray-900 uppercase">ANS-{product.id.substring(0, 8)}</span>
                                </div>
                                <div className="p-3 bg-stone-50/70 rounded-xl">
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-semibold">Category</span>
                                    <span className="font-bold text-gray-900 capitalize">{product.category}</span>
                                </div>
                                <div className="p-3 bg-stone-50/70 rounded-xl">
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-semibold">Type</span>
                                    <span className="font-bold text-gray-900 capitalize">{product.type}</span>
                                </div>
                                <div className="p-3 bg-stone-50/70 rounded-xl">
                                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider font-semibold">Origin</span>
                                    <span className="font-bold text-gray-900">Made in India 🇮🇳</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: Formulation, Ingredients & Quality Assurance Card */}
                        <div className="rounded-2xl shadow-sm p-6 border border-gray-100 bg-white space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Ingredients & Purity
                                </h2>
                                <span className="text-[11px] font-semibold text-emerald-700 uppercase">100% Organic</span>
                            </div>

                            {/* Ingredients Pills */}
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2.5">Key Actives & Formulation:</div>
                                <div className="flex flex-wrap gap-2">
                                    {(product.ingredients || 'Aloe Vera Extract, Botanical Actives, Vitamin E, Essential Herbal Oils, Aqua')
                                        .split(',')
                                        .map((item, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-purple-50/60 border border-purple-100/80 rounded-full text-xs font-medium text-purple-900 shadow-sm"
                                            >
                                                {item.trim()}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            {/* Trust Quality Badges */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-700">
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50/60">
                                    <span className="text-base">🌿</span>
                                    <span>Paraben & Toxin Free</span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50/60">
                                    <span className="text-base">🐰</span>
                                    <span>Cruelty-Free Certified</span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50/60">
                                    <span className="text-base">✨</span>
                                    <span>Dermatologically Tested</span>
                                </div>
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50/60">
                                    <span className="text-base">🛡️</span>
                                    <span>100% Authentic Product</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
