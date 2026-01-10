import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, MessageCircle, Clock, CheckCircle, XCircle, Users, BarChart } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getCampaign(id: string) {
    try {
        const campaign = await prisma.whatsAppCampaign.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { sentAt: 'desc' },
                },
            },
        });
        return campaign;
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return null;
    }
}

// Status colors
const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    RUNNING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
};

const messageStatusColors: Record<string, string> = {
    SENT: 'text-blue-600',
    DELIVERED: 'text-green-600',
    READ: 'text-green-700',
    FAILED: 'text-red-600',
};

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
    const campaign = await getCampaign(params.id);

    if (!campaign) {
        notFound();
    }

    const deliveredCount = campaign.messages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
    const failedCount = campaign.messages.filter(m => m.status === 'FAILED').length;
    const readCount = campaign.messages.filter(m => m.status === 'READ').length;
    const deliveryRate = campaign.sentCount > 0 ? ((deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0';

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/whatsapp/campaigns"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{campaign.name}</h1>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status]}`}>
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Created on {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Total Recipients</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{campaign.sentCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Delivered</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <BarChart className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Delivery Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{deliveryRate}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Failed</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                    </div>
                </div>

                {/* Message Log */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Message Log</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Phone Number</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Content Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {campaign.messages.map((message) => (
                                    <tr key={message.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {message.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {message.status === 'FAILED' ? (
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                ) : (
                                                    <CheckCircle className={`w-4 h-4 ${messageStatusColors[message.status] || 'text-gray-400'}`} />
                                                )}
                                                <span className={`text-sm font-medium ${messageStatusColors[message.status] || 'text-gray-600'}`}>
                                                    {message.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(message.sentAt).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 truncate max-w-xs">{message.content}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
