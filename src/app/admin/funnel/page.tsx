'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Target, Plus, Users, TrendingUp, IndianRupee, GripVertical, Phone, Mail, FileText, ChevronRight, ChevronLeft, Minimize2, Maximize2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, DragEvent, useRef } from 'react';

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
    const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDraggingBoard, setIsDraggingBoard] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

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

    const handleBoardMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDraggingBoard(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleBoardMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingBoard || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleBoardMouseUp = () => {
        setIsDraggingBoard(false);
    };

    const toggleCollapse = (stageId: string) => {
        const next = new Set(collapsedStages);
        if (next.has(stageId)) next.delete(stageId);
        else next.add(stageId);
        setCollapsedStages(next);
    };

    const STAGE_PROBABILITIES: Record<string, number> = {
        'new': 0.1,
        'contacted': 0.25,
        'qualified': 0.5,
        'proposal': 0.75,
        'negotiation': 0.85,
        'won': 1.0,
        'lost': 0
    };

    const getWeightedValue = () => {
        if (!stages.length) return 0;
        return stages.reduce((acc, stage) => {
            const prob = STAGE_PROBABILITIES[stage.name.toLowerCase()] || 0.1;
            const stageValue = stage.leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
            return acc + (stageValue * prob);
        }, 0);
    };

    const filteredStages = stages.map(stage => ({
        ...stage,
        leads: stage.leads.filter(lead => 
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }));

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
            <div className="space-y-6 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Funnel</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Track and manage your <span className="text-purple-600 font-bold">leads through stages</span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search leads or companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <Link
                            href="/admin/funnel/leads/add"
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex-shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Lead</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Leads</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.totalLeads}</p>
                                <span className="text-[10px] font-bold text-emerald-500 mb-1">+12%</span>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Conversion</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.conversionRate}%</p>
                                <span className="text-[10px] font-bold text-emerald-500 mb-1">+5%</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                                <IndianRupee className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pipeline Value</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{stats.totalValue.toLocaleString()}</p>
                        </div>

                        <div className="bg-white rounded-3xl p-5 border border-emerald-100 bg-emerald-50/10 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-emerald-600 mb-3">
                                <IndianRupee className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Won Value</span>
                            </div>
                            <p className="text-2xl font-black text-emerald-700 tracking-tighter">₹{stats.wonValue.toLocaleString()}</p>
                        </div>

                        <div className="bg-white rounded-3xl p-5 border border-purple-100 bg-purple-50/10 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 text-purple-600 mb-3">
                                <Target className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Weighted Value</span>
                            </div>
                            <p className="text-2xl font-black text-purple-700 tracking-tighter">₹{Math.round(getWeightedValue()).toLocaleString()}</p>
                            <p className="text-[9px] text-purple-400 font-bold mt-1 uppercase">Adjusted by probability</p>
                        </div>
                    </div>
                )}

                {/* Kanban Board */}
                <div 
                    ref={scrollContainerRef}
                    onMouseDown={handleBoardMouseDown}
                    onMouseMove={handleBoardMouseMove}
                    onMouseUp={handleBoardMouseUp}
                    onMouseLeave={handleBoardMouseUp}
                    className={`overflow-x-auto pb-8 -mx-8 px-8 select-none cursor-default ${isDraggingBoard ? 'cursor-grabbing' : ''}`}
                >
                    <div className="flex gap-6 min-w-max h-[calc(100vh-320px)] min-h-[500px]">
                        {filteredStages.map((stage) => {
                            const isCollapsed = collapsedStages.has(stage.id);
                            return (
                                <div
                                    key={stage.id}
                                    className={`flex flex-col transition-all duration-300 ${
                                        isCollapsed ? 'w-16 min-w-[64px]' : 'w-80 min-w-[320px]'
                                    }`}
                                >
                                    {/* Stage Column */}
                                    <div
                                        className={`flex flex-col h-full rounded-3xl transition-all duration-500 group/stage ${
                                            dragOverStage === stage.id
                                            ? 'bg-purple-100/50 ring-2 ring-purple-400 ring-inset shadow-2xl'
                                            : 'bg-gray-50/50 border border-gray-100'
                                        }`}
                                        onDragOver={(e) => handleDragOver(e, stage.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, stage.id)}
                                    >
                                        {/* Sticky Header */}
                                        <div className={`sticky top-0 z-10 px-4 py-4 rounded-t-3xl backdrop-blur-md transition-all ${
                                            isCollapsed ? 'flex flex-col items-center justify-between h-full py-8' : 'flex flex-col gap-3'
                                        }`}>
                                            <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-8 h-full' : ''}`}>
                                                <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col rotate-180 [writing-mode:vertical-lr]' : ''}`}>
                                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: stage.color }} />
                                                    <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest whitespace-nowrap">
                                                        {stage.name}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                                                        {stage.leads.length}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => toggleCollapse(stage.id)}
                                                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 transition-all border border-transparent hover:border-purple-100 shadow-sm"
                                                >
                                                    {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {!isCollapsed && (
                                                <Link
                                                    href={`/admin/funnel/leads/add?stage=${stage.id}`}
                                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/80 hover:bg-white border border-gray-100 rounded-xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-purple-600 hover:border-purple-200 shadow-sm transition-all group/add"
                                                >
                                                    <Plus className="w-3.5 h-3.5 transition-transform group-hover/add:rotate-90" />
                                                    <span>Add New Lead</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Leads List */}
                                        {!isCollapsed && (
                                            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 custom-scrollbar">
                                                {stage.leads.length === 0 ? (
                                                    <div className="h-full min-h-[120px] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 gap-2">
                                                        <Plus className="w-6 h-6 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No Leads</p>
                                                    </div>
                                                ) : (
                                                    stage.leads.map((lead) => (
                                                        <div
                                                            key={lead.id}
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, lead)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`group/card relative bg-white rounded-2xl p-4 border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-100 transition-all duration-300 ${
                                                                draggedLead?.id === lead.id ? 'opacity-40 scale-95' : ''
                                                            }`}
                                                        >
                                                            {/* Card Header */}
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <h4 className="font-black text-gray-900 text-sm tracking-tight leading-tight group-hover/card:text-purple-600 transition-colors truncate">
                                                                        {lead.name}
                                                                    </h4>
                                                                    {lead.company && (
                                                                        <p className="text-[11px] font-bold text-gray-400 mt-0.5 truncate uppercase tracking-tight italic">
                                                                            {lead.company}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <GripVertical className="w-4 h-4 text-gray-200 group-hover/card:text-gray-400 transition-colors flex-shrink-0" />
                                                            </div>

                                                            {/* Card Footer */}
                                                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-gray-100">
                                                                    {lead.source}
                                                                </span>
                                                                {lead.value > 0 && (
                                                                    <span className="text-sm font-black text-gray-900 tracking-tighter">
                                                                        ₹{lead.value.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Quick Actions Hover Overlay */}
                                                            <div className="absolute inset-x-0 -bottom-2 translate-y-full opacity-0 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 z-10 px-4 pointer-events-none group-hover/card:pointer-events-auto">
                                                                <div className="bg-gray-900 text-white p-1.5 rounded-xl flex items-center justify-center gap-1 shadow-2xl">
                                                                    <a href={`tel:${lead.name}`} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                                                        <Phone className="w-3.5 h-3.5" />
                                                                    </a>
                                                                    <a href={`mailto:${lead.email}`} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                                                        <Mail className="w-3.5 h-3.5" />
                                                                    </a>
                                                                    <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                                                        <FileText className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <div className="w-px h-4 bg-white/20 mx-1" />
                                                                    <Link href={`/admin/funnel/leads/${lead.id}`} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                                                        <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
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
            </div>
        </AdminLayout>
    );
}
