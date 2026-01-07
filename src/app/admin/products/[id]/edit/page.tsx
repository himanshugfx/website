'use client';

import { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
// import { upload } from '@vercel/blob/client';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'cosmetic',
        type: 'skin',
        gender: 'unisex',
        brand: 'Anose',
        price: '',
        originPrice: '',
        quantity: '',
        description: '',
        slug: '',
        sizes: '',
        images: '',
        thumbImage: '',
        videoUrl: '', // Optional video URL - if set, shows video instead of image
        new: false,
        sale: false,
        bestSeller: false,
        rate: 0,
        variations: [] as { id?: string, color: string, colorCode: string, colorImage: string, image: string }[],
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`/api/admin/products/${id}`);

            if (!res.ok) {
                throw new Error('Failed to fetch product');
            }

            const product = await res.json();

            if (product.error) {
                throw new Error(product.error);
            }

            setFormData({
                name: product.name || '',
                category: product.category || 'cosmetic',
                type: product.type || 'skin',
                gender: product.gender || 'unisex',
                brand: product.brand || 'Anose',
                price: product.price?.toString() || '',
                originPrice: product.originPrice?.toString() || '',
                quantity: product.quantity?.toString() || '',
                description: product.description || '',
                slug: product.slug || '',
                sizes: product.sizes || '',
                images: product.images || '',
                thumbImage: product.thumbImage || '',
                videoUrl: product.videoUrl || '',
                new: product.new || false,
                sale: product.sale || false,
                bestSeller: product.bestSeller || false,
                rate: product.rate || 0,
                variations: product.variations || [],
            });
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Failed to load product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update product');
            }
        } catch (err) {
            console.error('Error updating product:', err);
            setError('Failed to update product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-gray-500">Loading product...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error && !formData.name) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-red-500 font-medium">{error}</p>
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Back to Products
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="p-2 bg-black text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Update product information
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 font-bold">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="cosmetic">Cosmetic</option>
                                    <option value="skincare">Skincare</option>
                                    <option value="makeup">Makeup</option>
                                    <option value="fragrance">Fragrance</option>
                                    <option value="haircare">Haircare</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="skin">Skin</option>
                                    <option value="face">Face</option>
                                    <option value="body">Body</option>
                                    <option value="hair">Hair</option>
                                    <option value="lips">Lips</option>
                                    <option value="eyes">Eyes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="unisex">Unisex</option>
                                    <option value="women">Women</option>
                                    <option value="men">Men</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 font-bold">Pricing & Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="originPrice"
                                    value={formData.originPrice}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 font-bold">Product Details</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sizes (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="sizes"
                                    value={formData.sizes}
                                    onChange={handleChange}
                                    placeholder="e.g., 50ml, 100ml, 200ml"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug *
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Main Thumbnail (Search & List View) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter image URL..."
                                    value={formData.thumbImage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, thumbImage: e.target.value }))}
                                    className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-xl text-sm"
                                />
                                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-100 rounded-2xl hover:border-purple-200 transition-colors bg-gray-50/50">
                                    {(() => {
                                        // Parse thumbImage in case it's stored as JSON
                                        let displayThumb = formData.thumbImage;
                                        try {
                                            if (displayThumb && (displayThumb.startsWith('[') || displayThumb.startsWith('"'))) {
                                                const parsed = JSON.parse(displayThumb);
                                                displayThumb = Array.isArray(parsed) ? parsed[0] : parsed;
                                            }
                                        } catch (e) { /* keep as-is */ }

                                        return displayThumb ? (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                <img
                                                    src={displayThumb}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbImage: '' }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-gray-300" />
                                            </div>
                                        );
                                    })()}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={uploading}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                setUploading(true);
                                                console.log('Uploading file:', file.name, file.size, file.type);

                                                try {
                                                    // Manually generate unique filename to avoid "Blob already exists" error
                                                    // const uniqueFilename = `${Date.now()}-${file.name}`;
                                                    const data = new FormData();
                                                    data.append('file', file);
                                                    const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                    const json = await res.json();

                                                    if (!json.url) throw new Error('Upload failed');

                                                    setFormData(prev => ({ ...prev, thumbImage: json.url }));
                                                } catch (err) {
                                                    console.error('Upload error:', err);
                                                    alert('Upload failed: ' + (err as Error).message);
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        {uploading && <p className="text-xs text-purple-600 mt-1">Uploading thumbnail...</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Gallery (Detail Page Slideshow)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((index) => {
                                        let currentImages: string[] = [];
                                        try {
                                            if (formData.images) {
                                                const parsed = JSON.parse(formData.images);
                                                currentImages = Array.isArray(parsed) ? parsed : [];
                                            }
                                        } catch (e) {
                                            // Handle legacy comma-separated string
                                            currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
                                        }

                                        const img = currentImages[index];

                                        return (
                                            <div key={index} className="space-y-2">
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Photo {index + 1}</p>
                                                <input
                                                    type="text"
                                                    placeholder="URL..."
                                                    value={img || ''}
                                                    onChange={(e) => {
                                                        const updated = [...currentImages];
                                                        updated[index] = e.target.value;
                                                        setFormData(prev => ({ ...prev, images: JSON.stringify(updated.filter(Boolean)) }));
                                                    }}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs mb-1"
                                                />
                                                <div className="relative aspect-square border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center p-2 hover:border-purple-200 transition-all bg-gray-50/50 group">
                                                    {img ? (
                                                        <>
                                                            <img
                                                                src={img}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...currentImages];
                                                                    updated.splice(index, 1);
                                                                    setFormData(prev => ({ ...prev, images: JSON.stringify(updated.filter(Boolean)) }));
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Plus className="w-6 h-6 text-gray-300 group-hover:text-purple-400 transition-colors" />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                disabled={uploading}
                                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;

                                                                    setUploading(true);
                                                                    try {
                                                                        // const uniqueFilename = `${Date.now()}-${file.name}`;
                                                                        const data = new FormData();
                                                                        data.append('file', file);
                                                                        const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                                        const json = await res.json();

                                                                        if (!json.url) throw new Error('Upload failed');

                                                                        const updated = [...currentImages];
                                                                        updated[index] = json.url;
                                                                        setFormData(prev => ({ ...prev, images: JSON.stringify(updated.filter(Boolean)) }));
                                                                    } catch (err) {
                                                                        console.error('Upload error:', err);
                                                                        alert('Upload failed: ' + (err as Error).message);
                                                                    } finally {
                                                                        setUploading(false);
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Add Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Product Video (Optional) */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Video (Optional)</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Upload a video to show instead of the product image. The video will autoplay and loop on product cards and detail pages.
                        </p>
                        <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                            <input
                                type="text"
                                placeholder="Enter video URL..."
                                value={formData.videoUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                            />
                            <div className="flex items-center gap-4">
                                {formData.videoUrl ? (
                                    <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-black">
                                        <video
                                            src={formData.videoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            autoPlay
                                            playsInline
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-48 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                                        <div className="text-center">
                                            <svg className="w-8 h-8 mx-auto text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs text-gray-400">No video</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploading(true);
                                            console.log('Uploading video:', file.name, file.size, file.type);

                                            try {
                                                const data = new FormData();
                                                data.append('file', file);
                                                const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                const json = await res.json();

                                                if (!json.url) throw new Error('Upload failed');

                                                setFormData(prev => ({ ...prev, videoUrl: json.url }));
                                            } catch (err) {
                                                console.error('Video upload error:', err);
                                                alert('Video upload failed: ' + (err as Error).message);
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                        disabled={uploading}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    {uploading && <p className="text-sm text-purple-600 mt-2">Uploading video... Please wait.</p>}
                                    <p className="text-xs text-gray-400 mt-2">Supported formats: MP4, WebM. Max size: 50MB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variations */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Product Variations (Colors)</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        variations: [...prev.variations, { color: '', colorCode: '#000000', colorImage: '', image: '' }]
                                    }));
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl transition-colors text-sm font-semibold"
                            >
                                <Plus className="w-4 h-4" />
                                Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.variations.map((variant, index) => (
                                <div key={index} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-4 relative group">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...formData.variations];
                                            updated.splice(index, 1);
                                            setFormData(prev => ({ ...prev, variations: updated }));
                                        }}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Color Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Midnight Black"
                                                    value={variant.color}
                                                    onChange={(e) => {
                                                        const updated = [...formData.variations];
                                                        updated[index].color = e.target.value;
                                                        setFormData(prev => ({ ...prev, variations: updated }));
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Color Hex/Code</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={variant.colorCode}
                                                        onChange={(e) => {
                                                            const updated = [...formData.variations];
                                                            updated[index].colorCode = e.target.value;
                                                            setFormData(prev => ({ ...prev, variations: updated }));
                                                        }}
                                                        className="h-10 w-10 p-1 border border-gray-200 rounded-lg bg-white"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={variant.colorCode}
                                                        onChange={(e) => {
                                                            const updated = [...formData.variations];
                                                            updated[index].colorCode = e.target.value;
                                                            setFormData(prev => ({ ...prev, variations: updated }));
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Variant Thumbnail */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Swatch Image</label>
                                                <input
                                                    type="text"
                                                    placeholder="URL..."
                                                    value={variant.colorImage}
                                                    onChange={(e) => {
                                                        const updated = [...formData.variations];
                                                        updated[index].colorImage = e.target.value;
                                                        setFormData(prev => ({ ...prev, variations: updated }));
                                                    }}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs mb-1"
                                                />
                                                <div className="relative aspect-square border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center p-1 bg-white">
                                                    {variant.colorImage ? (
                                                        <>
                                                            <img src={variant.colorImage} className="w-full h-full object-cover rounded-lg" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...formData.variations];
                                                                    updated[index].colorImage = '';
                                                                    setFormData(prev => ({ ...prev, variations: updated }));
                                                                }}
                                                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-center">
                                                            <Plus className="w-5 h-5 mx-auto text-gray-300" />
                                                            <span className="text-[8px] text-gray-400 font-bold">SWATCH</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={uploading}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            setUploading(true);
                                                            try {
                                                                const data = new FormData();
                                                                data.append('file', file);
                                                                const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                                const json = await res.json();

                                                                if (!json.url) throw new Error('Upload failed');

                                                                const updated = [...formData.variations];
                                                                updated[index].colorImage = json.url;
                                                                setFormData(prev => ({ ...prev, variations: updated }));
                                                            } catch (err) {
                                                                console.error('Upload error:', err);
                                                                alert('Upload failed: ' + (err as Error).message);
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            {/* Variant Main Image */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Variant Image</label>
                                                <input
                                                    type="text"
                                                    placeholder="URL..."
                                                    value={variant.image}
                                                    onChange={(e) => {
                                                        const updated = [...formData.variations];
                                                        updated[index].image = e.target.value;
                                                        setFormData(prev => ({ ...prev, variations: updated }));
                                                    }}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs mb-1"
                                                />
                                                <div className="relative aspect-square border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center p-1 bg-white">
                                                    {variant.image ? (
                                                        <>
                                                            <img src={variant.image} className="w-full h-full object-cover rounded-lg" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...formData.variations];
                                                                    updated[index].image = '';
                                                                    setFormData(prev => ({ ...prev, variations: updated }));
                                                                }}
                                                                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-center">
                                                            <Plus className="w-5 h-5 mx-auto text-gray-300" />
                                                            <span className="text-[8px] text-gray-400 font-bold">MAIN</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={uploading}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            setUploading(true);
                                                            try {
                                                                const data = new FormData();
                                                                data.append('file', file);
                                                                const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                                const json = await res.json();

                                                                if (!json.url) throw new Error('Upload failed');

                                                                const updated = [...formData.variations];
                                                                updated[index].image = json.url;
                                                                setFormData(prev => ({ ...prev, variations: updated }));
                                                            } catch (err) {
                                                                console.error('Upload error:', err);
                                                                alert('Upload failed: ' + (err as Error).message);
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.variations.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <p className="text-sm text-gray-400">No variations added. Use variations for color options.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flags */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Flags</h2>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="new"
                                    checked={formData.new}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700">New Product</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="sale"
                                    checked={formData.sale}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700">On Sale</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="bestSeller"
                                    checked={formData.bestSeller}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700">Best Seller</span>
                            </label>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                        <Link
                            href="/admin/products"
                            className="px-6 py-2 bg-black text-white rounded-xl transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="w-full px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Save Product'
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </AdminLayout >
    );
}
