'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, X, ChevronRight, ShoppingBag, Sparkles, ArrowRight, Truck, ShieldCheck, Heart } from 'lucide-react';

interface ProductType {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbImage?: string;
    images?: string;
}

export default function CartPopup() {
    const { isPopupOpen, closePopup, lastAddedItem, cartTotal } = useCart();
    const [recommended, setRecommended] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);

    // Shipping Threshold Logic
    const SHIPPING_THRESHOLD = 500;
    const progress = Math.min((cartTotal / SHIPPING_THRESHOLD) * 100, 100);
    const away = SHIPPING_THRESHOLD - cartTotal;

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
                        setRecommended(shuffled.slice(0, 3)); 
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

    return (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-0 md:p-8">
            {/* High-End Shadow Overlay */}
            <div 
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[12px] animate-in fade-in duration-700" 
                onClick={closePopup}
            />

            {/* Modal - Luxury "Ritual Box" */}
            <div className="relative w-full h-full md:h-auto md:max-w-4xl bg-white md:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-20 zoom-in-95 fade-in duration-500 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side: Editorial Shot */}
                <div className="hidden md:flex w-[40%] bg-zinc-950 relative overflow-hidden flex-col p-12 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 ring-1 ring-white/20">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-10">
                            Ritual <br />Added
                        </h2>
                        
                        <div className="mt-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="w-5 h-5 text-purple-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authenticity Guaranteed</span>
                            </div>
                            <div className="flex items-center gap-4 text-zinc-400">
                                <Truck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {progress >= 100 ? 'Free Delivery Unlocked' : 'Safe Fast Shipping'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Product & Rituals */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden">
                    {/* Header - Mobile Only Close */}
                    <div className="flex justify-between items-center p-8 pb-4">
                        <div className="md:hidden flex items-center gap-2">
                             <CheckCircle2 className="w-5 h-5 text-green-600" />
                             <span className="font-black uppercase italic tracking-tighter">Success</span>
                        </div>
                        <button onClick={closePopup} className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full group transition-all">
                            <X className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-8 md:px-12 pb-10">
                        {/* Main Product Showcase */}
                        <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
                            <div className="relative aspect-[3/4] w-full md:w-56 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 group">
                                <Image
                                    src={lastAddedItem.image}
                                    alt={lastAddedItem.name}
                                    fill
                                    className="object-cover group-hover:scale-110 duration-700 transition-transform"
                                    priority
                                />
                                <div className="absolute bottom-6 left-6 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg">
                                    <Heart className="w-4 h-4 text-purple-600 fill-purple-600" />
                                </div>
                            </div>
                            
                            <div className="flex-1 py-4">
                                <div className="text-purple-600 text-[11px] font-black uppercase tracking-[0.25em] mb-4">In Your Bag</div>
                                <h3 className="text-3xl font-black text-zinc-950 uppercase italic tracking-tighter leading-tight mb-6">
                                    {lastAddedItem.name}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-y-6 border-y border-zinc-100 py-6 mb-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Variant</span>
                                        <span className="font-black text-zinc-900 uppercase italic tracking-tighter">{lastAddedItem.selectedSize || 'Select Size'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pricing</span>
                                        <span className="text-2xl font-black text-purple-600 italic tracking-tighter">₹{lastAddedItem.price}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Link 
                                        href="/cart"
                                        onClick={closePopup}
                                        className="flex-1 h-16 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-zinc-900/10 transition-all active:scale-[0.98] hover:bg-black"
                                    >
                                        My Bag
                                    </Link>
                                    <Link 
                                        href="/checkout"
                                        onClick={closePopup}
                                        className="flex-1 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-purple-600/20 active:scale-[0.98] transition-all hover:bg-purple-700 group"
                                    >
                                        Checkout <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ritual Suggestions */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="flex-shrink-0 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">The Beauty ritual</h4>
                                <div className="flex-1 h-[1px] bg-zinc-100" />
                            </div>
                            
                            <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4 snap-x -mx-2 px-2">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="flex-shrink-0 w-44 aspect-square bg-zinc-50 animate-pulse rounded-[2.5rem]" />
                                    ))
                                ) : (
                                    recommended.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/shop/product/${product.slug}`}
                                            onClick={closePopup}
                                            className="flex-shrink-0 w-48 snap-start group"
                                        >
                                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-50 mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                                <Image
                                                    src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 duration-700 transition-transform"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </div>
                                            <h5 className="text-[10px] font-black text-zinc-950 uppercase italic tracking-tighter mb-1 line-clamp-1 group-hover:text-purple-600">{product.name}</h5>
                                            <p className="text-[11px] font-black text-purple-600">₹{product.price}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
