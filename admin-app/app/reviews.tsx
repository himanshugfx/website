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

export default function ReviewsScreen() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const loadReviews = useCallback(async () => {
        try {
            const data = await api.getReviews({ status: filter });
            setReviews(data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadReviews();
        }, [loadReviews])
    );

    async function handleApprove(id: string, approve: boolean) {
        try {
            await api.updateReview(id, approve);
            setReviews((prev) =>
                prev.map((r) => (r.id === id ? { ...r, isApproved: approve } : r))
            );
        } catch {
            const msg = 'Failed to update review';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
        }
    }

    async function handleDelete(id: string) {
        const doDelete = async () => {
            try {
                await api.deleteReview(id);
                setReviews((prev) => prev.filter((r) => r.id !== id));
            } catch {
                const msg = 'Failed to delete review';
                Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
            }
        };

        if (Platform.OS === 'web') {
            if (confirm('Delete this review?')) doDelete();
        } else {
            Alert.alert('Delete Review', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete },
            ]);
        }
    }

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={14} color={Colors.warning} />
                ))}
            </View>
        );
    };

    const renderReview = ({ item }: { item: any }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                    <Text style={styles.avatarText}>{item.customerName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.reviewInfo}>
                    <Text style={styles.reviewerName}>{item.customerName}</Text>
                    <Text style={styles.reviewProduct} numberOfLines={1}>{item.product?.name || 'Product'}</Text>
                </View>
                <View style={[
                    styles.approvalBadge,
                    { backgroundColor: item.isApproved ? Colors.successBg : Colors.warningBg }
                ]}>
                    <Text style={[
                        styles.approvalText,
                        { color: item.isApproved ? Colors.success : Colors.warning }
                    ]}>
                        {item.isApproved ? 'Approved' : 'Pending'}
                    </Text>
                </View>
            </View>

            {renderStars(item.rating)}
            {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
            <Text style={styles.reviewComment}>{item.comment}</Text>

            <View style={styles.reviewActions}>
                {!item.isApproved && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.successBg }]}
                        onPress={() => handleApprove(item.id, true)}
                    >
                        <Ionicons name="checkmark" size={16} color={Colors.success} />
                        <Text style={[styles.actionText, { color: Colors.success }]}>Approve</Text>
                    </TouchableOpacity>
                )}
                {item.isApproved && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.warningBg }]}
                        onPress={() => handleApprove(item.id, false)}
                    >
                        <Ionicons name="close" size={16} color={Colors.warning} />
                        <Text style={[styles.actionText, { color: Colors.warning }]}>Reject</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.errorBg }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Filters */}
            <View style={styles.filterRow}>
                {['all', 'pending', 'approved'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => { setFilter(f); setLoading(true); }}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReview}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadReviews(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="star-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No reviews found</Text>
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
    filterRow: {
        flexDirection: 'row',
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
    filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
    filterTextActive: { color: Colors.white },
    listContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
    reviewCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    avatarText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
    reviewInfo: { flex: 1 },
    reviewerName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    reviewProduct: { fontSize: FontSize.xs, color: Colors.textMuted },
    approvalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    approvalText: { fontSize: FontSize.xs, fontWeight: '600' },
    starsRow: { flexDirection: 'row', gap: 2, marginBottom: Spacing.sm },
    reviewTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
    reviewComment: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
    reviewActions: { flexDirection: 'row', gap: Spacing.sm },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
        gap: 4,
    },
    actionText: { fontSize: FontSize.xs, fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
