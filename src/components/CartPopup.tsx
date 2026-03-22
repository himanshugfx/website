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
            <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 z-20 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors active:scale-95"
                >
                    <X className="w-4 h-4 text-zinc-900" />
                </button>

                <div className="overflow-y-auto no-scrollbar">
                    {/* Success Header */}
                    <div className="p-6 pb-4 border-b border-zinc-50">
                        <div className="flex items-center gap-2.5 text-green-600 mb-1">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4" />
                            </div>
                            <span className="font-black uppercase italic tracking-tighter text-sm">Success! Added to Bag</span>
                        </div>
                    </div>

                    {/* Product Summary - Compact */}
                    <div className="px-6 py-4 flex gap-4 bg-zinc-50/50">
                        <div className="w-20 aspect-[3/4] relative rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm ring-1 ring-zinc-100">
                            <Image
                                src={lastAddedItem.image}
                                alt={lastAddedItem.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center min-w-0 py-1">
                            <div className="font-black text-zinc-900 leading-tight line-clamp-2 text-sm uppercase italic tracking-tight">{lastAddedItem.name}</div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                {itemOptions}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-full ring-1 ring-zinc-100">Qty: {lastAddedItem.quantity}</span>
                                <span className="font-black text-purple-600">₹{lastAddedItem.price}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation Section */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 underline decoration-purple-200 underline-offset-4">Complete your routine</h4>
                            <div className="w-8 h-[1px] bg-zinc-100" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {loading ? (
                                <div className="col-span-2 py-8 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                </div>
                            ) : recommended.length > 0 ? (
                                recommended.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/shop/product/${product.slug}`}
                                        onClick={closePopup}
                                        className="flex flex-col p-2.5 bg-white border border-zinc-100 rounded-2xl hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all group group/card text-left h-full"
                                    >
                                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-50 mb-3">
                                            <Image
                                                src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 duration-700 transition-transform"
                                            />
                                        </div>
                                        <div className="min-w-0 mt-auto">
                                            <div className="font-bold text-[11px] text-zinc-900 line-clamp-1 leading-none mb-1.5 uppercase italic tracking-tight">{product.name}</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-zinc-400">₹{product.price}</span>
                                                <div className="w-5 h-5 bg-zinc-900 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 py-6 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                    No more suggestions found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-white border-t border-zinc-100 mt-auto">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/checkout"
                            onClick={closePopup}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-purple-600/20 group"
                        >
                            <span>Continue to Checkout</span>
                            <div className="flex items-center gap-1.5 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="h-4 w-auto bg-white rounded-md px-1 flex items-center justify-center overflow-hidden">
                                    <Image src="/assets/images/payment_methods/upi.webp" alt="UPI" width={24} height={12} className="w-auto h-2.5 object-contain" />
                                </div>
                                <div className="h-4 w-auto bg-white rounded-md px-1 flex items-center justify-center overflow-hidden">
                                    <Image src="/assets/images/payment_methods/rupay.webp" alt="Rupay" width={24} height={12} className="w-auto h-2.5 object-contain" />
                                </div>
                                <div className="h-4 w-auto bg-white rounded-md px-1 flex items-center justify-center overflow-hidden">
                                    <Image src="/assets/images/payment_methods/visa.webp" alt="Visa" width={24} height={12} className="w-auto h-2.5 object-contain" />
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={closePopup}
                            className="w-full py-4 text-zinc-400 hover:text-zinc-900 font-bold uppercase tracking-widest text-[10px] transition-colors"
                        >
                            Or Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
