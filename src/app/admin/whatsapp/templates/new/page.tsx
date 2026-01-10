'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, FileText, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTemplatePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Extract variables from content (format: {{variable_name}} or {{variable}})
        // Improved regex to handle spaces and common characters
        const variableMatches = content.match(/\{\{\s*(\w+)\s*\}\}/g) || [];
        const variables = variableMatches.map(v => v.replace(/\{\{|\}\}|\s/g, ''));

        try {
            const res = await fetch('/api/whatsapp/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, content, variables }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/whatsapp/templates');
                router.refresh();
            } else {
                setError(data.error || 'Failed to create template');
                setSaving(false);
            }
        } catch (err) {
            console.error('Error creating template:', err);
            setError('Failed to connect to server');
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/whatsapp/templates"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Template</h1>
                        <p className="text-sm text-gray-500 mt-1">Create a reusable message template</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h2 className="font-semibold text-gray-900">Template Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Order Confirmation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message Content *
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono text-sm"
                                    placeholder="Hello {{name}},

Your order #{{order_id}} has been confirmed!

Thank you for shopping with us.
- Anose Beauty"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-2">
                                    Use <code className="bg-gray-100 px-1 rounded">{"{{variable}}"}</code> for dynamic content.
                                    Example: {"{{name}}"}, {"{{order_id}}"}, {"{{amount}}"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-800">Template Tips</h3>
                                <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>Keep messages concise and personal</li>
                                    <li>Include a clear call-to-action</li>
                                    <li>Avoid excessive emojis or special characters</li>
                                    <li>Test templates before bulk sending</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Link
                            href="/admin/whatsapp/templates"
                            className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || !name || !content}
                            className="px-6 py-3 font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Template'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
