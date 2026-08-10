'use client';

import { useState, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import type { ProductCardProduct } from '@/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ProductTabsProps = {
    bestSellers: ProductCardProduct[];
    onSale: ProductCardProduct[];
    newArrivals: ProductCardProduct[];
};

export default function ProductTabs({ bestSellers, onSale, newArrivals }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<'best-sellers' | 'on-sale' | 'new-arrivals'>('on-sale');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: 'best-sellers', label: 'Best Sellers', products: bestSellers },
        { id: 'on-sale', label: 'On Sale', products: onSale },
        { id: 'new-arrivals', label: 'New Arrivals', products: newArrivals },
    ] as const;

    const activeProducts = tabs.find(tab => tab.id === activeTab)?.products || [];

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="product-tabs-block py-12 md:py-16 bg-gradient-to-b from-transparent via-purple-50/20 to-transparent">
            <div className="container mx-auto px-4">
                {/* Tab Navigation */}
                <div className="flex items-center justify-center mb-10">
                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-zinc-100/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-zinc-200 shadow-inner">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105'
                                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Horizontally Scrollable Products Track with Navigation Controls */}
                <div className="relative group/carousel">
                    {/* Left Scroll Arrow */}
                    <button
                        onClick={() => handleScroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-11 h-11 bg-white/95 backdrop-blur-md text-gray-900 rounded-full flex items-center justify-center shadow-lg border border-purple-100 hover:bg-purple-600 hover:text-white transition-all duration-300 opacity-90 group-hover/carousel:opacity-100 focus:outline-none"
                        aria-label="Scroll Left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Horizontal Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        className="list-product flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 px-1 no-scrollbar"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {activeProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex-none w-[230px] sm:w-[270px] md:w-[300px] snap-start"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}

                        {activeProducts.length === 0 && (
                            <div className="w-full text-center py-12 text-gray-400 font-medium">
                                No products available in this selection.
                            </div>
                        )}
                    </div>

                    {/* Right Scroll Arrow */}
                    <button
                        onClick={() => handleScroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-11 h-11 bg-white/95 backdrop-blur-md text-gray-900 rounded-full flex items-center justify-center shadow-lg border border-purple-100 hover:bg-purple-600 hover:text-white transition-all duration-300 opacity-90 group-hover/carousel:opacity-100 focus:outline-none"
                        aria-label="Scroll Right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
