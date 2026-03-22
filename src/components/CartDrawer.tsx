'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, Trash2, Tag, ChevronRight, CheckCircle2, Ticket, Percent } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cart, cartTotal, removeFromCart, updateQuantity, selectedPromo, applyPromo, removePromo } = useCart();
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [availablePromos, setAvailablePromos] = useState<any[]>([]);
    const [loadingPromos, setLoadingPromos] = useState(false);
    const [promoError, setPromoError] = useState('');

    const FREE_SHIPPING_THRESHOLD = 199;
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
        <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">Your Cart</h2>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{cart.length} items</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zinc-50 flex items-center justify-center transition-all active:scale-95">
                        <X className="w-5 h-5 text-zinc-900" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="p-6 bg-zinc-50">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-zinc-600">
                            {remainingForFreeShipping > 0
                                ? `Spend ₹${remainingForFreeShipping.toFixed(0)} more for FREE shipping!`
                                : "You've unlocked FREE shipping! 🚚"}
                        </span>
                        <span className="font-bold">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-600 transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 group">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <Link href={`/product/${item.slug}`} className="font-bold text-zinc-900 leading-tight hover:underline">{item.name}</Link>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                            className="text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                                        {item.selectedSize && `Size: ${item.selectedSize}`}
                                        {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4 bg-zinc-100 px-3 py-1.5 rounded-xl">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                                                className="text-xl font-bold text-zinc-400 hover:text-black"
                                            >-</button>
                                            <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                                                className="text-xl font-bold text-zinc-400 hover:text-black"
                                            >+</button>
                                        </div>
                                        <div className="font-black text-zinc-900">₹{item.price * item.quantity}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                <Tag className="w-10 h-10 text-zinc-300" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Your cart is empty</h3>
                            <p className="text-zinc-400 text-sm mt-3 leading-relaxed">Looks like you haven't added anything to your cart yet.</p>
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="mt-10 bg-black text-white px-10 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-5">
                    {/* Available Promos Section - More Prominent & Interactive */}
                    {availablePromos.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Ticket className="w-3.5 h-3.5 text-purple-600" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900/40">Available Coupons</h3>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400">{availablePromos.length} total</span>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 px-1 -mx-1 no-scrollbar snap-x">
                                {availablePromos.map((promo) => (
                                    <button
                                        key={promo.id}
                                        type="button"
                                        onClick={() => handleApply(promo.code)}
                                        className={`flex-shrink-0 snap-start p-4 rounded-2xl border-2 transition-all text-left min-w-[240px] relative overflow-hidden group ${selectedPromo?.code === promo.code ? 'border-purple-600 bg-white shadow-lg shadow-purple-500/10' : 'border-white bg-white hover:border-purple-200'}`}
                                    >
                                        {/* Coupon Notch Design */}
                                        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-zinc-50 rounded-full -translate-y-1/2" />
                                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-zinc-50 rounded-full -translate-y-1/2" />
                                        
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className={`text-xs font-black uppercase tracking-tight ${selectedPromo?.code === promo.code ? 'text-purple-600' : 'text-zinc-900 group-hover:text-purple-600'}`}>
                                                        {promo.code}
                                                    </span>
                                                    {selectedPromo?.code === promo.code && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 fill-purple-50" />
                                                    )}
                                                </div>
                                                <p className="text-[14px] font-black text-zinc-900">
                                                    {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% SAVINGS` : `₹${promo.discountValue} FLAT OFF`}
                                                </p>
                                                {promo.minOrderValue > 0 && (
                                                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                                                        On orders above ₹${promo.minOrderValue}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedPromo?.code === promo.code ? 'rotate-90 text-purple-600' : 'text-zinc-400 group-hover:text-purple-600'}`} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Promo Code Input / Active State */}
                    <div className="space-y-3">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="ENTER COUPON CODE"
                                className={`w-full pl-5 pr-24 py-4 rounded-2xl border outline-none transition-all text-xs font-black uppercase tracking-widest ${selectedPromo ? 'border-green-100 bg-green-50/30 text-green-700' : 'border-zinc-200 bg-white focus:border-purple-600 focus:shadow-lg focus:shadow-purple-500/5'}`}
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                disabled={!!selectedPromo}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                {selectedPromo ? (
                                    <button
                                        type="button"
                                        onClick={removePromo}
                                        className="h-10 px-5 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleApply()}
                                        disabled={!promoCodeInput}
                                        className="h-10 px-6 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all active:scale-95 shadow-sm"
                                    >
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                        {promoError && (
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                    {promoError}
                                </p>
                            </div>
                        ) || selectedPromo && (
                            <div className="flex items-center gap-2 px-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                <p className="text-[10px] font-black uppercase tracking-wider text-green-600">
                                    Applied Code <strong>{selectedPromo.code}</strong> — Benefit: {selectedPromo.discountType === 'PERCENTAGE' ? `${selectedPromo.discountValue}%` : `₹${selectedPromo.discountValue}`} OFF!
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 space-y-3">
                        <div className="flex justify-between font-bold text-zinc-400 uppercase text-[10px] tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-zinc-900 font-black">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        {selectedPromo && (
                            <div className="flex justify-between font-bold text-green-600 uppercase text-[10px] tracking-widest">
                                <div className="flex items-center gap-1.5">
                                    <Percent className="w-3 h-3" />
                                    <span>Discount ({selectedPromo.code})</span>
                                </div>
                                <span className="font-black">-₹{selectedPromo.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-zinc-400 uppercase text-[10px] tracking-widest">
                            <span>Shipping</span>
                            <span className="text-zinc-900 font-black">
                                {(selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal) >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Next Step'}
                            </span>
                        </div>
                        <div className="flex justify-between pt-5 border-t border-zinc-200">
                            <span className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Total</span>
                            <span className="text-xl font-black italic tracking-tighter text-zinc-900">
                                ₹{(() => {
                                    const subtotal = selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal;
                                    return subtotal.toFixed(2);
                                })()}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className={`group relative w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest transition-all duration-500 ${cart.length === 0 ? 'bg-zinc-100 text-zinc-300 pointer-events-none' : 'bg-[#1a1c23] text-white shadow-2xl shadow-gray-200/50 hover:bg-black hover:-translate-y-1 active:scale-[0.98]'}`}
                        >
                            <span>Secure checkout</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <p className="text-center text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-6">
                            Verified Secure Payment Gateway
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
