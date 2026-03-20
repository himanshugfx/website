'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Target, Plus, Users, TrendingUp, IndianRupee, GripVertical, Phone, Mail, FileText, ChevronRight, Minimize2, Maximize2, Search, X, Calendar, MessageSquare, Clock, ArrowRight, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, DragEvent, useRef, useMemo } from 'react';

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: string;
    value: number;
    stageId: string;
    notes: string | null;
    createdAt: string;
    _count: {
        activities: number;
        followUps: number;
    };
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
    const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    const handleDrop = async (e: DragEvent<HTMLDivElement>, targetStageId: string) => {
        e.preventDefault();
        setDragOverStage(null);

        if (!draggedLead || draggedLead.stageId === targetStageId) return;

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

        try {
            const res = await fetch(`/api/funnel/leads/${draggedLead.id}/stage`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId: targetStageId }),
            });
            if (!res.ok) fetchFunnelData();
        } catch (error) {
            fetchFunnelData();
        }
        setDraggedLead(null);
    };

    const toggleCollapse = (stageId: string) => {
        const next = new Set(collapsedStages);
        if (next.has(stageId)) next.delete(stageId);
        else next.add(stageId);
        setCollapsedStages(next);
    };

    const filteredStages = useMemo(() => {
        return stages.map(stage => ({
            ...stage,
            stageTotal: stage.leads.reduce((sum, lead) => sum + (lead.value || 0), 0),
            leads: stage.leads.filter(lead => 
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }));
    }, [stages, searchQuery]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-100"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Designing Funnel...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
                {/* 1. Sleek Header & Actions */}
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
                    <div>
                        <div className="flex flex-col items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter font-primary">Sales Pipeline</h1>
                            <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 shadow-sm inline-block">
                                Live Tracking
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-3 uppercase tracking-wider max-w-2xl">
                            Maximize your <span className="text-purple-600 font-black italic underline decoration-purple-200 underline-offset-4">revenue flow</span> and conversion velocity
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <button 
                                onClick={() => setViewMode('BOARD')}
                                className={`px-4 py-3 rounded-xl transition-all ${viewMode === 'BOARD' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('LIST')}
                                className={`px-4 py-3 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative group w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search prospects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-600 transition-all shadow-sm"
                            />
                        </div>

                        <Link
                            href="/admin/funnel/leads/add"
                            className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all text-sm tracking-tight"
                        >
                            <Plus className="w-5 h-5 stroke-[3px]" />
                            <span>Capture Lead</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Conversion Visualizer (The Funnel Bar) */}
                {stats && (
                    <div className="bg-white rounded-[2rem] border border-gray-50 shadow-2xl overflow-hidden p-2 flex items-stretch h-32 gap-1">
                        {filteredStages.map((stage, idx) => {
                            const count = stage.leads.length;
                            const prevCount = idx > 0 ? filteredStages[idx-1].leads.length : count;
                            const dropoff = idx > 0 && prevCount > 0 ? (count / prevCount) * 100 : 100;

                            return (
                                <div key={stage.id} className="flex-1 flex gap-1 group">
                                    <div className="flex-1 bg-gray-50/50 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden transition-all hover:bg-white hover:border hover:border-gray-100 border border-transparent">
                                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: stage.color }} />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{stage.name}</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter mt-1">{count}</p>
                                            <span className="text-[10px] font-black text-purple-600">Leads</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 mt-1">{formatCurrency(stage.stageTotal)}</p>
                                    </div>
                                    {idx < filteredStages.length - 1 && (
                                        <div className="w-12 flex flex-col items-center justify-center gap-1 opacity-40">
                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                            <span className="text-[8px] font-black text-gray-400">{Math.round(dropoff)}%</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. Modern Kanban Board */}
                {viewMode === 'BOARD' ? (
                    <div className="overflow-x-auto pb-10 -mx-8 px-8 select-none custom-scrollbar scroll-smooth">
                        <div className="flex gap-8 min-w-max min-h-[600px] h-[calc(100vh-420px)]">
                            {filteredStages.map((stage) => {
                                const isCollapsed = collapsedStages.has(stage.id);
                                return (
                                    <div
                                        key={stage.id}
                                        className={`flex flex-col transition-all duration-500 ease-in-out ${
                                            isCollapsed ? 'w-20' : 'w-80'
                                        }`}
                                    >
                                        <div
                                            className={`flex flex-col h-full rounded-[2.5rem] transition-all duration-500 ${
                                                dragOverStage === stage.id
                                                ? 'bg-purple-50 ring-2 ring-purple-600 ring-inset shadow-2xl scale-[1.02]'
                                                : 'bg-[#fcfdfe] border border-gray-100/60 shadow-inner'
                                            }`}
                                            onDragOver={(e) => handleDragOver(e, stage.id)}
                                            onDrop={(e) => handleDrop(e, stage.id)}
                                        >
                                            {/* Column Header */}
                                            <div className={`p-6 flex items-center justify-between ${isCollapsed ? 'flex-col gap-10 h-full py-10' : ''}`}>
                                                <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col rotate-180 [writing-mode:vertical-lr]' : ''}`}>
                                                    <div className="w-4 h-4 rounded-full shadow-lg ring-4 ring-white" style={{ backgroundColor: stage.color }} />
                                                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest whitespace-nowrap leading-none font-primary">
                                                        {stage.name}
                                                    </h3>
                                                    <div className="px-2.5 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 shadow-sm leading-none mt-0.5">
                                                        {stage.leads.length}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => toggleCollapse(stage.id)}
                                                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-purple-600 transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                                >
                                                    {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {/* Stage Value Line */}
                                            {!isCollapsed && (
                                                <div className="px-6 pb-4">
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gray-200 transition-all duration-1000" 
                                                            style={{ width: `${Math.min(100, (stage.stageTotal / (stats?.totalValue || 1)) * 100)}%` }} 
                                                        />
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest flex justify-between items-center">
                                                        Value: <span className="text-gray-900">{formatCurrency(stage.stageTotal)}</span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Leads Content Area */}
                                            {!isCollapsed && (
                                                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 custom-scrollbar">
                                                    {stage.leads.length === 0 ? (
                                                        <div className="h-full min-h-[160px] rounded-3xl border-2 border-dashed border-gray-100/60 flex flex-col items-center justify-center text-gray-300 gap-3 grayscale opacity-40">
                                                            <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center">
                                                                <Target className="w-6 h-6" />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Leads</p>
                                                        </div>
                                                    ) : (
                                                        stage.leads.map((lead) => (
                                                            <div
                                                                key={lead.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, lead)}
                                                                onDragEnd={handleDragEnd}
                                                                className={`group/card relative bg-white rounded-3xl p-5 border border-gray-100/60 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:border-purple-100 hover:-translate-y-1 transition-all duration-300 ${
                                                                    draggedLead?.id === lead.id ? 'opacity-40 scale-95 blur-sm' : ''
                                                                }`}
                                                            >
                                                                {/* Card ID & Source Icon */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/card:bg-purple-600 group-hover/card:text-white transition-colors uppercase">
                                                                            {lead.name.substring(0, 2)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                                                {lead.source}
                                                                            </p>
                                                                            <div className="flex items-center gap-1 mt-1 text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded uppercase">
                                                                                New Lead
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <GripVertical className="w-4 h-4 text-gray-200 group-hover/card:text-gray-400 transition-colors" />
                                                                </div>

                                                                {/* Card Body */}
                                                                <div className="space-y-1">
                                                                    <h4 className="font-black text-gray-900 text-base tracking-tight leading-tight group-hover/card:text-purple-600 transition-colors font-primary">
                                                                        {lead.name}
                                                                    </h4>
                                                                    {lead.company && (
                                                                        <div className="flex items-center gap-1.5 opacity-60">
                                                                            <Target className="w-3 h-3" />
                                                                            <p className="text-[11px] font-bold text-gray-600 truncate uppercase tracking-tight italic">
                                                                                {lead.company}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Activity & Followup Indicators */}
                                                                <div className="flex items-center gap-3 mt-4 mb-4">
                                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors ${lead._count.followUps > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                                        <Clock className="w-3 h-3" />
                                                                        <span className="text-[10px] font-black">{lead._count.followUps}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-gray-400">
                                                                        <MessageSquare className="w-3 h-3" />
                                                                        <span className="text-[10px] font-black">{lead._count.activities}</span>
                                                                    </div>
                                                                    <div className="flex-1 h-px bg-gray-50" />
                                                                </div>

                                                                {/* Value Indicator */}
                                                                <div className="flex items-center justify-between pt-1">
                                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</div>
                                                                    <div className="text-lg font-black text-gray-900 tracking-tighter">
                                                                        {formatCurrency(lead.value || 0)}
                                                                    </div>
                                                                </div>

                                                                {/* Quick Actions Bar (Bottom Floating) */}
                                                                <div className="absolute inset-x-2 -bottom-4 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 pointer-events-none group-hover/card:pointer-events-auto z-20">
                                                                    <div className="bg-gray-900 text-white p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-2xl border border-white/10 backdrop-blur-md">
                                                                        <div className="flex items-center gap-1">
                                                                            <a href={`tel:${lead.phone}`} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
                                                                                <Phone className="w-4 h-4" />
                                                                            </a>
                                                                            <a href={`mailto:${lead.email}`} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
                                                                                <Mail className="w-4 h-4" />
                                                                            </a>
                                                                        </div>
                                                                        <Link 
                                                                            href={`/admin/funnel/leads/${lead.id}`} 
                                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                                        >
                                                                            <span>Details</span>
                                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-4">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-4">Lead Information</th>
                                    <th className="px-6 py-4">Current Stage</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Est. Value</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStages.flatMap(s => s.leads).map(lead => (
                                    <tr key={lead.id} className="group hover:bg-purple-50/30 transition-all cursor-pointer">
                                        <td className="px-6 py-5 bg-gray-50/50 group-hover:bg-white rounded-l-3xl border border-transparent group-hover:border-purple-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-xs uppercase">
                                                    {lead.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-purple-700 transition-colors uppercase tracking-tight">{lead.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lead.company}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 bg-gray-50/50 group-hover:bg-white group-hover:border-y group-hover:border-purple-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stages.find(s => s.id === lead.stageId)?.color }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                                                    {stages.find(s => s.id === lead.stageId)?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 bg-gray-50/50 group-hover:bg-white group-hover:border-y group-hover:border-purple-100">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200 px-2.5 py-1 rounded-full">{lead.source}</span>
                                        </td>
                                        <td className="px-6 py-5 bg-gray-50/50 group-hover:bg-white group-hover:border-y group-hover:border-purple-100 font-black text-gray-900">
                                            {formatCurrency(lead.value || 0)}
                                        </td>
                                        <td className="px-6 py-5 bg-gray-50/50 group-hover:bg-white rounded-r-3xl border border-transparent group-hover:border-purple-100">
                                            <Link href={`/admin/funnel/leads/${lead.id}`} className="p-2 hover:bg-purple-100 rounded-lg inline-block text-purple-600 transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Float Action Button */}
            <Link 
                href="/admin/funnel/leads/add"
                className="fixed bottom-10 right-10 w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-110 transition-all z-50 animate-bounce cursor-pointer border-4 border-white active:scale-95"
            >
                <Plus className="w-8 h-8 stroke-[3px]" />
            </Link>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </AdminLayout>
    );
}
