import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity,
    ActivityIndicator, Alert, Platform, Modal, TextInput, ScrollView, Switch
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function PromoCodesScreen() {
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        code: '', discountType: 'PERCENTAGE', discountValue: '',
        minOrderValue: '', maxDiscount: '', usageLimit: '', expiresAt: '',
    });

    const loadCodes = useCallback(async () => {
        try {
            const data = await api.getPromoCodes();
            setCodes(Array.isArray(data) ? data : data.promoCodes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadCodes(); }, [loadCodes]));

    async function handleCreate() {
        if (!formData.code || !formData.discountValue) {
            Alert.alert('Error', 'Please fill required fields (Code, Value)');
            return;
        }
        setCreating(true);
        try {
            await api.createPromoCode({
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : null,
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                expiresAt: formData.expiresAt || null,
            });
            setCreateModalOpen(false);
            setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', maxDiscount: '', usageLimit: '', expiresAt: '' });
            loadCodes();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create promo code');
        } finally {
            setCreating(false);
        }
    }

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, code: result });
    };

    async function handleDelete(id: string) {
        const doDelete = async () => {
            try {
                await api.deletePromoCode(id);
                setCodes((prev) => prev.filter((c) => c.id !== id));
            } catch {
                Platform.OS === 'web' ? alert('Failed') : Alert.alert('Error', 'Failed to delete');
            }
        };
        if (Platform.OS === 'web') { if (confirm('Delete this promo code?')) doDelete(); }
        else Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: doDelete }]);
    }

    const renderCode = ({ item }: { item: any }) => {
        const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

        return (
            <View style={[styles.card, !item.isActive && styles.inactiveCard]}>
                <View style={styles.codeHeader}>
                    <View style={styles.codeTag}>
                        <Ionicons name="pricetag" size={16} color={Colors.primary} />
                        <Text style={styles.codeText}>{item.code}</Text>
                    </View>
                    <TouchableOpacity onPress={async () => {
                        try {
                            const res = await fetch(`${api.API_BASE_URL}/api/admin/promocodes/${item.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${await SecureStore.getItemAsync('anose_admin_token')}`
                                },
                                body: JSON.stringify({ isActive: !item.isActive })
                            });
                            if (res.ok) {
                                setCodes(codes.map(c => c.id === item.id ? { ...c, isActive: !item.isActive } : c));
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Failed to toggle status');
                        }
                    }} style={[styles.statusBadge, {
                        backgroundColor: item.isActive && !isExpired ? Colors.successBg : Colors.errorBg
                    }]}>
                        <Text style={[styles.statusText, {
                            color: item.isActive && !isExpired ? Colors.success : Colors.error
                        }]}>
                            {isExpired ? 'Expired' : item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.detailsGrid}>
                    <View style={styles.detail}>
                        <Text style={styles.detailLabel}>Discount</Text>
                        <Text style={styles.detailValue}>
                            {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : `₹${item.discountValue}`}
                        </Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.detailLabel}>Used</Text>
                        <Text style={styles.detailValue}>
                            {item.usedCount}{item.usageLimit ? `/${item.usageLimit}` : ''}
                        </Text>
                    </View>
                    {item.minOrderValue > 0 && (
                        <View style={styles.detail}>
                            <Text style={styles.detailLabel}>Min Order</Text>
                            <Text style={styles.detailValue}>₹{item.minOrderValue}</Text>
                        </View>
                    )}
                    {item.maxDiscount && (
                        <View style={styles.detail}>
                            <Text style={styles.detailLabel}>Max Off</Text>
                            <Text style={styles.detailValue}>₹{item.maxDiscount}</Text>
                        </View>
                    )}
                </View>

                {item.expiresAt && (
                    <Text style={styles.expiryText}>
                        {isExpired ? 'Expired' : 'Expires'}: {new Date(item.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                )}

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={codes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCode}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCodes(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="pricetag-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No promo codes</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setCreateModalOpen(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Modal visible={createModalOpen} animationType="slide" presentationStyle="formSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Promo Code</Text>
                        <TouchableOpacity onPress={() => setCreateModalOpen(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Promo Code</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, textTransform: 'uppercase' }]}
                                value={formData.code}
                                onChangeText={t => setFormData({ ...formData, code: t.toUpperCase() })}
                                placeholder="SAVE20"
                                placeholderTextColor={Colors.textDim}
                            />
                            <TouchableOpacity style={styles.generateBtn} onPress={generateRandomCode}>
                                <Text style={styles.generateBtnText}>Generate</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Discount Type</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.typeBtn, formData.discountType === 'PERCENTAGE' && styles.typeBtnActive]}
                                onPress={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                            >
                                <Text style={[styles.typeBtnText, formData.discountType === 'PERCENTAGE' && styles.typeBtnTextActive]}>Percentage</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, formData.discountType === 'FIXED' && styles.typeBtnActive]}
                                onPress={() => setFormData({ ...formData, discountType: 'FIXED' })}
                            >
                                <Text style={[styles.typeBtnText, formData.discountType === 'FIXED' && styles.typeBtnTextActive]}>Fixed Amount</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{formData.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount (₹)'}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.discountValue}
                            onChangeText={t => setFormData({ ...formData, discountValue: t })}
                            placeholder="e.g. 20"
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Min Order Value (₹) - Optional</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.minOrderValue}
                            onChangeText={t => setFormData({ ...formData, minOrderValue: t })}
                            placeholder="e.g. 1000"
                            placeholderTextColor={Colors.textDim}
                        />

                        {formData.discountType === 'PERCENTAGE' && (
                            <>
                                <Text style={styles.label}>Max Discount (₹) - Optional</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={formData.maxDiscount}
                                    onChangeText={t => setFormData({ ...formData, maxDiscount: t })}
                                    placeholder="e.g. 500"
                                    placeholderTextColor={Colors.textDim}
                                />
                            </>
                        )}

                        <Text style={styles.label}>Usage Limit - Optional</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.usageLimit}
                            onChangeText={t => setFormData({ ...formData, usageLimit: t })}
                            placeholder="Unlimited"
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Expires At (YYYY-MM-DD) - Optional</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.expiresAt}
                            onChangeText={t => setFormData({ ...formData, expiresAt: t })}
                            placeholder="e.g. 2026-12-31"
                            placeholderTextColor={Colors.textDim}
                        />

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleCreate} disabled={creating}>
                            {creating ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSaveText}>Create Code</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        position: 'relative',
    },
    inactiveCard: { opacity: 0.6 },
    codeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    codeTag: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.primaryGlow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    },
    codeText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: FontSize.xs, fontWeight: '600' },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
    detail: {},
    detailLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
    detailValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    expiryText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
    deleteBtn: {
        position: 'absolute', top: Spacing.lg, right: Spacing.lg,
        width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.errorBg,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
    fab: {
        position: 'absolute', bottom: Spacing.xxxl, right: Spacing.xxxl,
        width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    },
    modalContainer: { flex: 1, backgroundColor: Colors.surface },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
    },
    modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    closeBtn: { padding: Spacing.xs },
    modalContent: { flex: 1, padding: Spacing.xl },
    label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.lg, fontWeight: '600' },
    input: {
        backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md,
    },
    row: { flexDirection: 'row', gap: Spacing.md },
    generateBtn: {
        backgroundColor: Colors.primaryGlow, paddingHorizontal: Spacing.lg, justifyContent: 'center',
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.primary,
    },
    generateBtnText: { color: Colors.primary, fontWeight: '600' },
    typeBtn: {
        flex: 1, padding: Spacing.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        borderRadius: BorderRadius.md, alignItems: 'center',
    },
    typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeBtnText: { color: Colors.textMuted, fontWeight: '600' },
    typeBtnTextActive: { color: Colors.white },
    modalFooter: {
        padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
        backgroundColor: Colors.surface, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    },
    modalSaveBtn: {
        backgroundColor: Colors.primary, padding: 16, borderRadius: BorderRadius.md, alignItems: 'center',
    },
    modalSaveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
