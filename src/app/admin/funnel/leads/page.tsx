import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Search, Filter, Plus, ChevronRight, Mail, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getLeads() {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                stage: true,
            },
        });
        return leads;
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}

async function getStages() {
    try {
        const stages = await prisma.funnelStage.findMany({
            orderBy: { order: 'asc' },
        });
        return stages;
    } catch (error) {
        console.error('Error fetching stages:', error);
        return [];
    }
}

export default async function LeadsListPage() {
    const [leads, stages] = await Promise.all([getLeads(), getStages()]);

    console.log(`[LeadsListPage] Rendering with ${leads.length} leads and ${stages.length} stages`);
    if (leads.length > 0) {
        console.log(`[LeadsListPage] First lead stage:`, leads[0].stage?.name || 'MISSING');
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/funnel"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Leads</h1>
                            <p className="text-sm text-gray-500 mt-1">{leads.length} total leads</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/funnel/leads/add"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Lead
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">All Stages</option>
                        {stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                        ))}
                    </select>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span>More</span>
                    </button>
                </div>

                {/* Leads List */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {leads.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-900 font-medium">No leads yet</p>
                                <p className="text-gray-500 text-sm mt-1">Add your first lead to get started</p>
                            </div>
                        ) : (
                            leads.map((lead) => (
                                <Link
                                    key={lead.id}
                                    href={`/admin/funnel/leads/${lead.id}`}
                                    className="block p-4 active:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">{lead.name}</span>
                                                {lead.stage && (
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-medium rounded-full"
                                                        style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}
                                                    >
                                                        {lead.stage.name}
                                                    </span>
                                                )}
                                            </div>
                                            {lead.company && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" /> {lead.company}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">{lead.email}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {lead.value && (
                                                <p className="font-bold text-gray-900">₹{lead.value.toLocaleString()}</p>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mt-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Lead</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Stage</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <p className="text-gray-900 font-medium">No leads yet</p>
                                            <p className="text-gray-500 text-sm mt-1">Add your first lead to get started</p>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr key={lead.id} className="group hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{lead.name}</p>
                                                    {lead.company && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" /> {lead.company}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {lead.email}
                                                    </p>
                                                    {lead.phone && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {lead.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.stage ? (
                                                    <span
                                                        className="px-2.5 py-1 text-xs font-semibold rounded-full"
                                                        style={{ backgroundColor: `${lead.stage.color}20`, color: lead.stage.color }}
                                                    >
                                                        {lead.stage.name}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                                                        No Stage
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.value ? (
                                                    <span className="font-bold text-gray-900">₹{lead.value.toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{lead.source}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/funnel/leads/${lead.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
