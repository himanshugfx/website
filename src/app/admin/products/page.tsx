'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';

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

    return imageUrl || '/assets/images/product/1000x1000.png';
};
export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = { error: 'Unknown server error' };
            }

            if (res.ok) {
                fetchProducts();
            } else {
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="mt-2 text-gray-500">
                            Manage your product catalog
                        </p>
                    </div>
                    <Link
                        href="/admin/products/add"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by name, category, or brand..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all outline-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    Sort: {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Labels
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">

                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-500">Loading products...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">

                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-purple-500" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No products found</p>
                                                <Link
                                                    href="/admin/products/add"
                                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                                >
                                                    Add your first product →
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={getProductImage(product)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{product.brand}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${product.quantity > 10 ? 'bg-emerald-100 text-emerald-700' :
                                                    product.quantity > 0 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {product.quantity} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={(product as any).priority || 0}
                                                    onChange={(e) => updateField(product.id, 'priority', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateField(product.id, 'bestSeller', !product.bestSeller)}
                                                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all border ${product.bestSeller ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                        title="Toggle Best Seller"
                                                    >
                                                        BEST
                                                    </button>
                                                    <button
                                                        onClick={() => updateField(product.id, 'sale', !product.sale)}
                                                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all border ${product.sale ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                        title="Toggle On Sale"
                                                    >
                                                        SALE
                                                    </button>
                                                    <button
                                                        onClick={() => updateField(product.id, 'new', !product.new)}
                                                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all border ${product.new ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                        title="Toggle New Arrival"
                                                    >
                                                        NEW
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="p-2 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-800"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-800"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
