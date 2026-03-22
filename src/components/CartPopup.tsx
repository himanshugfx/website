'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, X, ChevronRight, ShoppingBag, Sparkles, ArrowRight, Truck, ShieldCheck, Star } from 'lucide-react';

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
                        setRecommended(shuffled.slice(0, 3)); // Show 3 for more variety
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
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-0 md:p-6 sm:p-4">
            {/* Ultra-Premium Backdrop with heavy blur */}
            <div 
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[12px] animate-in fade-in duration-1000" 
                onClick={closePopup}
            />

            {/* Main Modal - The "Beauty Box" Redesign */}
            <div className="relative w-full h-full md:h-auto md:max-w-4xl bg-white md:rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-20 sm:zoom-in-95 fade-in duration-700 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Side: Visual & Confirmation (Desktop only side) */}
                <div className="hidden md:flex w-2/5 bg-zinc-950 relative overflow-hidden flex-col p-12 text-white">
                    {/* Abstract Light Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 ring-1 ring-white/20">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
                            Added <br />To Bag
                        </h2>
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inventory Reserved</span>
                        </div>

                        {/* Order Progress / Free Shipping */}
                        <div className="space-y-4 bg-white/5 backdrop-blur-sm p-6 rounded-[2rem] border border-white/10">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                                <span>Free Shipping</span>
                                <span>{progress >= 100 ? 'Unlocked' : `₹${away} to Go`}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto relative z-10 flex items-center gap-4 text-zinc-500">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Cruelty Free • Paraben Free • Premium</span>
                    </div>
                </div>

                {/* Right Side: Product & Actions (Mobile Full Container) */}
                <div className="flex-1 overflow-hidden flex flex-col bg-white">
                    {/* Mobile Only Header */}
                    <div className="md:hidden flex items-center justify-between p-8 pb-4">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Success</h3>
                        <button onClick={closePopup} className="p-2 bg-zinc-50 rounded-full">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-8 md:px-12 py-6">
                        {/* Main Product Display */}
                        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                            <div className="relative aspect-[3/4] w-full md:w-48 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 group">
                                <Image
                                    src={lastAddedItem.image}
                                    alt={lastAddedItem.name}
                                    fill
                                    className="object-cover group-hover:scale-110 duration-700 transition-transform"
                                    priority
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
                                    <span className="text-[9px] font-black text-zinc-900 uppercase">New Arrival</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col pt-2">
                                <div className="text-purple-600 text-[11px] font-black uppercase tracking-[0.25em] mb-3">Item Summary</div>
                                <h1 className="text-2xl md:text-3xl font-black text-zinc-950 uppercase italic tracking-tighter leading-tight mb-4">
                                    {lastAddedItem.name}
                                </h1>
                                
                                <div className="grid grid-cols-2 gap-y-4 border-y border-zinc-100 py-6 mb-6">
                                    <div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Details</div>
                                        <div className="text-xs font-black text-zinc-900 uppercase">{lastAddedItem.selectedSize || 'Standard Size'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Quantity</div>
                                        <div className="text-xs font-black text-zinc-900 uppercase">{lastAddedItem.quantity} Unit</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Subtotal</div>
                                        <div className="text-2xl font-black text-purple-600 uppercase">₹{lastAddedItem.price}</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Link 
                                        href="/cart"
                                        onClick={closePopup}
                                        className="flex-1 h-16 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                    >
                                        Review Bag
                                    </Link>
                                    <Link 
                                        href="/checkout"
                                        onClick={closePopup}
                                        className="flex-[2] h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-purple-600/20 group transition-all active:scale-95"
                                    >
                                        Fast Checkout <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Pair with Section - Horizontal Gallery */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Complete the ritual</h4>
                                <div className="flex-1 h-[1px] bg-zinc-100 mx-6" />
                            </div>
                            
                            <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 -mx-2 px-2 snap-x">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="flex-shrink-0 w-40 aspect-square bg-zinc-50 animate-pulse rounded-[2rem]" />
                                    ))
                                ) : (
                                    recommended.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/shop/product/${product.slug}`}
                                            onClick={closePopup}
                                            className="flex-shrink-0 w-48 snap-start group"
                                        >
                                            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-50 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                <Image
                                                    src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.webp')}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 duration-700 transition-transform"
                                                />
                                                <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <ArrowRight className="w-4 h-4 text-purple-600" />
                                                </div>
                                            </div>
                                            <h5 className="text-[10px] font-black text-zinc-900 uppercase italic tracking-tight line-clamp-1 mb-1">{product.name}</h5>
                                            <p className="text-[11px] font-bold text-purple-600">₹{product.price}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Trust Section */}
                    <div className="px-12 py-8 bg-zinc-50/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-zinc-100">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Trusted By</span>
                                <span className="text-[11px] font-black text-zinc-900 uppercase italic">10k+ Beauty Enthusiasts</span>
                            </div>
                            <div className="h-8 w-[1px] bg-zinc-200" />
                            <div className="flex gap-3">
                                <Image src="/assets/images/payment_methods/upi.webp" alt="Payment" width={24} height={12} className="h-2.5 w-auto object-contain brightness-0 contrast-50" />
                                <Image src="/assets/images/payment_methods/visa.webp" alt="Payment" width={24} height={12} className="h-2.5 w-auto object-contain brightness-0 contrast-50" />
                                <Image src="/assets/images/payment_methods/rupay.webp" alt="Payment" width={24} height={12} className="h-2.5 w-auto object-contain brightness-0 contrast-50" />
                            </div>
                        </div>
                        
                        <button 
                            onClick={closePopup}
                            className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-950 underline decoration-purple-500 decoration-2 underline-offset-8 hover:decoration-purple-600"
                        >
                            Continue Selection
                        </button>
                    </div>
                </div>

                {/* Desktop Global Close */}
                <button 
                    onClick={closePopup}
                    className="hidden md:flex absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-[6000] backdrop-blur-md transition-all active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
