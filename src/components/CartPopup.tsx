'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckCircle, X, ChevronRight, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

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
        <div className="fixed inset-0 z-[3000] flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop with premium blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] cursor-pointer" onClick={closePopup}></div>
            
            {/* Modal Container */}
            <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[3rem] shadow-[0_25px_100px_-20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-700 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]">
                
                {/* Visual Accent - Purple Glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* Header - Success Message */}
                <div className="relative pt-10 pb-6 px-10 flex flex-col items-center">
                    <button
                        onClick={closePopup}
                        className="absolute top-6 right-6 p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all active:scale-90 group z-50"
                    >
                        <X className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                    </button>

                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-green-50/50 animate-bounce">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 mb-1">Added to Bag!</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">Your journey to beauty begins</p>
                </div>

                {/* Seamless Scrolling Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
                    {/* Main Product Card */}
                    <div className="px-8 mb-10">
                        <div className="group relative bg-zinc-50/50 p-6 rounded-[2.5rem] ring-1 ring-black/[0.03] transition-all hover:bg-zinc-50 duration-500">
                            <div className="flex gap-6 items-center">
                                <div className="w-28 aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-700 group-hover:scale-105">
                                    <Image
                                        src={lastAddedItem.image}
                                        alt={lastAddedItem.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 rounded-lg mb-2">
                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                        <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Premium Pick</span>
                                    </div>
                                    <h3 className="font-black text-lg text-zinc-900 leading-tight uppercase italic tracking-tight mb-3 line-clamp-2">{lastAddedItem.name}</h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {itemOptions.split(' | ').filter(Boolean).map((opt, i) => (
                                            <span key={i} className="px-3 py-1 bg-white ring-1 ring-black/[0.05] rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{opt}</span>
                                        ))}
                                        <span className="px-3 py-1 bg-white ring-1 ring-black/[0.05] rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Qty: {lastAddedItem.quantity}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-purple-600">₹{lastAddedItem.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upsell/Recommendations */}
                    <div className="px-8 pb-10">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Perfect Pairings</h4>
                            </div>
                            <Link href="/shop" onClick={closePopup} className="text-[9px] font-black uppercase text-purple-600 hover:underline">View All</Link>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5">
                            {loading ? (
                                [1, 2].map(i => (
                                    <div key={i} className="aspect-square bg-zinc-50 animate-pulse rounded-[2rem]" />
                                ))
                            ) : recommended.length > 0 ? (
                                recommended.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/shop/product/${product.slug}`}
                                        onClick={closePopup}
                                        className="group relative flex flex-col"
                                    >
                                        <div className="relative aspect-[4/5] w-full rounded-[2.2rem] overflow-hidden bg-zinc-50 mb-4 shadow-sm group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-700">
                                            <Image
                                                src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 duration-[1.5s] transition-transform ease-out"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-4 left-0 right-0 p-2 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-bold text-zinc-900 uppercase tracking-widest shadow-lg">Buy Now</div>
                                            </div>
                                        </div>
                                        <div className="px-2">
                                            <h5 className="font-bold text-[10px] text-zinc-900 line-clamp-1 mb-1 uppercase italic tracking-tight transition-colors group-hover:text-purple-600">{product.name}</h5>
                                            <p className="text-[11px] font-black text-purple-600/60">₹{product.price}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 py-12 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-[0.25em] bg-zinc-50/50 rounded-[2.5rem] border-2 border-dashed border-zinc-100">
                                    Tailored Beauty Picks
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Persistent Footer - Frosted Glass Glassmorphism */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-white/80 backdrop-blur-xl border-t border-zinc-50">
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/checkout"
                            onClick={closePopup}
                            className="group relative w-full h-16 bg-[#1a1c23] hover:bg-black text-white rounded-[1.8rem] flex items-center justify-center transition-all duration-500 active:scale-[0.97] shadow-2xl shadow-zinc-900/20"
                        >
                            <span className="relative z-10 flex items-center gap-3 font-black uppercase tracking-[0.25em] text-[11px]">
                                Secure Checkout
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                            </span>
                            
                            {/* Decorative Flash Effect */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1s] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                        </Link>
                        
                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={closePopup}
                                className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                Continue Selection
                            </button>
                            <div className="flex items-center gap-3 opacity-40">
                                <Image src="/assets/images/payment_methods/upi.webp" alt="UPI" width={28} height={14} className="h-2.5 w-auto object-contain grayscale" />
                                <Image src="/assets/images/payment_methods/visa.webp" alt="Visa" width={28} height={14} className="h-2.5 w-auto object-contain grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
