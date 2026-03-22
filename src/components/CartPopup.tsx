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
                        setRecommended(shuffled.slice(0, 4)); // Show 4 for a nice grid
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
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6">
            {/* Soft Minimalist Backdrop */}
            <div 
                className="absolute inset-0 bg-white/40 backdrop-blur-[20px] animate-in fade-in duration-700" 
                onClick={closePopup}
            />

            {/* Modern "Glass Island" Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03] animate-in zoom-in-95 slide-in-from-bottom-10 fade-in duration-500 overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Header - Minimalist */}
                <div className="flex items-center justify-between p-10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-zinc-900">Sweet success!</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Added to your curated bag</p>
                        </div>
                    </div>
                    <button 
                        onClick={closePopup}
                        className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all active:scale-90 group"
                    >
                        <X className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </button>
                </div>

                {/* Content - Airy & Modern */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-10">
                    
                    {/* Featured Product Card - Minimalist Focus */}
                    <div className="group relative bg-zinc-50/50 p-8 rounded-[3rem] border border-white/50 mb-10 transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-40 aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 transition-transform duration-700 group-hover:scale-105">
                                <Image
                                    src={lastAddedItem.image}
                                    alt={lastAddedItem.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                                    <Heart className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block px-3 py-1 bg-white rounded-full text-[9px] font-black text-purple-600 uppercase tracking-widest mb-3 shadow-sm ring-1 ring-black/[0.02]">Premium Choice</div>
                                <h3 className="text-2xl font-black text-zinc-950 uppercase italic tracking-tighter leading-tight mb-4">{lastAddedItem.name}</h3>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    {lastAddedItem.selectedSize && <span>Size: {lastAddedItem.selectedSize}</span>}
                                    <span>Quantity: {lastAddedItem.quantity}</span>
                                    <span className="text-purple-600 font-black">₹{lastAddedItem.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress to Free Shipping - Minimalist Bar */}
                    <div className="mb-12 px-2">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
                                {progress >= 100 ? '✨ FREE SHIPPING UNLOCKED' : '🚀 ALMOST THERE!'}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400">
                                {progress >= 100 ? 'Zero Delivery Fee' : `Only ₹${away} to go for free shipping`}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full p-0.5">
                            <div 
                                className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-600 -translate-y-1/4" />
                            </div>
                        </div>
                    </div>

                    {/* Recommendations - Modern Grid */}
                    <div className="pb-10">
                        <div className="flex items-center gap-4 mb-8">
                            <h4 className="flex-shrink-0 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Enhance your ritual</h4>
                            <div className="flex-1 h-[1px] bg-zinc-100" />
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-square bg-zinc-50 animate-pulse rounded-[2rem]" />
                                ))
                            ) : (
                                recommended.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/shop/product/${product.slug}`}
                                        onClick={closePopup}
                                        className="group relative"
                                    >
                                        <div className="relative aspect-square rounded-[1.8rem] overflow-hidden bg-zinc-50 mb-3 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                                            <Image
                                                src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 duration-700 transition-transform"
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="px-1 text-center">
                                            <h5 className="text-[9px] font-black text-zinc-900 uppercase italic tracking-tighter line-clamp-1 group-hover:text-purple-600 transition-colors">{product.name}</h5>
                                            <p className="text-[10px] font-bold text-zinc-400">₹{product.price}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Elegant Bottom Bar */}
                <div className="p-10 pt-6 bg-white border-t border-zinc-50 flex flex-col md:flex-row gap-6 items-center">
                    <Link
                        href="/cart"
                        onClick={closePopup}
                        className="w-full md:w-auto px-8 h-16 rounded-[1.8rem] bg-zinc-950 text-white flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] hover:bg-black shadow-2xl shadow-zinc-900/10"
                    >
                        Review Bag
                    </Link>
                    <Link
                        href="/checkout"
                        onClick={closePopup}
                        className="w-full flex-1 h-16 rounded-[1.8rem] bg-purple-600 text-white flex items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] hover:bg-purple-700 shadow-2xl shadow-purple-600/20 group"
                    >
                        Secure Checkout <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
