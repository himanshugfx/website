import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as api from '@/services/api';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DRAFT'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'SUCCESSFUL', 'FAILED'];
const PAYMENT_METHOD_OPTIONS = ['ONLINE', 'COD', 'BANK_TRANSFER', 'UPI', 'CASH'];

interface Product {
    id: string;
    name: string;
    price: number;
}

interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    availableProducts?: Product[];
}

export default function AddOrderScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Customer fields
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [address, setAddress] = useState('');

    // Order fields
    const [status, setStatus] = useState('DRAFT');
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingFee, setShippingFee] = useState('0');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [promoCode, setPromoCode] = useState('');
    const [notes, setNotes] = useState('');

    // Items
    const [items, setItems] = useState<OrderItem[]>([
        { productId: '', productName: '', quantity: 1, price: 0 },
    ]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.getAdminProducts({ limit: 1000 });
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, { productId: '', productName: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const updated = [...items];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index] = {
                    ...updated[index],
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                };
            } else {
                updated[index] = {
                    ...updated[index],
                    productId: '',
                    productName: '',
                    price: 0,
                };
            }
        } else {
            (updated[index] as any)[field] = value;
        }
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + parseFloat(shippingFee || '0') - parseFloat(discountAmount || '0');

    const handleSubmit = async () => {
        if (!customerName.trim()) {
            Alert.alert('Error', 'Customer name is required');
            return;
        }

        const validItems = items.filter(item => item.productId && item.quantity > 0);
        if (validItems.length === 0) {
            Alert.alert('Error', 'Please add at least one product');
            return;
        }

        setSubmitting(true);
        try {
            await api.createOrder({
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                address: address || null,
                status,
                paymentStatus,
                paymentMethod,
                shippingFee: parseFloat(shippingFee || '0'),
                discountAmount: parseFloat(discountAmount || '0'),
                promoCode: promoCode || null,
                total: total > 0 ? total : 0,
                notes: notes || null,
                items: validItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            Alert.alert('Success', 'Order created successfully');
            router.back();
        } catch (error: any) {
            console.error('Error creating order:', error);
            Alert.alert('Error', error.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Customer Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person" size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Customer Information</Text>
                    </View>
                    
                    <Text style={styles.label}>Customer Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="Full name"
                        placeholderTextColor={Colors.textDim}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={customerEmail}
                                onChangeText={setCustomerEmail}
                                placeholder="customer@example.com"
                                placeholderTextColor={Colors.textDim}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={customerPhone}
                                onChangeText={setCustomerPhone}
                                placeholder="+91 XXXXXXXXXX"
                                placeholderTextColor={Colors.textDim}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Shipping Address</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Full shipping address"
                        placeholderTextColor={Colors.textDim}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="cube" size={20} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Order Items</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={addItem}>
                            <Ionicons name="add" size={18} color={Colors.primary} />
                            <Text style={styles.addButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Product *</Text>
                                <View style={styles.pickerContainer}>
                                    {/* Using a simplified picker-like UI for brevity in this complex screen */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <TouchableOpacity 
                                            style={[styles.miniChip, !item.productId && { backgroundColor: Colors.primary }]}
                                            onPress={() => updateItem(index, 'productId', '')}
                                        >
                                            <Text style={[styles.miniChipText, !item.productId && { color: 'white' }]}>Select</Text>
                                        </TouchableOpacity>
                                        {products.map(p => (
                                            <TouchableOpacity 
                                                key={p.id} 
                                                style={[styles.miniChip, item.productId === p.id && { backgroundColor: Colors.primary }]}
                                                onPress={() => updateItem(index, 'productId', p.id)}
                                            >
                                                <Text style={[styles.miniChipText, item.productId === p.id && { color: 'white' }]}>{p.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                            
                            <View style={styles.qtyPriceRow}>
                                <View style={{ width: 60 }}>
                                    <Text style={styles.label}>Qty</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={item.quantity.toString()}
                                        onChangeText={(v) => updateItem(index, 'quantity', parseInt(v) || 0)}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View style={{ width: Spacing.md }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Price (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={item.price.toString()}
                                        onChangeText={(v) => updateItem(index, 'price', parseFloat(v) || 0)}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={styles.deleteItemButton} 
                                    onPress={() => removeItem(index)}
                                    disabled={items.length <= 1}
                                >
                                    <Ionicons name="trash-outline" size={20} color={items.length <= 1 ? Colors.textDim : Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal:</Text>
                        <Text style={styles.subtotalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cash" size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Order Details</Text>
                    </View>

                    <Text style={styles.label}>Order Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity 
                                key={opt} 
                                style={[styles.optionChip, status === opt && styles.optionChipActive]}
                                onPress={() => setStatus(opt)}
                            >
                                <Text style={[styles.optionChipText, status === opt && styles.optionChipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Payment Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                        {PAYMENT_STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity 
                                key={opt} 
                                style={[styles.optionChip, paymentStatus === opt && styles.optionChipActive]}
                                onPress={() => setPaymentStatus(opt)}
                            >
                                <Text style={[styles.optionChipText, paymentStatus === opt && styles.optionChipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Payment Method</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                        {PAYMENT_METHOD_OPTIONS.map(opt => (
                            <TouchableOpacity 
                                key={opt} 
                                style={[styles.optionChip, paymentMethod === opt && styles.optionChipActive]}
                                onPress={() => setPaymentMethod(opt)}
                            >
                                <Text style={[styles.optionChipText, paymentMethod === opt && styles.optionChipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Shipping Fee (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={shippingFee}
                                onChangeText={setShippingFee}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Discount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={discountAmount}
                                onChangeText={setDiscountAmount}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Promo Code</Text>
                    <TextInput
                        style={styles.input}
                        value={promoCode}
                        onChangeText={setPromoCode}
                        placeholder="Optional"
                        placeholderTextColor={Colors.textDim}
                    />

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Subtotal</Text>
                            <Text style={styles.summaryText}>₹{subtotal.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Shipping</Text>
                            <Text style={styles.summaryText}>+₹{parseFloat(shippingFee || '0').toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Discount</Text>
                            <Text style={styles.summaryText}>-₹{parseFloat(discountAmount || '0').toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{(total > 0 ? total : 0).toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Internal Notes</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Internal notes about this order..."
                        placeholderTextColor={Colors.textDim}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Action Button */}
                <TouchableOpacity 
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Order</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.md,
        color: Colors.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        gap: 4,
    },
    addButtonText: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: '700',
    },
    itemRow: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.cardBorder,
        paddingBottom: Spacing.md,
        marginBottom: Spacing.md,
    },
    qtyPriceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: Spacing.sm,
    },
    deleteItemButton: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    pickerContainer: {
        marginTop: Spacing.xs,
    },
    miniChip: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
    },
    miniChipText: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    subtotalLabel: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    subtotalValue: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
    },
    optionsRow: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    optionChip: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
    },
    optionChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    optionChipText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    optionChipTextActive: {
        color: Colors.white,
    },
    summaryContainer: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    summaryText: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
    },
    totalRow: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.cardBorder,
    },
    totalLabel: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.text,
    },
    totalValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.primary,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
});
