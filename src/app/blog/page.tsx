'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { blogPosts } from './blogData';

export default function BlogPage() {
    return (
        <div className="blog-page">
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden bg-zinc-50 py-10">
                    <div className="container mx-auto relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content text-center">
                                <h2 className="heading2 font-bold text-4xl">Skincare Science</h2>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3 text-zinc-500">
                                    <Link href="/" className="hover:text-black">Homepage</Link>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="capitalize">Ingredients Guide</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="blog-grid mt-16 md:mt-24 md:pb-20 py-10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-8 gap-y-12">
                        {blogPosts.map((post) => (
                            <div key={post.id} className="blog-item group">
                                <Link href={`/blog/${post.id}`} className="block overflow-hidden rounded-3xl relative aspect-[4/3] bg-zinc-100 border border-zinc-100 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                                    {/* After Image (Background - shown on hover) */}
                                    <Image
                                        src={post.afterImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Overlay with glass effect on secondary (hover) */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-[1] backdrop-blur-[2px]"></div>

                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm z-10 text-zinc-800">
                                        {post.category}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/40 text-white text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] backdrop-blur-md z-10 border border-white/20 transition-all duration-500 group-hover:bg-purple-600/60 group-hover:border-purple-400">
                                        View Science
                                    </div>
                                </Link>
                                <div className="blog-info mt-8 px-2">
                                    <div className="date caption1 text-zinc-400 flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                                        {post.date}
                                    </div>
                                    <Link href={`/blog/${post.id}`} className="block mt-4">
                                        <h4 className="heading4 text-2xl font-bold group-hover:text-purple-700 transition-colors line-clamp-2 leading-[1.2] tracking-tight">
                                            {post.title}
                                        </h4>
                                    </Link>
                                    <p className="body1 text-zinc-500 mt-4 line-clamp-2 leading-relaxed text-sm">
                                        {post.excerpt}
                                    </p>
                                    <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-2 mt-6 font-black text-xs uppercase tracking-[0.2em] text-zinc-800 hover:text-purple-700 transition-colors group/btn">
                                        <span>Identify Ingredient</span>
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

