import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function createTemplate(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const content = formData.get('content') as string;

    // Extract variables from content (format: {{variable_name}})
    const variableMatches = content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, ''));

    await prisma.whatsAppTemplate.create({
        data: {
            name,
            content,
            variables: JSON.stringify(variables),
        },
    });

    redirect('/admin/whatsapp/templates');
}

export default function NewTemplatePage() {
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

                {/* Form */}
                <form action={createTemplate} className="space-y-6">
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
                                    name="name"
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
                                    name="content"
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
                            className="px-6 py-3 font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                        >
                            Create Template
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
