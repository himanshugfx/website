import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function SubscribersScreen() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSubscribers = useCallback(async () => {
        try {
            const data = await api.getSubscribers();
            setSubscribers(data.subscribers || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadSubscribers(); }, [loadSubscribers]));

    const renderSubscriber = ({ item, index }: { item: any; index: number }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.avatar}>
                    <Ionicons name="mail" size={18} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.date}>
                        Subscribed {new Date(item.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? Colors.successBg : Colors.errorBg }]}>
                    <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.error }]}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{subscribers.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={[styles.summaryValue, { color: Colors.success }]}>
                        {subscribers.filter((s) => s.isActive).length}
                    </Text>
                    <Text style={styles.summaryLabel}>Active</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={subscribers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSubscriber}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSubscribers(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="newspaper-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No subscribers yet</Text>
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
        flexDirection: 'row',
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    summaryValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
    listContent: { padding: Spacing.xxl, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.primaryGlow,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    info: { flex: 1 },
    email: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    date: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: FontSize.xs, fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
