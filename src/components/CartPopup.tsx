'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPopup() {
    const { isPopupOpen, closePopup, lastAddedItem } = useCart();
    const [recommended, setRecommended] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isPopupOpen && lastAddedItem) {
            setLoading(true);
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/admin/products?limit=20');
                    const data = await res.json();
                    if (data.products) {
                        const others = data.products.filter((p: any) => p.id !== lastAddedItem.id);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={closePopup}></div>
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl animate-fade-up">
                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full duration-300"
                >
                    <i className="ph ph-x text-xl"></i>
                </button>

                <div className="flex items-center gap-2 text-green-600 mb-6">
                    <i className="ph ph-check-circle-fill text-xl"></i>
                    <span className="font-bold">Successfully added to cart!</span>
                </div>

                <div className="flex gap-6 border-b border-line pb-6">
                    <div className="w-24 aspect-[3/4] relative rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                        <Image
                            src={lastAddedItem.image}
                            alt={lastAddedItem.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="heading6 mb-1">{lastAddedItem.name}</div>
                        <div className="text-secondary text-sm mb-2">
                            {lastAddedItem.selectedSize && <span>Size: {lastAddedItem.selectedSize}</span>}
                            {lastAddedItem.selectedSize && lastAddedItem.selectedColor && <span className="mx-2">|</span>}
                            {lastAddedItem.selectedColor && <span>Color: {lastAddedItem.selectedColor}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-secondary">Qty: {lastAddedItem.quantity}</span>
                            <span className="font-bold">₹{lastAddedItem.price}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="heading6 mb-4">You might also like</div>
                    <div className="grid grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-2 text-center text-sm text-secondary">Loading suggestions...</div>
                        ) : recommended.length > 0 ? (
                            recommended.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/shop/product/${product.slug}`}
                                    onClick={closePopup}
                                    className="flex gap-3 p-3 border border-line rounded-lg hover:border-black duration-300 cursor-pointer group"
                                >
                                    <div className="w-16 aspect-square relative rounded bg-zinc-100 overflow-hidden flex-shrink-0">
                                        <Image
                                            src={product.thumbImage || (product.images ? product.images.split(',')[0] : '/assets/images/placeholder.png')}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 duration-500"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <div className="font-bold line-clamp-1 text-sm">{product.name}</div>
                                        <div className="text-xs text-secondary mt-1">₹{product.price}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-sm text-secondary">No other products found.</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button
                        onClick={closePopup}
                        className="button-main border border-black bg-white text-black py-3 rounded-xl hover:bg-black hover:text-white duration-300 font-bold"
                    >
                        Continue Shopping
                    </button>
                    <Link
                        href="/checkout"
                        onClick={closePopup}
                        className="button-main bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 duration-300 font-bold text-center flex flex-col items-center justify-center gap-1"
                    >
                        <span>Continue To Checkout</span>
                        <div className="flex items-center gap-1.5 opacity-90">
                            <div className="h-4 w-auto bg-white rounded px-1 flex items-center justify-center">
                                <Image src="/assets/images/payment_methods/upi.webp" alt="UPI" width={24} height={12} className="w-auto h-3 object-contain" />
                            </div>
                            <div className="h-4 w-auto bg-white rounded px-1 flex items-center justify-center">
                                <Image src="/assets/images/payment_methods/rupay.png" alt="Rupay" width={24} height={12} className="w-auto h-3 object-contain" />
                            </div>
                            <div className="h-4 w-auto bg-white rounded px-1 flex items-center justify-center">
                                <Image src="/assets/images/payment_methods/visa.png" alt="Visa" width={24} height={12} className="w-auto h-3 object-contain" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
