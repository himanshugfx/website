import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

interface MenuItem {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    color: string;
    bgColor: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
        title: 'Customer Management',
        items: [
            {
                title: 'Reviews',
                subtitle: 'Manage product reviews',
                icon: 'star',
                route: '/reviews',
                color: '#F59E0B',
                bgColor: 'rgba(245, 158, 11, 0.12)',
            },
            {
                title: 'Inquiries',
                subtitle: 'Contact form messages',
                icon: 'mail',
                route: '/inquiries',
                color: '#3B82F6',
                bgColor: 'rgba(59, 130, 246, 0.12)',
            },
            {
                title: 'Subscribers',
                subtitle: 'Newsletter subscribers',
                icon: 'newspaper',
                route: '/subscribers',
                color: '#8B5CF6',
                bgColor: 'rgba(139, 92, 246, 0.12)',
            },
            {
                title: 'Users',
                subtitle: 'Registered customers',
                icon: 'people',
                route: '/users',
                color: '#06B6D4',
                bgColor: 'rgba(6, 182, 212, 0.12)',
            },
        ],
    },
    {
        title: 'Sales & Marketing',
        items: [
            {
                title: 'Sales Funnel',
                subtitle: 'Leads & pipeline',
                icon: 'funnel',
                route: '/leads',
                color: '#10B981',
                bgColor: 'rgba(16, 185, 129, 0.12)',
            },
            {
                title: 'Promo Codes',
                subtitle: 'Discounts & coupons',
                icon: 'pricetag',
                route: '/promocodes',
                color: Colors.primary,
                bgColor: Colors.primaryGlow,
            },
            {
                title: 'Abandoned Carts',
                subtitle: 'Recovery opportunities',
                icon: 'cart',
                route: '/abandoned',
                color: '#EF4444',
                bgColor: 'rgba(239, 68, 68, 0.12)',
            },
        ],
    },
];

export default function MoreScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>More</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                            {(user?.name || 'A').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'Admin'}</Text>
                        <Text style={styles.profileEmail}>{user?.email}</Text>
                    </View>
                    <View style={styles.adminBadge}>
                        <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
                        <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                {MENU_SECTIONS.map((section, sIdx) => (
                    <View key={sIdx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuGroup}>
                            {section.items.map((item, iIdx) => (
                                <TouchableOpacity
                                    key={iIdx}
                                    style={[
                                        styles.menuItem,
                                        iIdx < section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    onPress={() => router.push(item.route as any)}
                                    activeOpacity={0.6}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: item.bgColor }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <View style={styles.menuText}>
                                        <Text style={styles.menuTitle}>{item.title}</Text>
                                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Anose Admin v1.0.0</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
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
    scrollContent: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.xl,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    profileAvatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    profileAvatarText: {
        color: Colors.white,
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    profileEmail: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.primaryGlow,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    adminBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.primary,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        paddingLeft: Spacing.xs,
    },
    menuGroup: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    menuSubtitle: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.errorBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    logoutText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.error,
    },
    version: {
        textAlign: 'center',
        color: Colors.textDim,
        fontSize: FontSize.xs,
        marginTop: Spacing.xl,
    },
});
