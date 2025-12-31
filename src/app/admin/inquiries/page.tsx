'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Mail, Trash2, CheckCircle, Clock, Search, Filter } from 'lucide-react';

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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
                        <p className="text-gray-500 mt-1">Manage messages sent from the contact us page</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm font-medium outline-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UNREAD">Unread</option>
                            <option value="READ">Read</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
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
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                                            {inquiry.message}
                                        </div>
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
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${inquiry.status === 'UNREAD' ? 'bg-purple-500' : inquiry.status === 'READ' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                {inquiry.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col items-center gap-2">
                                        {inquiry.status !== 'READ' && (
                                            <button
                                                onClick={() => handleUpdateStatus(inquiry.id, 'READ')}
                                                className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-bold"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="md:hidden">Read</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(inquiry.id)}
                                            className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold"
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
