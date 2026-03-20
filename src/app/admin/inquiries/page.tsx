'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Mail, Trash2, CheckCircle, Clock, Search, Filter, RefreshCw } from 'lucide-react';

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/inquiries');
            const data = await res.json();
            setInquiries(data);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/admin/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                fetchInquiries();
            }
        } catch (error) {
            console.error('Error updating inquiry:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            const res = await fetch(`/api/admin/inquiries?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchInquiries();
            }
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inquiry.phone && inquiry.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
            inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inquiry.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalInquiries = inquiries.length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary flex items-center gap-3">
                                <Mail className="w-10 h-10 text-purple-600" />
                                Unified Inquiries
                            </h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {totalInquiries} Pending Requests
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Managing <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">customer communication</span> and business support tickets
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <button 
                            onClick={fetchInquiries}
                            className="p-4 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl transition-all shadow-sm group"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-900 group-hover:text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="relative group min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-2xl shadow-sm">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-6 py-2.5 bg-transparent border-none text-[10px] font-black focus:ring-0 cursor-pointer outline-none"
                            >
                                <option value="ALL">All Status</option>
                                <option value="UNREAD">Unread</option>
                                <option value="READ">Read</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Inquiries 🏆</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{inquiries.length.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Unread Messages 📩</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{inquiries.filter(i => i.status === 'UNREAD').length.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Hospitality Deals 🏨</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{inquiries.filter(i => i.message?.startsWith('[metadata]:')).length.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">General Queries 👤</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{inquiries.filter(i => !i.message?.startsWith('[metadata]:')).length.toString().padStart(2, '0')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading inquiries...</p>
                        </div>
                    ) : filteredInquiries.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No inquiries found</h3>
                            <p className="text-gray-500">When users contact you, their messages will appear here.</p>
                        </div>
                    ) : (
                        filteredInquiries.map((inquiry) => (
                            <div key={inquiry.id} className={`bg-white rounded-2xl border ${inquiry.status === 'UNREAD' ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'} p-6 transition-all hover:shadow-md relative group`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${inquiry.status === 'UNREAD' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {inquiry.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{inquiry.name}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <p className="text-sm text-gray-500">{inquiry.email}</p>
                                                    {inquiry.phone && (
                                                        <>
                                                            <span className="text-gray-300 hidden sm:inline">•</span>
                                                            <p className="text-sm text-gray-500">{inquiry.phone}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {inquiry.status === 'UNREAD' && (
                                                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>
                                            )}
                                            {inquiry.message?.startsWith('[metadata]:') ? (
                                                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Hospitality</span>
                                            ) : (
                                                <span className="bg-zinc-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">General</span>
                                            )}
                                        </div>

                                        {(() => {
                                            if (inquiry.message?.startsWith('[metadata]:')) {
                                                try {
                                                    const meta = JSON.parse(inquiry.message.replace('[metadata]:', ''));
                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                                                                    <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Hotel/Company</div>
                                                                    <div className="text-sm font-bold text-blue-900">{meta.hotelName}</div>
                                                                </div>
                                                                <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl">
                                                                    <div className="text-[10px] font-bold text-purple-600 uppercase mb-1">Quantity Estimate</div>
                                                                    <div className="text-sm font-bold text-purple-900">{meta.quantity}</div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Additional Message</div>
                                                                {meta.originalMessage}
                                                            </div>
                                                        </div>
                                                    );
                                                } catch (e) {
                                                    return (
                                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed shadow-inner italic">
                                                            {inquiry.message} (Metadata parsing failed)
                                                        </div>
                                                    );
                                                }
                                            }
                                            return (
                                                <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed border border-gray-100 shadow-sm">
                                                    {inquiry.message}
                                                </div>
                                            );
                                        })()}

                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium pt-2">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(inquiry.createdAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1 uppercase tracking-tighter">
                                                <div className={`w-1.5 h-1.5 rounded-full ${inquiry.status === 'UNREAD' ? 'bg-purple-500' : inquiry.status === 'READ' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                {inquiry.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col items-center gap-2">
                                        {inquiry.status !== 'READ' && (
                                            <button
                                                onClick={() => handleUpdateStatus(inquiry.id, 'READ')}
                                                className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="md:hidden">Read</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(inquiry.id)}
                                            className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold"
                                            title="Delete Inquiry"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="md:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
