'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

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
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zinc-50 flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="text-6xl mb-6">🛒</div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Your cart is empty</h3>
                            <p className="text-zinc-400 text-sm mt-2">Looks like you haven't added anything yet.</p>
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="mt-8 bg-black text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest shadow-lg hover:-translate-y-1 transition-all"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-4">
                    {/* Available Promos Section */}
                    {availablePromos.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Available Offers</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                {availablePromos.map((promo) => (
                                    <button
                                        key={promo.id}
                                        onClick={() => handleApply(promo.code)}
                                        className={`flex-shrink-0 snap-start p-3 rounded-xl border-2 transition-all text-left min-w-[200px] ${selectedPromo?.code === promo.code ? 'border-purple-600 bg-purple-50' : 'border-zinc-100 bg-white hover:border-purple-200'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black uppercase tracking-tighter text-purple-600">{promo.code}</span>
                                            {selectedPromo?.code === promo.code && (
                                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-900 line-clamp-1">
                                            {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                                            {promo.minOrderValue > 0 && ` on orders above ₹${promo.minOrderValue}`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Promo Code Input */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="ENTER PROMO CODE"
                                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-purple-600 text-xs font-bold uppercase tracking-widest"
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                disabled={!!selectedPromo}
                            />
                            {selectedPromo ? (
                                <button
                                    onClick={removePromo}
                                    className="bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                                >
                                    Remove
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApply()}
                                    className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
                                >
                                    Apply
                                </button>
                            )}
                        </div>
                        {promoError && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                {promoError}
                            </p>
                        ) || selectedPromo && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                                Applied: {selectedPromo.discountType === 'PERCENTAGE' ? `${selectedPromo.discountValue}%` : `₹${selectedPromo.discountValue}`} OFF!
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between font-bold text-zinc-500 uppercase text-xs tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-zinc-900 font-black">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        {selectedPromo && (
                            <div className="flex justify-between font-bold text-green-600 uppercase text-xs tracking-widest">
                                <span>Discount ({selectedPromo.code})</span>
                                <span className="font-black">-₹{selectedPromo.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-zinc-500 uppercase text-xs tracking-widest">
                            <span>Shipping</span>
                            <span className="text-zinc-900 font-black">
                                {(selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal) >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Calculated next'}
                            </span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-zinc-200">
                            <span className="text-lg font-black uppercase italic tracking-tighter">Total</span>
                            <span className="text-lg font-black italic tracking-tighter">
                                ₹{(() => {
                                    const subtotal = selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal;
                                    return subtotal.toFixed(2);
                                })()}
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/checkout"
                        onClick={onClose}
                        className={`w-full block text-center py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${cart.length === 0 ? 'bg-zinc-200 text-zinc-400 pointer-events-none' : 'bg-purple-600 text-white shadow-xl shadow-purple-500/25 hover:-translate-y-1 hover:shadow-2xl'}`}
                    >
                        Secure Checkout
                    </Link>
                    <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        Tax included. Shipping calculated at checkout.
                    </p>
                </div>
            </div>
        </div>
    );
}
