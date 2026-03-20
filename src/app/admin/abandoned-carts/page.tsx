'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { ChevronRight, ShoppingCart, RefreshCw, MessageCircle, Mail, MapPin, Trash2, Search, ArrowUpDown, Filter, CheckSquare, Square, Inbox, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface CartItem {
    id: string;
    name: string;
    image?: string;
    quantity: number;
    price: number;
}

interface AbandonedCheckout {
    id: string;
    userId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    cartItems: CartItem[];
    shippingInfo: any;
    total: number | null;
    city: string | null;
    country: string | null;
    source: string | null;
    status: string;
    createdAt: string;
}

export default function AbandonedCartsPage() {
    const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recovering, setRecovering] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterHasEmail, setFilterHasEmail] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'value'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchCheckouts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/abandoned-checkouts?page=${page}`);
            const data = await res.json();
            if (data.success) {
                setCheckouts(data.checkouts || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching abandoned carts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckouts();
    }, [page]);

    const handleRecover = async (checkoutId: string, type: 'whatsapp' | 'email') => {
        const checkout = checkouts.find(c => c.id === checkoutId);
        if (!checkout) return;

        try {
            setRecovering(checkoutId);

            // Use the updated recovery endpoint
            const res = await fetch('/api/admin/abandoned-carts/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkoutId: checkoutId,
                    type,
                    total: checkout.total
                }),
            });

            if (res.ok) {
                alert(`Recovery ${type} sent successfully!`);
            } else {
                const data = await res.json();
                alert(data.error || `Failed to send recovery ${type}`);
            }
        } catch (error) {
            console.error('Error recovering cart:', error);
            alert('An error occurred while trying to recover the cart.');
        } finally {
            setRecovering(null);
        }
    };

    const handleMarkRecovered = async (checkoutId: string) => {
        try {
            const res = await fetch(`/api/admin/abandoned-checkouts?id=${checkoutId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCheckouts(prev => prev.filter(c => c.id !== checkoutId));
            }
        } catch (error) {
            console.error('Error marking as recovered:', error);
        }
    };

    const getDisplayName = (checkout: AbandonedCheckout): string => {
        if (checkout.customerName) return checkout.customerName;
        if (checkout.shippingInfo?.firstName) {
            return `${checkout.shippingInfo.firstName} ${checkout.shippingInfo.lastName || ''}`.trim();
        }
        return 'Guest';
    };

    const getDisplayEmail = (checkout: AbandonedCheckout): string => {
        return checkout.customerEmail || checkout.shippingInfo?.email || 'No email';
    };

    const getDisplayPhone = (checkout: AbandonedCheckout): string => {
        return checkout.customerPhone || checkout.shippingInfo?.phone || '';
    };

    const getLocation = (checkout: AbandonedCheckout): string => {
        const parts: string[] = [];
        if (checkout.city) parts.push(checkout.city);
        if (checkout.country) parts.push(checkout.country);
        return parts.length > 0 ? parts.join(', ') : 'Unknown';
    };

    const getSourceBadge = (source: string | null) => {
        if (source === 'CHECKOUT') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                    Checkout
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                Cart
            </span>
        );
    };

    const handleSort = (key: 'date' | 'value') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('desc');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === checkouts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(checkouts.map(c => c.id)));
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
        if (!confirm(`Are you sure you want to archive ${selectedIds.size} carts?`)) return;
        
        try {
            setLoading(true);
            for (const id of Array.from(selectedIds)) {
                await fetch(`/api/admin/abandoned-checkouts?id=${id}`, { method: 'DELETE' });
            }
            setCheckouts(prev => prev.filter(c => !selectedIds.has(c.id)));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedCheckouts = checkouts
        .filter(c => {
            if (filterHasEmail && !getDisplayEmail(c).includes('@')) return false;
            if (searchQuery) {
                const search = searchQuery.toLowerCase();
                return (
                    getDisplayName(c).toLowerCase().includes(search) ||
                    getDisplayEmail(c).toLowerCase().includes(search) ||
                    (c.city?.toLowerCase().includes(search))
                );
            }
            return true;
        })
        .sort((a, b) => {
            const factor = sortOrder === 'asc' ? 1 : -1;
            if (sortBy === 'value') {
                return ((a.total || 0) - (b.total || 0)) * factor;
            }
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
        });

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary">Abandoned Carts</h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {checkouts.length} Potential Saves
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Target the <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">missed opportunities</span> and recover pending checkouts
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setFilterHasEmail(!filterHasEmail)}
                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-black transition-all border ${
                                filterHasEmail 
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-200' 
                                : 'bg-white text-gray-900 border-gray-100 hover:border-purple-300'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>{filterHasEmail ? 'Identified Only' : 'Show All'}</span>
                        </button>
                        <button 
                            onClick={fetchCheckouts} 
                            className="p-4 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl transition-all shadow-sm group"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-900 group-hover:text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center justify-between bg-purple-900 text-white px-6 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold">{selectedIds.size} items selected</span>
                            <div className="h-4 w-px bg-white/20" />
                            <button className="text-sm font-semibold hover:text-purple-200 transition-colors flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Bulk Recovery
                            </button>
                        </div>
                        <button 
                            onClick={handleBulkDelete}
                            className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                        >
                            Archive Selected
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                                <tr>
                                    <th className="pl-6 py-5 w-10">
                                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                                            {selectedIds.size === checkouts.length && checkouts.length > 0 ? (
                                                <CheckSquare className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-300" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                    <th 
                                        className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest cursor-pointer group"
                                        onClick={() => handleSort('value')}
                                    >
                                        <div className="flex items-center gap-1 group-hover:text-purple-600 transition-colors">
                                            Cart Value
                                            <ArrowUpDown className={`w-3 h-3 ${sortBy === 'value' ? 'text-purple-600' : 'text-gray-300'}`} />
                                        </div>
                                    </th>
                                    <th className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Abandoned Items</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Stage</th>
                                    <th 
                                        className="px-4 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest cursor-pointer group"
                                        onClick={() => handleSort('date')}
                                    >
                                        <div className="flex items-center gap-1 group-hover:text-purple-600 transition-colors">
                                            Date
                                            <ArrowUpDown className={`w-3 h-3 ${sortBy === 'date' ? 'text-purple-600' : 'text-gray-300'}`} />
                                        </div>
                                    </th>
                                    <th className="pr-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && checkouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-10 h-10 text-purple-200 animate-spin" />
                                                <span className="text-gray-400 font-medium">Loading your leads...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAndSortedCheckouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Inbox className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">No carts found</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query to find identifying users.</p>
                                                </div>
                                                <button 
                                                    onClick={() => {setSearchQuery(''); setFilterHasEmail(false);}}
                                                    className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedCheckouts.map((checkout) => {
                                        const isGuest = getDisplayName(checkout) === 'Guest';
                                        const phone = getDisplayPhone(checkout);
                                        const email = getDisplayEmail(checkout);
                                        const hasEmail = email.includes('@');
                                        
                                        return (
                                            <tr 
                                                key={checkout.id} 
                                                className={`group hover:bg-purple-50/30 transition-all duration-300 ${selectedIds.has(checkout.id) ? 'bg-purple-50/50' : ''}`}
                                            >
                                                <td className="pl-6 py-6">
                                                    <button onClick={() => toggleSelect(checkout.id)} className="p-1">
                                                        {selectedIds.has(checkout.id) ? (
                                                            <CheckSquare className="w-5 h-5 text-purple-600" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-gray-200 group-hover:text-gray-300" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`text-sm tracking-tight ${isGuest ? 'text-gray-400 font-mediumitalic' : 'text-gray-900 font-black'}`}>
                                                            {getDisplayName(checkout)}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 truncate max-w-[180px]">
                                                            {hasEmail ? <Mail className="w-2.5 h-2.5" /> : null}
                                                            {email}
                                                        </div>
                                                        {phone && (
                                                            <div className="text-[10px] text-gray-300 font-medium">
                                                                {phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                                                        <MapPin className="w-3 h-3 text-red-400" />
                                                        {getLocation(checkout)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <span className="text-base font-black text-gray-900">
                                                        {checkout.total ? `₹${checkout.total.toLocaleString()}` : '₹0'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex -space-x-3 overflow-hidden">
                                                            {checkout.cartItems?.slice(0, 3).map((item, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className="relative w-10 h-10 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden ring-1 ring-gray-100"
                                                                    title={item.name}
                                                                >
                                                                    {item.image ? (
                                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                                            <ShoppingCart className="w-4 h-4 text-gray-200" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {checkout.cartItems?.length > 3 && (
                                                                <div className="relative w-10 h-10 rounded-xl bg-purple-100 border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-purple-600 ring-1 ring-gray-100">
                                                                    +{checkout.cartItems.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            {checkout.cartItems?.slice(0, 1).map((item, idx) => (
                                                                <span key={idx} className="text-xs font-bold text-gray-600 line-clamp-1">
                                                                    {item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span>
                                                                </span>
                                                            ))}
                                                            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">
                                                                {checkout.cartItems?.length || 0} Products Lost
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    {getSourceBadge(checkout.source)}
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-bold text-gray-700">
                                                            {new Date(checkout.createdAt).toLocaleDateString('en-GB')}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {new Date(checkout.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="pr-6 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {phone && (
                                                            <a
                                                                href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi ${getDisplayName(checkout)}, we noticed you left some items in your cart at Anose Beauty. Would you like to complete your order?`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 font-bold text-[10px]"
                                                            >
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                WhatsApp
                                                            </a>
                                                        )}
                                                        {hasEmail && (
                                                            <button
                                                                onClick={() => handleRecover(checkout.id, 'email')}
                                                                disabled={recovering === checkout.id}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold text-[10px] disabled:opacity-50"
                                                            >
                                                                {recovering === checkout.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                                                                Email
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleMarkRecovered(checkout.id)}
                                                            className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                                            title="Archive Cart"
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
