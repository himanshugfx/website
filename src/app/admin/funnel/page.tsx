'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Target, Plus, Users, TrendingUp, DollarSign, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, DragEvent } from 'react';

interface Lead {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    source: string;
    value: number;
    stageId: string;
}

interface Stage {
    id: string;
    name: string;
    order: number;
    color: string;
    leads: Lead[];
    _count: { leads: number };
}

interface Stats {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
    totalValue: number;
    wonValue: number;
}

export default function SalesFunnelPage() {
    const [stages, setStages] = useState<Stage[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    useEffect(() => {
        fetchFunnelData();
    }, []);

    const fetchFunnelData = async () => {
        try {
            const res = await fetch('/api/funnel');
            const data = await res.json();
            setStages(data.stages || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Error fetching funnel data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e: DragEvent<HTMLDivElement>, lead: Lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', lead.id);
        // Make the element semi-transparent while dragging
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
        setDraggedLead(null);
        setDragOverStage(null);
        (e.target as HTMLElement).style.opacity = '1';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStage(stageId);
    };

    const handleDragLeave = () => {
        setDragOverStage(null);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>, targetStageId: string) => {
        e.preventDefault();
        setDragOverStage(null);

        if (!draggedLead || draggedLead.stageId === targetStageId) {
            return;
        }

        // Optimistic update
        setStages(prevStages => {
            return prevStages.map(stage => {
                if (stage.id === draggedLead.stageId) {
                    return {
                        ...stage,
                        leads: stage.leads.filter(l => l.id !== draggedLead.id),
                        _count: { leads: stage._count.leads - 1 }
                    };
                }
                if (stage.id === targetStageId) {
                    return {
                        ...stage,
                        leads: [{ ...draggedLead, stageId: targetStageId }, ...stage.leads],
                        _count: { leads: stage._count.leads + 1 }
                    };
                }
                return stage;
            });
        });

        // Update on server
        try {
            const res = await fetch(`/api/funnel/leads/${draggedLead.id}/stage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId: targetStageId }),
            });

            if (!res.ok) {
                // Revert on error
                fetchFunnelData();
            }
        } catch (error) {
            console.error('Error updating lead stage:', error);
            fetchFunnelData();
        }

        setDraggedLead(null);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Funnel</h1>
                        <p className="text-sm text-gray-500 mt-1">Drag and drop leads between stages</p>
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
                {stats && (
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
                )}

                {/* Kanban Board */}
                <div className="overflow-x-auto pb-4 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="flex gap-4" style={{ minWidth: `${stages.length * 300}px` }}>
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                className={`flex-1 min-w-[280px] max-w-[340px] rounded-2xl p-3 transition-all duration-200 ${dragOverStage === stage.id
                                        ? 'bg-purple-50 ring-2 ring-purple-400 ring-inset'
                                        : 'bg-gray-50'
                                    }`}
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                {/* Stage Header */}
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <h3 className="font-semibold text-gray-900 text-sm">{stage.name}</h3>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                            {stage._count.leads}
                                        </span>
                                    </div>
                                </div>

                                {/* Lead Cards */}
                                <div className="space-y-2 min-h-[200px]">
                                    {stage.leads.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                            <p className="text-sm">Drop leads here</p>
                                        </div>
                                    ) : (
                                        stage.leads.map((lead) => (
                                            <div
                                                key={lead.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead)}
                                                onDragEnd={handleDragEnd}
                                                className={`bg-white rounded-xl p-3 border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-1 text-gray-300 cursor-grab">
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>
                                                    <Link
                                                        href={`/admin/funnel/leads/${lead.id}`}
                                                        className="flex-1 min-w-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <p className="font-medium text-gray-900 text-sm truncate hover:text-purple-600">
                                                            {lead.name}
                                                        </p>
                                                        {lead.company && (
                                                            <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                                                        )}
                                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                            <span className="text-xs text-gray-400">{lead.source}</span>
                                                            {lead.value > 0 && (
                                                                <span className="text-xs font-semibold text-gray-900">
                                                                    ₹{lead.value.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Lead to Stage */}
                                <Link
                                    href={`/admin/funnel/leads/add?stage=${stage.id}`}
                                    className="flex items-center justify-center gap-1 w-full mt-3 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-white rounded-lg transition-colors border-2 border-dashed border-gray-200 hover:border-purple-300"
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
