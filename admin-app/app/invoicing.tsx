import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { getInvoices, getExpenses, getQuotations } from '@/services/api';

type TabKey = 'invoices' | 'expenses' | 'quotations';

interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName: string;
    status: string;
    total: number;
    balance: number;
    invoiceDate: string;
    dueDate: string | null;
}

interface InvoiceStats {
    total: number;
    paid: number;
    partiallyPaid: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
}

interface Expense {
    id: string;
    date: string;
    category: string;
    amount: number;
    vendor: string | null;
    description: string | null;
}

interface ExpenseStats {
    totalExpenses: number;
    thisMonth: number;
    lastMonth: number;
    count: number;
}

interface Quotation {
    id: string;
    quotationNumber: string;
    customerName: string;
    customerEmail: string | null;
    status: string;
    total: number;
    quotationDate: string;
    expiryDate: string | null;
}

interface QuotationStats {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    invoiced: number;
    declined: number;
    totalValue: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'rgba(139, 131, 168, 0.15)', text: '#8B83A8' },
    SENT: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
    PAID: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    OVERDUE: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
    VOID: { bg: 'rgba(139, 131, 168, 0.1)', text: '#6B6490' },
    PARTIALLY_PAID: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    ACCEPTED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
    DECLINED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
    EXPIRED: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
    INVOICED: { bg: 'rgba(124, 58, 237, 0.15)', text: '#7C3AED' },
};

const CATEGORY_COLORS: Record<string, string> = {
    TRAVEL: '#3B82F6',
    OFFICE_SUPPLIES: '#10B981',
    MARKETING: '#8B5CF6',
    UTILITIES: '#F59E0B',
    RENT: '#EF4444',
    SALARY: '#EC4899',
    MISC: '#6B7280',
};

const CATEGORY_LABELS: Record<string, string> = {
    TRAVEL: 'Travel',
    OFFICE_SUPPLIES: 'Office Supplies',
    MARKETING: 'Marketing',
    UTILITIES: 'Utilities',
    RENT: 'Rent',
    SALARY: 'Salary',
    MISC: 'Miscellaneous',
};

const formatCurrency = (amount: number) =>
    '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'invoices', label: 'Invoices', icon: 'document-text' },
    { key: 'expenses', label: 'Expenses', icon: 'receipt' },
    { key: 'quotations', label: 'Quotes', icon: 'clipboard' },
];

