import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity,
    TextInput, ActivityIndicator, Image, Modal, ScrollView, Alert, Platform
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSize, API_BASE_URL } from '@/constants/theme';

export default function ProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category: '', brand: '', price: '', originPrice: '', quantity: '', description: '', thumbImage: ''
    });

    const loadProducts = useCallback(async (p = 1, append = false) => {
        try {
            const params: any = { page: p, limit: 15, sortBy: 'date_desc' };
            if (search.trim()) params.search = search.trim();

            const data = await api.getProducts(params);
            if (append) {
                setProducts((prev) => [...prev, ...(data.products || [])]);
            } else {
                setProducts(data.products || []);
            }
            setTotalPages(data.totalPages || 1);
            setPage(p);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [search]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadProducts(1);
        }, [loadProducts])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadProducts(1);
    };

    const loadMore = () => {
        if (page < totalPages && !loadingMore) {
            setLoadingMore(true);
            loadProducts(page + 1, true);
        }
    };

    function getImageUri(img: string) {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `${API_BASE_URL}${img}`;
        return img;
    }

    const openAddModal = () => {
        setFormData({ name: '', category: '', brand: '', price: '', originPrice: '', quantity: '', description: '', thumbImage: '' });
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
        if (!formData.name.trim() || !formData.price || !formData.category) {
            Alert.alert('Error', 'Name, Price and Category are required');
            return;
        }
        setSaving(true);
        try {
            await api.createProduct({
                ...formData,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5)
            });
            setModalVisible(false);
            loadProducts(1);
            Alert.alert('Success', 'Product created successfully');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    const renderProduct = ({ item }: { item: any }) => {
        const imageUri = getImageUri(item.thumbImage);
        const discount = item.originPrice > item.price
            ? Math.round(((item.originPrice - item.price) / item.originPrice) * 100)
            : 0;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={32} color={Colors.textDim} />
                        </View>
                    )}
                    {item.new && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                    )}
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>-{discount}%</Text>
                        </View>
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productCategory}>{item.category} · {item.brand}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                        {item.originPrice > item.price && (
                            <Text style={styles.originPrice}>₹{item.originPrice.toLocaleString('en-IN')}</Text>
                        )}
                    </View>

                    <View style={styles.stockRow}>
                        <View style={[
                            styles.stockBadge,
                            { backgroundColor: item.quantity > 0 ? Colors.successBg : Colors.errorBg }
                        ]}>
                            <Text style={[
                                styles.stockText,
                                { color: item.quantity > 0 ? Colors.success : Colors.error }
                            ]}>
                                {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                            </Text>
                        </View>
                        <Text style={styles.soldText}>{item.sold} sold</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Products</Text>
                <Text style={styles.headerSubtitle}>{products.length} items</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor={Colors.textDim}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => {
                        setLoading(true);
                        loadProducts(1);
                    }}
                    returnKeyType="search"
                />
                {search ? (
                    <TouchableOpacity onPress={() => { setSearch(''); setLoading(true); loadProducts(1); }}>
                        <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Products List */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.lg }} /> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color={Colors.textDim} />
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={openAddModal}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Product</Text>
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
                        <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholder="e.g. Lavender Perfume" />

                        <Text style={styles.label}>Category *</Text>
                        <TextInput style={styles.input} value={formData.category} onChangeText={t => setFormData({ ...formData, category: t })} placeholder="e.g. Perfume" />

                        <Text style={styles.label}>Brand</Text>
                        <TextInput style={styles.input} value={formData.brand} onChangeText={t => setFormData({ ...formData, brand: t })} placeholder="Anose" />

                        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Price (₹) *</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.price} onChangeText={t => setFormData({ ...formData, price: t })} placeholder="199" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Origin Price (₹)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.originPrice} onChangeText={t => setFormData({ ...formData, originPrice: t })} placeholder="299" />
                            </View>
                        </View>

                        <Text style={styles.label}>Stock Quantity</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.quantity} onChangeText={t => setFormData({ ...formData, quantity: t })} placeholder="100" />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} multiline value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} placeholder="Product features..." />

                        <View style={{ height: 60 }} />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalSaveText}>Create Product</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.xxl,
        marginVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 46,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Colors.text,
        fontSize: FontSize.md,
        height: '100%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: 40,
    },
    row: {
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    productCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    imageContainer: {
        height: 140,
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
        top: 8,
        left: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    newBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.error,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    productInfo: {
        padding: Spacing.md,
    },
    productName: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
        lineHeight: 18,
    },
    productCategory: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    price: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: Colors.text,
    },
    originPrice: {
        fontSize: FontSize.xs,
        color: Colors.textDim,
        textDecorationLine: 'line-through',
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stockBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '600',
    },
    soldText: {
        fontSize: FontSize.xs,
        color: Colors.textDim,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl * 2,
        gap: Spacing.md,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
        fontWeight: '500',
    },
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
