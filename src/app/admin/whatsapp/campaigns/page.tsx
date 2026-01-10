import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Users, MessageCircle, Clock, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getCampaigns() {
    try {
        const campaigns = await prisma.whatsAppCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    select: {
                        status: true,
                    },
                },
            },
        });
        return campaigns;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return [];
    }
}

// Status colors
const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    RUNNING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export default async function CampaignsPage() {
    const campaigns = await getCampaigns();

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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campaigns</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and track your WhatsApp campaigns</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/whatsapp/campaigns/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Link>
                </div>

                {/* Campaigns List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {campaigns.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-900 font-medium">No campaigns found</p>
                            <p className="text-gray-500 text-sm mt-1">Create your first bulk messaging campaign</p>
                            <Link
                                href="/admin/whatsapp/campaigns/new"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4" />
                                Create Campaign
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stats</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Audience</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                                        <MessageCircle className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{campaign.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {campaign.id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[campaign.status] || statusColors.DRAFT}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium">{campaign.sentCount}</span>
                                                        <span className="text-xs text-gray-500">Sent</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-green-600 font-medium">
                                                            {campaign.messages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Delivered</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-red-600 font-medium">
                                                            {campaign.messages.filter(m => m.status === 'FAILED').length}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Failed</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{campaign.audience}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/whatsapp/campaigns/${campaign.id}`}
                                                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
