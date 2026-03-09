import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
    TextInput, Alert, Platform, RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function LeadDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [lead, setLead] = useState<any>(null);
    const [stages, setStages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Editing states
    const [editingContact, setEditingContact] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '' });
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesText, setNotesText] = useState('');
    const [valueText, setValueText] = useState('');

    // Activity note
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    // Follow-ups
    const [followUps, setFollowUps] = useState<any[]>([]);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpNotes, setFollowUpNotes] = useState('');

    const loadData = useCallback(async () => {
        if (!id) return;
        try {
            const [leadData, funnelData] = await Promise.all([
                api.getLeadDetail(id),
                api.getLeads(),
            ]);
            setLead(leadData);
            setStages(funnelData.stages || []);
            setContactForm({
                name: leadData.name || '',
                email: leadData.email || '',
                phone: leadData.phone || '',
                company: leadData.company || '',
            });
            setNotesText(leadData.notes || '');
            setValueText(leadData.value ? String(leadData.value) : '');

            // Load follow-ups
            try {
                const fups = await api.getFollowUps(id);
                setFollowUps(fups);
            } catch { }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to load lead details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleStageChange = async (newStageId: string) => {
        if (!lead || newStageId === lead.stageId) return;
        setSaving(true);
        try {
            const updated = await api.updateLead(lead.id, { stageId: newStageId });
            setLead(updated);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update stage');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveValue = async () => {
        setSaving(true);
        try {
            const updated = await api.updateLead(lead.id, {
                value: valueText ? parseFloat(valueText) : null,
            });
            setLead(updated);
            Alert.alert('Saved', 'Lead value updated');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save value');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContact = async () => {
        if (!contactForm.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        setSaving(true);
        try {
            const updated = await api.updateLead(lead.id, {
                name: contactForm.name,
                email: contactForm.email || null,
                phone: contactForm.phone || null,
                company: contactForm.company || null,
            });
            setLead(updated);
            setEditingContact(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save contact');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            const updated = await api.updateLead(lead.id, { notes: notesText || null });
            setLead(updated);
            setEditingNotes(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setAddingNote(true);
        try {
            const activity = await api.addLeadNote(lead.id, newNote);
            setLead((prev: any) => ({
                ...prev,
                activities: [activity, ...(prev.activities || [])],
            }));
            setNewNote('');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to add note');
        } finally {
            setAddingNote(false);
        }
    };

    const handleAddFollowUp = async () => {
        if (!followUpDate.trim()) {
            Alert.alert('Error', 'Please enter a date (YYYY-MM-DD HH:MM format)');
            return;
        }
        try {
            const scheduledAt = new Date(followUpDate).toISOString();
            const fu = await api.addFollowUp(lead.id, {
                scheduledAt,
                notes: followUpNotes || undefined,
            });
            setFollowUps(prev => [...prev, fu]);
            setFollowUpDate('');
            setFollowUpNotes('');
            setShowFollowUpForm(false);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to add follow-up');
        }
    };

    const handleCompleteFollowUp = async (fuId: string) => {
        try {
            await api.completeFollowUp(lead.id, fuId);
            setFollowUps(prev => prev.map(f =>
                f.id === fuId ? { ...f, status: 'COMPLETED', completedAt: new Date().toISOString() } : f
            ));
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to complete follow-up');
        }
    };

    const handleDeleteFollowUp = async (fuId: string) => {
        try {
            await api.deleteFollowUp(lead.id, fuId);
            setFollowUps(prev => prev.filter(f => f.id !== fuId));
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete follow-up');
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Lead', `Delete "${lead.name}"? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteLead(lead.id);
                        router.back();
                    } catch (e: any) {
                        Alert.alert('Error', e.message || 'Failed to delete');
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!lead) {
        return (
            <View style={styles.loader}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Lead not found</Text>
            </View>
        );
    }

    const pendingFollowUps = followUps.filter(f => f.status === 'PENDING');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadData(); }}
                    tintColor={Colors.primary}
                />
            }
        >
            {/* Header with stage badge */}
            <View style={styles.headerCard}>
                <View style={styles.headerRow}>
                    <View style={styles.avatarLg}>
                        <Text style={styles.avatarLgText}>{lead.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{lead.name}</Text>
                        <View style={[styles.stageBadge, { backgroundColor: `${lead.stage?.color || Colors.primary}30` }]}>
                            <Text style={[styles.stageBadgeText, { color: lead.stage?.color || Colors.primary }]}>
                                {lead.stage?.name || 'Unknown'}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.createdAt}>
                    Added on {new Date(lead.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </Text>
            </View>

            {/* Stage Selector */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Stage</Text>
                <View style={styles.stagesRow}>
                    {stages.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={[
                                styles.stageChip,
                                lead.stageId === s.id && { backgroundColor: `${s.color}30`, borderColor: s.color },
                            ]}
                            onPress={() => handleStageChange(s.id)}
                            disabled={saving}
                        >
                            <View style={[styles.stageDot, { backgroundColor: s.color }]} />
                            <Text style={[
                                styles.stageChipText,
                                lead.stageId === s.id && { color: s.color, fontWeight: '700' },
                            ]}>{s.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Contact Info */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    {!editingContact && (
                        <TouchableOpacity onPress={() => setEditingContact(true)}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {editingContact ? (
                    <View style={styles.formGroup}>
                        <TextInput style={styles.input} value={contactForm.name} onChangeText={t => setContactForm({ ...contactForm, name: t })} placeholder="Name *" placeholderTextColor={Colors.textDim} />
                        <TextInput style={styles.input} value={contactForm.email} onChangeText={t => setContactForm({ ...contactForm, email: t })} placeholder="Email" placeholderTextColor={Colors.textDim} keyboardType="email-address" autoCapitalize="none" />
                        <TextInput style={styles.input} value={contactForm.phone} onChangeText={t => setContactForm({ ...contactForm, phone: t })} placeholder="Phone" placeholderTextColor={Colors.textDim} keyboardType="phone-pad" />
                        <TextInput style={styles.input} value={contactForm.company} onChangeText={t => setContactForm({ ...contactForm, company: t })} placeholder="Company" placeholderTextColor={Colors.textDim} />
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveContact} disabled={saving}>
                                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                                setEditingContact(false);
                                setContactForm({ name: lead.name, email: lead.email || '', phone: lead.phone || '', company: lead.company || '' });
                            }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.contactDetails}>
                        <View style={styles.contactRow}>
                            <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
                            <Text style={styles.contactText}>{lead.name}</Text>
                        </View>
                        {lead.email ? (
                            <View style={styles.contactRow}>
                                <Ionicons name="mail-outline" size={16} color={Colors.textMuted} />
                                <Text style={styles.contactText}>{lead.email}</Text>
                            </View>
                        ) : null}
                        {lead.phone ? (
                            <View style={styles.contactRow}>
                                <Ionicons name="call-outline" size={16} color={Colors.textMuted} />
                                <Text style={styles.contactText}>{lead.phone}</Text>
                            </View>
                        ) : null}
                        {lead.company ? (
                            <View style={styles.contactRow}>
                                <Ionicons name="business-outline" size={16} color={Colors.textMuted} />
                                <Text style={styles.contactText}>{lead.company}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </View>

            {/* Value */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Lead Value (₹)</Text>
                <View style={[styles.btnRow, { marginTop: Spacing.sm }]}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={valueText}
                        onChangeText={setValueText}
                        placeholder="0"
                        placeholderTextColor={Colors.textDim}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveValue} disabled={saving}>
                        {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notes */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    {!editingNotes ? (
                        <TouchableOpacity onPress={() => setEditingNotes(true)}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
                {editingNotes ? (
                    <View style={styles.formGroup}>
                        <TextInput
                            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                            value={notesText}
                            onChangeText={setNotesText}
                            placeholder="Add notes about this lead..."
                            placeholderTextColor={Colors.textDim}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes} disabled={saving}>
                                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditingNotes(false); setNotesText(lead.notes || ''); }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.notesText}>
                        {lead.notes || 'No notes yet. Tap Edit to add.'}
                    </Text>
                )}
            </View>

            {/* Add Note to Timeline */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Add Note to Timeline</Text>
                <TextInput
                    style={[styles.input, { minHeight: 60, textAlignVertical: 'top', marginTop: Spacing.sm }]}
                    value={newNote}
                    onChangeText={setNewNote}
                    placeholder="Write a note..."
                    placeholderTextColor={Colors.textDim}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.saveBtn, { marginTop: Spacing.sm, alignSelf: 'flex-start' }]}
                    onPress={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                >
                    {addingNote ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="send" size={14} color={Colors.white} />
                            <Text style={styles.saveBtnText}>Add Note</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Activity Timeline */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Activity Timeline</Text>
                {(!lead.activities || lead.activities.length === 0) ? (
                    <Text style={styles.emptyText}>No activity recorded yet</Text>
                ) : (
                    lead.activities.map((act: any) => (
                        <View key={act.id} style={styles.activityRow}>
                            <View style={[styles.activityIcon, {
                                backgroundColor: act.type === 'NOTE' ? 'rgba(124, 58, 237, 0.15)' :
                                    act.type === 'STAGE_CHANGE' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 131, 168, 0.15)'
                            }]}>
                                <Ionicons
                                    name={act.type === 'NOTE' ? 'chatbox-outline' : act.type === 'STAGE_CHANGE' ? 'swap-horizontal' : 'ellipse-outline'}
                                    size={14}
                                    color={act.type === 'NOTE' ? Colors.primary : act.type === 'STAGE_CHANGE' ? Colors.info : Colors.textMuted}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityType}>{act.type.replace('_', ' ')}</Text>
                                <Text style={styles.activityText}>{act.content}</Text>
                                <Text style={styles.activityTime}>
                                    {new Date(act.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Follow-ups */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="notifications-outline" size={16} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Follow-ups</Text>
                    </View>
                    {!showFollowUpForm && (
                        <TouchableOpacity onPress={() => setShowFollowUpForm(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="add" size={16} color={Colors.primary} />
                                <Text style={styles.editLink}>Schedule</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {showFollowUpForm && (
                    <View style={[styles.formGroup, { backgroundColor: Colors.elevated, padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.sm }]}>
                        <Text style={styles.inputLabel}>Date & Time (YYYY-MM-DD HH:MM)</Text>
                        <TextInput
                            style={styles.input}
                            value={followUpDate}
                            onChangeText={setFollowUpDate}
                            placeholder="2026-03-15 10:00"
                            placeholderTextColor={Colors.textDim}
                        />
                        <Text style={[styles.inputLabel, { marginTop: Spacing.sm }]}>Notes (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={followUpNotes}
                            onChangeText={setFollowUpNotes}
                            placeholder="What to discuss..."
                            placeholderTextColor={Colors.textDim}
                        />
                        <View style={[styles.btnRow, { marginTop: Spacing.sm }]}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddFollowUp}>
                                <Text style={styles.saveBtnText}>Schedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                                setShowFollowUpForm(false);
                                setFollowUpDate('');
                                setFollowUpNotes('');
                            }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {pendingFollowUps.length === 0 ? (
                    <Text style={styles.emptyText}>No scheduled follow-ups</Text>
                ) : (
                    pendingFollowUps.map(fu => {
                        const isOverdue = new Date(fu.scheduledAt) < new Date();
                        return (
                            <View key={fu.id} style={[styles.followUpCard, isOverdue && styles.followUpOverdue]}>
                                <View style={styles.followUpRow}>
                                    <Ionicons name="time-outline" size={16} color={isOverdue ? Colors.error : Colors.primary} />
                                    <Text style={[styles.followUpDate, isOverdue && { color: Colors.error }]}>
                                        {new Date(fu.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </Text>
                                    {isOverdue && (
                                        <View style={styles.overdueBadge}>
                                            <Text style={styles.overdueText}>Overdue</Text>
                                        </View>
                                    )}
                                </View>
                                {fu.notes && <Text style={styles.followUpNotes}>{fu.notes}</Text>}
                                <View style={[styles.btnRow, { marginTop: Spacing.sm }]}>
                                    <TouchableOpacity
                                        style={[styles.iconBtn, { backgroundColor: Colors.successBg }]}
                                        onPress={() => handleCompleteFollowUp(fu.id)}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.iconBtn, { backgroundColor: Colors.errorBg }]}
                                        onPress={() => handleDeleteFollowUp(fu.id)}
                                    >
                                        <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>

            {/* Source & Meta */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.contactRow}>
                    <Ionicons name="pricetag-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.contactText}>Source: {lead.source}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.contactText}>
                        Created: {new Date(lead.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </Text>
                </View>
            </View>

            {/* Delete */}
            <TouchableOpacity style={styles.deleteCard} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                <Text style={styles.deleteText}>Delete Lead</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    contentContainer: { padding: Spacing.xxl },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    errorText: { color: Colors.error, fontSize: FontSize.md, marginTop: Spacing.md },

    headerCard: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl,
        borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.md,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    avatarLg: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryGlow,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarLgText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
    headerInfo: { flex: 1 },
    headerName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
    stageBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 4 },
    stageBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
    createdAt: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: Spacing.sm },

    sectionCard: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.md,
    },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
    editLink: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },

    stagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
    stageChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.cardBorder,
        backgroundColor: Colors.card,
    },
    stageDot: { width: 8, height: 8, borderRadius: 4 },
    stageChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMuted },

    contactDetails: { gap: Spacing.sm, marginTop: Spacing.md },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    contactText: { fontSize: FontSize.sm, color: Colors.textSecondary },

    formGroup: { gap: Spacing.sm, marginTop: Spacing.md },
    input: {
        backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md,
    },
    inputLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
    btnRow: { flexDirection: 'row', gap: Spacing.sm },
    saveBtn: {
        backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center',
    },
    saveBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
    cancelBtn: {
        backgroundColor: Colors.card, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: Colors.cardBorder,
    },
    cancelBtnText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },

    notesText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
    emptyText: { fontSize: FontSize.sm, color: Colors.textDim, textAlign: 'center', paddingVertical: Spacing.xl },

    activityRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
    activityIcon: {
        width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    },
    activityContent: { flex: 1 },
    activityType: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' },
    activityText: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2 },
    activityTime: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: 4 },

    followUpCard: {
        backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md,
        marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.cardBorder,
    },
    followUpOverdue: { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: Colors.errorBg },
    followUpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    followUpDate: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, flex: 1 },
    overdueBadge: { backgroundColor: Colors.errorBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    overdueText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: '600' },
    followUpNotes: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm, paddingLeft: 24 },

    iconBtn: {
        width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    },

    deleteCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        backgroundColor: Colors.errorBg, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    deleteText: { color: Colors.error, fontSize: FontSize.md, fontWeight: '700' },
});
