import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export default function OrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const router = useRouter();

    const loadOrders = useCallback(async (p = 1, append = false) => {
        try {
            const params: any = { page: p, limit: 15 };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (search.trim()) params.search = search.trim();

            const data = await api.getOrders(params);
            if (append) {
                setOrders((prev) => [...prev, ...(data.orders || [])]);
            } else {
                setOrders(data.orders || []);
            }
            setTotalPages(data.totalPages || 1);
            setPage(p);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [statusFilter, search]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadOrders(1);
        }, [loadOrders])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders(1);
    };

    const loadMore = () => {
        if (page < totalPages && !loadingMore) {
            setLoadingMore(true);
            loadOrders(page + 1, true);
        }
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

    function getPaymentColor(status: string) {
        switch (status) {
            case 'PAID':
                return Colors.success;
            case 'PENDING':
                return Colors.warning;
            case 'FAILED':
                return Colors.error;
            default:
                return Colors.textMuted;
        }
    }

    const renderOrder = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/order/${item.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.orderTop}>
                <View style={styles.orderAvatar}>
                    <Text style={styles.avatarText}>
                        {(item.customerName || item.user?.name || 'G').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderName} numberOfLines={1}>
                        {item.customerName || item.user?.name || 'Guest'}
                    </Text>
                    <Text style={styles.orderMeta}>
                        #{item.orderNumber} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <Text style={styles.orderTotal}>₹{item.total.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.orderBottom}>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '18' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getPaymentColor(item.paymentStatus) + '18' }]}>
                    <Text style={[styles.badgeText, { color: getPaymentColor(item.paymentStatus) }]}>
                        {item.paymentMethod} · {item.paymentStatus}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Orders</Text>
                <Text style={styles.headerSubtitle}>{orders.length} orders</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, email, order #..."
                    placeholderTextColor={Colors.textDim}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => {
                        setLoading(true);
                        loadOrders(1);
                    }}
                    returnKeyType="search"
                />
                {search ? (
                    <TouchableOpacity onPress={() => { setSearch(''); setLoading(true); loadOrders(1); }}>
                        <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Status Filters */}
            <FlatList
                horizontal
                data={STATUS_FILTERS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.filterChip, statusFilter === item && styles.filterChipActive]}
                        onPress={() => {
                            setStatusFilter(item);
                            setLoading(true);
                        }}
                    >
                        <Text style={[styles.filterChipText, statusFilter === item && styles.filterChipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Orders List */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.lg }} /> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No orders found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.xxl,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 46,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Colors.text,
        fontSize: FontSize.md,
        height: '100%',
    },
    filterContainer: {
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterChipText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    filterChipTextActive: {
        color: Colors.white,
    },
    listContent: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: 40,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm + 2,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    orderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    orderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
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
    orderMeta: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    orderTotal: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.text,
    },
    orderBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 5,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    badgeText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
        fontWeight: '500',
    },
});
