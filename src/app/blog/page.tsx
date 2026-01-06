'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const blogPosts = [
    {
        id: 1,
        title: "The Ultimate Guide to Minimalist Fashion",
        category: "Fashion",
        date: "July 24, 2024",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
        excerpt: "Discover how to build a timeless wardrobe with fewer, better pieces that never go out of style."
    },
    {
        id: 2,
        title: "How to Style Oversized Blazers for any Occasion",
        category: "Style",
        date: "July 20, 2024",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        excerpt: "The oversized blazer is a versatile staple. Learn three ways to wear it from day to night."
    },
    {
        id: 3,
        title: "Summer 2024 Trends: What's Hot and What's Not",
        category: "Trends",
        date: "July 15, 2024",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
        excerpt: "From vibrant colors to sustainable fabrics, here's everything you need to know about this season's trends."
    },
    {
        id: 4,
        title: "Why Sustainable Fashion Matters More Than Ever",
        category: "Sustainability",
        date: "July 10, 2024",
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80",
        excerpt: "Understanding the impact of your clothing choices on the environment and how to shop ethically."
    },
    {
        id: 5,
        title: "10 Accessory Must-Haves for Your Travel Wardrobe",
        category: "Accessories",
        date: "July 05, 2024",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        excerpt: "Travel in style with these functional yet fashionable accessories that make every outfit pop."
    },
    {
        id: 6,
        title: "The Art of Layering: A Practical Guide for Transitions",
        category: "Fashion",
        date: "June 30, 2024",
        image: "https://images.unsplash.com/photo-1539109132314-d4a8c62e40dc?w=800&q=80",
        excerpt: "Master the art of layering to stay comfortable and stylish during unpredictable weather shifts."
    }
];

export default function BlogPage() {
    return (
        <div className="blog-page">
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden bg-zinc-50 py-10">
                    <div className="container mx-auto relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content text-center">
                                <h2 className="heading2 font-bold text-4xl">Blog Grid</h2>
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3 text-zinc-500">
                                    <Link href="/" className="hover:text-black">Homepage</Link>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="capitalize">Blog Grid</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="blog-grid mt-16 md:mt-24 md:py-20 py-10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-8 gap-y-12">
                        {blogPosts.map((post) => (
                            <div key={post.id} className="blog-item group">
                                <Link href={`/blog/${post.id}`} className="block overflow-hidden rounded-2xl relative aspect-[4/3] bg-zinc-100">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 duration-700 transition-transform"
                                    />
                                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                        {post.category}
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
                                    <Link href={`/blog/${post.id}`} className="text-button inline-block mt-4 font-bold border-b-2 border-black pb-1">
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="list-pagination w-full flex items-center justify-center gap-4 md:mt-16 mt-10">
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-purple-600 text-white font-bold cursor-pointer">1</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-gray-100 text-gray-500 cursor-pointer">2</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-gray-100 text-gray-500 cursor-pointer">3</div>
                        <div className="item w-10 h-10 flex items-center justify-center rounded-lg border border-line bg-black text-white cursor-pointer">
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
