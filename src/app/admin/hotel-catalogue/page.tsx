'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Building2, Download, Package, Eye } from 'lucide-react';

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

const CATEGORIES = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'COSMETIC', label: 'Cosmetics' },
    { value: 'DENTAL_KIT', label: 'Dental Kits' },
    { value: 'SHAVING_KIT', label: 'Shaving Kits' },
    { value: 'VANITY_KIT', label: 'Vanity Kits' },
    { value: 'SLIPPER', label: 'Slippers' },
    { value: 'COASTER', label: 'Coasters' },
    { value: 'LAUNDRY_BAG', label: 'Laundry Bags' },
    { value: 'GARBAGE_BAG', label: 'Garbage Bags' },
    { value: 'SHOWER_CAP', label: 'Shower Caps' },
    { value: 'COMB', label: 'Combs' },
    { value: 'OTHER', label: 'Other' },
];

const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        COSMETIC: 'bg-purple-100 text-purple-700',
        DENTAL_KIT: 'bg-blue-100 text-blue-700',
        SHAVING_KIT: 'bg-green-100 text-green-700',
        VANITY_KIT: 'bg-pink-100 text-pink-700',
        SLIPPER: 'bg-orange-100 text-orange-700',
        COASTER: 'bg-yellow-100 text-yellow-700',
        LAUNDRY_BAG: 'bg-teal-100 text-teal-700',
        GARBAGE_BAG: 'bg-gray-100 text-gray-700',
        SHOWER_CAP: 'bg-cyan-100 text-cyan-700',
        COMB: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
};

const getImageUrl = (image: string): string => {
    if (!image) return '/assets/images/product/1000x1000.png';
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return `/api/media/${image}`;
};

