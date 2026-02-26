import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function InquiriesScreen() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadInquiries = useCallback(async () => {
        try {
            const data = await api.getInquiries();
            setInquiries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadInquiries(); }, [loadInquiries]));

    async function handleUpdateStatus(id: string, status: string) {
        try {
            await api.updateInquiryStatus(id, status);
            setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
        } catch {
            Platform.OS === 'web' ? alert('Failed to update') : Alert.alert('Error', 'Failed to update');
        }
    }

    async function handleDelete(id: string) {
        const doDelete = async () => {
            try {
                await api.deleteInquiry(id);
                setInquiries((prev) => prev.filter((i) => i.id !== id));
            } catch {
                Platform.OS === 'web' ? alert('Failed to delete') : Alert.alert('Error', 'Failed to delete');
            }
        };
        if (Platform.OS === 'web') { if (confirm('Delete?')) doDelete(); }
        else Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: doDelete }]);
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'UNREAD': return { icon: 'mail-unread' as const, color: Colors.warning };
            case 'READ': return { icon: 'mail-open' as const, color: Colors.info };
            case 'ARCHIVED': return { icon: 'archive' as const, color: Colors.textMuted };
            default: return { icon: 'mail' as const, color: Colors.textMuted };
        }
    }

    const renderInquiry = ({ item }: { item: any }) => {
        const si = getStatusIcon(item.status);
        return (
            <View style={[styles.card, item.status === 'UNREAD' && styles.unreadCard]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: si.color + '18' }]}>
                        <Ionicons name={si.icon} size={20} color={si.color} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                {item.phone && (
                    <View style={styles.phoneRow}>
                        <Ionicons name="call-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.phone}>{item.phone}</Text>
                    </View>
                )}
                <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
                <View style={styles.actions}>
                    {item.status === 'UNREAD' && (
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.infoBg }]} onPress={() => handleUpdateStatus(item.id, 'READ')}>
                            <Ionicons name="checkmark" size={14} color={Colors.info} />
                            <Text style={[styles.actionText, { color: Colors.info }]}>Mark Read</Text>
                        </TouchableOpacity>
                    )}
                    {item.status !== 'ARCHIVED' && (
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primaryGlow }]} onPress={() => handleUpdateStatus(item.id, 'ARCHIVED')}>
                            <Ionicons name="archive" size={14} color={Colors.primary} />
                            <Text style={[styles.actionText, { color: Colors.primary }]}>Archive</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.errorBg }]} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash-outline" size={14} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={inquiries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderInquiry}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadInquiries(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="mail-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No inquiries</Text>
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
    listContent: { padding: Spacing.xxl, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    unreadCard: { borderLeftWidth: 3, borderLeftColor: Colors.warning },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    iconBg: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
    headerInfo: { flex: 1 },
    name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    email: { fontSize: FontSize.xs, color: Colors.textMuted },
    date: { fontSize: FontSize.xs, color: Colors.textDim },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
    phone: { fontSize: FontSize.xs, color: Colors.textMuted },
    message: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
    actions: { flexDirection: 'row', gap: Spacing.sm },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 8, gap: 4 },
    actionText: { fontSize: FontSize.xs, fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
