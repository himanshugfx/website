'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Handshake, Trash2, CheckCircle, XCircle, Clock, Search, RefreshCw, Instagram, Facebook, Linkedin, Twitter, Package, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CollabApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    platform: string;
    profileId: string;
    wantsProducts: boolean;
    address: string | null;
    status: string;
    promoCode: string | null;
    notes: string | null;
    createdAt: string;
}

const platformIcons: Record<string, React.ReactNode> = {
    INSTAGRAM: <Instagram className="w-4 h-4" />,
    FACEBOOK: <Facebook className="w-4 h-4" />,
    X: <Twitter className="w-4 h-4" />,
    LINKEDIN: <Linkedin className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
    INSTAGRAM: 'bg-pink-100 text-pink-700 border-pink-200',
    FACEBOOK: 'bg-blue-100 text-blue-700 border-blue-200',
    X: 'bg-gray-100 text-gray-900 border-gray-300',
    LINKEDIN: 'bg-sky-100 text-sky-700 border-sky-200',
};

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminCollabsPage() {
    const [collabs, setCollabs] = useState<CollabApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPromoCode, setEditPromoCode] = useState('');
    const [editNotes, setEditNotes] = useState('');

    useEffect(() => {
        fetchCollabs();
    }, []);

    const fetchCollabs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/collabs');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCollabs(data);
            }
        } catch (error) {
            console.error('Error fetching collabs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/admin/collabs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                fetchCollabs();
            }
        } catch (error) {
            console.error('Error updating collab:', error);
        }
    };

    const handleSaveDetails = async (id: string) => {
        try {
            const res = await fetch('/api/admin/collabs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, promoCode: editPromoCode, notes: editNotes }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchCollabs();
            }
        } catch (error) {
            console.error('Error saving details:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        try {
            const res = await fetch(`/api/admin/collabs?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchCollabs();
            }
        } catch (error) {
            console.error('Error deleting collab:', error);
        }
    };

    const handleExport = () => {
        const dataToExport = collabs.map(c => ({
            Name: c.name,
            Email: c.email,
            Phone: c.phone,
            Platform: c.platform,
            'Profile ID': c.profileId,
            'Wants Products': c.wantsProducts ? 'Yes' : 'No',
            'Shipping Address': c.address || '',
            Status: c.status,
            'Promo Code': c.promoCode || '',
            Notes: c.notes || '',
            'Applied Date': new Date(c.createdAt).toLocaleDateString('en-GB'),
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Collaborators");
        XLSX.writeFile(wb, `collab_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredCollabs = collabs.filter(collab => {
        const matchesSearch =
            collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.phone.includes(searchTerm) ||
            collab.profileId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || collab.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalCollabs = collabs.length;
    const pendingCount = collabs.filter(c => c.status === 'PENDING').length;
    const approvedCount = collabs.filter(c => c.status === 'APPROVED').length;
    const wantsProductsCount = collabs.filter(c => c.wantsProducts).length;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary flex items-center gap-3">
                                <Handshake className="w-10 h-10 text-purple-600" />
                                Collaborations
                            </h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                {totalCollabs} Applications
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Managing <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">influencer partnerships</span> and brand ambassador applications
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <button 
                            onClick={fetchCollabs}
                            className="p-4 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl transition-all shadow-sm group"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-900 group-hover:text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="relative group min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone..."
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
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black shadow-sm hover:border-gray-200 transition-all text-sm tracking-tight text-gray-900"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Apps 📋</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{totalCollabs.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Pending ⏳</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{pendingCount.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Approved ✅</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{approvedCount.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">Want Products 📦</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-purple-600 transition-colors">{wantsProductsCount.toString().padStart(2, '0')}</p>
                    </div>
                </div>

                {/* Collab List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading applications...</p>
                        </div>
                    ) : filteredCollabs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Handshake className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No applications found</h3>
                            <p className="text-gray-500">When influencers apply, their applications will appear here.</p>
                        </div>
                    ) : (
                        filteredCollabs.map((collab) => (
                            <div key={collab.id} className={`bg-white rounded-3xl border ${collab.status === 'PENDING' ? 'border-amber-200 shadow-amber-500/5' : 'border-gray-100'} p-6 transition-all hover:shadow-xl relative group`}>
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left Content */}
                                    <div className="flex-1 space-y-5">
                                        {/* Header Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${collab.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : collab.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {collab.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-black text-gray-900 text-lg">{collab.name}</h3>
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${statusColors[collab.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {collab.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <a href={`mailto:${collab.email}`} className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">{collab.email}</a>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <a href={`tel:${collab.phone}`} className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">{collab.phone}</a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges row */}
                                        <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Platform</span>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${platformColors[collab.platform] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {platformIcons[collab.platform]}
                                                    {collab.platform}
                                                </div>
                                            </div>

                                            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Profile</span>
                                                <a href={`https://${collab.platform.toLowerCase()}.com/${collab.profileId}`} target="_blank" className="text-sm text-gray-900 bg-white px-3 py-1.5 rounded-xl font-mono font-bold border border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-colors">
                                                    @{collab.profileId}
                                                </a>
                                            </div>

                                            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Request</span>
                                                {collab.wantsProducts ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-black">
                                                        <Package className="w-3.5 h-3.5" />
                                                        Wants Product (Paid ₹49)
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold">
                                                        Don't want product
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes and Promo Code */}
                                        {(collab.notes || collab.promoCode) && (
                                            <div className="flex flex-wrap gap-3">
                                                {collab.promoCode && (
                                                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl font-mono font-bold border border-emerald-200">
                                                        🎟️ {collab.promoCode}
                                                    </div>
                                                )}
                                                {collab.notes && (
                                                    <div className="flex-1 bg-amber-50/50 p-3 rounded-xl text-amber-900 text-sm border border-amber-100/50">
                                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-0.5">Internal Notes:</span>
                                                        {collab.notes}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Address Block */}
                                        {collab.address && (
                                            <div className="flex-1 bg-gray-50/50 p-3 rounded-xl text-gray-700 text-sm border border-gray-100/50">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Shipping Address:</span>
                                                <div className="whitespace-pre-line leading-relaxed">{collab.address}</div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                                            <Clock className="w-3.5 h-3.5" />
                                            Applied on {new Date(collab.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Actions Right Side */}
                                    <div className="flex md:flex-col items-center justify-start gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 w-full md:w-auto">
                                        {collab.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(collab.id, 'APPROVED')} className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all group/btn shadow-sm" title="Approve">
                                                    <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                    <span>Approve</span>
                                                </button>
                                                <button onClick={() => handleUpdateStatus(collab.id, 'REJECTED')} className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all group/btn shadow-sm" title="Reject">
                                                    <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                    <span>Reject</span>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => {
                                            setEditingId(editingId === collab.id ? null : collab.id);
                                            setEditPromoCode(collab.promoCode || '');
                                            setEditNotes(collab.notes || '');
                                        }} className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all group/btn shadow-sm" title="Edit Details">
                                            <span>✏️</span>
                                            <span>Edit Details</span>
                                        </button>
                                        <button onClick={() => handleDelete(collab.id)} className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all group/btn shadow-sm" title="Delete">
                                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                            <span className="md:inline hidden lg:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Editing Panel */}
                                {editingId === collab.id && (
                                    <div className="mt-6 bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 block">Assign Promo Code</label>
                                                <input
                                                    type="text"
                                                    value={editPromoCode}
                                                    onChange={(e) => setEditPromoCode(e.target.value)}
                                                    placeholder="e.g. INFLUENCER10"
                                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 block">Internal Notes</label>
                                                <textarea
                                                    value={editNotes}
                                                    onChange={(e) => setEditNotes(e.target.value)}
                                                    placeholder="Private notes about this collaboration..."
                                                    rows={1}
                                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => setEditingId(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={() => handleSaveDetails(collab.id)} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all">
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
