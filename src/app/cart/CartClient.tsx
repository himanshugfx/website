'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartClient() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="cart-block md:py-20 py-12">
                <div className="container mx-auto text-center">
                    <div className="heading3">Your cart is empty</div>
                    <p className="body1 text-secondary mt-4">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/shop" className="button-main bg-purple-600 text-white px-10 py-3 rounded-full inline-block mt-8 hover:bg-purple-700 duration-300">
                        Go To Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="flex max-xl:flex-col gap-y-10">
                    <div className="xl:w-2/3 w-full xl:pr-10">
                        <div className="heading flex items-center justify-between border-b border-line pb-4 max-md:hidden">
                            <div className="w-1/2 text-button-uppercase">Products</div>
                            <div className="w-1/6 text-button-uppercase text-center">Price</div>
                            <div className="w-1/6 text-button-uppercase text-center">Quantity</div>
                            <div className="w-1/6 text-button-uppercase text-center">Total</div>
                        </div>

                        <div className="list-product mt-6">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="item flex items-center border-b border-line py-6 last:border-0">
                                    <div className="w-1/2 flex items-center gap-6">
                                        <div className="bg-zinc-100 rounded-xl overflow-hidden w-24 aspect-[3/4] relative flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <Link href={`/product/${item.slug}`} className="heading6 hover:underline line-clamp-1">{item.name}</Link>
                                            <div className="flex items-center gap-3 mt-2">
                                                {item.selectedSize && <span className="caption1 text-secondary">Size: <b className="text-black">{item.selectedSize}</b></span>}
                                                {item.selectedColor && <span className="caption1 text-secondary">Color: <b className="text-black capitalize">{item.selectedColor}</b></span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-1/6 text-center heading6 max-md:hidden">₹{item.price}</div>

                                    <div className="w-1/6 flex justify-center max-md:hidden">
                                        <div className="quantity-block border border-line rounded-lg flex items-center px-3 py-1">
                                            <div className="cursor-pointer px-2" onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}>-</div>
                                            <div className="font-semibold px-2">{item.quantity}</div>
                                            <div className="cursor-pointer px-2" onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}>+</div>
                                        </div>
                                    </div>

                                    <div className="w-1/6 text-center heading6 flex items-center justify-center gap-4 max-md:hidden">
                                        ₹{item.price * item.quantity}
                                        <i className="ph ph-trash text-xl text-secondary hover:text-red-500 cursor-pointer" onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}></i>
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="md:hidden flex-1 flex flex-col items-end gap-2">
                                        <div className="heading6">₹{item.price * item.quantity}</div>
                                        <div className="quantity-block border border-line rounded-lg flex items-center px-2 py-1">
                                            <div className="cursor-pointer px-2" onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}>-</div>
                                            <div className="font-semibold px-2">{item.quantity}</div>
                                            <div className="cursor-pointer px-2" onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}>+</div>
                                        </div>
                                        <i className="ph ph-trash text-xl text-secondary" onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="xl:w-1/3 w-full">
                        <div className="checkout-block bg-zinc-50 p-8 rounded-2xl">
                            <div className="heading5">Order Summary</div>

                            <div className="total-block py-5 flex justify-between border-b border-line mt-4">
                                <div className="body1">Subtotal</div>
                                <div className="heading6">₹{cartTotal}</div>
                            </div>

                            <div className="ship-block py-5 flex justify-between border-b border-line">
                                <div className="body1">Shipping</div>
                                <div className="body1 text-green-600 font-semibold">Free</div>
                            </div>

                            <div className="total-cart-block py-5 flex justify-between">
                                <div className="heading5">Total</div>
                                <div className="heading5">₹{cartTotal}</div>
                            </div>

                            <Link href="/checkout" className="button-main w-full bg-purple-600 text-white py-4 rounded-xl mt-6 hover:bg-purple-700 duration-300 block text-center">
                                Proceed To Checkout
                            </Link>

                            <Link href="/shop" className="text-button text-center block w-full mt-4 hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
