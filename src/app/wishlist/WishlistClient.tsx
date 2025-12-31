'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistClient() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-block md:py-20 py-12">
                <div className="container mx-auto text-center">
                    <div className="heading3">Your wishlist is empty</div>
                    <p className="body1 text-secondary mt-4">Save items you like to see them here.</p>
                    <Link href="/shop" className="button-main bg-purple-600 text-white px-10 py-3 rounded-full inline-block mt-8 hover:bg-purple-700 duration-300">
                        Go To Shop
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            slug: item.slug
        });
        removeFromWishlist(item.id);
    };

    return (
        <div className="wishlist-block md:py-20 py-10">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-[30px] gap-[16px]">
                    {wishlist.map((item) => (
                        <div key={item.id} className="product-item">
                            <div className="product-main">
                                <div className="product-thumb relative aspect-[3/4] rounded-2xl overflow-hidden group">
                                    <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-3 right-3">
                                        <div
                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-purple-600 hover:text-white duration-300"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            <i className="ph ph-trash text-xl"></i>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300 transition-all">
                                        <button
                                            className="button-main w-full bg-white text-black py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            Add To Cart
                                        </button>
                                    </div>
                                </div>
                                <div className="product-infor mt-4 text-center">
                                    <Link href={`/product/${item.slug}`} className="heading6 hover:underline truncate block">{item.name}</Link>
                                    <div className="price heading6 mt-2">₹{item.price}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
