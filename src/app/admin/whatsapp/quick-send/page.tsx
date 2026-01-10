'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Send, MessageCircle, CheckCircle, XCircle, Loader2, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface Template {
    id: string;
    name: string;
    content: string;
}

export default function QuickSendPage() {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // New state for selection
    const [leads, setLeads] = useState<Lead[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leadsRes, templatesRes] = await Promise.all([
                fetch('/api/whatsapp/leads'),
                fetch('/api/whatsapp/templates')
            ]);

            const leadsData = await leadsRes.json();
            const templatesData = await templatesRes.json();

            if (leadsData.success) setLeads(leadsData.leads);
            if (templatesData.success) setTemplates(templatesData.localTemplates || []); // Use local templates for quick send preview
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleLeadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const leadId = e.target.value;
        setSelectedLeadId(leadId);

        if (leadId) {
            const lead = leads.find(l => l.id === leadId);
            if (lead && lead.phone) {
                // Strip non-digits and ensure 10 digits
                const cleanPhone = lead.phone.replace(/\D/g, '').slice(-10);
                setPhone(cleanPhone);
            }
        }
    };

    const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);

        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                // If a lead is selected, try to replace {{name}}
                let content = template.content;
                if (selectedLeadId) {
                    const lead = leads.find(l => l.id === selectedLeadId);
                    if (lead) {
                        content = content.replace(/{{name}}/g, lead.name.split(' ')[0]);
                    }
                }
                setMessage(content);
            }
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setResult(null);

        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message }),
            });

            const data = await res.json();

            if (data.success) {
                setResult({ success: true, message: 'Message sent successfully!' });
                setPhone('');
                setMessage('');
                setSelectedLeadId('');
                setSelectedTemplateId('');
            } else {
                setResult({ success: false, message: data.error || 'Failed to send message' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Failed to connect to server' });
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/whatsapp"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Send</h1>
                        <p className="text-sm text-gray-500 mt-1">Send a WhatsApp message to a customer</p>
                    </div>
                </div>

                {/* Result Message */}
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

                {/* Send Form */}
                <form onSubmit={handleSend} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">

                    {/* Selectors Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Lead Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                Select Lead (Optional)
                            </label>
                            <select
                                value={selectedLeadId}
                                onChange={handleLeadSelect}
                                disabled={loadingData}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            >
                                <option value="">-- Manual Entry --</option>
                                {leads.map(lead => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.name} ({lead.source})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Template Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Select Template (Optional)
                            </label>
                            <select
                                value={selectedTemplateId}
                                onChange={handleTemplateSelect}
                                disabled={loadingData}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            >
                                <option value="">-- Custom Message --</option>
                                {templates.map(tmpl => (
                                    <option key={tmpl.id} value={tmpl.id}>
                                        {tmpl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                required
                                maxLength={10}
                                className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter 10-digit Indian mobile number</p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                            rows={5}
                            maxLength={1000}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-sans"
                        />
                        <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
                    </div>

                    {/* Preview */}
                    {message && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview
                            </label>
                            <div className="bg-[#e5ddd5] rounded-xl p-4">
                                <div className="bg-[#dcf8c6] rounded-lg p-3 max-w-[80%] ml-auto shadow-sm">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
                                    <span className="text-[10px] text-gray-500 float-right mt-1">Now</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={sending || !phone || !message}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Message
                            </>
                        )}
                    </button>
                </form>

                {/* Tips */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        Tips for sending messages
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Customer must have started a conversation with your business first (24-hour window)</li>
                        <li>• For marketing messages, use approved templates</li>
                        <li>• Keep messages professional and relevant</li>
                        <li>• Respect customer privacy and opt-out requests</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
