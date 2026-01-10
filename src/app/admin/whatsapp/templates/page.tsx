'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, FileText, CheckCircle, XCircle, Trash2, Loader2, RefreshCw, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LocalTemplate {
    id: string;
    name: string;
    content: string;
    variables: string;
    approved: boolean;
    createdAt: string;
}

interface MetaTemplate {
    name: string;
    status: string;
    category: string;
    components: any[];
}

export default function WhatsAppTemplatesPage() {
    const [localTemplates, setLocalTemplates] = useState<LocalTemplate[]>([]);
    const [metaTemplates, setMetaTemplates] = useState<MetaTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [metaError, setMetaError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/whatsapp/templates');
            const data = await res.json();
            if (data.success) {
                setLocalTemplates(data.localTemplates || []);
                setMetaTemplates(data.metaTemplates || []);
                setMetaError(data.metaError || null);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmitToMeta = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to submit "${name}" to Meta for approval?`)) return;

        setSubmittingId(id);
        try {
            const res = await fetch(`/api/whatsapp/templates/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                alert('Template submitted successfully! It may take some time to appear in Meta templates.');
                // Optimistically update local state to approved
                setLocalTemplates(prev => prev.map(t => t.id === id ? { ...t, approved: true } : t));
                // Trigger refresh to see if it appears in meta templates immediately (unlikely but good practice)
                fetchData();
            } else {
                alert(data.error || 'Failed to submit template');
            }
        } catch (error) {
            alert('Failed to connect to server');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the local template "${name}"?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/whatsapp/templates/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setLocalTemplates(prev => prev.filter(t => t.id !== id));
            } else {
                alert(data.error || 'Failed to delete template');
            }
        } catch (error) {
            alert('Failed to connect to server');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/whatsapp"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">WhatsApp Templates</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage local and Meta-approved templates</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Refresh from Meta"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <Link
                            href="/admin/whatsapp/templates/new"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Local Template
                        </Link>
                    </div>
                </div>

                {/* Meta Integration Status */}
                {metaError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800 text-sm">Meta Sync Issue</h3>
                            <p className="text-xs text-amber-700 mt-1">
                                {metaError}. Showing local templates only. Check your WHATSAPP_API_TOKEN.
                            </p>
                        </div>
                    </div>
                )}

                {/* Local Templates Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-bold text-gray-900">Local Drafts</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {localTemplates.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm">
                                No local templates found. Create one to get started.
                            </div>
                        ) : (
                            localTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm"
                                >
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full uppercase">
                                            Local
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 flex-1">
                                        <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-6 font-mono">
                                            {template.content}
                                        </p>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(template.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {!template.approved && (
                                                <button
                                                    onClick={() => handleSubmitToMeta(template.id, template.name)}
                                                    disabled={submittingId === template.id}
                                                    className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                                                >
                                                    {submittingId === template.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-3 h-3" />
                                                    )}
                                                    Submit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(template.id, template.name)}
                                                disabled={deletingId === template.id}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                                {deletingId === template.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Meta Templates Section */}
                {metaTemplates.length > 0 && (
                    <section className="space-y-4 pt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h2 className="text-lg font-bold text-gray-900">Meta Cloud Templates</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {metaTemplates.map((template, idx) => (
                                <div
                                    key={`${template.name}-${idx}`}
                                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm"
                                >
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${template.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {template.status}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-gray-50 flex-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">{template.category}</p>
                                        <p className="text-xs text-gray-600 line-clamp-6">
                                            {template.components.find(c => c.type === 'BODY')?.text || 'No content'}
                                        </p>
                                    </div>
                                    <div className="p-4 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-medium">Synced from Meta Cloud API</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
}