export default function InvoicingScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('invoices');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Invoices
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);

    // Expenses
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);

    // Quotations
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [quotationStats, setQuotationStats] = useState<QuotationStats | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [invData, expData, quoData] = await Promise.all([
                getInvoices().catch(() => ({ invoices: [], stats: null })),
                getExpenses().catch(() => ({ expenses: [], stats: null })),
                getQuotations().catch(() => ({ quotations: [], stats: null })),
            ]);
            setInvoices(invData.invoices || []);
            setInvoiceStats(invData.stats || null);
            setExpenses(expData.expenses || []);
            setExpenseStats(expData.stats || null);
            setQuotations(quoData.quotations || []);
            setQuotationStats(quoData.stats || null);
        } catch (error) {
            console.error('Error loading invoicing data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading financial data...</Text>
            </View>
        );
    }

    // ── Overview Cards ──
    const renderOverview = () => {
        const revenue = invoiceStats?.paidAmount || 0;
        const totalExpense = expenseStats?.totalExpenses || 0;
        const netProfit = revenue - totalExpense;

        return (
            <View style={styles.overviewContainer}>
                <View style={styles.overviewRow}>
                    <View style={[styles.overviewCard, { borderLeftColor: Colors.success }]}>
                        <Text style={styles.overviewLabel}>Revenue</Text>
                        <Text style={[styles.overviewValue, { color: Colors.success }]}>
                            {formatCurrency(revenue)}
                        </Text>
                    </View>
                    <View style={[styles.overviewCard, { borderLeftColor: Colors.error }]}>
                        <Text style={styles.overviewLabel}>Expenses</Text>
                        <Text style={[styles.overviewValue, { color: Colors.error }]}>
                            {formatCurrency(totalExpense)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.profitCard, { borderLeftColor: netProfit >= 0 ? '#3B82F6' : Colors.error }]}>
                    <View style={styles.profitLeft}>
                        <Ionicons name="trending-up" size={20} color={netProfit >= 0 ? '#3B82F6' : Colors.error} />
                        <Text style={styles.overviewLabel}>Net Profit</Text>
                    </View>
                    <Text style={[styles.profitValue, { color: netProfit >= 0 ? '#3B82F6' : Colors.error }]}>
                        {formatCurrency(netProfit)}
                    </Text>
                </View>
            </View>
        );
    };

    // ── Tabs ──
    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {TABS.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={tab.icon}
                        size={16}
                        color={activeTab === tab.key ? Colors.primary : Colors.textDim}
                    />
                    <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // ── Invoice List ──
    const renderInvoices = () => {
        if (invoices.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color={Colors.textDim} />
                    <Text style={styles.emptyTitle}>No invoices yet</Text>
                    <Text style={styles.emptySubtitle}>Invoices will appear here when created</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Invoice Stats Row */}
                {invoiceStats && (
                    <View style={styles.miniStatsRow}>
                        <View style={styles.miniStat}>
                            <Text style={styles.miniStatValue}>{invoiceStats.total}</Text>
                            <Text style={styles.miniStatLabel}>Total</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.success }]}>{invoiceStats.paid}</Text>
                            <Text style={styles.miniStatLabel}>Paid</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.warning }]}>{invoiceStats.partiallyPaid}</Text>
                            <Text style={styles.miniStatLabel}>Partial</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.error }]}>{invoiceStats.overdue}</Text>
                            <Text style={styles.miniStatLabel}>Overdue</Text>
                        </View>
                    </View>
                )}

                {invoices.slice(0, 50).map((invoice, index) => {
                    const statusStyle = STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT;
                    return (
                        <View key={invoice.id} style={[styles.listItem, index === 0 && { borderTopWidth: 0 }]}>
                            <View style={styles.listItemTop}>
                                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                        {invoice.status.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.listItemBottom}>
                                <View style={styles.listItemInfo}>
                                    <Text style={styles.customerName} numberOfLines={1}>{invoice.customerName}</Text>
                                    <Text style={styles.itemDate}>{formatDate(invoice.invoiceDate)}</Text>
                                </View>
                                <View style={styles.listItemAmounts}>
                                    <Text style={styles.totalAmount}>{formatCurrency(invoice.total)}</Text>
                                    {invoice.balance > 0 && (
                                        <Text style={styles.balanceDue}>Due: {formatCurrency(invoice.balance)}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    // ── Expense List ──
    const renderExpenses = () => {
        if (expenses.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={Colors.textDim} />
                    <Text style={styles.emptyTitle}>No expenses logged</Text>
                    <Text style={styles.emptySubtitle}>Add expenses from the web dashboard</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Expense Stats Row */}
                {expenseStats && (
                    <View style={styles.miniStatsRow}>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.error }]}>
                                {formatCurrency(expenseStats.totalExpenses)}
                            </Text>
                            <Text style={styles.miniStatLabel}>Total</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: '#3B82F6' }]}>
                                {formatCurrency(expenseStats.thisMonth)}
                            </Text>
                            <Text style={styles.miniStatLabel}>This Month</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={styles.miniStatValue}>{expenseStats.count}</Text>
                            <Text style={styles.miniStatLabel}>Count</Text>
                        </View>
                    </View>
                )}

                {expenses.slice(0, 50).map((expense, index) => {
                    const catColor = CATEGORY_COLORS[expense.category] || '#6B7280';
                    const catLabel = CATEGORY_LABELS[expense.category] || expense.category;
                    return (
                        <View key={expense.id} style={[styles.listItem, index === 0 && { borderTopWidth: 0 }]}>
                            <View style={styles.listItemTop}>
                                <View style={styles.expenseCatRow}>
                                    <View style={[styles.catDot, { backgroundColor: catColor }]} />
                                    <Text style={styles.catLabel}>{catLabel}</Text>
                                </View>
                                <Text style={styles.totalAmount}>{formatCurrency(expense.amount)}</Text>
                            </View>
                            <View style={styles.listItemBottom}>
                                <Text style={styles.itemDate}>{formatDate(expense.date)}</Text>
                                {expense.vendor && (
                                    <Text style={styles.vendorName} numberOfLines={1}>{expense.vendor}</Text>
                                )}
                            </View>
                            {expense.description && (
                                <Text style={styles.expenseDesc} numberOfLines={1}>{expense.description}</Text>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    // ── Quotation List ──
    const renderQuotations = () => {
        if (quotations.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="clipboard-outline" size={48} color={Colors.textDim} />
                    <Text style={styles.emptyTitle}>No quotations yet</Text>
                    <Text style={styles.emptySubtitle}>Create quotations from the web dashboard</Text>
                </View>
            );
        }

        return (
            <View>
                {/* Quotation Stats Row */}
                {quotationStats && (
                    <View style={styles.miniStatsRow}>
                        <View style={styles.miniStat}>
                            <Text style={styles.miniStatValue}>{quotationStats.total}</Text>
                            <Text style={styles.miniStatLabel}>Total</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.success }]}>{quotationStats.accepted}</Text>
                            <Text style={styles.miniStatLabel}>Accepted</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: '#3B82F6' }]}>{quotationStats.sent}</Text>
                            <Text style={styles.miniStatLabel}>Sent</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Text style={[styles.miniStatValue, { color: Colors.primary }]}>{quotationStats.invoiced}</Text>
                            <Text style={styles.miniStatLabel}>Invoiced</Text>
                        </View>
                    </View>
                )}

                {quotations.slice(0, 50).map((quotation, index) => {
                    const statusStyle = STATUS_COLORS[quotation.status] || STATUS_COLORS.DRAFT;
                    return (
                        <View key={quotation.id} style={[styles.listItem, index === 0 && { borderTopWidth: 0 }]}>
                            <View style={styles.listItemTop}>
                                <Text style={styles.invoiceNumber}>{quotation.quotationNumber}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                        {quotation.status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.listItemBottom}>
                                <View style={styles.listItemInfo}>
                                    <Text style={styles.customerName} numberOfLines={1}>{quotation.customerName}</Text>
                                    <Text style={styles.itemDate}>{formatDate(quotation.quotationDate)}</Text>
                                </View>
                                <Text style={styles.totalAmount}>{formatCurrency(quotation.total)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
            >
                {renderOverview()}
                {renderTabs()}

                <View style={styles.listContainer}>
                    {activeTab === 'invoices' && renderInvoices()}
                    {activeTab === 'expenses' && renderExpenses()}
                    {activeTab === 'quotations' && renderQuotations()}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
    },

    // Overview
    overviewContainer: {
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    overviewRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    overviewCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderLeftWidth: 3,
    },
    overviewLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.text,
    },
    profitCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderLeftWidth: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    profitValue: {
        fontSize: FontSize.xl,
        fontWeight: '800',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: Spacing.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    tabActive: {
        backgroundColor: Colors.primaryGlow,
    },
    tabLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textDim,
    },
    tabLabelActive: {
        color: Colors.primary,
    },

    // Mini Stats
    miniStatsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    miniStat: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    miniStatValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.text,
    },
    miniStatLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.textDim,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },

    // List
    listContainer: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        overflow: 'hidden',
    },
    listItem: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    listItemTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    listItemBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    listItemInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    listItemAmounts: {
        alignItems: 'flex-end',
    },

    // Invoice specific
    invoiceNumber: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.primary,
        fontFamily: 'monospace',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    customerName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    itemDate: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    totalAmount: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: Colors.text,
    },
    balanceDue: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.error,
        marginTop: 2,
    },

    // Expense specific
    expenseCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    catDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    catLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    vendorName: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    expenseDesc: {
        fontSize: FontSize.xs,
        color: Colors.textDim,
        marginTop: 4,
        fontStyle: 'italic',
    },

    // Empty
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xxxl,
        gap: Spacing.sm,
    },
    emptyTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    emptySubtitle: {
        fontSize: FontSize.xs,
        color: Colors.textDim,
        textAlign: 'center',
    },
});
