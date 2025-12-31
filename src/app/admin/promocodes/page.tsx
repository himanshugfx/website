'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Search,
    TicketPercent,
    Calendar,
    MoreVertical,
    CheckCircle,
    XCircle,
    Copy,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PromoCode {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        expiresAt: '',
    });

    const router = useRouter();

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch('/api/admin/promocodes');
            if (res.ok) {
                const data = await res.json();
                setPromoCodes(data);
            }
        } catch (error) {
            console.error('Failed to fetch promo codes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/admin/promocodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Convert everything to string/number as backend expects
                    ...formData,
                    // If backend expects numbers or nulls, make sure to handle empty strings
                    discountValue: formData.discountValue,
                    minOrderValue: formData.minOrderValue || null,
                    maxDiscount: formData.maxDiscount || null,
                    usageLimit: formData.usageLimit || null,
                    expiresAt: formData.expiresAt || null,
                }),
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                setFormData({
                    code: '',
                    discountType: 'PERCENTAGE',
                    discountValue: '',
                    minOrderValue: '',
                    maxDiscount: '',
                    usageLimit: '',
                    expiresAt: '',
                });
                fetchPromoCodes();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;
        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPromoCodes(prev => prev.filter(p => p.id !== id));
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const filteredCodes = promoCodes.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <TicketPercent className="w-8 h-8 text-purple-600" />
                            Promo Codes
                        </h1>
                        <p className="mt-2 text-gray-500">Manage discount codes and coupons</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-purple-500/25 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Promo Code
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Active Codes</p>
                                <h3 className="text-2xl font-bold mt-1 text-zinc-900">{promoCodes.filter(p => p.isActive).length}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Usage</p>
                                <h3 className="text-2xl font-bold mt-1 text-zinc-900">
                                    {promoCodes.reduce((acc, curr) => acc + curr.usedCount, 0)}
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                                <TicketPercent className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Expired/Inactive</p>
                                <h3 className="text-2xl font-bold mt-1 text-zinc-900">{promoCodes.filter(p => !p.isActive).length}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Usage</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Limits</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            No promo codes found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCodes.map((code) => (
                                        <tr key={code.id} className="hover:bg-zinc-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">{code.code}</span>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(code.code)}
                                                        className="text-zinc-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Copy Code"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {code.expiresAt && <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Expires: {new Date(code.expiresAt).toLocaleDateString()}
                                                </div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-zinc-900">
                                                    {code.discountType === 'PERCENTAGE' ? `${code.discountValue}%` : `$${code.discountValue}`} OFF
                                                </div>
                                                {code.maxDiscount && (
                                                    <div className="text-xs text-zinc-500">Max disc. ${code.maxDiscount}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                <span className="font-semibold">{code.usedCount}</span>
                                                {code.usageLimit && <span className="text-zinc-400"> / {code.usageLimit}</span>} uses
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600">
                                                {code.minOrderValue ? `Min. Order: $${code.minOrderValue}` : 'No min. order'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(code.id, code.isActive)}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${code.isActive
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                                                        }`}
                                                >
                                                    {code.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(code.id)}
                                                    className="text-zinc-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Floating Action Button */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg shadow-purple-500/50 hover:bg-gray-900 transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
                    title="Create New Promo Code"
                >
                    <Plus className="w-6 h-6" />
                </button>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-zinc-900">Create New Promo Code</h2>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-red-500">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

                                {/* Code Input */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Promo Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 uppercase font-mono placeholder:normal-case focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                                            placeholder="e.g. SAVE20"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="text-sm px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Discount Type</label>
                                        <select
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Value</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 50'}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Min. Order Value ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.minOrderValue}
                                            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Max Discount ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            placeholder="Optional"
                                            disabled={formData.discountType === 'FIXED'}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Expires At</label>
                                        <input
                                            type="date"
                                            value={formData.expiresAt}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-zinc-700 font-medium hover:bg-zinc-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Create Code
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
