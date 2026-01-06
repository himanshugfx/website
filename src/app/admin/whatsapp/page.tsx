import AdminLayout from '@/components/admin/AdminLayout';
import { MessageCircle, Plus, Send, FileText, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getWhatsAppStats() {
    try {
        const [templates, campaigns, messages] = await Promise.all([
            prisma.whatsAppTemplate.count(),
            prisma.whatsAppCampaign.count(),
            prisma.whatsAppMessage.count(),
        ]);

        const deliveredMessages = await prisma.whatsAppMessage.count({
            where: { status: 'DELIVERED' },
        });

        return {
            templates,
            campaigns,
            messagesSent: messages,
            deliveryRate: messages > 0 ? ((deliveredMessages / messages) * 100).toFixed(1) : '0',
        };
    } catch (error) {
        console.error('Error fetching WhatsApp stats:', error);
        return { templates: 0, campaigns: 0, messagesSent: 0, deliveryRate: '0' };
    }
}

async function getRecentCampaigns() {
    try {
        const campaigns = await prisma.whatsAppCampaign.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
        return campaigns;
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return [];
    }
}

async function getTemplates() {
    try {
        const templates = await prisma.whatsAppTemplate.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
        });
        return templates;
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

// Status badge colors for campaigns
const campaignStatusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    RUNNING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export default async function WhatsAppPage() {
    const [stats, campaigns, templates] = await Promise.all([
        getWhatsAppStats(),
        getRecentCampaigns(),
        getTemplates(),
    ]);

    // Check if WhatsApp is configured
    const isConfigured = !!(
        process.env.WHATSAPP_API_TOKEN &&
        process.env.WHATSAPP_PHONE_NUMBER_ID
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">WhatsApp Marketing</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage campaigns, templates, and reach your customers</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/admin/whatsapp/templates"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Templates</span>
                        </Link>
                        <Link
                            href="/admin/whatsapp/campaigns/new"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Campaign</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>

                {/* Configuration Warning */}
                {!isConfigured && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800">WhatsApp API not configured</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                To send messages, please add your WhatsApp Business API credentials to the <code className="bg-amber-100 px-1 rounded">.env</code> file.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Templates</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.templates}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Campaigns</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.campaigns}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Send className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Messages Sent</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.messagesSent}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Delivery Rate</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/admin/whatsapp/quick-send"
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all"
                    >
                        <Send className="w-8 h-8 mb-3" />
                        <h3 className="font-bold text-lg">Quick Send</h3>
                        <p className="text-green-100 text-sm mt-1">Send a single message to a customer</p>
                    </Link>
                    <Link
                        href="/admin/whatsapp/campaigns/new"
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
                    >
                        <Users className="w-8 h-8 mb-3" />
                        <h3 className="font-bold text-lg">Bulk Campaign</h3>
                        <p className="text-purple-100 text-sm mt-1">Reach multiple customers at once</p>
                    </Link>
                    <Link
                        href="/admin/whatsapp/templates/new"
                        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white hover:from-gray-800 hover:to-gray-900 transition-all"
                    >
                        <FileText className="w-8 h-8 mb-3" />
                        <h3 className="font-bold text-lg">New Template</h3>
                        <p className="text-gray-300 text-sm mt-1">Create a reusable message template</p>
                    </Link>
                </div>

                {/* Recent Campaigns */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Recent Campaigns</h2>
                        <Link href="/admin/whatsapp/campaigns" className="text-sm text-purple-600 font-medium hover:text-purple-700">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {campaigns.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-900 font-medium">No campaigns yet</p>
                                <p className="text-gray-500 text-sm mt-1">Create your first WhatsApp campaign</p>
                            </div>
                        ) : (
                            campaigns.map((campaign) => (
                                <Link
                                    key={campaign.id}
                                    href={`/admin/whatsapp/campaigns/${campaign.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{campaign.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${campaignStatusColors[campaign.status] || campaignStatusColors.DRAFT}`}>
                                                    {campaign.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {campaign.sentCount} sent
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            {new Date(campaign.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Templates Preview */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Message Templates</h2>
                        <Link href="/admin/whatsapp/templates" className="text-sm text-purple-600 font-medium hover:text-purple-700">
                            Manage Templates
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                        {templates.length === 0 ? (
                            <div className="col-span-full p-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-900 font-medium">No templates yet</p>
                                <p className="text-gray-500 text-sm mt-1">Create message templates for quick sending</p>
                            </div>
                        ) : (
                            templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-gray-50 rounded-xl p-4"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                                        {template.approved ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
