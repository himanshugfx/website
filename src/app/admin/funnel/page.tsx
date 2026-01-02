import AdminLayout from '@/components/admin/AdminLayout';
import { Target, Plus, Users, TrendingUp, DollarSign, ChevronRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Default funnel stages
const defaultStages = [
    { name: 'NEW', order: 1, color: '#9CA3AF' },
    { name: 'CONTACTED', order: 2, color: '#3B82F6' },
    { name: 'QUALIFIED', order: 3, color: '#8B5CF6' },
    { name: 'PROPOSAL', order: 4, color: '#F59E0B' },
    { name: 'WON', order: 5, color: '#10B981' },
    { name: 'LOST', order: 6, color: '#EF4444' },
];

async function ensureStagesExist() {
    const existingStages = await prisma.funnelStage.count();
    if (existingStages === 0) {
        // Create default stages
        for (const stage of defaultStages) {
            await prisma.funnelStage.create({
                data: stage,
            });
        }
    }
}

async function getFunnelData() {
    try {
        await ensureStagesExist();

        const stages = await prisma.funnelStage.findMany({
            orderBy: { order: 'asc' },
            include: {
                leads: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { leads: true },
                },
            },
        });

        // Calculate stats
        const totalLeads = await prisma.lead.count();
        const convertedLeads = await prisma.lead.count({
            where: { convertedAt: { not: null } },
        });
        const totalValue = await prisma.lead.aggregate({
            _sum: { value: true },
        });
        const wonValue = await prisma.lead.aggregate({
            where: { stage: { name: 'WON' } },
            _sum: { value: true },
        });

        return {
            stages,
            stats: {
                totalLeads,
                convertedLeads,
                conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0',
                totalValue: totalValue._sum.value || 0,
                wonValue: wonValue._sum.value || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching funnel data:', error);
        return { stages: [], stats: { totalLeads: 0, convertedLeads: 0, conversionRate: '0', totalValue: 0, wonValue: 0 } };
    }
}

export default async function SalesFunnelPage() {
    const { stages, stats } = await getFunnelData();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Funnel</h1>
                        <p className="text-sm text-gray-500 mt-1">Track and manage your leads through the sales pipeline</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/admin/funnel/leads"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">All Leads</span>
                        </Link>
                        <Link
                            href="/admin/funnel/leads/add"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Lead</span>
                            <span className="sm:hidden">New</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Total Leads</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Conversion</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.conversionRate}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Pipeline Value</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Won Value</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">₹{stats.wonValue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads by name, email, or company..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="overflow-x-auto pb-4 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="flex gap-4" style={{ minWidth: `${stages.length * 280}px` }}>
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                className="flex-1 min-w-[260px] max-w-[320px] bg-gray-50 rounded-2xl p-3"
                            >
                                {/* Stage Header */}
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <h3 className="font-semibold text-gray-900 text-sm">{stage.name}</h3>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                            {stage._count.leads}
                                        </span>
                                    </div>
                                </div>

                                {/* Lead Cards */}
                                <div className="space-y-2">
                                    {stage.leads.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            No leads in this stage
                                        </div>
                                    ) : (
                                        stage.leads.map((lead) => (
                                            <Link
                                                key={lead.id}
                                                href={`/admin/funnel/leads/${lead.id}`}
                                                className="block bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">{lead.name}</p>
                                                        {lead.company && (
                                                            <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                </div>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                    <span className="text-xs text-gray-500">{lead.source}</span>
                                                    {lead.value && (
                                                        <span className="text-xs font-semibold text-gray-900">
                                                            ₹{lead.value.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>

                                {/* Add Lead to Stage */}
                                <Link
                                    href={`/admin/funnel/leads/add?stage=${stage.id}`}
                                    className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Lead
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
