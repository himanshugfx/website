'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, Trash2, Tag, ChevronRight, CheckCircle2, Ticket, Percent, ShoppingBag, ShieldCheck, Truck, ArrowRight, Info } from 'lucide-react';

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
        <div className="fixed inset-0 z-[6000] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose} />

            {/* Seamless Flipkart-Style Drawer */}
            <div className="relative w-full max-w-md bg-[#f1f3e6]/30 backdrop-blur-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-400 ease-out">
                
                {/* Header - Sticky */}
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-zinc-100 z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Cart Bag ({cart.length})</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                {/* Main Scrollable Plane */}
                <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain bg-white">
                    {/* Free Shipping Alert */}
                    <div className={`px-6 py-3 flex items-center gap-3 border-b ${remainingForFreeShipping > 0 ? 'bg-purple-50 border-purple-100' : 'bg-green-50 border-green-100'}`}>
                        {remainingForFreeShipping > 0 ? <Truck className="w-4 h-4 text-purple-600" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        <p className={`text-[11px] font-bold ${remainingForFreeShipping > 0 ? 'text-purple-700' : 'text-green-700'}`}>
                            {remainingForFreeShipping > 0 
                                ? `Add worth ₹${remainingForFreeShipping.toFixed(0)} more for FREE Delivery` 
                                : "Order eligible for FREE Delivery ✨"}
                        </p>
                    </div>

                    {/* Product List */}
                    <div className="divide-y divide-zinc-100">
                        {cart.length > 0 ? (
                            cart.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex gap-5">
                                        <div className="relative w-20 h-24 bg-zinc-50 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100">
                                            <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <Link href={`/shop/product/${item.slug}`} className="text-sm font-bold text-zinc-900 line-clamp-2 hover:text-purple-600">
                                                    {item.name}
                                                </Link>
                                                <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="p-1 text-zinc-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3">
                                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                                {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border border-zinc-200 rounded-lg h-8 px-1">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)} className="w-6 h-full text-zinc-400 hover:text-purple-600 font-bold">–</button>
                                                    <span className="w-8 text-center text-xs font-bold text-zinc-900">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)} className="w-6 h-full text-zinc-400 hover:text-purple-600 font-bold">+</button>
                                                </div>
                                                <span className="text-base font-black text-zinc-950">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <ShoppingBag className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <h3 className="font-bold text-zinc-900">Bag is empty</h3>
                                <Link href="/shop" onClick={onClose} className="mt-4 inline-block text-purple-600 text-sm font-bold underline">Go Shopping</Link>
                            </div>
                        )}
                    </div>

                    {/* Promocodes - Thinner Card Style */}
                    <div className="p-6 bg-zinc-50 border-y border-zinc-100">
                         <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-purple-600" />
                            <h3 className="text-xs font-black uppercase text-zinc-950 tracking-widest">Available Offers</h3>
                        </div>
                        
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
                            {availablePromos.map((promo) => (
                                <button
                                    key={promo.id}
                                    onClick={() => handleApply(promo.code)}
                                    className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-3 min-w-[200px] ${selectedPromo?.code === promo.code ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200' : 'border-white bg-white hover:border-purple-200 shadow-sm'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedPromo?.code === promo.code ? 'bg-white/20' : 'bg-purple-50'}`}>
                                        <Ticket className={`w-4 h-4 ${selectedPromo?.code === promo.code ? 'text-white' : 'text-purple-600'}`} />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="text-[10px] font-black uppercase tracking-tighter truncate">{promo.code}</div>
                                        <div className={`text-[9px] font-bold opacity-70 ${selectedPromo?.code === promo.code ? 'text-white' : 'text-zinc-500'}`}>
                                            {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% SAVINGS` : `₹${promo.discountValue} FLAT OFF`}
                                        </div>
                                    </div>
                                    {selectedPromo?.code === promo.code && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                                </button>
                            ))}
                        </div>

                        {/* Manual Code Input - Slimmer */}
                        <div className="mt-4 relative group">
                            <input
                                type="text"
                                placeholder="ENTER CUSTOM CODE"
                                className={`w-full pl-4 pr-24 py-3 rounded-xl border text-[10px] font-black tracking-widest outline-none transition-all ${selectedPromo ? 'border-green-100 bg-green-50/30 text-green-700' : 'border-zinc-200 focus:border-purple-600 shadow-sm'}`}
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                disabled={!!selectedPromo}
                            />
                            <button
                                onClick={() => (selectedPromo ? removePromo() : handleApply())}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedPromo ? 'bg-zinc-900 text-white' : promoCodeInput ? 'bg-purple-600 text-white' : 'bg-zinc-100 text-zinc-300'}`}
                            >
                                {selectedPromo ? 'Remove' : 'Apply'}
                            </button>
                        </div>
                    </div>

                    {/* bill Summary - In the same plane */}
                    <div className="p-8 space-y-4 pb-20">
                         <h3 className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-4">Pricing Details</h3>
                         <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500 font-bold uppercase tracking-widest">Bag Total</span>
                                <span className="text-zinc-900 font-bold">₹{Number(cartTotal).toFixed(0)}</span>
                            </div>
                            {selectedPromo && (
                                <div className="flex justify-between text-xs text-green-600 font-bold">
                                    <span className="uppercase tracking-widest">Coupon Savings</span>
                                    <span>-₹{Number(selectedPromo.discountAmount || 0).toFixed(0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500 font-bold uppercase tracking-widest">Delivery</span>
                                <span className="text-green-600 font-bold uppercase">{remainingForFreeShipping > 0 ? '₹40' : 'FREE'}</span>
                            </div>
                         </div>
                         <div className="pt-4 mt-4 border-t border-dashed border-zinc-200 flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Final Amount</span>
                                <span className="text-3xl font-black text-zinc-950 italic tracking-tighter">
                                    ₹{(selectedPromo ? cartTotal - selectedPromo.discountAmount : cartTotal + (remainingForFreeShipping > 0 ? 40 : 0)).toFixed(0)}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full mb-1">Safe Checkout</span>
                                <span className="text-[8px] font-bold text-zinc-300 uppercase">Taxes Included</span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Place Order - Bottom Sticky */}
                <div className="p-6 bg-white border-t border-zinc-100 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                    <Link
                        href="/checkout"
                        onClick={onClose}
                        className="w-full bg-purple-600 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.25em] text-[11px] text-center shadow-xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                        <span className="relative z-10">Place Order Now</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.2s] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
