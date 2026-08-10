'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import type { ProductCardProduct } from '@/components/ProductCard';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Sparkles, ShieldCheck, Truck, HelpCircle, BookOpen } from 'lucide-react';

interface Product extends ProductCardProduct {
    category: string;
    type: string;
    new: boolean;
    sale: boolean;
    bestSeller?: boolean;
}

interface ShopClientProps {
    initialProducts: Product[];
    categories: string[];
    types: string[];
    brands: string[];
}

export default function ShopClient({ initialProducts, categories, types, brands }: ShopClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('Sorting');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 12;

    // Accordion State for Micro-FAQs & Buying Guide
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [openGuide, setOpenGuide] = useState<boolean>(true);

    // Initialize from URL params for GMC & Canonical query parameter support
    useEffect(() => {
        const filterParam = searchParams.get('filter');
        const catParam = searchParams.get('category');
        const typeParam = searchParams.get('type');
        const brandParam = searchParams.get('brand');
        const intentParam = searchParams.get('intent');
        const pageParam = parseInt(searchParams.get('page') || '1', 10);

        if (filterParam === 'best' || filterParam === 'sale' || filterParam === 'new') {
            setSelectedLabel(filterParam);
        }
        if (catParam) setSelectedCategory(catParam);
        if (typeParam) setSelectedType(typeParam);
        if (brandParam) setSelectedBrand(brandParam);
        if (intentParam) setSelectedIntent(intentParam);
        if (pageParam > 0) setCurrentPage(pageParam);
    }, [searchParams]);

    // Conversational Intent Filter definitions for GEO & AEO
    const conversationalFilters = [
        { id: 'all', label: '✨ All Collection', intent: null },
        { id: 'glow', label: '🌿 Glowing & Hydrated Skin', intent: 'glow' },
        { id: 'sun', label: '☀️ Sun Protection & De-Tan', intent: 'sun' },
        { id: 'oil', label: '💧 Oil & Acne Control', intent: 'oil' },
        { id: 'daily', label: '🌸 Daily Herbal Routine', intent: 'daily' },
    ];

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];

        if (selectedCategory) {
            result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (selectedType) {
            result = result.filter(p => p.type.toLowerCase() === selectedType.toLowerCase());
        }
        if (selectedBrand) {
            result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
        }
        if (selectedLabel === 'best') {
            result = result.filter(p => p.bestSeller);
        } else if (selectedLabel === 'sale') {
            result = result.filter(p => p.sale);
        } else if (selectedLabel === 'new') {
            result = result.filter(p => p.new);
        }

        // Conversational Filter Mapping
        if (selectedIntent === 'glow') {
            result = result.filter(p => p.name.toLowerCase().includes('cream') || p.name.toLowerCase().includes('face') || p.type.toLowerCase().includes('moisturizer'));
        } else if (selectedIntent === 'sun') {
            result = result.filter(p => p.name.toLowerCase().includes('sunscreen') || p.type.toLowerCase().includes('sunscreen'));
        } else if (selectedIntent === 'oil') {
            result = result.filter(p => p.name.toLowerCase().includes('facewash') || p.name.toLowerCase().includes('wash'));
        }

        // Sort
        if (sortBy === 'priceHighToLow') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'priceLowToHigh') {
            result.sort((a, b) => a.price - b.price);
        }

        return result;
    }, [initialProducts, selectedCategory, selectedType, selectedBrand, selectedLabel, selectedIntent, sortBy]);

    // Paginated Products
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/shop?${params.toString()}`);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <main className="bg-gradient-to-b from-purple-50/40 via-white to-white min-h-screen">
            {/* Header Banner & SEO H1 Title */}
            <div className="breadcrumb-block style-img">
                <div
                    className="breadcrumb-main overflow-hidden relative"
                    style={{
                        backgroundImage: 'url(/assets/images/banner/shop.webp)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="container mx-auto lg:pt-[120px] pt-20 pb-12 relative z-[1]">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center text-center">
                            {/* Structured SEO H1 Tag */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-primary max-w-4xl">
                                Luxury Skincare & Herbal Beauty Collection
                            </h1>

                            {/* Rich Contextual Introductory Copy (SEO & GEO) */}
                            <p className="text-sm md:text-base text-purple-100/90 font-medium mt-4 max-w-3xl leading-relaxed">
                                Discover Anose Beauty&apos;s premium range of dermatologically tested herbal face washes, sunscreen lotions, and revitalizing creams. Formulated with authentic Indian botanicals for long-lasting hydration, sun protection, and radiant skin.
                            </p>

                            {/* Shipping Callout Badge (AEO) */}
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-sm">
                                    <Truck className="w-3.5 h-3.5 text-purple-300" />
                                    Free Shipping Across India Over ₹199
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                                    100% Dermatologically Tested
                                </span>
                            </div>

                            {/* Breadcrumbs */}
                            <div className="link flex items-center justify-center gap-1.5 caption1 mt-6 text-white/80">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <span className="text-white/40">/</span>
                                <span className="text-purple-200 font-bold">Shop Collection</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main PLP Section */}
            <div className="shop-product mt-8 lg:py-16 md:py-12 py-8">
                <div className="container mx-auto px-4">

                    {/* AEO Conversational Filter Chips */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-purple-900">Conversational Search & Intent Filters</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            {conversationalFilters.map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setSelectedIntent(selectedIntent === chip.intent ? null : chip.intent)}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                                        (selectedIntent === chip.intent || (chip.intent === null && selectedIntent === null))
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                                    }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
                        {/* Sidebar Filters */}
                        <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-8">
                            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-8">
                                {/* Categories Filter */}
                                <div>
                                    <div className="heading6 font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Categories</div>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                className={`w-full text-left py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                                    selectedCategory === cat
                                                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Labels Filter */}
                                <div>
                                    <div className="heading6 font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Collection Highlights</div>
                                    <div className="space-y-2 text-sm">
                                        {[
                                            { id: 'new', label: 'New Arrivals' },
                                            { id: 'sale', label: 'Special Sale' },
                                            { id: 'best', label: 'Best Sellers' },
                                        ].map((lbl) => (
                                            <button
                                                key={lbl.id}
                                                type="button"
                                                className={`w-full text-left py-1.5 px-3 rounded-lg font-medium transition-all ${
                                                    selectedLabel === lbl.id
                                                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedLabel(selectedLabel === lbl.id ? null : lbl.id)}
                                            >
                                                {lbl.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Types Filter */}
                                {types.length > 0 && (
                                    <div>
                                        <div className="heading6 font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Product Type</div>
                                        <div className="space-y-2 text-sm">
                                            {types.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`w-full text-left py-1.5 px-3 rounded-lg font-medium transition-all capitalize ${
                                                        selectedType === type
                                                            ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clear Filters */}
                                <button
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-sm"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSelectedType(null);
                                        setSelectedBrand(null);
                                        setSelectedLabel(null);
                                        setSelectedIntent(null);
                                        setSortBy('Sorting');
                                        setCurrentPage(1);
                                        router.push('/shop');
                                    }}
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        </div>

                        {/* Product Grid & Controls */}
                        <div className="list-product-block style-grid lg:w-3/4 md:w-2/3 w-full">
                            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between gap-5 flex-wrap mb-6">
                                <div className="caption1 text-gray-600 font-semibold">
                                    Showing <span className="text-purple-700 font-extrabold">{paginatedProducts.length}</span> of {filteredProducts.length} items
                                </div>

                                <div className="sort-product flex items-center gap-3">
                                    <label htmlFor="select-filter" className="caption1 text-gray-700 font-bold">Sort By</label>
                                    <div className="select-block relative">
                                        <select
                                            id="select-filter"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="caption1 py-2 pl-3 pr-8 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                                        >
                                            <option value="Sorting">Featured</option>
                                            <option value="priceHighToLow">Price: High to Low</option>
                                            <option value="priceLowToHigh">Price: Low to High</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-2.5 pointer-events-none text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Grid Display */}
                            <div className="list-product grid lg:grid-cols-3 grid-cols-2 sm:gap-6 gap-4">
                                {paginatedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-6">
                                    <div className="text-gray-400 font-bold text-lg mb-2">No products match your selection</div>
                                    <p className="text-gray-500 text-sm">Try clearing some filters or browsing our full collection.</p>
                                </div>
                            )}

                            {/* Clean SEO Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white"
                                    >
                                        Previous Page
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white"
                                    >
                                        Next Page
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GEO (Generative Engine Optimization) - Skincare Buying Guide */}
                    <div className="mt-20 bg-white rounded-3xl p-8 border border-purple-100 shadow-sm">
                        <button
                            onClick={() => setOpenGuide(!openGuide)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0" />
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                                    Skincare Buying Guide: How to Choose the Right Products
                                </h2>
                            </div>
                            {openGuide ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>

                        {openGuide && (
                            <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600 space-y-6 leading-relaxed">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                        <h3 className="font-bold text-purple-900 text-base mb-2">1. Identify Your Skin Needs</h3>
                                        <p>Choose herbal face washes for daily deep cleansing. Look for non-comedogenic formulas that preserve natural skin oils while preventing acne breakouts.</p>
                                    </div>
                                    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                        <h3 className="font-bold text-purple-900 text-base mb-2">2. Daily Sun Protection</h3>
                                        <p>Protect skin against UV damage and de-tanning with broad-spectrum SPF sunscreen lotions formulated specifically for tropical Indian weather conditions.</p>
                                    </div>
                                    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                        <h3 className="font-bold text-purple-900 text-base mb-2">3. Deep Hydration Routine</h3>
                                        <p>Lock in essential moisture with lightweight, dermatologically tested face creams enriched with botanical antioxidants for all-day skin radiance.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AEO (Answer Engine Optimization) - Micro-FAQs Accordion */}
                    <div className="mt-12 bg-purple-900 text-white rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="w-7 h-7 text-purple-300" />
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">
                                Frequently Asked Questions (Micro-FAQs)
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "What makes Anose Beauty skincare products suitable for Indian skin?",
                                    a: "Anose Beauty products are formulated with authentic Indian botanicals specifically designed to tackle Indian climatic conditions—providing oil control, UV protection, and deep hydration without clogging pores."
                                },
                                {
                                    q: "Are Anose Beauty products dermatologically tested and chemical-free?",
                                    a: "Yes, all Anose Beauty skincare products are 100% dermatologically tested, paraben-free, sulfate-free, and cruelty-free."
                                },
                                {
                                    q: "How do I qualify for free shipping on Anose Beauty?",
                                    a: "Anose Beauty offers free shipping across India on all orders over ₹199. Orders below ₹199 carry a flat delivery fee of ₹49."
                                },
                                {
                                    q: "What is the recommended order for applying daily skincare products?",
                                    a: "Start with an herbal face wash to cleanse pores, follow with a lightweight hydrating face cream or serum, and finish with a broad-spectrum sunscreen lotion before stepping outdoors."
                                }
                            ].map((faq, idx) => (
                                <div key={idx} className="bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full p-5 text-left flex items-center justify-between font-bold text-sm sm:text-base text-purple-100 hover:text-white"
                                    >
                                        <span>{faq.q}</span>
                                        {openFaq === idx ? <ChevronUp className="w-4 h-4 text-purple-300" /> : <ChevronDown className="w-4 h-4 text-purple-300" />}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-5 pb-5 text-xs sm:text-sm text-purple-200/90 leading-relaxed border-t border-white/10 pt-3">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
