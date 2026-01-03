import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Mail, Phone, Building2, Calendar, DollarSign, Tag, MessageSquare, Edit } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getLead(id: string) {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                stage: true,
                activities: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        return lead;
    } catch (error) {
        console.error('Error fetching lead:', error);
        return null;
    }
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lead = await getLead(id);

    if (!lead) {
        notFound();
    }

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
                    {/* Placeholder for Edit button - can be implemented later */}
                    {/* <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                        <Edit className="w-4 h-4" />
                        Edit Lead
                    </button> */}
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
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Lead Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Lead Value</p>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                                        <DollarSign className="w-5 h-5 text-gray-400" />
                                        {lead.value ? `₹${lead.value.toLocaleString()}` : '-'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Source</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium">{lead.source}</span>
                                    </div>
                                </div>
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
        </AdminLayout>
    );
}
