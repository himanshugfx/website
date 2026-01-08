import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, User, Building2, Mail, Phone, Target, IndianRupee, FileText } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

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

async function addLead(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const stageId = formData.get('stageId') as string;
    const source = formData.get('source') as string;
    const value = formData.get('value') as string;
    const notes = formData.get('notes') as string;

    await prisma.lead.create({
        data: {
            name,
            email,
            phone: phone || null,
            company: company || null,
            stageId,
            source,
            value: value ? parseFloat(value) : null,
            notes: notes || null,
        },
    });

    redirect('/admin/funnel');
}

export default async function AddLeadPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
    const stages = await getStages();
    const { stage: preselectedStage } = await searchParams;

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/funnel"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Lead</h1>
                        <p className="text-sm text-gray-500 mt-1">Add a potential customer to your sales funnel</p>
                    </div>
                </div>

                {/* Form */}
                <form action={addLead} className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Contact Information</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="w-3 h-3 inline mr-1" /> Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Phone className="w-3 h-3 inline mr-1" /> Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building2 className="w-3 h-3 inline mr-1" /> Company / Business
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Business name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lead Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Lead Details</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stage *
                                </label>
                                <select
                                    name="stageId"
                                    required
                                    defaultValue={preselectedStage || stages[0]?.id}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {stages.map((stage) => (
                                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Source *
                                </label>
                                <select
                                    name="source"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="WEBSITE">Website</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="REFERRAL">Referral</option>
                                    <option value="SOCIAL">Social Media</option>
                                    <option value="IMPORT">Import</option>
                                    <option value="MANUAL">Manual Entry</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IndianRupee className="w-3 h-3 inline mr-1" /> Estimated Value (₹)
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Expected Order Value"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold text-gray-900">Notes</h2>
                        </div>
                        <textarea
                            name="notes"
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Any additional notes about this lead..."
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Link
                            href="/admin/funnel"
                            className="px-6 py-3 text-center font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-3 font-semibold text-white bg-black rounded-xl hover:bg-black/80"
                        >
                            Add Lead
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
