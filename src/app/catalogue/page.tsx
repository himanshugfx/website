'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HotelAmenity {
    id: string;
    name: string;
    category: string;
    description: string | null;
    image: string;
    minOrderQty: number;
    sizes: string | null;
    packing: string | null;
    contents: string | null;
    material: string | null;
    dimensions: string | null;
    color: string | null;
    isActive: boolean;
    priority: number;
}

const getImageUrl = (image: string): string => {
    if (!image) return '/assets/images/product/1000x1000.png';
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return `/api/media/${image}`;
};

export default function CataloguePage() {
    const [products, setProducts] = useState<HotelAmenity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/hotel-catalogue?limit=1000');
            const data = await res.json();
            const allProducts: HotelAmenity[] = data.amenities || [];
            allProducts.sort((a, b) => b.priority - a.priority);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white mt-6 text-lg font-medium">Loading catalogue...</p>
                </div>
            </div>
        );
    }

    const totalProducts = products.length;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
                
                :root {
                    --primary: #7c3aed;
                    --primary-light: #a855f7;
                    --primary-dark: #5b21b6;
                    --dark: #1a1c23;
                    --dark-light: #2d2f36;
                    --text: #374151;
                    --text-light: #6b7280;
                    --bg-cream: #faf9f7;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
            `}</style>

            {/* Cover Page */}
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex flex-col justify-center items-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute w-[600px] h-[600px] border border-purple-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute w-[500px] h-[500px] border border-purple-500/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute w-[400px] h-[400px] border border-purple-500/10 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                {/* Floating decorative elements */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-32 right-20 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 text-center p-10 animate-fadeInUp">
                    <img
                        src="/assets/images/anose-logo.png"
                        alt="Anose Beauty"
                        className="w-36 h-auto mx-auto mb-8 brightness-0 invert drop-shadow-2xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="font-['Playfair_Display'] text-base tracking-[8px] uppercase text-purple-400 mb-6 font-medium">Anose Beauty</p>
                    <h1 className="font-['Playfair_Display'] text-7xl md:text-8xl font-normal text-white mb-6 tracking-tight">Catalogue</h1>
                    <p className="text-lg font-light text-white/70 tracking-[4px] uppercase mb-12">Premium Hotel Amenities</p>

                    <div className="flex justify-center gap-16 mb-14">
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">{totalProducts}</span>
                            <span className="text-xs uppercase tracking-[4px] text-white/50 mt-2 block">Products</span>
                        </div>
                        <div className="w-px h-20 bg-white/20"></div>
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">100+</span>
                            <span className="text-xs uppercase tracking-[4px] text-white/50 mt-2 block">Hotels Served</span>
                        </div>
                        <div className="w-px h-20 bg-white/20"></div>
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">{currentYear}</span>
                            <span className="text-xs uppercase tracking-[4px] text-white/50 mt-2 block">Edition</span>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="mt-8">
                        <div className="w-8 h-12 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-2">
                            <div className="w-2 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                        </div>
                        <p className="text-white/40 text-xs mt-4 tracking-wider uppercase">Scroll to explore</p>
                    </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-10 text-white/50 text-sm">
                    <span className="flex items-center gap-2 hover:text-purple-400 transition-colors">📧 wecare@anosebeauty.com</span>
                    <span className="flex items-center gap-2 hover:text-purple-400 transition-colors">📞 +91 9110134408</span>
                    <span className="flex items-center gap-2 hover:text-purple-400 transition-colors">🌐 www.anosebeauty.com</span>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-gradient-to-b from-[#faf9f7] to-white py-20 px-6 md:px-12 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-5 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold tracking-wider uppercase mb-6">
                            Premium Collection
                        </span>
                        <h2 className="font-['Playfair_Display'] text-5xl md:text-6xl text-[#1a1c23] mb-4">Our Products</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-500 mx-auto rounded-full mb-6"></div>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Premium quality hotel amenities designed to elevate your guest experience</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((item, idx) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/product/1000x1000.png'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 left-4 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#1a1c23] mb-4 group-hover:text-purple-600 transition-colors">{item.name}</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wide text-gray-400 block">MOQ</span>
                                                <span className="text-xs font-semibold text-[#1a1c23]">{item.minOrderQty} units</span>
                                            </div>
                                        </div>

                                        {item.sizes && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Sizes</span>
                                                    <span className="text-xs font-semibold text-[#1a1c23]">{JSON.parse(item.sizes).join(', ')}</span>
                                                </div>
                                            </div>
                                        )}

                                        {item.packing && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Packing</span>
                                                    <span className="text-xs font-semibold text-[#1a1c23]">{item.packing}</span>
                                                </div>
                                            </div>
                                        )}

                                        {item.material && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Material</span>
                                                    <span className="text-xs font-semibold text-[#1a1c23]">{item.material}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {item.description && (
                                        <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 line-clamp-2">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Back Cover / Contact */}
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex flex-col justify-center items-center text-center p-12 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <p className="font-['Playfair_Display'] text-base tracking-[8px] uppercase text-purple-400 mb-8">Anose Beauty</p>
                    <h2 className="font-['Playfair_Display'] text-5xl md:text-6xl font-normal text-white mb-6">Ready to Order?</h2>
                    <p className="text-xl text-white/60 mb-16 max-w-xl mx-auto leading-relaxed">Contact us today for bulk pricing, customization options, and exclusive partnership opportunities.</p>

                    <div className="flex flex-wrap justify-center gap-10 mb-16">
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">📧</div>
                            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Email</p>
                            <p className="text-base text-white font-medium">wecare@anosebeauty.com</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">📞</div>
                            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Phone</p>
                            <p className="text-base text-white font-medium">+91 9110134408</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">🌐</div>
                            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Website</p>
                            <p className="text-base text-white font-medium">www.anosebeauty.com</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <a
                            href="mailto:wecare@anosebeauty.com?subject=Hotel Amenities Enquiry"
                            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-base font-semibold uppercase tracking-wider rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1"
                        >
                            Get Quote Now
                        </a>
                        <Link
                            href="/amenities"
                            className="inline-block px-10 py-4 bg-white/10 backdrop-blur-md text-white text-base font-semibold uppercase tracking-wider rounded-full border border-white/30 hover:bg-white/20 transition-all"
                        >
                            Back to Amenities
                        </Link>
                    </div>

                    <div className="text-sm text-white/40 leading-loose space-y-1 mb-8">
                        <p>* Prices available on request</p>
                        <p>* Minimum order quantities apply</p>
                        <p>* Customization available for orders above 500 units</p>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <p className="text-sm text-white/30">© {currentYear} Anose Beauty. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
