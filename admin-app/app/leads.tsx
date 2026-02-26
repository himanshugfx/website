import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator,
    TouchableOpacity, Modal, TextInput, ScrollView, Alert, Platform
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function LeadsScreen() {
    const [stages, setStages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedStage, setExpandedStage] = useState<string | null>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', company: '', value: '', stageId: '', source: 'MANUAL', notes: ''
    });

    const loadLeads = useCallback(async () => {
        try {
            const data = await api.getLeads();
            setStages(Array.isArray(data) ? data : data.stages || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadLeads(); }, [loadLeads]));

    const openCreateModal = () => {
        setEditingLeadId(null);
        setFormData({ name: '', email: '', phone: '', company: '', value: '', stageId: stages[0]?.id || '', source: 'MANUAL', notes: '' });
        setModalVisible(true);
    };

    const openEditModal = (lead: any) => {
        setEditingLeadId(lead.id);
        setFormData({
            name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
            company: lead.company || '', value: lead.value ? String(lead.value) : '',
            stageId: lead.stageId || '', source: lead.source || 'MANUAL', notes: lead.notes || ''
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.stageId) {
            Alert.alert('Error', 'Name and Stage are required');
            return;
        }
        setSaving(true);
        try {
            if (editingLeadId) {
                await api.updateLead(editingLeadId, formData);
            } else {
                await api.createLead(formData);
            }
            setModalVisible(false);
            loadLeads();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save lead');
        } finally {
            setSaving(false);
        }
    };

    const totalLeads = stages.reduce((sum: number, s: any) => sum + (s.leads?.length || 0), 0);

    const renderStage = ({ item: stage }: { item: any }) => {
        const isExpanded = expandedStage === stage.id;
        const leadCount = stage.leads?.length || 0;

        return (
            <View style={styles.stageCard}>
                <TouchableOpacity
                    style={styles.stageHeader}
                    onPress={() => setExpandedStage(isExpanded ? null : stage.id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.stageColor, { backgroundColor: stage.color || Colors.primary }]} />
                    <View style={styles.stageInfo}>
                        <Text style={styles.stageName}>{stage.name}</Text>
                        <Text style={styles.stageCount}>{leadCount} lead{leadCount !== 1 ? 's' : ''}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.textMuted}
                    />
                </TouchableOpacity>

                {isExpanded && stage.leads && stage.leads.length > 0 && (
                    <View style={styles.leadsContainer}>
                        {stage.leads.map((lead: any, idx: number) => (
                            <TouchableOpacity
                                key={lead.id}
                                style={[styles.leadCard, idx < stage.leads.length - 1 && styles.leadBorder]}
                                onPress={() => openEditModal(lead)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.leadRow}>
                                    <View style={styles.leadAvatar}>
                                        <Text style={styles.leadAvatarText}>
                                            {(lead.name || 'L').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.leadInfo}>
                                        <Text style={styles.leadName}>{lead.name}</Text>
                                        <Text style={styles.leadEmail}>{lead.email}</Text>
                                        {lead.phone && <Text style={styles.leadPhone}>{lead.phone}</Text>}
                                    </View>
                                    {lead.value && (
                                        <Text style={styles.leadValue}>₹{lead.value.toLocaleString('en-IN')}</Text>
                                    )}
                                </View>
                                {lead.source && (
                                    <View style={styles.sourceTag}>
                                        <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                                        <Text style={styles.sourceText}>{lead.source}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {isExpanded && (!stage.leads || stage.leads.length === 0) && (
                    <View style={styles.emptyLeads}>
                        <Text style={styles.emptyLeadsText}>No leads in this stage</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Summary */}
            <View style={styles.summaryBar}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{totalLeads}</Text>
                    <Text style={styles.summaryLabel}>Total Leads</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={[styles.summaryValue, { color: Colors.primary }]}>{stages.length}</Text>
                    <Text style={styles.summaryLabel}>Stages</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={stages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderStage}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLeads(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="funnel-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No funnel stages configured</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={openCreateModal}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingLeadId ? 'Edit Lead' : 'Add Lead'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Stage *</Text>
                        <View style={styles.stagesGrid}>
                            {stages.map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.stageSelectBtn, formData.stageId === s.id && styles.stageSelectBtnActive, { borderColor: formData.stageId === s.id ? s.color : Colors.cardBorder }]}
                                    onPress={() => setFormData({ ...formData, stageId: s.id })}
                                >
                                    <Text style={[styles.stageSelectText, formData.stageId === s.id && { color: s.color, fontWeight: '700' }]}>{s.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { marginTop: Spacing.md }]}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            placeholder="John Doe"
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Estimated Value (₹) - Optional</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.value}
                            keyboardType="numeric"
                            onChangeText={t => setFormData({ ...formData, value: t })}
                            placeholder="e.g. 5000"
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Email - Optional</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={t => setFormData({ ...formData, email: t })}
                            placeholder="john@example.com"
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Phone - Optional</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            keyboardType="phone-pad"
                            onChangeText={t => setFormData({ ...formData, phone: t })}
                            placeholder="+91..."
                            placeholderTextColor={Colors.textDim}
                        />

                        <Text style={styles.label}>Company - Optional</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.company}
                            onChangeText={t => setFormData({ ...formData, company: t })}
                            placeholder="Acme Corp"
                            placeholderTextColor={Colors.textDim}
                        />

                        <View style={{ height: 60 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSaveText}>Save Lead</Text>}
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
    summaryBar: {
        flexDirection: 'row', paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, gap: Spacing.md,
    },
    summaryCard: {
        flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
        padding: Spacing.lg, alignItems: 'center',
        borderWidth: 1, borderColor: Colors.cardBorder,
    },
    summaryValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
    listContent: { padding: Spacing.xxl, paddingBottom: 40 },
    stageCard: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden',
    },
    stageHeader: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    },
    stageColor: { width: 4, height: 32, borderRadius: 2, marginRight: Spacing.md },
    stageInfo: { flex: 1 },
    stageName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    stageCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    leadsContainer: { borderTopWidth: 1, borderTopColor: Colors.cardBorder },
    leadCard: { padding: Spacing.lg },
    leadBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
    leadRow: { flexDirection: 'row', alignItems: 'center' },
    leadAvatar: {
        width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.card,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    leadAvatarText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
    leadInfo: { flex: 1 },
    leadName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
    leadEmail: { fontSize: FontSize.xs, color: Colors.textMuted },
    leadPhone: { fontSize: FontSize.xs, color: Colors.textDim },
    leadValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.success },
    sourceTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginTop: Spacing.sm, paddingLeft: 46,
    },
    sourceText: { fontSize: FontSize.xs, color: Colors.textMuted },
    emptyLeads: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
    emptyLeadsText: { fontSize: FontSize.sm, color: Colors.textDim, textAlign: 'center' },
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
    stagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    stageSelectBtn: {
        backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    },
    stageSelectBtnActive: { backgroundColor: Colors.elevated, borderWidth: 2 },
    stageSelectText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
    modalFooter: {
        padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
        backgroundColor: Colors.surface, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    },
    modalSaveBtn: {
        backgroundColor: Colors.primary, padding: 16, borderRadius: BorderRadius.md, alignItems: 'center',
    },
    modalSaveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
