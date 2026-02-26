import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function AbandonedScreen() {
    const [checkouts, setCheckouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCheckouts = useCallback(async () => {
        try {
            const data = await api.getAbandonedCheckouts();
            setCheckouts(Array.isArray(data) ? data : data.checkouts || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadCheckouts(); }, [loadCheckouts]));

    const totalValue = checkouts.reduce((sum: number, c: any) => sum + (c.total || 0), 0);

    const renderCheckout = ({ item }: { item: any }) => {
        const name = item.customerName || item.customerEmail || 'Anonymous';
        const isRecovered = item.status === 'RECOVERED';

        return (
            <View style={[styles.card, isRecovered && styles.recoveredCard]}>
                <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                        <Ionicons
                            name={isRecovered ? 'checkmark-circle' : 'cart'}
                            size={20}
                            color={isRecovered ? Colors.success : Colors.error}
                        />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>{name}</Text>
                        {item.customerPhone && (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                                onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="call" size={14} color={Colors.primary} />
                                <Text style={[styles.phone, { color: Colors.primary, marginTop: 0 }]}>{item.customerPhone}</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.date}>
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                    <View style={styles.rightCol}>
                        {item.total && (
                            <Text style={styles.total}>₹{item.total.toLocaleString('en-IN')}</Text>
                        )}
                        <View style={[styles.statusBadge, {
                            backgroundColor: isRecovered ? Colors.successBg : Colors.errorBg,
                        }]}>
                            <Text style={[styles.statusText, {
                                color: isRecovered ? Colors.success : Colors.error,
                            }]}>
                                {isRecovered ? 'Recovered' : 'Abandoned'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Source & Location */}
                <View style={styles.metaRow}>
                    {item.source && (
                        <View style={styles.metaTag}>
                            <Ionicons name="layers-outline" size={12} color={Colors.textMuted} />
                            <Text style={styles.metaText}>{item.source}</Text>
                        </View>
                    )}
                    {item.city && (
                        <View style={styles.metaTag}>
                            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                            <Text style={styles.metaText}>{item.city}{item.country ? `, ${item.country}` : ''}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Ionicons name="cart-outline" size={22} color={Colors.error} />
                    <Text style={styles.summaryValue}>{checkouts.length}</Text>
                    <Text style={styles.summaryLabel}>Abandoned</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Ionicons name="cash-outline" size={22} color={Colors.warning} />
                    <Text style={styles.summaryValue}>₹{totalValue.toLocaleString('en-IN')}</Text>
                    <Text style={styles.summaryLabel}>Lost Revenue</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Ionicons name="refresh-outline" size={22} color={Colors.success} />
                    <Text style={styles.summaryValue}>
                        {checkouts.filter((c: any) => c.status === 'RECOVERED').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Recovered</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={checkouts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCheckout}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCheckouts(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="cart-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No abandoned checkouts</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summaryRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, gap: Spacing.sm,
    },
    summaryCard: {
        flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
        padding: Spacing.md, alignItems: 'center',
        borderWidth: 1, borderColor: Colors.cardBorder, gap: 4,
    },
    summaryValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
    summaryLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
    listContent: { padding: Spacing.xxl, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.md,
        borderWidth: 1, borderColor: Colors.cardBorder,
    },
    recoveredCard: { borderLeftWidth: 3, borderLeftColor: Colors.success },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.errorBg,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    info: { flex: 1 },
    name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    phone: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
    date: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: 2 },
    rightCol: { alignItems: 'flex-end' },
    total: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '600' },
    metaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
    metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
