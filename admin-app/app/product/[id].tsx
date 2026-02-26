import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Modal, TextInput, Alert, Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSize, API_BASE_URL } from '@/constants/theme';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category: '', brand: '', price: '', originPrice: '', quantity: '', description: '', thumbImage: ''
    });

    useEffect(() => {
        loadProduct();
    }, [id]);

    async function loadProduct() {
        try {
            const data = await api.getProductDetail(id);
            setProduct(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const openEditModal = () => {
        setFormData({
            name: product.name || '',
            category: product.category || '',
            brand: product.brand || '',
            price: product.price ? String(product.price) : '',
            originPrice: product.originPrice ? String(product.originPrice) : '',
            quantity: product.quantity ? String(product.quantity) : '',
            description: product.description || '',
            thumbImage: product.thumbImage || ''
        });
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSaving(true);
            try {
                const asset = result.assets[0];
                const res = await api.uploadImage(asset.uri, asset.fileName || 'image.jpg', asset.mimeType || 'image/jpeg');
                setFormData({ ...formData, thumbImage: res.url });
            } catch (error: any) {
                Alert.alert('Upload Failed', error.message);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.price) {
            Alert.alert('Error', 'Name and Price are required');
            return;
        }
        setSaving(true);
        try {
            await api.updateProduct(id, formData);
            setModalVisible(false);
            loadProduct();
            Alert.alert('Success', 'Product updated successfully');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    function getImageUri(img: string) {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `${API_BASE_URL}${img}`;
        return img;
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loader}>
                <Ionicons name="alert-circle" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    const discount = product.originPrice > product.price
        ? Math.round(((product.originPrice - product.price) / product.originPrice) * 100)
        : 0;

    const imageUri = getImageUri(product.thumbImage);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={64} color={Colors.textDim} />
                    </View>
                )}
                {product.new && (
                    <View style={styles.newBadge}><Text style={styles.badgeText}>NEW</Text></View>
                )}
                {product.bestSeller && (
                    <View style={[styles.newBadge, { left: product.new ? 70 : 16, backgroundColor: Colors.warning }]}>
                        <Text style={styles.badgeText}>BESTSELLER</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.editFab}
                    onPress={openEditModal}
                >
                    <Ionicons name="pencil" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>{product.category} · {product.brand} · {product.gender}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
                    {product.originPrice > product.price && (
                        <>
                            <Text style={styles.originPrice}>₹{product.originPrice.toLocaleString('en-IN')}</Text>
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* Stock & Sales */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Ionicons name="cube" size={22} color={product.quantity > 0 ? Colors.success : Colors.error} />
                    <Text style={styles.statValue}>{product.quantity}</Text>
                    <Text style={styles.statLabel}>In Stock</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="cart" size={22} color={Colors.info} />
                    <Text style={styles.statValue}>{product.sold}</Text>
                    <Text style={styles.statLabel}>Sold</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="star" size={22} color={Colors.warning} />
                    <Text style={styles.statValue}>{product.rate}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="arrow-up" size={22} color={Colors.primary} />
                    <Text style={styles.statValue}>{product.priority}</Text>
                    <Text style={styles.statLabel}>Priority</Text>
                </View>
            </View>

            {/* Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.card}>
                    <Text style={styles.descriptionText}>{product.description || 'No description'}</Text>
                </View>
            </View>

            {product.ingredients && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    <View style={styles.card}>
                        <Text style={styles.descriptionText}>{product.ingredients}</Text>
                    </View>
                </View>
            )}

            {product.sizes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sizes</Text>
                    <View style={styles.card}>
                        <Text style={styles.descriptionText}>{product.sizes}</Text>
                    </View>
                </View>
            )}

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Variations ({product.variations.length})</Text>
                    {product.variations.map((v: any) => (
                        <View key={v.id} style={styles.variationCard}>
                            <View style={[styles.colorSwatch, { backgroundColor: v.colorCode || '#ccc' }]} />
                            <Text style={styles.variationName}>{v.color}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Meta Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.card}>
                    {[
                        { label: 'Slug', value: product.slug },
                        { label: 'Sale', value: product.sale ? 'Yes' : 'No' },
                        { label: 'Created', value: new Date(product.createdAt).toLocaleDateString('en-IN') },
                    ].map((row, idx) => (
                        <View key={idx} style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{row.label}</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ height: 40 }} />

            {/* Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Product</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Product Image</Text>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {formData.thumbImage ? (
                                <Image source={{ uri: getImageUri(formData.thumbImage) as string }} style={styles.pickerImageProps} />
                            ) : (
                                <View style={styles.pickerPlaceholder}>
                                    <Ionicons name="camera" size={32} color={Colors.textMuted} />
                                    <Text style={styles.pickerText}>Upload Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.label}>Name *</Text>
                        <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />

                        <Text style={styles.label}>Category</Text>
                        <TextInput style={styles.input} value={formData.category} onChangeText={t => setFormData({ ...formData, category: t })} />

                        <Text style={styles.label}>Brand</Text>
                        <TextInput style={styles.input} value={formData.brand} onChangeText={t => setFormData({ ...formData, brand: t })} />

                        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Price (₹) *</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.price} onChangeText={t => setFormData({ ...formData, price: t })} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Origin Price (₹)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.originPrice} onChangeText={t => setFormData({ ...formData, originPrice: t })} />
                            </View>
                        </View>

                        <Text style={styles.label}>Stock Quantity</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.quantity} onChangeText={t => setFormData({ ...formData, quantity: t })} />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} multiline value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} />

                        <View style={{ height: 60 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSaveText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        paddingBottom: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        gap: Spacing.md,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSize.md,
    },
    imageContainer: {
        height: 260,
        backgroundColor: Colors.card,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        color: Colors.white,
        fontSize: FontSize.xs,
        fontWeight: '700',
    },
    infoCard: {
        padding: Spacing.xxl,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
    },
    productName: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    productMeta: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    price: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
    },
    originPrice: {
        fontSize: FontSize.md,
        color: Colors.textDim,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: Colors.errorBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        color: Colors.error,
        fontSize: FontSize.xs,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        padding: Spacing.xxl,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        gap: 4,
    },
    statValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: Spacing.xxl,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    descriptionText: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    variationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        gap: Spacing.md,
    },
    colorSwatch: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.cardBorder,
    },
    variationName: {
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
    },
    detailLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    detailValue: {
        fontSize: FontSize.sm,
        color: Colors.text,
        fontWeight: '500',
        maxWidth: '60%',
    },
    editFab: {
        position: 'absolute',
        bottom: -24,
        right: Spacing.xxl,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalContainer: { flex: 1, backgroundColor: Colors.surface },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
    },
    modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    closeBtn: { padding: Spacing.xs },
    modalContent: { flex: 1, padding: Spacing.xl },
    label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md, fontWeight: '600' },
    input: {
        backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        borderRadius: BorderRadius.md, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md,
    },
    imagePicker: {
        width: 120, height: 120, borderRadius: BorderRadius.md,
        backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
        overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
    },
    pickerImageProps: { width: '100%', height: '100%' },
    pickerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    pickerText: { marginTop: 8, color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
    modalFooter: {
        padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
        backgroundColor: Colors.surface, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    },
    modalSaveBtn: {
        backgroundColor: Colors.primary, padding: 16, borderRadius: BorderRadius.md, alignItems: 'center',
    },
    modalSaveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
