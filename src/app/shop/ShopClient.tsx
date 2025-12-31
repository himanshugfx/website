'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    originPrice: number;
    thumbImage: string;
    slug: string;
    brand: string;
    category: string;
    type: string;
    new: boolean;
    sale: boolean;
}

interface ShopClientProps {
    initialProducts: Product[];
    categories: string[];
    types: string[];
    brands: string[];
}

export default function ShopClient({ initialProducts, categories, types, brands }: ShopClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('Sorting');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]); // Max price from data is likely lower

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (selectedType) {
            result = result.filter(p => p.type === selectedType);
        }
        if (selectedBrand) {
            result = result.filter(p => p.brand === selectedBrand);
        }

        // Sort
        if (sortBy === 'priceHighToLow') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'priceLowToHigh') {
            result.sort((a, b) => a.price - b.price);
        }

        return result;
    }, [initialProducts, selectedCategory, selectedType, selectedBrand, sortBy]);

    return (
        <main>
            <div className="breadcrumb-block style-img">
                <div className="breadcrumb-main bg-linear overflow-hidden">
                    <div className="container mx-auto lg:pt-[134px] pt-24 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content">
                                <div className="heading2 text-center">Shop</div>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                    <Link href="/">Homepage</Link>
                                    <i className="ph ph-caret-right text-sm text-secondary2"></i>
                                    <div className="text-secondary2 capitalize">Shop</div>
                                </div>
                            </div>
                            <div className="filter-type menu-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12 overflow-hidden">
                                {categories.map(cat => (
                                    <div
                                        key={cat}
                                        className={`item tab-item text-button-uppercase cursor-pointer has-line-before line-2px ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
                <div className="container mx-auto">
                    <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
                            <div className="filter-type-block pb-8 border-b border-line">
                                <div className="heading6">Products Type</div>
                                <div className="list-type filter-type menu-tab mt-4">
                                    {types.map(type => (
                                        <div
                                            key={type}
                                            className={`item tab-item flex items-center justify-between cursor-pointer mb-2 ${selectedType === type ? 'text-black font-bold' : 'text-secondary'}`}
                                            onClick={() => setSelectedType(selectedType === type ? null : type)}
                                        >
                                            <div className="type-name has-line-before hover:text-black capitalize">{type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-brand pb-8 mt-8">
                                <div className="heading6">Brands</div>
                                <div className="list-brand mt-4">
                                    {brands.map(brand => (
                                        <div key={brand} className="brand-item flex items-center justify-between mb-2">
                                            <div className="left flex items-center cursor-pointer" onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}>
                                                <div className="block-input mr-2">
                                                    <input type="checkbox" checked={selectedBrand === brand} readOnly />
                                                </div>
                                                <label className="brand-name capitalize cursor-pointer">{brand}</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="button-main w-full py-2 bg-purple-600 text-white rounded-lg mt-5"
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setSelectedType(null);
                                    setSelectedBrand(null);
                                    setSortBy('Sorting');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="list-product-block style-grid lg:w-3/4 md:w-2/3 w-full md:pl-3">
                            <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                                <div className="left flex has-line items-center flex-wrap gap-5">
                                    <div className="caption1 text-secondary">
                                        Showing {filteredProducts.length} products
                                    </div>
                                </div>
                                <div className="sort-product right flex items-center gap-3">
                                    <label htmlFor="select-filter" className="caption1 capitalize">Sort by</label>
                                    <div className="select-block relative">
                                        <select
                                            id="select-filter"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line appearance-none bg-transparent"
                                        >
                                            <option value="Sorting">Default Sorting</option>
                                            <option value="priceHighToLow">Price High To Low</option>
                                            <option value="priceLowToHigh">Price Low To High</option>
                                        </select>
                                        <i className="ph ph-caret-down absolute top-1/2 -translate-y-1/2 md:right-4 right-2 pointer-events-none"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="list-product grid lg:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-7">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product as any} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-20 text-secondary">
                                    No products found matching your selection.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
