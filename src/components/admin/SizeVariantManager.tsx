'use client';

import { useState } from 'react';
import { Plus, Trash2, Tag, Layers, Sparkles } from 'lucide-react';
import { SizeOption } from '@/lib/productSizes';

interface SizeVariantManagerProps {
    variants: SizeOption[];
    onChange: (variants: SizeOption[]) => void;
    defaultPrice?: number;
    defaultOriginPrice?: number;
}

export default function SizeVariantManager({
    variants,
    onChange,
    defaultPrice = 0,
    defaultOriginPrice = 0,
}: SizeVariantManagerProps) {
    const [quickText, setQuickText] = useState('');
    const [showQuickImport, setShowQuickImport] = useState(false);

    const handleAddVariant = () => {
        const fallbackPrice = defaultPrice > 0 ? defaultPrice : 0;
        const fallbackOrigin = defaultOriginPrice > 0 ? defaultOriginPrice : fallbackPrice;
        onChange([
            ...variants,
            {
                size: '',
                price: fallbackPrice,
                originPrice: fallbackOrigin,
            },
        ]);
    };

    const handleUpdateVariant = (index: number, field: keyof SizeOption, value: any) => {
        const updated = variants.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    [field]: field === 'price' || field === 'originPrice'
                        ? (value === '' ? '' : parseFloat(value) || 0)
                        : value,
                };
            }
            return item;
        });
        onChange(updated as SizeOption[]);
    };

    const handleRemoveVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    const handleQuickImport = () => {
        if (!quickText.trim()) return;
        const parts = quickText.split(',').map(s => s.trim()).filter(Boolean);
        const fallbackPrice = defaultPrice > 0 ? defaultPrice : 0;
        const fallbackOrigin = defaultOriginPrice > 0 ? defaultOriginPrice : fallbackPrice;

        const newItems: SizeOption[] = parts.map(part => {
            if (part.includes(':')) {
                const [size, p, op] = part.split(':').map(x => x.trim());
                return {
                    size,
                    price: parseFloat(p) || fallbackPrice,
                    originPrice: op ? parseFloat(op) : (parseFloat(p) || fallbackOrigin),
                };
            }
            return {
                size: part,
                price: fallbackPrice,
                originPrice: fallbackOrigin,
            };
        });

        // Merge without duplicate size names
        const existingSizes = new Set(variants.map(v => v.size.toLowerCase().trim()));
        const uniqueNew = newItems.filter(v => !existingSizes.has(v.size.toLowerCase().trim()));

        onChange([...variants, ...uniqueNew]);
        setQuickText('');
        setShowQuickImport(false);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Size Variants & Pricing
                        </h3>
                        <p className="text-xs text-gray-500">
                            Set different selling prices and MRP for each product size (e.g., 50ml @ ₹99 vs 100ml @ ₹149)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowQuickImport(!showQuickImport)}
                        className="text-xs font-semibold text-gray-600 hover:text-purple-700 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-purple-50/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>{showQuickImport ? 'Close Quick Add' : 'Quick Add (Comma-separated)'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Size</span>
                    </button>
                </div>
            </div>

            {/* Quick Add Tray */}
            {showQuickImport && (
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-sm space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                        Paste comma-separated sizes (e.g. 50ml, 100ml or 50ml:99:149, 100ml:149:199):
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={quickText}
                            onChange={(e) => setQuickText(e.target.value)}
                            placeholder="50ml, 100ml, 200ml"
                            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleQuickImport();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleQuickImport}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
                        >
                            Import
                        </button>
                    </div>
                </div>
            )}

            {/* Variant Rows Table */}
            {variants.length > 0 ? (
                <div className="space-y-2.5">
                    <div className="hidden sm:grid grid-cols-12 gap-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-4">Size Name / Volume</div>
                        <div className="col-span-3">Selling Price (₹)</div>
                        <div className="col-span-3">Original / MRP (₹)</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    <div className="space-y-2">
                        {variants.map((v, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-2 bg-white rounded-xl border border-gray-200 items-center shadow-xs"
                            >
                                <div className="sm:col-span-4">
                                    <label className="sm:hidden block text-[11px] font-bold text-gray-500 mb-1">Size / Volume</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 50ml, 100ml, 200ml"
                                        value={v.size}
                                        onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                                        required
                                        className="w-full px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="sm:hidden block text-[11px] font-bold text-gray-500 mb-1">Selling Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="99"
                                            value={v.price === 0 && defaultPrice > 0 ? '' : v.price}
                                            onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)}
                                            required
                                            className="w-full pl-6 pr-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="sm:hidden block text-[11px] font-bold text-gray-500 mb-1">Original Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder={String(defaultOriginPrice || defaultPrice || '')}
                                            value={v.originPrice ?? ''}
                                            onChange={(e) => handleUpdateVariant(index, 'originPrice', e.target.value)}
                                            className="w-full pl-6 pr-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2 flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remove Size"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 px-4 bg-white rounded-xl border border-dashed border-gray-300">
                    <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">No size variants added yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        If this product has multiple sizes (e.g., 50ml, 100ml), add them here to give each its own price.
                    </p>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="mt-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Size Variant</span>
                    </button>
                </div>
            )}
        </div>
    );
}
