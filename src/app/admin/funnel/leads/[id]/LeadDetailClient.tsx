'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Mail, Phone, Building2, Calendar, IndianRupee, Tag, MessageSquare, Check, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stage {
    id: string;
    name: string;
    color: string;
    order: number;
}

interface Activity {
    id: string;
    type: string;
    content: string;
    createdAt: string;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    value?: number;
    notes?: string;
    stageId: string;
    stage: Stage;
    activities: Activity[];
    createdAt: string;
}

interface LeadDetailClientProps {
    initialLead: Lead;
    stages: Stage[];
}

export default function LeadDetailClient({ initialLead, stages }: LeadDetailClientProps) {
    const router = useRouter();
    const [lead, setLead] = useState<Lead>(initialLead);
    const [selectedStageId, setSelectedStageId] = useState(initialLead.stageId);
    const [value, setValue] = useState(initialLead.value?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleStageChange = async (newStageId: string) => {
        setSelectedStageId(newStageId);
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId: newStageId }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleValueSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: value ? parseFloat(value) : null }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error updating value:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/admin/funnel/leads');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Failed to delete lead');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/funnel/leads"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{lead.name}</h1>
                                <span
                                    className="px-2.5 py-1 text-xs font-semibold rounded-full"
                                    style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}
                                >
                                    {lead.stage.name}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Added on {new Date(lead.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {saved && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                <Check className="w-4 h-4" />
                                Saved
                            </div>
                        )}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-5 h-5 flex-shrink-0 text-gray-400" />
                                    <span className="text-sm">{lead.email}</span>
                                </div>
                                {lead.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-5 h-5 flex-shrink-0 text-gray-400" />
                                        <span className="text-sm">{lead.phone}</span>
                                    </div>
                                )}
                                {lead.company && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Building2 className="w-5 h-5 flex-shrink-0 text-gray-400" />
                                        <span className="text-sm">{lead.company}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h2>
                            <div className="space-y-6">
                                {lead.activities.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet</p>
                                ) : (
                                    lead.activities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-purple-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                                                <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Editable Stage & Value */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Lead Details</h2>
                            <div className="space-y-5">
                                {/* Stage Selector */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Stage</label>
                                    <select
                                        value={selectedStageId}
                                        onChange={(e) => handleStageChange(e.target.value)}
                                        disabled={saving}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                                    >
                                        {stages.map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value Input */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Lead Value (₹)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleValueSave}
                                            disabled={saving}
                                            className="px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Save'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Source (Read-only) */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Source</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium">{lead.source}</span>
                                    </div>
                                </div>

                                {/* Created At (Read-only) */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {lead.notes && (
                            <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-6">
                                <h2 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-3">Notes</h2>
                                <p className="text-sm text-yellow-800 whitespace-pre-wrap">{lead.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Lead</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{lead.name}</strong>? All associated activities will also be deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Lead'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
