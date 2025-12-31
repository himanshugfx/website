'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category: string;
    [key: string]: any;
};

type ProductTabsProps = {
    bestSellers: Product[];
    onSale: Product[];
    newArrivals: Product[];
};

export default function ProductTabs({ bestSellers, onSale, newArrivals }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<'best-sellers' | 'on-sale' | 'new-arrivals'>('on-sale');

    const tabs = [
        { id: 'best-sellers', label: 'Best Sellers', products: bestSellers },
        { id: 'on-sale', label: 'On Sale', products: onSale },
        { id: 'new-arrivals', label: 'New Arrivals', products: newArrivals },
    ] as const;

    const activeProducts = tabs.find(tab => tab.id === activeTab)?.products || [];

    return (
        <div className="product-tabs-block md:py-20 py-10">
            <div className="container mx-auto px-4">
                {/* Tab Navigation */}
                <div className="flex items-center justify-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-zinc-100 p-2 rounded-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="list-product grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-[30px] gap-[16px]">
                    {activeProducts.map((product) => (
                        <ProductCard key={product.id} product={product as any} />
                    ))}
                </div>
            </div>
        </div>
    );
}
