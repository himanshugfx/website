'use client';

import { useState, useEffect } from 'react';

interface HotelAmenity {
    id: string;
    name: string;
    category: string;
    description: string | null;
    image: string;
    price: number;
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white mt-4">Loading catalogue...</p>
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
            `}</style>

            {/* Cover Page */}
            <div className="min-h-screen bg-gradient-to-br from-[#1a1c23] via-[#2d2f36] to-[#5b21b6] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute w-[500px] h-[500px] border border-purple-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute w-[400px] h-[400px] border border-purple-500/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 text-center p-10">
                    <img
                        src="/assets/images/anose-logo.png"
                        alt="Anose Beauty"
                        className="w-32 h-auto mx-auto mb-6 brightness-0 invert"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="font-['Playfair_Display'] text-base tracking-[6px] uppercase text-purple-400 mb-4">Anose Beauty</p>
                    <h1 className="font-['Playfair_Display'] text-6xl md:text-7xl font-normal text-white mb-4">Catalogue</h1>
                    <p className="text-sm font-light text-white/70 tracking-widest uppercase mb-8">Premium Hotel Amenities</p>

                    <div className="flex justify-center gap-12 mb-10">
                        <div className="text-center">
                            <span className="font-['Playfair_Display'] text-5xl text-purple-400 block">{totalProducts}</span>
                            <span className="text-xs uppercase tracking-widest text-white/50">Products</span>
                        </div>
                        <div className="text-center">
                            <span className="font-['Playfair_Display'] text-5xl text-purple-400 block">100+</span>
                            <span className="text-xs uppercase tracking-widest text-white/50">Hotels Served</span>
                        </div>
                        <div className="text-center">
                            <span className="font-['Playfair_Display'] text-5xl text-purple-400 block">{currentYear}</span>
                            <span className="text-xs uppercase tracking-widest text-white/50">Edition</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-white/50 text-sm">
                    <span className="flex items-center gap-2">📧 wecare@anosebeauty.com</span>
                    <span className="flex items-center gap-2">📞 +91 9110134408</span>
                    <span className="flex items-center gap-2">🌐 www.anosebeauty.com</span>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-[#faf9f7] py-16 px-12 min-h-screen">
                <div className="text-center mb-12 pb-8 border-b-2 border-purple-600">
                    <h2 className="font-['Playfair_Display'] text-4xl text-[#1a1c23] mb-2">Our Products</h2>
                    <p className="text-sm text-gray-500">Premium quality hotel amenities for exceptional guest experiences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {products.map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/product/1000x1000.png'; }}
                                />
                                <div className="absolute top-3 left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-['Playfair_Display'] text-lg font-medium text-[#1a1c23] mb-2">{item.name}</h3>
                                <div className="flex items-baseline gap-2 mb-3 pb-3 border-b border-gray-100">
                                    <span className="text-2xl font-bold text-purple-600">₹{item.price.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">per unit</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wide text-gray-400 block">MOQ</span>
                                        <span className="text-xs font-medium text-[#1a1c23]">{item.minOrderQty} units</span>
                                    </div>
                                    {item.sizes && (
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Sizes</span>
                                            <span className="text-xs font-medium text-[#1a1c23]">{JSON.parse(item.sizes).join(', ')}</span>
                                        </div>
                                    )}
                                    {item.packing && (
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Packing</span>
                                            <span className="text-xs font-medium text-[#1a1c23]">{item.packing}</span>
                                        </div>
                                    )}
                                    {item.material && (
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wide text-gray-400 block">Material</span>
                                            <span className="text-xs font-medium text-[#1a1c23]">{item.material}</span>
                                        </div>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Back Cover / Contact */}
            <div className="min-h-screen bg-[#1a1c23] flex flex-col justify-center items-center text-center p-12">
                <p className="font-['Playfair_Display'] text-sm tracking-[5px] uppercase text-purple-400 mb-6">Anose Beauty</p>
                <h2 className="font-['Playfair_Display'] text-5xl font-normal text-white mb-4">Ready to Order?</h2>
                <p className="text-base text-white/60 mb-12 max-w-md">Contact us today for bulk pricing, customization options, and exclusive partnership opportunities.</p>

                <div className="flex justify-center gap-12 mb-12">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📧</div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Email</p>
                        <p className="text-sm text-white font-medium">wecare@anosebeauty.com</p>
                    </div>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📞</div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Phone</p>
                        <p className="text-sm text-white font-medium">+91 9110134408</p>
                    </div>
                    <div className="text-center">
                        <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌐</div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Website</p>
                        <p className="text-sm text-white font-medium">www.anosebeauty.com</p>
                    </div>
                </div>

                <a
                    href="mailto:wecare@anosebeauty.com?subject=Hotel Amenities Enquiry"
                    className="inline-block px-10 py-4 bg-purple-600 text-white text-sm font-semibold uppercase tracking-wider rounded-full hover:bg-purple-700 transition-colors mb-12"
                >
                    Get Quote Now
                </a>

                <div className="text-xs text-white/40 leading-loose">
                    <p>* Prices are subject to change without prior notice</p>
                    <p>* Minimum order quantities apply</p>
                    <p>* Customization available for orders above 500 units</p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-xs text-white/30">© {currentYear} Anose Beauty. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}
