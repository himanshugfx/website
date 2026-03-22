'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckCircle, X, ChevronRight } from 'lucide-react';

interface ProductType {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbImage?: string;
    images?: string;
}

export default function CartPopup() {
    const { isPopupOpen, closePopup, lastAddedItem } = useCart();
    const [recommended, setRecommended] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isPopupOpen && lastAddedItem) {
            setLoading(true);
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/ana/products?action=list');
                    const data = await res.json();
                    if (data.products && Array.isArray(data.products)) {
                        const others = data.products.filter((p: ProductType) => p.id !== lastAddedItem.id);
                        const shuffled = others.sort(() => 0.5 - Math.random());
                        setRecommended(shuffled.slice(0, 2));
                    }
                } catch (e) {
                    console.error("Failed to load recommendations", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [isPopupOpen, lastAddedItem]);

    if (!isPopupOpen || !lastAddedItem) return null;

    // Helper to format item options
    const itemOptions = [
        lastAddedItem.selectedSize && `Size: ${lastAddedItem.selectedSize}`,
        lastAddedItem.selectedColor && `Color: ${lastAddedItem.selectedColor}`
    ].filter(Boolean).join(' | ');

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={closePopup}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-500 overflow-hidden flex flex-col max-h-[92vh]">
                {/* Close Button - More Premium */}
                <button
                    onClick={closePopup}
                    className="absolute top-5 right-5 z-30 p-2.5 bg-white/80 backdrop-blur-md hover:bg-white shadow-sm ring-1 ring-black/5 rounded-full transition-all active:scale-90"
                >
                    <X className="w-4 h-4 text-zinc-900" />
                </button>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    {/* Success Header - Seamless */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-2.5 text-green-600 mb-2">
                            <div className="w-7 h-7 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-black uppercase italic tracking-tighter text-base">Success! Added to Bag</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] ml-1">Your premium selection is ready</p>
                    </div>

                    {/* Product Summary - Seamless & Elegant */}
                    <div className="px-8 py-6 mb-2">
                        <div className="flex gap-6 items-center p-4 bg-zinc-50/50 rounded-[2rem] ring-1 ring-black/[0.03]">
                            <div className="w-24 aspect-[3/4] relative rounded-2xl overflow-hidden flex-shrink-0 shadow-xl shadow-black/5">
                                <Image
                                    src={lastAddedItem.image}
                                    alt={lastAddedItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col min-w-0 pr-2">
                                <div className="font-black text-zinc-900 text-base leading-tight line-clamp-2 uppercase italic tracking-tight mb-2">{lastAddedItem.name}</div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 flex flex-wrap gap-2">
                                    {lastAddedItem.selectedSize && <span className="bg-white px-2 py-0.5 rounded-full ring-1 ring-zinc-100">Size: {lastAddedItem.selectedSize}</span>}
                                    {lastAddedItem.selectedColor && <span className="bg-white px-2 py-0.5 rounded-full ring-1 ring-zinc-100">Color: {lastAddedItem.selectedColor}</span>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[11px] font-black text-zinc-400 opacity-60">QTY: {lastAddedItem.quantity}</span>
                                    <span className="font-black text-xl text-purple-600">₹{lastAddedItem.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Section - Seamless Flow */}
                    <div className="px-8 pb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Complete the Look</h4>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-100 to-transparent" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {loading ? (
                                <div className="col-span-2 py-10 flex flex-col items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Finding the perfect match...</span>
                                </div>
                            ) : recommended.length > 0 ? (
                                recommended.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/shop/product/${product.slug}`}
                                        onClick={closePopup}
                                        className="flex flex-col group text-left"
                                    >
                                        <div className="relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-zinc-50 mb-3 shadow-sm group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-500">
                                            <Image
                                                src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 duration-700 transition-transform"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                        </div>
                                        <div className="px-1">
                                            <div className="font-bold text-[11px] text-zinc-900 line-clamp-1 mb-1 uppercase italic tracking-tight">{product.name}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-purple-600">₹{product.price}</span>
                                                <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 py-8 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-100">
                                    Tailored for you
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Footer - Seamless Blur Glassmorphism */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 pb-10 bg-gradient-to-t from-white via-white/100 to-white/0 pointer-events-none">
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <Link
                            href="/checkout"
                            onClick={closePopup}
                            className="w-full bg-[#1a1c23] hover:bg-black text-white flex flex-col items-center justify-center py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-[0.98] shadow-2xl shadow-zinc-900/20 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Secure Checkout <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="flex items-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="h-4 w-auto bg-white/10 rounded px-1 flex items-center">
                                    <Image src="/assets/images/payment_methods/upi.webp" alt="UPI" width={24} height={12} className="w-auto h-2 object-contain brightness-0 invert" />
                                </div>
                                <div className="h-4 w-auto bg-white/10 rounded px-1 flex items-center">
                                    <Image src="/assets/images/payment_methods/rupay.webp" alt="Rupay" width={24} height={12} className="w-auto h-2 object-contain brightness-0 invert" />
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={closePopup}
                            className="w-full text-zinc-400 hover:text-zinc-900 font-bold uppercase tracking-[0.2em] text-[10px] transition-all"
                        >
                            Explore More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
