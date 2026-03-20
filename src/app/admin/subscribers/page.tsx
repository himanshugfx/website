'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Download, Plus, Search, Trash2, User, Mail, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    subscribedAt: string;
}

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await fetch('/api/admin/subscribers');
            const data = await res.json();
            if (data.success) {
                setSubscribers(data.subscribers);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            const res = await fetch('/api/admin/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail }),
            });

            const data = await res.json();

            if (data.success) {
                setSubscribers(prev => [data.subscriber, ...prev]);
                setNewEmail('');
                setShowAddModal(false);
            } else {
                alert(data.error || 'Failed to add subscriber');
            }
        } catch (error) {
            console.error('Error adding subscriber:', error);
            alert('Failed to connect to server');
        } finally {
            setAdding(false);
        }
    };

    const handleExport = () => {
        const dataToExport = subscribers.map(s => ({
            Email: s.email,
            Status: s.isActive ? 'Active' : 'Inactive',
            'Subscribed Date': new Date(s.subscribedAt).toLocaleDateString('en-GB'),
            'Subscribed Time': new Date(s.subscribedAt).toLocaleTimeString('en-GB'),
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Subscribers");
        XLSX.writeFile(wb, `subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary flex items-center gap-3">
                                <Mail className="w-10 h-10 text-purple-600" />
                                Newsletter Hub
                            </h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {subscribers.length} Audience Members
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Managing your <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">broadcast reach</span> and subscriber engagement
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-white border border-gray-100 rounded-2xl font-black shadow-sm hover:border-gray-200 transition-all text-sm tracking-tight text-gray-900"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export CSV</span>
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all text-sm tracking-tight"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                            <span>Add Subscriber</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{subscribers.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {subscribers.filter(s => s.isActive).length}
                        </p>
                    </div>
                </div>

                {/* Search & List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredSubscribers.length === 0 ? (
                        <div className="p-12 text-center">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-900 font-medium">No subscribers found</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'Start growing your audience!'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <Mail className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{sub.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sub.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                                                        <XCircle className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(sub.subscribedAt).toLocaleDateString('en-GB')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add Subscriber</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubscriber}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="customer@example.com"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {adding ? 'Adding...' : 'Add Subscriber'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
