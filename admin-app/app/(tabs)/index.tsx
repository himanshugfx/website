import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    recentOrdersCount: number;
    recentRevenue: number;
}

interface Order {
    id: string;
    orderNumber: number;
    customerName: string | null;
    customerEmail: string | null;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    user?: { name: string | null; email: string | null };
}

export default function DashboardScreen() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    const loadData = useCallback(async () => {
        try {
            const [statsData, ordersData] = await Promise.all([
                api.getStats(),
                api.getOrders({ status: 'PENDING', limit: 5 }),
            ]);
            setStats(statsData);
            setPendingOrders(ordersData.orders || []);
        } catch (err: any) {
            if (err.message === 'SESSION_EXPIRED') {
                router.replace('/login');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    function getStatusColor(status: string) {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED':
                return Colors.success;
            case 'PENDING':
                return Colors.warning;
            case 'PROCESSING':
            case 'SHIPPED':
                return Colors.info;
            case 'CANCELLED':
                return Colors.error;
            default:
                return Colors.textMuted;
        }
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const statsCards = [
        {
            title: 'Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
            icon: 'wallet' as const,
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.12)',
        },
        {
            title: 'Orders',
            value: String(stats?.totalOrders || 0),
            icon: 'receipt' as const,
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.12)',
        },
        {
            title: 'Products',
            value: String(stats?.totalProducts || 0),
            icon: 'cube' as const,
            color: Colors.primary,
            bgColor: Colors.primaryGlow,
        },
        {
            title: 'Customers',
            value: String(stats?.totalUsers || 0),
            icon: 'people' as const,
            color: '#F59E0B',
            bgColor: 'rgba(245, 158, 11, 0.12)',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'Admin'} 👋</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {statsCards.map((card, idx) => (
                        <View key={idx} style={styles.statsCard}>
                            <View style={[styles.statsIconContainer, { backgroundColor: card.bgColor }]}>
                                <Ionicons name={card.icon} size={22} color={card.color} />
                            </View>
                            <Text style={styles.statsValue}>{card.value}</Text>
                            <Text style={styles.statsLabel}>{card.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Weekly Snapshot */}
                {stats?.recentRevenue !== undefined && (
                    <View style={styles.weeklyCard}>
                        <View style={styles.weeklyHeader}>
                            <Ionicons name="trending-up" size={20} color={Colors.success} />
                            <Text style={styles.weeklyTitle}>Last 7 Days</Text>
                        </View>
                        <View style={styles.weeklyStats}>
                            <View style={styles.weeklyStat}>
                                <Text style={styles.weeklyValue}>₹{(stats.recentRevenue || 0).toLocaleString('en-IN')}</Text>
                                <Text style={styles.weeklyLabel}>Revenue</Text>
                            </View>
                            <View style={styles.weeklyDivider} />
                            <View style={styles.weeklyStat}>
                                <Text style={styles.weeklyValue}>{stats.recentOrdersCount || 0}</Text>
                                <Text style={styles.weeklyLabel}>Orders</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Pending Orders */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pending Orders</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {pendingOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
                        </View>
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySubtitle}>No pending orders right now 🎉</Text>
                    </View>
                ) : (
                    pendingOrders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderCard}
                            onPress={() => router.push(`/order/${order.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.orderRow}>
                                <View style={styles.orderAvatar}>
                                    <Text style={styles.orderAvatarText}>
                                        {(order.customerName || order.user?.name || 'G').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderName} numberOfLines={1}>
                                        {order.customerName || order.user?.name || 'Guest'}
                                    </Text>
                                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                                </View>
                                <View style={styles.orderRight}>
                                    <Text style={styles.orderTotal}>₹{order.total.toLocaleString('en-IN')}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { marginTop: Spacing.xxl }]}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    {[
                        { title: 'Reviews', icon: 'star' as const, route: '/reviews', color: '#F59E0B' },
                        { title: 'Inquiries', icon: 'mail' as const, route: '/inquiries', color: '#3B82F6' },
                        { title: 'Leads', icon: 'people' as const, route: '/leads', color: '#10B981' },
                        { title: 'Promos', icon: 'pricetag' as const, route: '/promocodes', color: Colors.primary },
                    ].map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.quickAction}
                            onPress={() => router.push(action.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                                <Ionicons name={action.icon} size={22} color={action.color} />
                            </View>
                            <Text style={styles.quickActionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const cardWidth = (width - Spacing.xxl * 2 - Spacing.md) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingTop: 60,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    greeting: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    userName: {
        fontSize: FontSize.xl,
        color: Colors.text,
        fontWeight: '800',
        marginTop: 2,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statsCard: {
        width: cardWidth,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    statsIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    statsValue: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 2,
    },
    statsLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    weeklyCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    weeklyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    weeklyTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
    },
    weeklyStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weeklyStat: {
        flex: 1,
        alignItems: 'center',
    },
    weeklyValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.text,
    },
    weeklyLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
        marginTop: 2,
    },
    weeklyDivider: {
        width: 1,
        height: 36,
        backgroundColor: Colors.cardBorder,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    viewAll: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: Spacing.lg,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: Colors.successBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: 4,
    },
    orderCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm + 2,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderAvatar: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    orderAvatarText: {
        color: Colors.white,
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    orderInfo: {
        flex: 1,
    },
    orderName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    orderNumber: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
        fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    orderRight: {
        alignItems: 'flex-end',
    },
    orderTotal: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    quickAction: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    quickActionText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
});
