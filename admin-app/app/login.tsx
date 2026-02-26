import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(email.trim().toLowerCase(), password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Decorative gradient circles */}
                <View style={styles.bgCircle1} />
                <View style={styles.bgCircle2} />
                <View style={styles.bgCircle3} />

                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="shield-checkmark" size={36} color={Colors.white} />
                    </View>
                    <Text style={styles.brandName}>Anose Beauty</Text>
                    <Text style={styles.subtitle}>Admin Panel</Text>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to manage your store</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={18} color={Colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="admin@anosebeauty.com"
                                placeholderTextColor={Colors.textDim}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={Colors.textDim}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="password"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>© 2026 Anose Beauty. Admin Access Only.</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        overflow: 'hidden',
    },
    bgCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        top: -80,
        right: -60,
    },
    bgCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(167, 139, 250, 0.06)',
        bottom: 60,
        left: -50,
    },
    bgCircle3: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(124, 58, 237, 0.04)',
        top: '40%' as any,
        right: -30,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl + 8,
    },
    logoIcon: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    brandName: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textMuted,
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.xl,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.errorBg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSize.sm,
        flex: 1,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: Spacing.md,
        height: 52,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: FontSize.md,
        height: '100%',
    },
    eyeButton: {
        padding: Spacing.sm,
        marginRight: -Spacing.sm,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        height: 52,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        color: Colors.textDim,
        fontSize: FontSize.xs,
        marginTop: Spacing.xxxl,
    },
});