export default function HotelCataloguePage() {
    const [amenities, setAmenities] = useState<HotelAmenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        fetchAmenities();
    }, [search, category]);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (category && category !== 'ALL') params.set('category', category);

            const res = await fetch(`/api/admin/hotel-catalogue?${params}`);
            const data = await res.json();
            setAmenities(data.amenities || []);
        } catch (error) {
            console.error('Error fetching amenities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this amenity?')) return;

        try {
            const res = await fetch(`/api/admin/hotel-catalogue/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAmenities();
            } else {
                alert('Failed to delete amenity');
            }
        } catch (error) {
            console.error('Error deleting amenity:', error);
            alert('An error occurred');
        }
    };

    const handleSeedData = async () => {
        if (!confirm('This will add sample hotel amenities. Continue?')) return;

        try {
            setSeeding(true);
            const res = await fetch('/api/admin/hotel-catalogue/seed', {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Successfully added ${data.count || 'sample'} amenities!`);
                fetchAmenities();
            } else {
                alert(data.message || data.error || 'Failed to seed data');
            }
        } catch (error) {
            console.error('Error seeding data:', error);
            alert('Failed to seed data');
        } finally {
            setSeeding(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            setGeneratingPdf(true);

            const res = await fetch('/api/admin/hotel-catalogue?limit=1000');
            const data = await res.json();
            const allAmenities: HotelAmenity[] = data.amenities || [];

            // Sort by priority (highest first)
            allAmenities.sort((a, b) => b.priority - a.priority);

            const html = generatePdfHtml(allAmenities);

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const generatePdfHtml = (products: HotelAmenity[]) => {
        const totalProducts = products.length;

        const productsHtml = products.map((item, idx) => `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${getImageUrl(item.image)}" alt="${item.name}" onerror="this.src='/assets/images/product/1000x1000.png'" />
                    <div class="product-badge">${String(idx + 1).padStart(2, '0')}</div>
                </div>
                <div class="product-details">
                    <h3 class="product-title">${item.name}</h3>
                    <div class="product-price-row">
                        <span class="product-price">₹${item.price.toFixed(2)}</span>
                        <span class="product-unit">per unit</span>
                    </div>
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label">MOQ</span>
                            <span class="spec-value">${item.minOrderQty} units</span>
                        </div>
                        ${item.sizes ? `
                            <div class="spec-item">
                                <span class="spec-label">Sizes</span>
                                <span class="spec-value">${JSON.parse(item.sizes).join(', ')}</span>
                            </div>
                        ` : ''}
                        ${item.packing ? `
                            <div class="spec-item">
                                <span class="spec-label">Packing</span>
                                <span class="spec-value">${item.packing}</span>
                            </div>
                        ` : ''}
                        ${item.contents ? `
                            <div class="spec-item">
                                <span class="spec-label">Contents</span>
                                <span class="spec-value">${JSON.parse(item.contents).join(', ')}</span>
                            </div>
                        ` : ''}
                        ${item.material ? `
                            <div class="spec-item">
                                <span class="spec-label">Material</span>
                                <span class="spec-value">${item.material}</span>
                            </div>
                        ` : ''}
                        ${item.color ? `
                            <div class="spec-item">
                                <span class="spec-label">Colors</span>
                                <span class="spec-value">${item.color}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${item.description ? `<p class="product-desc">${item.description}</p>` : ''}
                </div>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Anose Beauty - Hotel Amenities Catalogue ${new Date().getFullYear()}</title>
                <style>
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
                    
                    @page { size: A4; margin: 0; }
                    
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body {
                        font-family: 'Inter', sans-serif;
                        color: var(--text);
                        background: #fff;
                        line-height: 1.5;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .cover-page {
                        width: 100%;
                        height: 100vh;
                        background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 50%, var(--primary-dark) 100%);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        overflow: hidden;
                        page-break-after: always;
                    }
                    
                    .cover-decoration {
                        position: absolute;
                        width: 500px;
                        height: 500px;
                        border: 1px solid rgba(168, 85, 247, 0.2);
                        border-radius: 50%;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    
                    .cover-content {
                        position: relative;
                        z-index: 10;
                        text-align: center;
                        padding: 40px;
                    }
                    
                    .cover-logo {
                        width: 120px;
                        height: auto;
                        margin-bottom: 25px;
                        filter: brightness(0) invert(1);
                    }
                    
                    .cover-brand {
                        font-family: 'Playfair Display', serif;
                        font-size: 16px;
                        letter-spacing: 6px;
                        text-transform: uppercase;
                        color: var(--primary-light);
                        margin-bottom: 15px;
                    }
                    
                    .cover-title {
                        font-family: 'Playfair Display', serif;
                        font-size: 60px;
                        font-weight: 400;
                        color: white;
                        line-height: 1.1;
                        margin-bottom: 15px;
                    }
                    
                    .cover-subtitle {
                        font-size: 14px;
                        font-weight: 300;
                        color: rgba(255,255,255,0.7);
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        margin-bottom: 30px;
                    }
                    
                    .cover-stats {
                        display: flex;
                        justify-content: center;
                        gap: 50px;
                        margin-bottom: 40px;
                    }
                    
                    .cover-stat { text-align: center; }
                    
                    .cover-stat-number {
                        font-family: 'Playfair Display', serif;
                        font-size: 42px;
                        color: var(--primary-light);
                        display: block;
                    }
                    
                    .cover-stat-label {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: rgba(255,255,255,0.5);
                    }
                    
                    .cover-footer {
                        position: absolute;
                        bottom: 30px;
                        left: 0;
                        right: 0;
                        display: flex;
                        justify-content: center;
                        gap: 30px;
                        color: rgba(255,255,255,0.5);
                        font-size: 11px;
                    }
                    
                    .cover-footer span {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    .products-page {
                        padding: 60px 50px;
                        background: var(--bg-cream);
                        min-height: 100vh;
                    }
                    
                    .products-header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 30px;
                        border-bottom: 2px solid var(--primary);
                    }
                    
                    .products-header h2 {
                        font-family: 'Playfair Display', serif;
                        font-size: 36px;
                        color: var(--dark);
                        margin-bottom: 8px;
                    }
                    
                    .products-header p {
                        font-size: 14px;
                        color: var(--text-light);
                    }
                    
                    .products-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 25px;
                    }
                    
                    .product-card {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 3px 15px rgba(0,0,0,0.06);
                        page-break-inside: avoid;
                    }
                    
                    .product-image-container {
                        width: 100%;
                        height: 160px;
                        position: relative;
                        background: #f8f8f8;
                    }
                    
                    .product-image-container img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .product-badge {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        width: 30px;
                        height: 30px;
                        background: var(--primary);
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        font-weight: 600;
                    }
                    
                    .product-details { padding: 15px; }
                    
                    .product-title {
                        font-family: 'Playfair Display', serif;
                        font-size: 16px;
                        font-weight: 500;
                        color: var(--dark);
                        margin-bottom: 8px;
                    }
                    
                    .product-price-row {
                        display: flex;
                        align-items: baseline;
                        gap: 6px;
                        margin-bottom: 12px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .product-price {
                        font-size: 20px;
                        font-weight: 700;
                        color: var(--primary);
                    }
                    
                    .product-unit {
                        font-size: 11px;
                        color: var(--text-light);
                    }
                    
                    .product-specs {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        margin-bottom: 10px;
                    }
                    
                    .spec-item {
                        display: flex;
                        flex-direction: column;
                        gap: 1px;
                    }
                    
                    .spec-label {
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: var(--text-light);
                    }
                    
                    .spec-value {
                        font-size: 11px;
                        font-weight: 500;
                        color: var(--dark);
                    }
                    
                    .product-desc {
                        font-size: 10px;
                        color: var(--text-light);
                        line-height: 1.5;
                        border-top: 1px solid #eee;
                        padding-top: 10px;
                    }
                    
                    .back-cover {
                        width: 100%;
                        height: 100vh;
                        background: var(--dark);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        padding: 50px;
                        page-break-before: always;
                    }
                    
                    .back-brand {
                        font-family: 'Playfair Display', serif;
                        font-size: 12px;
                        letter-spacing: 5px;
                        text-transform: uppercase;
                        color: var(--primary-light);
                        margin-bottom: 25px;
                    }
                    
                    .back-title {
                        font-family: 'Playfair Display', serif;
                        font-size: 40px;
                        font-weight: 400;
                        color: white;
                        margin-bottom: 15px;
                    }
                    
                    .back-subtitle {
                        font-size: 14px;
                        color: rgba(255,255,255,0.6);
                        margin-bottom: 50px;
                        max-width: 450px;
                    }
                    
                    .contact-grid {
                        display: flex;
                        justify-content: center;
                        gap: 50px;
                        margin-bottom: 50px;
                    }
                    
                    .contact-box { text-align: center; }
                    
                    .contact-icon {
                        width: 50px;
                        height: 50px;
                        background: var(--primary);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 15px;
                        font-size: 20px;
                    }
                    
                    .contact-label {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: rgba(255,255,255,0.5);
                        margin-bottom: 5px;
                    }
                    
                    .contact-value {
                        font-size: 13px;
                        color: white;
                        font-weight: 500;
                    }
                    
                    .back-cta {
                        display: inline-block;
                        padding: 15px 40px;
                        background: var(--primary);
                        color: white;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        border-radius: 40px;
                        margin-bottom: 40px;
                    }
                    
                    .back-terms {
                        font-size: 10px;
                        color: rgba(255,255,255,0.4);
                        line-height: 1.8;
                    }
                    
                    .back-copyright {
                        margin-top: 25px;
                        padding-top: 25px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        font-size: 11px;
                        color: rgba(255,255,255,0.3);
                    }

                    @media print {
                        .cover-page, .products-page, .back-cover {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="cover-page">
                    <div class="cover-decoration"></div>
                    <div class="cover-content">
                        <img src="/assets/images/anose-logo.png" alt="Anose Beauty" class="cover-logo" onerror="this.style.display='none'" />
                        <div class="cover-brand">Anose Beauty</div>
                        <h1 class="cover-title">Catalogue</h1>
                        <p class="cover-subtitle">Premium Hotel Amenities</p>
                        <div class="cover-stats">
                            <div class="cover-stat">
                                <span class="cover-stat-number">${totalProducts}</span>
                                <span class="cover-stat-label">Products</span>
                            </div>
                            <div class="cover-stat">
                                <span class="cover-stat-number">100+</span>
                                <span class="cover-stat-label">Hotels Served</span>
                            </div>
                            <div class="cover-stat">
                                <span class="cover-stat-number">${new Date().getFullYear()}</span>
                                <span class="cover-stat-label">Edition</span>
                            </div>
                        </div>
                    </div>
                    <div class="cover-footer">
                        <span>📧 wecare@anosebeauty.com</span>
                        <span>📞 +91 9110134408</span>
                        <span>🌐 www.anosebeauty.com</span>
                    </div>
                </div>
                
                <div class="products-page">
                    <div class="products-header">
                        <h2>Our Products</h2>
                        <p>Premium quality hotel amenities for exceptional guest experiences</p>
                    </div>
                    <div class="products-grid">
                        ${productsHtml}
                    </div>
                </div>
                
                <div class="back-cover">
                    <div class="back-brand">Anose Beauty</div>
                    <h2 class="back-title">Ready to Order?</h2>
                    <p class="back-subtitle">Contact us today for bulk pricing, customization options, and exclusive partnership opportunities.</p>
                    
                    <div class="contact-grid">
                        <div class="contact-box">
                            <div class="contact-icon">📧</div>
                            <div class="contact-label">Email</div>
                            <div class="contact-value">wecare@anosebeauty.com</div>
                        </div>
                        <div class="contact-box">
                            <div class="contact-icon">📞</div>
                            <div class="contact-label">Phone</div>
                            <div class="contact-value">+91 9110134408</div>
                        </div>
                        <div class="contact-box">
                            <div class="contact-icon">🌐</div>
                            <div class="contact-label">Website</div>
                            <div class="contact-value">www.anosebeauty.com</div>
                        </div>
                    </div>
                    
                    <div class="back-cta">Get Quote Now</div>
                    
                    <div class="back-terms">
                        <p>* Prices are subject to change without prior notice</p>
                        <p>* Minimum order quantities apply</p>
                        <p>* Customization available for orders above 500 units</p>
                    </div>
                    
                    <div class="back-copyright">
                        © ${new Date().getFullYear()} Anose Beauty. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-purple-600" />
                            Hotel Catalogue
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Manage hotel amenities and supplies
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/catalogue"
                            target="_blank"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
                        >
                            <Eye className="w-5 h-5" />
                            View Catalogue
                        </Link>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={generatingPdf || amenities.length === 0}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-5 h-5" />
                            {generatingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
                        <Link
                            href="/admin/hotel-catalogue/add"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Amenity
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search amenities by name or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all outline-none cursor-pointer"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Amenities Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 mt-3">Loading amenities...</p>
                        </div>
                    ) : amenities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <Package className="w-10 h-10 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No amenities found</h3>
                            <p className="text-gray-500 mb-6">Get started by adding your first amenity or load sample data</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSeedData}
                                    disabled={seeding}
                                    className="px-5 py-2.5 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                                >
                                    {seeding ? 'Adding...' : 'Load Sample Data'}
                                </button>
                                <Link
                                    href="/admin/hotel-catalogue/add"
                                    className="px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Add Manually
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {amenities.map((amenity) => (
                                <div
                                    key={amenity.id}
                                    className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                        <img
                                            src={getImageUrl(amenity.image)}
                                            alt={amenity.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/images/product/1000x1000.png';
                                            }}
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(amenity.category)}`}>
                                                {getCategoryLabel(amenity.category)}
                                            </span>
                                        </div>
                                        {!amenity.isActive && (
                                            <div className="absolute top-3 right-3">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                                    Inactive
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{amenity.name}</h3>
                                        <p className="text-xl font-bold text-purple-600 mb-2">₹{amenity.price.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500 mb-3">Min. Order: {amenity.minOrderQty} units</p>

                                        {amenity.sizes && (
                                            <p className="text-xs text-gray-500 mb-1">
                                                <span className="font-medium">Sizes:</span> {JSON.parse(amenity.sizes).join(', ')}
                                            </p>
                                        )}
                                        {amenity.material && (
                                            <p className="text-xs text-gray-500 mb-1">
                                                <span className="font-medium">Material:</span> {amenity.material}
                                            </p>
                                        )}

                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                            <Link
                                                href={`/admin/hotel-catalogue/${amenity.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(amenity.id)}
                                                className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
