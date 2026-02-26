import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

export default function UsersScreen() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            const data = await api.getUsers();
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { setLoading(true); loadUsers(); }, [loadUsers]));

    const renderUser = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={[styles.avatar, item.role === 'admin' && { backgroundColor: Colors.primaryGlow }]}>
                    <Text style={[styles.avatarText, item.role === 'admin' && { color: Colors.primary }]}>
                        {(item.name || item.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name || 'No Name'}</Text>
                    <Text style={styles.email}>{item.email || 'No email'}</Text>
                </View>
                <View style={[styles.roleBadge, {
                    backgroundColor: item.role === 'admin' ? Colors.primaryGlow : Colors.card
                }]}>
                    <Text style={[styles.roleText, {
                        color: item.role === 'admin' ? Colors.primary : Colors.textMuted
                    }]}>
                        {item.role}
                    </Text>
                </View>
            </View>
            <Text style={styles.joined}>
                Joined {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.countBar}>
                <Text style={styles.countText}>{users.length} users</Text>
                <Text style={styles.countText}>
                    {users.filter((u) => u.role === 'admin').length} admins
                </Text>
            </View>
            {loading ? (
                <View style={styles.loader}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} tintColor={Colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No users</Text>
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
    countBar: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    },
    countText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },
    listContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.cardBorder,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.card,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    avatarText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    info: { flex: 1 },
    name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
    email: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    roleText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    joined: { fontSize: FontSize.xs, color: Colors.textDim, marginTop: Spacing.sm },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2, gap: Spacing.md },
    emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
