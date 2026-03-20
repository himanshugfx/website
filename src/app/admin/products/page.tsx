'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Package, GripVertical, CheckSquare, Square, RefreshCw, X, Tag, ChevronRight, ChevronLeft } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand: string;
    thumbImage: string;
    images: string; // JSON string of images array
    new: boolean;
    sale: boolean;
    bestSeller: boolean;
}

// Helper function to get a valid image URL from product
const getProductImage = (product: Product): string => {
    // Try to parse thumbImage first
    let imageUrl = product.thumbImage;

    try {
        // If thumbImage looks like JSON, parse it
        if (imageUrl && (imageUrl.startsWith('[') || imageUrl.startsWith('"'))) {
            const parsed = JSON.parse(imageUrl);
            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch (e) {
        // Keep original if parse fails
    }

    // If thumbImage is empty or invalid, try images field
    if (!imageUrl || imageUrl === '' || imageUrl === '[]') {
        try {
            if (product.images) {
                const images = JSON.parse(product.images);
                imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : '';
            }
        } catch (e) {
            // Keep empty if parse fails
        }
    }

    return imageUrl || '/assets/images/product/1000x1000.webp';
};
export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const SORT_OPTIONS = [
        { value: 'date_desc', label: 'Newest First' },
        { value: 'date_asc', label: 'Oldest First' },
        { value: 'priority_desc', label: 'Priority (High to Low)' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'name_asc', label: 'Name: A-Z' },
        { value: 'name_desc', label: 'Name: Z-A' },
        { value: 'stock_asc', label: 'Stock: Low to High' },
        { value: 'stock_desc', label: 'Stock: High to Low' },
    ];

    useEffect(() => {
        fetchProducts();
    }, [page, search, sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/products?page=${page}&search=${search}&sortBy=${sortBy}`);
            const data = await res.json();
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = async (id: string, field: string, value: any) => {
        try {
            const res = await fetch(`/api/admin/products/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ [field]: value }),
            });

            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
            } else {
                alert('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchProducts();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} products? This action cannot be undone.`)) return;
        
        try {
            setLoading(true);
            for (const id of Array.from(selectedIds)) {
                await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            }
            setSelectedIds(new Set());
            fetchProducts();
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('An error occurred during bulk deletion');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (qty: number) => {
        if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' };
        if (qty < 20) return { label: `${qty} Low Stock`, color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
        return { label: `${qty} in Stock`, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
    };

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Managing <span className="text-purple-600 font-bold">{products.length} active products</span> in your store
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all shadow-sm"
                            />
                        </div>
                        <Link
                            href="/admin/products/add"
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all h-full"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Product</span>
                        </Link>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold">{selectedIds.size} products selected</span>
                            <div className="h-4 w-px bg-white/20" />
                            <button className="text-sm font-semibold hover:text-purple-300 transition-colors flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Bulk Category
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setSelectedIds(new Set())}
                                className="px-4 py-1.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/20"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setSortBy(option.value)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                                    sortBy === option.value 
                                    ? 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchProducts} className="p-2.5 bg-white border border-gray-100 hover:border-purple-200 rounded-xl transition-all shadow-sm">
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
                                <tr>
                                    <th className="pl-6 py-4 w-10">
                                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                                            {selectedIds.size === products.length && products.length > 0 ? (
                                                <CheckSquare className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[300px]">
                                        Product
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        Category
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        Price
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        Stock Status
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        Labels
                                    </th>
                                    <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                        Priority
                                    </th>
                                    <th className="pr-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-10 h-10 text-purple-200 animate-spin" />
                                                <span className="text-gray-400 font-medium">Loading catalog...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Start by adding your first product to the catalog.</p>
                                                </div>
                                                <Link
                                                    href="/admin/products/add"
                                                    className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all font-black text-purple-600 shadow-sm transition-all"
                                                >
                                                    Add Product
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const stock = getStockStatus(product.quantity);
                                        return (
                                            <tr 
                                                key={product.id} 
                                                className={`group hover:bg-purple-50/20 transition-all duration-300 ${selectedIds.has(product.id) ? 'bg-purple-50/50' : ''}`}
                                            >
                                                <td className="pl-6 py-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <button className="p-1 cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 transition-colors">
                                                            <GripVertical className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => toggleSelect(product.id)} className="p-1">
                                                            {selectedIds.has(product.id) ? (
                                                                <CheckSquare className="w-5 h-5 text-purple-600" />
                                                            ) : (
                                                                <Square className="w-5 h-5 text-gray-200 group-hover:text-gray-300" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative group/thumb w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 transition-transform hover:scale-110 duration-300 shadow-sm z-10 hover:shadow-xl hover:ring-4 hover:ring-purple-500/10">
                                                            <img
                                                                src={getProductImage(product)}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <span className="text-sm font-black text-gray-900 line-clamp-1 tracking-tight">
                                                                {product.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                {product.brand}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <span className="inline-flex px-2.5 py-1 text-[10px] font-black rounded-lg bg-gray-100 text-gray-600 uppercase tracking-tight">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <span className="text-base font-black text-purple-600 tracking-tighter">
                                                        ₹{product.price.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black border ${stock.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stock.dot} ${product.quantity === 0 ? 'animate-pulse' : ''}`} />
                                                        {stock.label}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => updateField(product.id, 'bestSeller', !product.bestSeller)}
                                                            className={`px-2 py-1 text-[9px] font-black rounded-md transition-all border tracking-tighter ${
                                                                product.bestSeller 
                                                                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200' 
                                                                : 'bg-amber-50/50 text-amber-600 border-amber-100 hover:border-amber-300'
                                                            }`}
                                                        >
                                                            BEST
                                                        </button>
                                                        <button
                                                            onClick={() => updateField(product.id, 'sale', !product.sale)}
                                                            className={`px-2 py-1 text-[9px] font-black rounded-md transition-all border tracking-tighter ${
                                                                product.sale 
                                                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' 
                                                                : 'bg-red-50/50 text-red-600 border-red-100 hover:border-red-300'
                                                            }`}
                                                        >
                                                            SALE
                                                        </button>
                                                        <button
                                                            onClick={() => updateField(product.id, 'new', !product.new)}
                                                            className={`px-2 py-1 text-[9px] font-black rounded-md transition-all border tracking-tighter ${
                                                                product.new 
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                                                                : 'bg-blue-50/50 text-blue-600 border-blue-100 hover:border-blue-300'
                                                            }`}
                                                        >
                                                            NEW
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center align-middle">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="number"
                                                            value={(product as any).priority || 0}
                                                            onChange={(e) => updateField(product.id, 'priority', parseInt(e.target.value))}
                                                            className="w-12 h-8 text-center text-xs font-bold border border-gray-100 rounded-lg focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                </td>

                                                <td className="pr-6 py-4 text-right align-middle">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-gray-200 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 border border-transparent hover:border-red-700 hover:shadow-lg hover:shadow-red-200"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Previous
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-400">Page</span>
                                <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-black text-purple-600 shadow-sm">{page}</span>
                                <span className="text-sm font-bold text-gray-400">of {totalPages}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
