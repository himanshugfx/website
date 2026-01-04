import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, Receipt, ClipboardList, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getFinanceStats() {
    try {
        const [invoiceTotal, invoicePaid, expenseTotal, quotationTotal, quotationAccepted] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { total: true } }),
            prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
            prisma.expense.aggregate({ _sum: { amount: true } }),
            prisma.quotation.aggregate({ _sum: { total: true } }),
            prisma.quotation.aggregate({ where: { status: 'ACCEPTED' }, _sum: { total: true } }),
        ]);

        return {
            invoiceTotal: invoiceTotal._sum.total || 0,
            invoicePaid: invoicePaid._sum.total || 0,
            expenseTotal: expenseTotal._sum.amount || 0,
            quotationTotal: quotationTotal._sum.total || 0,
            quotationAccepted: quotationAccepted._sum.total || 0,
        };
    } catch (error) {
        console.error('Error fetching finance stats:', error);
        return { invoiceTotal: 0, invoicePaid: 0, expenseTotal: 0, quotationTotal: 0, quotationAccepted: 0 };
    }
}

export default async function FinancesPage() {
    const stats = await getFinanceStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const sections = [
        {
            title: 'Invoices',
            description: 'Manage customer invoices and payments',
            href: '/admin/finances/invoices',
            icon: FileText,
            color: 'bg-blue-500',
            stats: [
                { label: 'Total Invoiced', value: formatCurrency(stats.invoiceTotal) },
                { label: 'Paid', value: formatCurrency(stats.invoicePaid) },
            ],
        },
        {
            title: 'Expenses',
            description: 'Track business expenses and costs',
            href: '/admin/finances/expenses',
            icon: Receipt,
            color: 'bg-red-500',
            stats: [
                { label: 'Total Expenses', value: formatCurrency(stats.expenseTotal) },
            ],
        },
        {
            title: 'Quotations',
            description: 'Create and manage customer quotations',
            href: '/admin/finances/quotations',
            icon: ClipboardList,
            color: 'bg-purple-500',
            stats: [
                { label: 'Total Quoted', value: formatCurrency(stats.quotationTotal) },
                { label: 'Accepted', value: formatCurrency(stats.quotationAccepted) },
            ],
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finances</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage invoices, expenses, and quotations</p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Revenue (Paid)</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.invoicePaid)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Expenses</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.expenseTotal)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Net Profit</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.invoicePaid - stats.expenseTotal)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Quotes Accepted</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.quotationAccepted)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={section.title}
                                href={section.href}
                                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${section.color} rounded-xl`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">{section.title}</h2>
                                <p className="text-sm text-gray-500 mb-4">{section.description}</p>
                                <div className="space-y-2">
                                    {section.stats.map((stat, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{stat.label}</span>
                                            <span className="font-semibold text-gray-900">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
