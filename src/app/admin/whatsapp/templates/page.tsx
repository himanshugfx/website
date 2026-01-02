import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Plus, FileText, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getTemplates() {
    try {
        const templates = await prisma.whatsAppTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return templates;
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

export default async function WhatsAppTemplatesPage() {
    const templates = await getTemplates();

    return (
        <AdminLayout>
            <div className="space-y-6">
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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Message Templates</h1>
                            <p className="text-sm text-gray-500 mt-1">{templates.length} templates</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/whatsapp/templates/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                    >
                        <Plus className="w-4 h-4" />
                        New Template
                    </Link>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.length === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-900 font-medium">No templates yet</p>
                            <p className="text-gray-500 text-sm mt-1">Create your first message template</p>
                            <Link
                                href="/admin/whatsapp/templates/new"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4" />
                                Create Template
                            </Link>
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div
                                key={template.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                        {template.approved ? (
                                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                <CheckCircle className="w-3 h-3" />
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                <XCircle className="w-3 h-3" />
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50">
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
                                        {template.content}
                                    </p>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {new Date(template.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
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
