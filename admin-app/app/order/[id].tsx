import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            const data = await api.getOrderDetail(id);
            setOrder(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(newStatus: string) {
        setUpdating(true);
        try {
            await api.updateOrderStatus(id, newStatus);
            setOrder((prev: any) => ({ ...prev, status: newStatus }));
            if (Platform.OS === 'web') {
                alert('Status updated!');
            } else {
                Alert.alert('Success', `Order status updated to ${newStatus}`);
            }
        } catch (err) {
            if (Platform.OS === 'web') {
                alert('Failed to update status');
            } else {
                Alert.alert('Error', 'Failed to update status');
            }
        } finally {
            setUpdating(false);
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'COMPLETED': case 'DELIVERED': return Colors.success;
            case 'PENDING': return Colors.warning;
            case 'PROCESSING': case 'SHIPPED': return Colors.info;
            case 'CANCELLED': return Colors.error;
            default: return Colors.textMuted;
        }
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.loader}>
                <Ionicons name="alert-circle" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const statusColor = getStatusColor(order.status);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Order Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.orderIdRow}>
                    <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
                    </View>
                </View>
                <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </Text>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{order.total.toLocaleString('en-IN')}</Text>
                </View>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                        <Text style={styles.infoText}>{order.customerName || order.user?.name || 'Guest'}</Text>
                    </View>
                    {(order.customerEmail || order.user?.email) && (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                            <Text style={styles.infoText}>{order.customerEmail || order.user?.email}</Text>
                        </View>
                    )}
                    {order.customerPhone && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                            <Text style={styles.infoText}>{order.customerPhone}</Text>
                        </View>
                    )}
                    {order.address && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                            <Text style={[styles.infoText, { flex: 1 }]}>{order.address}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Payment Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.card}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Method</Text>
                        <Text style={styles.paymentValue}>{order.paymentMethod}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Status</Text>
                        <Text style={[styles.paymentValue, {
                            color: order.paymentStatus === 'PAID' ? Colors.success : Colors.warning
                        }]}>
                            {order.paymentStatus}
                        </Text>
                    </View>
                    {order.promoCode && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Promo</Text>
                            <Text style={[styles.paymentValue, { color: Colors.primary }]}>{order.promoCode}</Text>
                        </View>
                    )}
                    {order.discountAmount > 0 && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Discount</Text>
                            <Text style={[styles.paymentValue, { color: Colors.success }]}>-₹{order.discountAmount}</Text>
                        </View>
                    )}
                    {order.shippingFee > 0 && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Shipping</Text>
                            <Text style={styles.paymentValue}>₹{order.shippingFee}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Shipping Info */}
            {order.awbNumber && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping</Text>
                    <View style={styles.card}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Provider</Text>
                            <Text style={styles.paymentValue}>{order.shippingProvider}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>AWB</Text>
                            <Text style={[styles.paymentValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
                                {order.awbNumber}
                            </Text>
                        </View>
                        {order.shippingStatus && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Status</Text>
                                <Text style={styles.paymentValue}>{order.shippingStatus}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
                    <View style={styles.card}>
                        {order.items.map((item: any, idx: number) => (
                            <View key={item.id} style={[styles.itemRow, idx < order.items.length - 1 && styles.itemBorder]}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.product?.name || 'Product'}</Text>
                                    <Text style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</Text>
                                </View>
                                <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toLocaleString('en-IN')}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Update Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Update Status</Text>
                <View style={styles.statusGrid}>
                    {STATUS_OPTIONS.map((s) => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusOption,
                                order.status === s && styles.statusOptionActive,
                                order.status === s && { borderColor: getStatusColor(s) },
                            ]}
                            onPress={() => order.status !== s && handleStatusUpdate(s)}
                            disabled={updating || order.status === s}
                            activeOpacity={0.7}
                        >
                            {updating && order.status !== s ? null : (
                                <View style={[styles.statusOptionDot, { backgroundColor: getStatusColor(s) }]} />
                            )}
                            <Text style={[
                                styles.statusOptionText,
                                order.status === s && { color: getStatusColor(s), fontWeight: '700' }
                            ]}>
                                {s}
                            </Text>
                            {order.status === s && (
                                <Ionicons name="checkmark-circle" size={16} color={getStatusColor(s)} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.xxl,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        gap: Spacing.md,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSize.md,
        fontWeight: '500',
    },
    headerCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    orderIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 5,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statusText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
    },
    orderDate: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    totalLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    totalValue: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    infoText: {
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '500',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    paymentLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    paymentValue: {
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '600',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    itemMeta: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    itemTotal: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: Spacing.md,
    },
    statusGrid: {
        gap: Spacing.sm,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        gap: Spacing.sm,
    },
    statusOptionActive: {
        borderWidth: 2,
        backgroundColor: Colors.card,
    },
    statusOptionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusOptionText: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '500',
    },
});
