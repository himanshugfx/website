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
            const res = await fetch('/api/public/catalogue?limit=1000');
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
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white mt-4 md:mt-6 text-base md:text-lg font-medium">Loading catalogue...</p>
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
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex flex-col justify-center items-center relative overflow-hidden px-4 sm:px-6">
                {/* Animated background elements - smaller on mobile */}
                <div className="absolute w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] border border-purple-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute w-[250px] sm:w-[350px] md:w-[500px] h-[250px] sm:h-[350px] md:h-[500px] border border-purple-500/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] border border-purple-500/10 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                {/* Floating decorative elements - hidden on small mobile */}
                <div className="hidden sm:block absolute top-20 left-10 md:left-20 w-20 md:w-32 h-20 md:h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="hidden sm:block absolute bottom-32 right-10 md:right-20 w-24 md:w-40 h-24 md:h-40 bg-purple-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="hidden md:block absolute top-1/3 right-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 text-center p-4 sm:p-6 md:p-10 animate-fadeInUp">
                    <img
                        src="/assets/images/anose-logo.png"
                        alt="Anose Beauty"
                        className="w-24 sm:w-28 md:w-36 h-auto mx-auto mb-4 sm:mb-6 md:mb-8 brightness-0 invert drop-shadow-2xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="font-['Playfair_Display'] text-xs sm:text-sm md:text-base tracking-[4px] sm:tracking-[6px] md:tracking-[8px] uppercase text-purple-400 mb-3 sm:mb-4 md:mb-6 font-medium">Anose Beauty</p>
                    <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-normal text-white mb-3 sm:mb-4 md:mb-6 tracking-tight">Catalogue</h1>
                    <p className="text-sm sm:text-base md:text-lg font-light text-white/70 tracking-[2px] sm:tracking-[3px] md:tracking-[4px] uppercase mb-8 sm:mb-10 md:mb-12">Premium Hotel Amenities</p>

                    {/* Stats - stacked on mobile, inline on larger screens */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 md:gap-16 mb-8 sm:mb-10 md:mb-14">
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">{totalProducts}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-[2px] sm:tracking-[4px] text-white/50 mt-1 sm:mt-2 block">Products</span>
                        </div>
                        <div className="hidden sm:block w-px h-16 md:h-20 bg-white/20"></div>
                        <div className="w-16 h-px sm:hidden bg-white/20"></div>
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">100+</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-[2px] sm:tracking-[4px] text-white/50 mt-1 sm:mt-2 block">Hotels Served</span>
                        </div>
                        <div className="hidden sm:block w-px h-16 md:h-20 bg-white/20"></div>
                        <div className="w-16 h-px sm:hidden bg-white/20"></div>
                        <div className="text-center group">
                            <span className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl text-purple-400 block group-hover:scale-110 transition-transform duration-300">{currentYear}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-[2px] sm:tracking-[4px] text-white/50 mt-1 sm:mt-2 block">Edition</span>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="mt-4 sm:mt-6 md:mt-8">
                        <div className="w-6 h-10 sm:w-8 sm:h-12 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-1.5 sm:p-2">
                            <div className="w-1.5 h-2.5 sm:w-2 sm:h-3 bg-purple-400 rounded-full animate-bounce"></div>
                        </div>
                        <p className="text-white/40 text-[10px] sm:text-xs mt-2 sm:mt-4 tracking-wider uppercase">Scroll to explore</p>
                    </div>
                </div>

                {/* Contact footer - stacked on mobile */}
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-0 right-0 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 md:gap-10 text-white/50 text-xs sm:text-sm px-4">
                    <span className="flex items-center gap-2 hover:text-purple-400 transition-colors">📧 wecare@anosebeauty.com</span>
                    <span className="flex items-center gap-2 hover:text-purple-400 transition-colors">📞 +91 9110134408</span>
                    <span className="hidden sm:flex items-center gap-2 hover:text-purple-400 transition-colors">🌐 www.anosebeauty.com</span>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-gradient-to-b from-[#faf9f7] to-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 sm:mb-12 md:mb-16">
                        <span className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4 sm:mb-6">
                            Premium Collection
                        </span>
                        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1c23] mb-3 sm:mb-4">Our Products</h2>
                        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-500 mx-auto rounded-full mb-4 sm:mb-6"></div>
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4">Premium quality hotel amenities designed to elevate your guest experience</p>
                    </div>

                    {/* Product Grid - 2 columns on mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {products.map((item, idx) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="relative h-36 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/product/1000x1000.png'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold shadow-lg">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                                    <h3 className="font-['Playfair_Display'] text-sm sm:text-base md:text-lg lg:text-xl font-medium text-[#1a1c23] mb-2 sm:mb-3 md:mb-4 group-hover:text-purple-600 transition-colors line-clamp-2">{item.name}</h3>

                                    {/* Specs - simplified on mobile */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center gap-2 sm:gap-3 text-sm">
                                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wide text-gray-400 block">MOQ</span>
                                                <span className="text-[10px] sm:text-xs font-semibold text-[#1a1c23] truncate block">{item.minOrderQty} units</span>
                                            </div>
                                        </div>

                                        {/* Show fewer specs on mobile */}
                                        {item.sizes && (
                                            <div className="hidden sm:flex items-center gap-2 sm:gap-3 text-sm">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wide text-gray-400 block">Sizes</span>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-[#1a1c23] truncate block">{JSON.parse(item.sizes).join(', ')}</span>
                                                </div>
                                            </div>
                                        )}

                                        {item.packing && (
                                            <div className="hidden md:flex items-center gap-2 sm:gap-3 text-sm">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wide text-gray-400 block">Packing</span>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-[#1a1c23] truncate block">{item.packing}</span>
                                                </div>
                                            </div>
                                        )}

                                        {item.material && (
                                            <div className="hidden lg:flex items-center gap-2 sm:gap-3 text-sm">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wide text-gray-400 block">Material</span>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-[#1a1c23] truncate block">{item.material}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {item.description && (
                                        <p className="hidden sm:block text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 line-clamp-2">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Back Cover / Contact */}
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex flex-col justify-center items-center text-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
                {/* Background decorations - smaller on mobile */}
                <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-purple-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-4xl mx-auto w-full">
                    <p className="font-['Playfair_Display'] text-xs sm:text-sm md:text-base tracking-[4px] sm:tracking-[6px] md:tracking-[8px] uppercase text-purple-400 mb-4 sm:mb-6 md:mb-8">Anose Beauty</p>
                    <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 sm:mb-6">Ready to Order?</h2>
                    <p className="text-sm sm:text-base md:text-xl text-white/60 mb-10 sm:mb-12 md:mb-16 max-w-xl mx-auto leading-relaxed px-4">Contact us today for bulk pricing, customization options, and exclusive partnership opportunities.</p>

                    {/* Contact cards - stacked on mobile, grid on larger */}
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 mb-10 sm:mb-12 md:mb-16">
                        <div className="text-center group">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5 text-xl sm:text-2xl md:text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">📧</div>
                            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-1 sm:mb-2">Email</p>
                            <p className="text-xs sm:text-sm md:text-base text-white font-medium break-all sm:break-normal">wecare@anosebeauty.com</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5 text-xl sm:text-2xl md:text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">📞</div>
                            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-1 sm:mb-2">Phone</p>
                            <p className="text-xs sm:text-sm md:text-base text-white font-medium">+91 9110134408</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5 text-xl sm:text-2xl md:text-3xl shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">🌐</div>
                            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-1 sm:mb-2">Website</p>
                            <p className="text-xs sm:text-sm md:text-base text-white font-medium">anosebeauty.com</p>
                        </div>
                    </div>

                    {/* CTA Buttons - stacked on mobile */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 md:mb-16 px-4 sm:px-0">
                        <a
                            href="mailto:wecare@anosebeauty.com?subject=Hotel Amenities Enquiry"
                            className="inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm sm:text-base font-semibold uppercase tracking-wider rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1"
                        >
                            Get Quote Now
                        </a>
                        <Link
                            href="/amenities"
                            className="inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-white/10 backdrop-blur-md text-white text-sm sm:text-base font-semibold uppercase tracking-wider rounded-full border border-white/30 hover:bg-white/20 transition-all"
                        >
                            Back to Amenities
                        </Link>
                    </div>

                    <div className="text-xs sm:text-sm text-white/40 leading-loose space-y-0.5 sm:space-y-1 mb-6 sm:mb-8 px-4">
                        <p>* Prices available on request</p>
                        <p>* Minimum order quantities apply</p>
                        <p className="hidden sm:block">* Customization available for orders above 500 units</p>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-white/10">
                        <p className="text-xs sm:text-sm text-white/30">© {currentYear} Anose Beauty. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
