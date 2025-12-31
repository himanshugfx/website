'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        new: false,
        sale: false,
        rate: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                alert('Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Auto-generate slug from name
            if (name === 'name') {
                const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setFormData(prev => ({ ...prev, slug }));
            }
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Create a new product for your store
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
                        <div className="space-y-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail Image *
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        {formData.thumbImage && (
                                            <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                                <img
                                                    src={formData.thumbImage}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, thumbImage: '' }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    const data = new FormData();
                                                    data.append('file', file);

                                                    try {
                                                        const res = await fetch('/api/admin/upload', {
                                                            method: 'POST',
                                                            body: data
                                                        });
                                                        const json = await res.json();
                                                        if (json.url) {
                                                            setFormData(prev => ({ ...prev, thumbImage: json.url }));
                                                        }
                                                    } catch (err) {
                                                        console.error('Upload failed', err);
                                                        alert('Upload failed');
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Supported: JPG, PNG, WEBP</p>
                                        </div>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="thumbImage"
                                        value={formData.thumbImage}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Images
                                </label>
                                <div className="space-y-4">
                                    {formData.images && (
                                        <div className="flex flex-wrap gap-4">
                                            {formData.images.split(',').filter(Boolean).map((img, index) => (
                                                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                                                    <img
                                                        src={img}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentImages = formData.images.split(',').filter(Boolean);
                                                            const newImages = currentImages.filter(i => i !== img).join(',');
                                                            setFormData(prev => ({ ...prev, images: newImages }));
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const files = e.target.files;
                                                    if (!files || files.length === 0) return;

                                                    for (let i = 0; i < files.length; i++) {
                                                        const data = new FormData();
                                                        data.append('file', files[i]);

                                                        try {
                                                            const res = await fetch('/api/admin/upload', {
                                                                method: 'POST',
                                                                body: data
                                                            });
                                                            const json = await res.json();
                                                            if (json.url) {
                                                                setFormData(prev => {
                                                                    const current = prev.images ? prev.images.split(',').filter(Boolean) : [];
                                                                    return {
                                                                        ...prev,
                                                                        images: [...current, json.url].join(',')
                                                                    };
                                                                });
                                                            }
                                                        } catch (err) {
                                                            console.error('Upload failed', err);
                                                        }
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <Link
                            href="/admin/products"
                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
