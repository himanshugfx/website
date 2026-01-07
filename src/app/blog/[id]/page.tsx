import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '../blogData';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const post = blogPosts.find((p) => p.id === parseInt(id));

    if (!post) return { title: 'Post Not Found' };

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            images: [post.afterImage],
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const post = blogPosts.find((p) => p.id === id);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Post Not Found</h1>
                    <Link href="/blog" className="text-blue-600 mt-4 inline-block underline">Return to Blog</Link>
                </div>
            </div>
        );
    }

    const blogJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.afterImage,
        "datePublished": new Date(post.date).toISOString(),
        "author": {
            "@type": "Organization",
            "name": "Anose"
        },
        "description": post.excerpt
    };

    return (
        <div className="blog-detail-page bg-white min-h-screen pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
            />
            {/* Breadcrumb / Hero Area */}
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden bg-zinc-50 py-16">
                    <div className="container mx-auto px-4 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content text-center max-w-2xl">
                                <div className="category text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{post.category}</div>
                                <h1 className="heading1 font-bold text-4xl md:text-5xl leading-tight mb-6">{post.title}</h1>
                                <div className="meta flex items-center justify-center gap-6 text-sm text-zinc-500">
                                    <div className="date flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {post.date}
                                    </div>
                                    <div className="read-time flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        5 min read
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 mt-12 md:mt-20">
                <div className="max-w-4xl mx-auto">
                    {/* Visual Comparison Area */}
                    <div className="comparison-container mb-16">
                        <h2 className="text-2xl font-bold mb-8 text-center italic text-zinc-400 uppercase tracking-widest">Skin Texture Comparison</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="before-side group relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-100 bg-zinc-50">
                                <Image
                                    src={post.beforeImage}
                                    alt="Before treatment"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Before
                                </div>
                            </div>
                            <div className="after-side group relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-100 bg-zinc-50 shadow-xl">
                                <Image
                                    src={post.afterImage}
                                    alt="After treatment"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-green-600/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                    After
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-zinc-400 text-sm mt-6 italic">
                            *Actual results observed in controlled dermatological testing of the ingredient.
                        </p>
                    </div>

                    {/* Article Body */}
                    <article className="prose prose-zinc max-w-none pt-10 border-t border-zinc-100">
                        <div
                            className="blog-content text-zinc-700 leading-relaxed text-lg"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />
                    </article>

                    {/* Navigation */}
                    <div className="mt-20 pt-10 border-t border-zinc-100 flex items-center justify-between">
                        <Link href="/blog" className="group flex items-center gap-3 font-bold hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Ingredients
                        </Link>

                        <div className="share-links flex items-center gap-4">
                            <span className="text-sm font-bold text-zinc-400 uppercase">Share:</span>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.234-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-200 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.472 1.381.893.42.42.677.82.893 1.38.163.422.358 1.057.412 2.227.059 1.266.071 1.646.071 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.472.96-.893 1.381-.42.42-.82.677-1.38.893-.422.163-1.057.358-2.227.412-1.266.059-1.646.071-4.85.071s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.472-1.381-.893-.42-.42-.677-.82-.893-1.38-.163-.422-.358-1.057-.412-2.227-.059-1.266-.071-1.646-.071-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.472-.96.893-1.381.42-.42.82-.677 1.38-.893.422-.163 1.057-.358 2.227-.412 1.266-.059 1.646-.071 4.85-.071zm0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.148.258-2.911.556-.788.306-1.457.716-2.122 1.381-.665.665-1.075 1.334-1.381 2.122-.298.763-.499 1.634-.556 2.911-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.057 1.277.258 2.148.556 2.911.306.788.716 1.457 1.381 2.122.665.665 1.334 1.075 2.122 1.381.763.298 1.634.499 2.911.556 1.28.059 1.688.072 4.948.072s3.668-.014 4.948-.072c1.277-.057 2.148-.258 2.911-.556.788-.306 1.457-.716 2.122-1.381.665-.665 1.075-1.334 1.381-2.122.298-.763.499-1.634.556-2.911.059-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.057-1.277-.258-2.148-.556-2.911-.306-.788-.716-1.457-1.381-2.122-.665-.665-1.334-1.075-2.122-1.381-.763-.298-1.634-.499-2.911-.556-1.28-.059-1.689-.072-4.948-.072z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
