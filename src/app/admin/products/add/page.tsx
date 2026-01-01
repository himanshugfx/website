'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Package, Trash2 } from 'lucide-react';
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
        bestSeller: false,
        rate: 0,
        variations: [] as { color: string, colorCode: string, colorImage: string, image: string }[],
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Main Thumbnail (Search & List View) *
                                </label>
                                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-purple-300 transition-colors bg-gray-50/50">
                                    {formData.thumbImage ? (
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                            <img
                                                src={formData.thumbImage}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, thumbImage: '' }))}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
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
                                                    const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                    const json = await res.json();
                                                    if (json.url) setFormData(prev => ({ ...prev, thumbImage: json.url }));
                                                } catch (err) {
                                                    alert('Upload failed');
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                                        />
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
                                        const currentImages = formData.images ? JSON.parse(formData.images) : [];
                                        const img = currentImages[index];

                                        return (
                                            <div key={index} className="space-y-2">
                                                <p className="text-xs font-medium text-gray-500">Photo {index + 1}</p>
                                                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-2 hover:border-purple-300 transition-all bg-gray-50/50 group">
                                                    {img ? (
                                                        <>
                                                            <img
                                                                src={img}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...currentImages];
                                                                    updated.splice(index, 1);
                                                                    setFormData(prev => ({ ...prev, images: JSON.stringify(updated) }));
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Plus className="w-6 h-6 text-gray-400" />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const data = new FormData();
                                                                    data.append('file', file);
                                                                    try {
                                                                        const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                                        const json = await res.json();
                                                                        if (json.url) {
                                                                            const updated = [...currentImages];
                                                                            updated[index] = json.url;
                                                                            setFormData(prev => ({ ...prev, images: JSON.stringify(updated.filter(Boolean)) }));
                                                                        }
                                                                    } catch (err) {
                                                                        alert('Upload failed');
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-[10px] text-gray-400 font-medium">Add Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.bestSeller}
                                            onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Best Seller</span>
                                    </label>
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
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-semibold"
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
                                                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-1 bg-white">
                                                    {variant.colorImage ? (
                                                        <img src={variant.colorImage} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Plus className="w-5 h-5 mx-auto text-gray-300" />
                                                            <span className="text-[8px] text-gray-400 font-bold">SWATCH</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const data = new FormData();
                                                            data.append('file', file);
                                                            const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                            const json = await res.json();
                                                            if (json.url) {
                                                                const updated = [...formData.variations];
                                                                updated[index].colorImage = json.url;
                                                                setFormData(prev => ({ ...prev, variations: updated }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            {/* Variant Main Image */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Variant Image</label>
                                                <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-1 bg-white">
                                                    {variant.image ? (
                                                        <img src={variant.image} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Plus className="w-5 h-5 mx-auto text-gray-300" />
                                                            <span className="text-[8px] text-gray-400 font-bold">MAIN</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const data = new FormData();
                                                            data.append('file', file);
                                                            const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
                                                            const json = await res.json();
                                                            if (json.url) {
                                                                const updated = [...formData.variations];
                                                                updated[index].image = json.url;
                                                                setFormData(prev => ({ ...prev, variations: updated }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
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
