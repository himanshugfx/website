'use client';

import { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import MediaUploader from '@/components/admin/MediaUploader';

const CATEGORIES = [
    { value: 'COSMETIC', label: 'Cosmetics', fields: ['sizes', 'packing'] },
    { value: 'DENTAL_KIT', label: 'Dental Kit', fields: ['contents', 'packing'] },
    { value: 'SHAVING_KIT', label: 'Shaving Kit', fields: ['contents', 'packing'] },
    { value: 'VANITY_KIT', label: 'Vanity Kit', fields: ['contents', 'packing'] },
    { value: 'SLIPPER', label: 'Slipper', fields: ['material', 'color', 'dimensions'] },
    { value: 'COASTER', label: 'Coaster', fields: ['material', 'color', 'dimensions'] },
    { value: 'LAUNDRY_BAG', label: 'Laundry Bag', fields: ['material', 'color', 'dimensions'] },
    { value: 'GARBAGE_BAG', label: 'Garbage Bag', fields: ['material', 'color', 'dimensions'] },
    { value: 'SHOWER_CAP', label: 'Shower Cap', fields: ['material', 'color'] },
    { value: 'COMB', label: 'Comb', fields: ['material', 'color', 'dimensions'] },
    { value: 'OTHER', label: 'Other', fields: ['material', 'dimensions'] },
];

export default function EditHotelAmenityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'COSMETIC',
        description: '',
        image: '',
        price: '',
        minOrderQty: '100',
        sizes: '',
        packing: '',
        contents: '',
        material: '',
        dimensions: '',
        color: '',
        isActive: true,
        priority: '0',
    });
    const [sizeInputs, setSizeInputs] = useState<string[]>(['']);
    const [contentInputs, setContentInputs] = useState<string[]>(['']);

    const selectedCategory = CATEGORIES.find(c => c.value === formData.category);
    const categoryFields = selectedCategory?.fields || [];

    useEffect(() => {
        fetchAmenity();
    }, [id]);

    const fetchAmenity = async () => {
        try {
            const res = await fetch(`/api/admin/hotel-catalogue/${id}`);
            if (!res.ok) {
                throw new Error('Amenity not found');
            }
            const data = await res.json();

            setFormData({
                name: data.name || '',
                category: data.category || 'COSMETIC',
                description: data.description || '',
                image: data.image || '',
                price: data.price?.toString() || '',
                minOrderQty: data.minOrderQty?.toString() || '100',
                sizes: data.sizes || '',
                packing: data.packing || '',
                contents: data.contents || '',
                material: data.material || '',
                dimensions: data.dimensions || '',
                color: data.color || '',
                isActive: data.isActive !== false,
                priority: data.priority?.toString() || '0',
            });

            // Parse sizes array
            if (data.sizes) {
                try {
                    const parsed = JSON.parse(data.sizes);
                    setSizeInputs(Array.isArray(parsed) ? parsed : [parsed]);
                } catch {
                    setSizeInputs([data.sizes]);
                }
            }

            // Parse contents array
            if (data.contents) {
                try {
                    const parsed = JSON.parse(data.contents);
                    setContentInputs(Array.isArray(parsed) ? parsed : [parsed]);
                } catch {
                    setContentInputs([data.contents]);
                }
            }
        } catch (error) {
            console.error('Error fetching amenity:', error);
            alert('Failed to load amenity');
            router.push('/admin/hotel-catalogue');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                sizes: sizeInputs.filter(Boolean).length > 0 ? JSON.stringify(sizeInputs.filter(Boolean)) : null,
                contents: contentInputs.filter(Boolean).length > 0 ? JSON.stringify(contentInputs.filter(Boolean)) : null,
            };

            const res = await fetch(`/api/admin/hotel-catalogue/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/admin/hotel-catalogue');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update amenity');
            }
        } catch (error) {
            console.error('Error updating amenity:', error);
            alert('Failed to update amenity');
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

    const addSizeInput = () => setSizeInputs([...sizeInputs, '']);
    const removeSizeInput = (index: number) => setSizeInputs(sizeInputs.filter((_, i) => i !== index));
    const updateSizeInput = (index: number, value: string) => {
        const updated = [...sizeInputs];
        updated[index] = value;
        setSizeInputs(updated);
    };

    const addContentInput = () => setContentInputs([...contentInputs, '']);
    const removeContentInput = (index: number) => setContentInputs(contentInputs.filter((_, i) => i !== index));
    const updateContentInput = (index: number, value: string) => {
        const updated = [...contentInputs];
        updated[index] = value;
        setContentInputs(updated);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <p className="text-gray-500 mt-3">Loading amenity...</p>
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
                        href="/admin/hotel-catalogue"
                        className="p-2 bg-black text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-purple-600" />
                            Edit Amenity
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Update hotel amenity details
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
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
                                    placeholder="e.g., Luxury Shampoo"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority (Higher = First)
                                </label>
                                <input
                                    type="number"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe the product features, benefits, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Image</h2>
                        <MediaUploader
                            label="Upload Product Image *"
                            value={formData.image}
                            onChange={(id) => setFormData(prev => ({ ...prev, image: id }))}
                            type="image"
                        />
                    </div>

                    {/* Pricing */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price per Unit (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    placeholder="e.g., 10.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Order Quantity
                                </label>
                                <input
                                    type="number"
                                    name="minOrderQty"
                                    value={formData.minOrderQty}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category-specific Fields */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sizes - for cosmetics */}
                            {categoryFields.includes('sizes') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Available Sizes
                                    </label>
                                    <div className="space-y-2">
                                        {sizeInputs.map((size, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={size}
                                                    onChange={(e) => updateSizeInput(index, e.target.value)}
                                                    placeholder="e.g., 30ml, 50ml, 100ml"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                                {sizeInputs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSizeInput(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addSizeInput}
                                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Size
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Packing */}
                            {categoryFields.includes('packing') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Packing
                                    </label>
                                    <input
                                        type="text"
                                        name="packing"
                                        value={formData.packing}
                                        onChange={handleChange}
                                        placeholder="e.g., Box of 100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Contents - for kits */}
                            {categoryFields.includes('contents') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kit Contents
                                    </label>
                                    <div className="space-y-2">
                                        {contentInputs.map((content, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={content}
                                                    onChange={(e) => updateContentInput(index, e.target.value)}
                                                    placeholder="e.g., Toothbrush, Toothpaste (10g)"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                                {contentInputs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeContentInput(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addContentInput}
                                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Material */}
                            {categoryFields.includes('material') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Material
                                    </label>
                                    <input
                                        type="text"
                                        name="material"
                                        value={formData.material}
                                        onChange={handleChange}
                                        placeholder="e.g., Non-woven fabric"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Color */}
                            {categoryFields.includes('color') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available Colors
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="e.g., White, Brown, Grey"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Dimensions */}
                            {categoryFields.includes('dimensions') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dimensions / Sizes
                                    </label>
                                    <input
                                        type="text"
                                        name="dimensions"
                                        value={formData.dimensions}
                                        onChange={handleChange}
                                        placeholder="e.g., Small, Medium, Large or 40x30cm"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Active (visible in catalogue)</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <Link
                            href="/admin/hotel-catalogue"
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
