'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Rabbit, Sparkles, Heart, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400 rounded-full blur-[150px]" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <svg className="w-5 h-4" viewBox="0 0 900 600" fill="none">
                                <rect width="900" height="200" fill="#FF9933" />
                                <rect y="200" width="900" height="200" fill="white" />
                                <rect y="400" width="900" height="200" fill="#138808" />
                                <circle cx="450" cy="300" r="60" fill="#000080" />
                                <circle cx="450" cy="300" r="50" fill="white" />
                            </svg>
                            <span>Proudly Made in India</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            5-Star Spa Skincare.<br />
                            <span className="text-purple-300">Now at Home.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
                            For years, we crafted premium spa experiences for 5-star hotels.
                            Now, we bring that luxury directly to your home.
                        </p>
                    </div>
                </div>
            </section>

            {/* Trust Badges Strip */}
            <section className="bg-zinc-50 py-6 border-b border-zinc-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                            <svg className="w-5 h-4" viewBox="0 0 900 600" fill="none">
                                <rect width="900" height="200" fill="#FF9933" />
                                <rect y="200" width="900" height="200" fill="white" />
                                <rect y="400" width="900" height="200" fill="#138808" />
                                <circle cx="450" cy="300" r="60" fill="#000080" />
                                <circle cx="450" cy="300" r="50" fill="white" />
                            </svg>
                            <span>Made in India</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <span>FDA Approved</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                            <Rabbit className="w-5 h-5 text-purple-600" />
                            <span>Cruelty-Free</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                            <Award className="w-5 h-5 text-amber-600" />
                            <span>5-Star Spa Quality</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-zinc-600 leading-relaxed">
                                <p>
                                    Anose Beauty was born from a simple observation: the premium skincare
                                    products we manufactured for luxury hotels were something everyone deserved
                                    access to—not just hotel guests.
                                </p>
                                <p>
                                    With the years of experience crafting amenities for 5-star properties
                                    across India, we understood what truly works for Indian skin. The climate,
                                    the water quality, the lifestyle—our formulations are designed specifically
                                    for you.
                                </p>
                                <p>
                                    By going direct-to-consumer, we cut out the middlemen. This means you get
                                    the same premium quality at honest, accessible prices. No fancy markups,
                                    just pure, effective skincare.
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/assets/images/banner/about.jpg"
                                alt="Anose Beauty - Crafted with Love"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 md:py-24 bg-zinc-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 text-center mb-12">
                        What We Stand For
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100">
                            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3">
                                Dermatologically Tested
                            </h3>
                            <p className="text-zinc-600">
                                Every product is clinically tested to ensure it's gentle, safe,
                                and effective for all skin types. Your skin's health is our priority.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100">
                            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                                <Rabbit className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3">
                                100% Cruelty-Free
                            </h3>
                            <p className="text-zinc-600">
                                We never test on animals. Our products are certified cruelty-free
                                because beauty should never come at the cost of innocent lives.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100">
                            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                                <Heart className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3">
                                Made with Love in India
                            </h3>
                            <p className="text-zinc-600">
                                Proudly manufactured in India with ingredients sourced ethically.
                                Supporting local communities while delivering global quality.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Experience the Difference?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                        Discover skincare that's crafted with expertise, sold with honesty.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-xl"
                    >
                        Shop Our Collection
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </main>
    );
}
