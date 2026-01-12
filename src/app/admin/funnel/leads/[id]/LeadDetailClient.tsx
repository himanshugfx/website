'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Mail, Phone, Building2, Calendar, IndianRupee, Tag, MessageSquare, Check, Loader2, Trash2, Plus, Clock, Bell, Send, X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stage {
    id: string;
    name: string;
    color: string;
    order: number;
}

interface Activity {
    id: string;
    type: string;
    content: string;
    createdAt: string;
}

interface FollowUp {
    id: string;
    scheduledAt: string;
    notes: string | null;
    status: string;
    completedAt: string | null;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    value?: number;
    notes?: string;
    stageId: string;
    stage: Stage;
    activities: Activity[];
    followUps?: FollowUp[];
    createdAt: string;
}

interface LeadDetailClientProps {
    initialLead: Lead;
    stages: Stage[];
}

export default function LeadDetailClient({ initialLead, stages }: LeadDetailClientProps) {
    const router = useRouter();
    const [lead, setLead] = useState<Lead>(initialLead);
    const [selectedStageId, setSelectedStageId] = useState(initialLead.stageId);
    const [value, setValue] = useState(initialLead.value?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Notes state
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [leadNotes, setLeadNotes] = useState(initialLead.notes || '');
    const [editingNotes, setEditingNotes] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);

    // Follow-up state
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpTime, setFollowUpTime] = useState('');
    const [followUpNotes, setFollowUpNotes] = useState('');
    const [addingFollowUp, setAddingFollowUp] = useState(false);

    // Contact editing state
    const [editingContact, setEditingContact] = useState(false);
    const [contactName, setContactName] = useState(initialLead.name);
    const [contactEmail, setContactEmail] = useState(initialLead.email);
    const [contactPhone, setContactPhone] = useState(initialLead.phone || '');
    const [contactCompany, setContactCompany] = useState(initialLead.company || '');
    const [savingContact, setSavingContact] = useState(false);

    // Fetch follow-ups on mount
    useEffect(() => {
        fetchFollowUps();
    }, [lead.id]);

    const fetchFollowUps = async () => {
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}/followups`);
            if (res.ok) {
                const data = await res.json();
                setFollowUps(data);
            }
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
        }
    };

    const handleStageChange = async (newStageId: string) => {
        setSelectedStageId(newStageId);
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageId: newStageId }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleValueSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: value ? parseFloat(value) : null }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error updating value:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/admin/funnel/leads');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Failed to delete lead');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Add note to activity timeline
    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setAddingNote(true);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote }),
            });

            if (res.ok) {
                const activity = await res.json();
                setLead(prev => ({
                    ...prev,
                    activities: [activity, ...prev.activities]
                }));
                setNewNote('');
            }
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setAddingNote(false);
        }
    };

    // Save lead notes (sidebar notes)
    const handleSaveLeadNotes = async () => {
        setSavingNotes(true);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: leadNotes }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setEditingNotes(false);
            }
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSavingNotes(false);
        }
    };

    // Save contact details
    const handleSaveContact = async () => {
        if (!contactName.trim() || !contactPhone.trim()) {
            alert('Name and Phone are required');
            return;
        }
        setSavingContact(true);

        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: contactName,
                    email: contactEmail || null,
                    phone: contactPhone,
                    company: contactCompany || null,
                }),
            });

            if (res.ok) {
                const updatedLead = await res.json();
                setLead(updatedLead);
                setEditingContact(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error saving contact:', error);
        } finally {
            setSavingContact(false);
        }
    };

    // Add follow-up
    const handleAddFollowUp = async () => {
        if (!followUpDate || !followUpTime) return;
        setAddingFollowUp(true);

        try {
            const scheduledAt = new Date(`${followUpDate}T${followUpTime}`);
            const res = await fetch(`/api/admin/leads/${lead.id}/followups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scheduledAt: scheduledAt.toISOString(),
                    notes: followUpNotes || null,
                }),
            });

            if (res.ok) {
                const followUp = await res.json();
                setFollowUps(prev => [...prev, followUp].sort((a, b) =>
                    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                ));
                setFollowUpDate('');
                setFollowUpTime('');
                setFollowUpNotes('');
                setShowFollowUpForm(false);
                // Refresh activities
                const leadRes = await fetch(`/api/admin/leads/${lead.id}`);
                if (leadRes.ok) {
                    const updatedLead = await leadRes.json();
                    setLead(updatedLead);
                }
            }
        } catch (error) {
            console.error('Error adding follow-up:', error);
        } finally {
            setAddingFollowUp(false);
        }
    };

    // Mark follow-up as complete
    const handleCompleteFollowUp = async (followUpId: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}/followups/${followUpId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' }),
            });

            if (res.ok) {
                setFollowUps(prev => prev.map(f =>
                    f.id === followUpId ? { ...f, status: 'COMPLETED', completedAt: new Date().toISOString() } : f
                ));
                // Refresh activities
                const leadRes = await fetch(`/api/admin/leads/${lead.id}`);
                if (leadRes.ok) {
                    const updatedLead = await leadRes.json();
                    setLead(updatedLead);
                }
            }
        } catch (error) {
            console.error('Error completing follow-up:', error);
        }
    };

    // Delete follow-up
    const handleDeleteFollowUp = async (followUpId: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}/followups/${followUpId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setFollowUps(prev => prev.filter(f => f.id !== followUpId));
            }
        } catch (error) {
            console.error('Error deleting follow-up:', error);
        }
    };

    const pendingFollowUps = followUps.filter(f => f.status === 'PENDING');

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
                    <div className="flex items-center gap-3">
                        {saved && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                <Check className="w-4 h-4" />
                                Saved
                            </div>
                        )}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                                {!editingContact && (
                                    <button
                                        onClick={() => setEditingContact(true)}
                                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editingContact ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                                        <input
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Phone *</label>
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+91 XXXXXXXXXX"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Company</label>
                                        <input
                                            type="text"
                                            value={contactCompany}
                                            onChange={(e) => setContactCompany(e.target.value)}
                                            placeholder="Company Name"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleSaveContact}
                                            disabled={savingContact}
                                            className="flex-1 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {savingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingContact(false);
                                                setContactName(lead.name);
                                                setContactEmail(lead.email);
                                                setContactPhone(lead.phone || '');
                                                setContactCompany(lead.company || '');
                                            }}
                                            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                            {lead.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{lead.name}</span>
                                    </div>
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
                            )}
                        </div>

                        {/* Add Note Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Note</h2>
                            <div className="space-y-3">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Write a note about this lead..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                                    rows={3}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={addingNote || !newNote.trim()}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {addingNote ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Add Note
                                </button>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h2>
                            <div className="space-y-6">
                                {lead.activities.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet</p>
                                ) : (
                                    lead.activities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'NOTE' ? 'bg-purple-50' :
                                                    activity.type === 'STAGE_CHANGE' ? 'bg-blue-50' :
                                                        'bg-gray-50'
                                                    }`}>
                                                    <MessageSquare className={`w-4 h-4 ${activity.type === 'NOTE' ? 'text-purple-600' :
                                                        activity.type === 'STAGE_CHANGE' ? 'text-blue-600' :
                                                            'text-gray-600'
                                                        }`} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{activity.type.replace('_', ' ')}</p>
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
                        {/* Editable Stage & Value */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Lead Details</h2>
                            <div className="space-y-5">
                                {/* Stage Selector */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Stage</label>
                                    <select
                                        value={selectedStageId}
                                        onChange={(e) => handleStageChange(e.target.value)}
                                        disabled={saving}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
                                    >
                                        {stages.map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value Input */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Lead Value (₹)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder="0"
                                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleValueSave}
                                            disabled={saving}
                                            className="px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Save'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Source (Read-only) */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Source</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Tag className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium">{lead.source}</span>
                                    </div>
                                </div>

                                {/* Created At (Read-only) */}
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

                        {/* Editable Notes */}
                        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-yellow-900 uppercase tracking-wider">Notes</h2>
                                {!editingNotes && (
                                    <button
                                        onClick={() => setEditingNotes(true)}
                                        className="text-xs font-medium text-yellow-700 hover:text-yellow-800"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {editingNotes ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={leadNotes}
                                        onChange={(e) => setLeadNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none text-sm bg-white"
                                        rows={4}
                                        placeholder="Add notes about this lead..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveLeadNotes}
                                            disabled={savingNotes}
                                            className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingNotes(false);
                                                setLeadNotes(lead.notes || '');
                                            }}
                                            className="px-3 py-2 bg-white text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-100 border border-yellow-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                                    {leadNotes || <span className="text-yellow-600 italic">No notes yet. Click Edit to add.</span>}
                                </p>
                            )}
                        </div>

                        {/* Schedule Follow-up */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-purple-600" />
                                    Follow-ups
                                </h2>
                                {!showFollowUpForm && (
                                    <button
                                        onClick={() => setShowFollowUpForm(true)}
                                        className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Schedule
                                    </button>
                                )}
                            </div>

                            {showFollowUpForm && (
                                <div className="mb-4 p-4 bg-purple-50 rounded-xl space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Date</label>
                                            <input
                                                type="date"
                                                value={followUpDate}
                                                onChange={(e) => setFollowUpDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Time</label>
                                            <input
                                                type="time"
                                                value={followUpTime}
                                                onChange={(e) => setFollowUpTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        value={followUpNotes}
                                        onChange={(e) => setFollowUpNotes(e.target.value)}
                                        placeholder="What to discuss..."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddFollowUp}
                                            disabled={addingFollowUp || !followUpDate || !followUpTime}
                                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {addingFollowUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowFollowUpForm(false);
                                                setFollowUpDate('');
                                                setFollowUpTime('');
                                                setFollowUpNotes('');
                                            }}
                                            className="px-3 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 border border-gray-200"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Pending Follow-ups List */}
                            {pendingFollowUps.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No scheduled follow-ups</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingFollowUps.map((followUp) => {
                                        const isOverdue = new Date(followUp.scheduledAt) < new Date();
                                        return (
                                            <div
                                                key={followUp.id}
                                                className={`p-3 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-purple-500'}`} />
                                                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                                                            {new Date(followUp.scheduledAt).toLocaleString('en-IN', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleCompleteFollowUp(followUp.id)}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                            title="Mark complete"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFollowUp(followUp.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {followUp.notes && (
                                                    <p className="text-xs text-gray-600 mt-2 pl-6">{followUp.notes}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Lead</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{lead.name}</strong>? All associated activities will also be deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Lead'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
