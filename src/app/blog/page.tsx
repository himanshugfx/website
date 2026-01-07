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
                                <Link href={`/blog/${post.id}`} className="block overflow-hidden rounded-2xl relative aspect-[4/3] bg-zinc-100 border border-zinc-100">
                                    {/* After Image (Background - shown on hover) */}
                                    <Image
                                        src={post.afterImage}
                                        alt="Skin Texture After"
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Before Image (Top - default view, fades on hover) */}
                                    <Image
                                        src={post.beforeImage}
                                        alt="Skin Texture Before"
                                        fill
                                        className="object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-700 font-bold"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm z-10">
                                        {post.category}
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest backdrop-blur-sm z-10">
                                        <span className="group-hover:hidden italic">Before Treatment</span>
                                        <span className="hidden group-hover:inline italic text-green-300">Ingredient Result</span>
                                    </div>
                                </Link>
                                <div className="blog-info mt-6">
                                    <div className="date caption1 text-zinc-500 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {post.date}
                                    </div>
                                    <Link href={`/blog/${post.id}`} className="block mt-3">
                                        <h4 className="heading4 text-xl font-bold group-hover:text-zinc-600 transition-colors line-clamp-2 leading-tight">
                                            {post.title}
                                        </h4>
                                    </Link>
                                    <p className="body1 text-zinc-500 mt-3 line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <Link href={`/blog/${post.id}`} className="text-button inline-block mt-4 font-bold border-b-2 border-black pb-1 hover:text-zinc-600 transition-colors">
                                        Identify Ingredient
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="list-pagination w-full flex items-center justify-center gap-4 md:mt-16 mt-10">
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-black text-white font-bold cursor-pointer">1</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-gray-100 text-gray-500 cursor-not-allowed">2</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-gray-100 text-gray-500 cursor-not-allowed">3</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-zinc-200 text-zinc-400 cursor-not-allowed">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

