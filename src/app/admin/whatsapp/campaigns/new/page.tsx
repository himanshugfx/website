'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Users, Send, FileText, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Template {
    id: string;
    name: string;
    content: string;
}

interface Lead {
    id: string;
    name: string;
    phone: string | null;
    email: string;
}

export default function NewCampaignPage() {
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [audience, setAudience] = useState<'ALL' | 'LEADS'>('ALL');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [customNumbers, setCustomNumbers] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; sent?: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [templatesRes, leadsRes] = await Promise.all([
                fetch('/api/whatsapp/templates'),
                fetch('/api/whatsapp/leads'),
            ]);

            const templatesData = await templatesRes.json();
            const leadsData = await leadsRes.json();

            setTemplates(templatesData.localTemplates || []);
            setLeads((leadsData.leads || []).filter((l: Lead) => l.phone));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setResult(null);

        const selectedTemplate = templates.find(t => t.id === templateId);
        if (!selectedTemplate) {
            setResult({ success: false, message: 'Please select a template' });
            setSending(false);
            return;
        }

        // Collect recipients
        let recipients: { phone: string; name: string }[] = [];

        // Add leads
        leads
            .filter(l => selectedLeads.includes(l.id) && l.phone)
            .forEach(l => {
                recipients.push({ phone: l.phone as string, name: l.name });
            });

        // Add custom numbers
        if (customNumbers) {
            const customList = customNumbers
                .split(/[,\n]/)
                .map(p => p.trim())
                .filter(p => p.length >= 10);

            customList.forEach(p => {
                // If it's already in the list, skip
                if (!recipients.some(r => r.phone.replace(/\D/g, '') === p.replace(/\D/g, ''))) {
                    recipients.push({ phone: p, name: 'Customer' });
                }
            });
        }

        if (recipients.length === 0) {
            setResult({ success: false, message: 'No recipients selected' });
            setSending(false);
            return;
        }

        try {
            const campaignRes = await fetch('/api/whatsapp/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    templateId,
                    recipients,
                }),
            });

            const campaignData = await campaignRes.json();

            if (campaignData.success) {
                setResult({
                    success: true,
                    message: `Campaign created! Sent to ${campaignData.sentCount} recipients.`,
                    sent: campaignData.sentCount,
                });
                // Reset form
                setName('');
                setTemplateId('');
                setSelectedLeads([]);
                setCustomNumbers('');
            } else {
                setResult({ success: false, message: campaignData.error || 'Failed to create campaign' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Failed to connect to server' });
        } finally {
            setSending(false);
        }
    };

    const toggleLead = (id: string) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    const selectAllLeads = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(l => l.id));
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/whatsapp"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Campaign</h1>
                        <p className="text-sm text-gray-500 mt-1">Send bulk WhatsApp messages with variables</p>
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${result.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                            {result.message}
                        </span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSend} className="space-y-6">
                    {/* Campaign Name */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Campaign Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Seasonal Greetings 2026"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Template Selection */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h2 className="font-semibold text-gray-900">Select Message Template</h2>
                        </div>

                        {templates.length === 0 ? (
                            <div className="text-center py-6">
                                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No templates available</p>
                                <Link
                                    href="/admin/whatsapp/templates/new"
                                    className="text-green-600 text-sm font-medium hover:underline"
                                >
                                    Create a template first
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {templates.map((template) => (
                                    <label
                                        key={template.id}
                                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${templateId === template.id
                                            ? 'border-green-500 bg-green-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="template"
                                            value={template.id}
                                            checked={templateId === template.id}
                                            onChange={(e) => setTemplateId(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{template.name}</p>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-mono text-xs">{template.content}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recipients */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-green-600" />
                            <h2 className="font-semibold text-gray-900">Select Recipients</h2>
                        </div>

                        {/* Leads Selection */}
                        {leads.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Qualified Leads ({selectedLeads.length} selected)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={selectAllLeads}
                                        className="text-sm text-green-600 font-medium hover:underline"
                                    >
                                        {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                                    {leads.map((lead) => (
                                        <label
                                            key={lead.id}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-green-50' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => toggleLead(lead.id)}
                                                className="rounded h-4 w-4 text-green-600"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                                                <p className="text-xs text-gray-500">{lead.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom Numbers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Phone Numbers
                            </label>
                            <textarea
                                value={customNumbers}
                                onChange={(e) => setCustomNumbers(e.target.value)}
                                placeholder="Enter phone numbers, one per line or comma-separated"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                    Total unique recipients: {
                                        // Simple count for UI display
                                        selectedLeads.length + (customNumbers.split(/[,\n]/).filter(p => p.trim()).length)
                                    }
                                </p>
                                <p className="text-[10px] text-amber-600 font-medium">
                                    * Messages will be sent one by one
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Restriction Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Important Note</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                Meta restricts regular messages to a 24-hour window from the user's last message.
                                For older leads, please ensure you use **Meta Approved Templates** for best delivery rates.
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={sending || !name || !templateId || (selectedLeads.length === 0 && !customNumbers)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.99]"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Campaign...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Launch Campaign
                            </>
                        )}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
}
