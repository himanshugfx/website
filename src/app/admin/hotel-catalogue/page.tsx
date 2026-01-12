'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Building2, Download, Package, Filter } from 'lucide-react';

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

// Get image URL - handle both media IDs and direct paths
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

            // Fetch all amenities for PDF
            const res = await fetch('/api/admin/hotel-catalogue?limit=1000');
            const data = await res.json();
            const allAmenities = data.amenities || [];

            // Group by category
            const grouped: Record<string, HotelAmenity[]> = {};
            allAmenities.forEach((a: HotelAmenity) => {
                if (!grouped[a.category]) grouped[a.category] = [];
                grouped[a.category].push(a);
            });

            // Generate HTML for PDF
            const html = generatePdfHtml(grouped);

            // Open in new window for printing
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

    const generatePdfHtml = (grouped: Record<string, HotelAmenity[]>) => {
        const categoryOrder = ['COSMETIC', 'DENTAL_KIT', 'SHAVING_KIT', 'VANITY_KIT', 'SLIPPER', 'COASTER', 'LAUNDRY_BAG', 'GARBAGE_BAG', 'SHOWER_CAP', 'COMB', 'OTHER'];

        let productsHtml = '';
        categoryOrder.forEach(cat => {
            const items = grouped[cat];
            if (!items || items.length === 0) return;

            productsHtml += `
                <div class="category-section">
                    <h2 class="category-title">${getCategoryLabel(cat)}</h2>
                    <div class="products-grid">
                        ${items.map(item => `
                            <div class="product-card">
                                <div class="product-image">
                                    <img src="${getImageUrl(item.image)}" alt="${item.name}" onerror="this.src='/assets/images/product/1000x1000.png'" />
                                </div>
                                <div class="product-info">
                                    <h3 class="product-name">${item.name}</h3>
                                    <p class="product-price">₹${item.price.toFixed(2)} per unit</p>
                                    <p class="product-moq">Min. Order: ${item.minOrderQty} units</p>
                                    ${item.sizes ? `<p class="product-detail"><strong>Sizes:</strong> ${JSON.parse(item.sizes).join(', ')}</p>` : ''}
                                    ${item.packing ? `<p class="product-detail"><strong>Packing:</strong> ${item.packing}</p>` : ''}
                                    ${item.contents ? `<p class="product-detail"><strong>Contents:</strong> ${JSON.parse(item.contents).join(', ')}</p>` : ''}
                                    ${item.material ? `<p class="product-detail"><strong>Material:</strong> ${item.material}</p>` : ''}
                                    ${item.color ? `<p class="product-detail"><strong>Colors:</strong> ${item.color}</p>` : ''}
                                    ${item.dimensions ? `<p class="product-detail"><strong>Sizes/Dimensions:</strong> ${item.dimensions}</p>` : ''}
                                    ${item.description ? `<p class="product-description">${item.description}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Anose Beauty - Hotel Amenities Catalogue</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Poppins', sans-serif;
                        color: #333;
                        background: #fff;
                        line-height: 1.6;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                    }
                    
                    .logo {
                        width: 120px;
                        height: auto;
                        margin-bottom: 20px;
                    }
                    
                    .header h1 {
                        font-size: 32px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    
                    .header p {
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    
                    .contact-bar {
                        background: #1a1c23;
                        color: white;
                        padding: 15px 40px;
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 15px;
                        font-size: 13px;
                    }
                    
                    .contact-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .content {
                        padding: 40px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .intro {
                        text-align: center;
                        margin-bottom: 40px;
                        padding: 30px;
                        background: #f8f9fc;
                        border-radius: 12px;
                    }
                    
                    .intro h2 {
                        color: #7c3aed;
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    
                    .category-section {
                        margin-bottom: 50px;
                        page-break-inside: avoid;
                    }
                    
                    .category-title {
                        font-size: 22px;
                        color: #7c3aed;
                        padding-bottom: 10px;
                        border-bottom: 3px solid #7c3aed;
                        margin-bottom: 25px;
                    }
                    
                    .products-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 25px;
                    }
                    
                    .product-card {
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        overflow: hidden;
                        display: flex;
                        page-break-inside: avoid;
                    }
                    
                    .product-image {
                        width: 150px;
                        min-width: 150px;
                        height: 150px;
                        background: #f3f4f6;
                    }
                    
                    .product-image img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .product-info {
                        padding: 15px;
                        flex: 1;
                    }
                    
                    .product-name {
                        font-size: 16px;
                        font-weight: 600;
                        color: #1a1c23;
                        margin-bottom: 5px;
                    }
                    
                    .product-price {
                        font-size: 18px;
                        font-weight: 700;
                        color: #7c3aed;
                        margin-bottom: 5px;
                    }
                    
                    .product-moq {
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 10px;
                    }
                    
                    .product-detail {
                        font-size: 12px;
                        color: #4b5563;
                        margin-bottom: 3px;
                    }
                    
                    .product-description {
                        font-size: 11px;
                        color: #6b7280;
                        margin-top: 8px;
                        line-height: 1.4;
                    }
                    
                    .footer {
                        background: #1a1c23;
                        color: white;
                        padding: 40px;
                        text-align: center;
                    }
                    
                    .footer h3 {
                        font-size: 20px;
                        margin-bottom: 15px;
                        color: #a855f7;
                    }
                    
                    .footer p {
                        font-size: 13px;
                        margin-bottom: 8px;
                        opacity: 0.8;
                    }
                    
                    .terms {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #333;
                        font-size: 11px;
                        opacity: 0.6;
                    }
                    
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .contact-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/assets/images/anose-logo.png" alt="Anose Beauty" class="logo" />
                    <h1>Hotel Amenities Catalogue</h1>
                    <p>Premium Quality Products for Hospitality Industry</p>
                </div>
                
                <div class="contact-bar">
                    <div class="contact-item">
                        <span>📍</span>
                        <span>India</span>
                    </div>
                    <div class="contact-item">
                        <span>📧</span>
                        <span>contact@anosebeauty.com</span>
                    </div>
                    <div class="contact-item">
                        <span>🌐</span>
                        <span>www.anosebeauty.com</span>
                    </div>
                </div>
                
                <div class="content">
                    <div class="intro">
                        <h2>Welcome to Anose Beauty</h2>
                        <p>We provide premium quality hotel amenities that enhance your guests' experience. Our products are crafted with care using the finest ingredients and materials.</p>
                    </div>
                    
                    ${productsHtml}
                </div>
                
                <div class="footer">
                    <h3>Ready to Order?</h3>
                    <p>Contact us for bulk pricing and customization options</p>
                    <p>📧 Email: contact@anosebeauty.com</p>
                    <p>🌐 Website: www.anosebeauty.com</p>
                    
                    <div class="terms">
                        <p>* Prices are subject to change without prior notice</p>
                        <p>* Minimum order quantities apply | Customization available for orders above 500 units</p>
                        <p>© ${new Date().getFullYear()} Anose Beauty. All rights reserved.</p>
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
