'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, Trash2, Tag, ChevronRight, CheckCircle2, Ticket, Percent, ShoppingBag, Sparkles } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cart, cartTotal, removeFromCart, updateQuantity, selectedPromo, applyPromo, removePromo } = useCart();
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [availablePromos, setAvailablePromos] = useState<any[]>([]);
    const [loadingPromos, setLoadingPromos] = useState(false);
    const [promoError, setPromoError] = useState('');

    const FREE_SHIPPING_THRESHOLD = 500;
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const progressPercent = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

    React.useEffect(() => {
        const fetchPromos = async () => {
            setLoadingPromos(true);
            try {
                const res = await fetch('/api/promocodes');
                if (res.ok) {
                    const data = await res.json();
                    setAvailablePromos(data);
                }
            } catch (error) {
                console.error('Failed to fetch promos', error);
            } finally {
                setLoadingPromos(false);
            }
        };
        fetchPromos();
    }, []);

    const handleApply = async (code?: string) => {
        const codeToApply = code || promoCodeInput;
        if (!codeToApply) return;

        setPromoError('');
        const res = await applyPromo(codeToApply);
        if (!res.success) {
            setPromoError(res.error || 'Invalid code');
        } else {
            setPromoCodeInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex justify-end">
            {/* Ultra-Blur Backdrop */}
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[12px] animate-in fade-in duration-700" onClick={onClose} />

            {/* Sidebar Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                
                {/* Header - Luxury Style */}
                <div className="px-10 py-12 flex items-center justify-between pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-950">My Bag</h2>
                            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                                <span className="text-xs font-black text-purple-600 italic">{cart.length}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Curated just for you</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 bg-zinc-50 hover:bg-zinc-100 rounded-full flex items-center justify-center transition-all active:scale-90 group"
                    >
                        <X className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                    </button>
                </div>

                {/* Free Shipping Tracker - Modern Minimalist */}
                <div className="px-10 pb-8 pt-2">
                    <div className="p-6 bg-zinc-50 rounded-[2rem] ring-1 ring-black/[0.03]">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-1">
                                    {remainingForFreeShipping > 0 ? 'Shipping Status' : 'Congratulations!'}
                                </span>
                                <span className="text-xs font-bold text-zinc-500">
                                    {remainingForFreeShipping > 0 
                                        ? `Only ₹${remainingForFreeShipping.toFixed(0)} to unlock free shipping` 
                                        : "Free delivery is now active 🚀"}
                                </span>
                            </div>
                            <span className="text-xl font-black text-purple-600">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Cart Items - The Hero Section */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-6 space-y-10">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="group relative flex gap-8 items-start animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                                {/* Large Prominent Image */}
                                <div className="relative w-32 aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 flex-shrink-0 group-hover:scale-105 duration-700 transition-transform">
                                    <Image 
                                        src={item.image} 
                                        alt={item.name} 
                                        fill 
                                        className="object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>

                                <div className="flex-1 flex flex-col h-full py-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" /> Popular
                                            </div>
                                            <Link href={`/shop/product/${item.slug}`} className="text-lg font-black text-zinc-950 leading-tight uppercase italic tracking-tighter hover:text-purple-600 transition-colors line-clamp-2">
                                                {item.name}
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                            className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2 mb-6">
                                        {item.selectedSize && (
                                            <span className="px-3 py-1 bg-zinc-50 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-widest ring-1 ring-black/[0.03]">Size: {item.selectedSize}</span>
                                        )}
                                        {item.selectedColor && (
                                            <span className="px-3 py-1 bg-zinc-50 rounded-full text-[9px] font-bold text-zinc-400 uppercase tracking-widest ring-1 ring-black/[0.03]">Color: {item.selectedColor}</span>
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-4 bg-zinc-950 text-white px-5 py-2 rounded-2xl shadow-lg shadow-zinc-900/10">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                                                className="text-lg font-bold text-zinc-400 hover:text-white transition-colors"
                                            >–</button>
                                            <span className="text-sm font-black min-w-[20px] text-center italic tracking-tighter">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                                                className="text-lg font-bold text-zinc-400 hover:text-white transition-colors"
                                            >+</button>
                                        </div>
                                        <div className="text-xl font-black text-zinc-950 uppercase tracking-tighter italic">₹{item.price * item.quantity}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8">
                                <ShoppingBag className="w-10 h-10 text-zinc-200" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-950">Your Bag is empty</h3>
                            <p className="text-zinc-400 text-xs mt-4 leading-relaxed max-w-[240px]">Explore our exclusive collection and start your beauty ritual today.</p>
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="mt-12 bg-zinc-950 text-white px-12 py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-zinc-950/20 hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Shop Collections
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer / Summary Area - High Impact */}
                <div className="px-10 py-10 bg-white border-t border-zinc-100 shadow-[0_-20px_50px_rgba(0,0,0,0.02)] space-y-6">
                    
                    {/* Active Coupon Display */}
                    {selectedPromo && (
                        <div className="flex items-center gap-4 p-5 bg-green-50/50 border border-green-100 rounded-3xl animate-in zoom-in-95 duration-500">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Percent className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] text-green-600/60 font-black uppercase tracking-widest">Active Discount</div>
                                <div className="text-xs font-black text-green-800 uppercase italic tracking-tighter">
                                    {selectedPromo.code} — Saved ₹{Number(selectedPromo.discountAmount || 0).toFixed(0)}
                                </div>
                            </div>
                            <button onClick={removePromo} className="text-green-800/40 hover:text-green-800 p-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Coupons Header */}
                    {availablePromos.length > 0 && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Available Offers</h3>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">{availablePromos.length} total</span>
                        </div>
                    )}

                    {/* Coupons Carousel - Sleek Tear-off Edge Style */}
                    {availablePromos.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x -mx-2 px-2">
                            {availablePromos.map((promo) => (
                                <button
                                    key={promo.id}
                                    onClick={() => handleApply(promo.code)}
                                    className={`flex-shrink-0 snap-start p-5 rounded-[2rem] border-2 transition-all text-left min-w-[260px] relative overflow-hidden group ${selectedPromo?.code === promo.code ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'border-zinc-50 bg-zinc-50/50 hover:bg-white hover:border-purple-200'}`}
                                >
                                    {/* Coupon Notches */}
                                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full -translate-y-1/2 border border-zinc-100" />
                                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full -translate-y-1/2 border border-zinc-100" />
                                    
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${selectedPromo?.code === promo.code ? 'text-white/60' : 'text-purple-600'}`}>COUPON CODE</span>
                                            <div className="text-2xl font-black italic tracking-tighter uppercase mb-3">{promo.code}</div>
                                            <p className={`text-[11px] font-bold uppercase tracking-widest opacity-80 ${selectedPromo?.code === promo.code ? 'text-white' : 'text-zinc-500'}`}>
                                                {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} FLAT OFF`}
                                            </p>
                                        </div>
                                        {selectedPromo?.code === promo.code ? (
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Final Actions */}
                    <div className="pt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex flex-col">
                                <span className="text-zinc-950 font-black uppercase tracking-[0.2em] text-xs italic">Estimated Total</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Taxes and Shipping Calculated at checkout</span>
                             </div>
                             <span className="text-3xl font-black text-purple-600 italic tracking-tighter">
                                ₹{(selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal).toFixed(0)}
                             </span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="bg-[#1a1c23] hover:bg-black text-white py-6 rounded-[1.8rem] font-black uppercase tracking-[0.25em] text-[11px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <span className="relative z-10">Proceed to Checkout</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                            {/* Reflection Glow */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.2s] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
