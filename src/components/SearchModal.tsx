'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/media';

interface Product {
    id: string;
    name: string;
    price: number;
    thumbImage: string;
    slug: string;
    category: string;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[10vh] px-4 backdrop-blur-md bg-black/40 animate-fade-in" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-zinc-100">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products, ingredients, or science..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 placeholder:text-zinc-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && onClose()}
                    />
                    <div className="flex items-center gap-2">
                        {isLoading && (
                            <div className="w-5 h-5 border-2 border-zinc-200 border-t-purple-600 rounded-full animate-spin" />
                        )}
                        <button
                            onClick={onClose}
                            className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors"
                        >
                            Esc
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {query.length >= 2 ? (
                        <div className="p-4">
                            {results.length > 0 ? (
                                <div className="grid gap-2">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 mb-2">Products Found</div>
                                    {results.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.slug}`}
                                            onClick={onClose}
                                            className="flex items-center gap-4 p-2 rounded-2xl hover:bg-zinc-50 transition-all group"
                                        >
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                                <Image
                                                    src={getMediaUrl(product.thumbImage)}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-0.5">{product.category}</div>
                                                <div className="font-bold text-zinc-900 line-clamp-1">{product.name}</div>
                                                <div className="text-sm text-zinc-500">₹{product.price}</div>
                                            </div>
                                            <svg className="w-5 h-5 text-zinc-300 group-hover:text-purple-600 transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                !isLoading && (
                                    <div className="py-20 text-center">
                                        <div className="text-5xl mb-4">🔍</div>
                                        <div className="text-zinc-500 font-medium">No results found for "{query}"</div>
                                        <div className="text-xs text-zinc-400 mt-2">Try searching for different keywords</div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-zinc-400">
                            <div className="mb-4 flex justify-center gap-4">
                                {['Sunscreen', 'Facewash'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setQuery(term)}
                                        className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold uppercase tracking-wider select-none transition-colors cursor-pointer"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm">Start typing to search our collection...</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Searching in Anose Store</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[9px]">⏎</kbd> select
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[9px]">↑↓</kbd> navigate
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
