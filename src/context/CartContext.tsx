'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    slug: string;
}

interface AppliedPromo {
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string, size?: string, color?: string) => void;
    updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isPopupOpen: boolean;
    closePopup: () => void;
    lastAddedItem: CartItem | null;
    abandonedCheckoutId: string | null;
    selectedPromo: AppliedPromo | null;
    applyPromo: (code: string) => Promise<{ success: boolean; error?: string }>;
    removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to get location data from IP
async function getLocationData(): Promise<{ city?: string; country?: string }> {
    try {
        // Using a free IP geolocation service
        const res = await fetch('https://ipapi.co/json/', { cache: 'force-cache' });
        if (res.ok) {
            const data = await res.json();
            return {
                city: data.city || undefined,
                country: data.country_name || undefined,
            };
        }
    } catch (e) {
        console.error('Failed to get location:', e);
    }
    return {};
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('anose_cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    const [abandonedCheckoutId, setAbandonedCheckoutId] = useState<string | null>(null);

    const [selectedPromo, setSelectedPromo] = useState<AppliedPromo | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAbandonedCheckoutId(localStorage.getItem('anose_abandoned_checkout_id'));
            const savedPromo = localStorage.getItem('anose_promo');
            if (savedPromo) {
                try {
                    setSelectedPromo(JSON.parse(savedPromo));
                } catch (e) {
                    console.error("Failed to parse promo", e);
                }
            }
        }
    }, []);

    // Track if we've synced this session
    const hasSyncedRef = useRef(false);

    // Save cart to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('anose_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // Save selected promo to local storage
    useEffect(() => {
        if (isLoaded) {
            if (selectedPromo) {
                localStorage.setItem('anose_promo', JSON.stringify(selectedPromo));
            } else {
                localStorage.removeItem('anose_promo');
            }
        }
    }, [selectedPromo, isLoaded]);

    // Sync abandoned checkout when cart changes (but not cleared)
    const syncAbandonedCart = useCallback(async (updatedCart: CartItem[]) => {
        if (updatedCart.length === 0) return;

        try {
            const location = await getLocationData();
            const cartTotal = updatedCart.reduce((total, item) => total + item.price * item.quantity, 0);

            const res = await fetch('/api/checkout/abandoned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkoutId: abandonedCheckoutId,
                    cartItems: updatedCart.map(item => ({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total: cartTotal,
                    city: location.city,
                    country: location.country,
                    source: 'CART'
                }),
            });

            const data = await res.json();
            if (data.success && data.id && !abandonedCheckoutId) {
                setAbandonedCheckoutId(data.id);
            }
        } catch (err) {
            console.error('Failed to sync abandoned cart:', err);
        }
    }, [abandonedCheckoutId]);

    // Sync when cart is updated (debounced effect)
    useEffect(() => {
        if (cart.length === 0 || hasSyncedRef.current) return;

        // Debounce the sync
        const timer = setTimeout(() => {
            syncAbandonedCart(cart);
            hasSyncedRef.current = true;
        }, 2000);

        return () => clearTimeout(timer);
    }, [cart, syncAbandonedCart]);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // Auto-update discount amount if cartTotal changes
    useEffect(() => {
        if (selectedPromo) {
            let newDiscountAmount = 0;
            if (selectedPromo.discountType === 'PERCENTAGE') {
                newDiscountAmount = (cartTotal * selectedPromo.discountValue) / 100;
            } else {
                newDiscountAmount = selectedPromo.discountValue;
            }
            newDiscountAmount = Math.min(newDiscountAmount, cartTotal);
            
            if (newDiscountAmount !== selectedPromo.discountAmount) {
                setSelectedPromo(prev => prev ? { ...prev, discountAmount: newDiscountAmount } : null);
            }
        }
    }, [cartTotal, selectedPromo?.code, selectedPromo?.discountValue, selectedPromo?.discountType]);

    const applyPromo = async (code: string) => {
        try {
            const res = await fetch('/api/users/apply-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    cartTotal
                }),
            });

            const data = await res.json();

            if (data.success) {
                const newPromo = {
                    code: data.code,
                    discountAmount: data.discountAmount,
                    discountType: data.type,
                    discountValue: data.value
                };
                setSelectedPromo(newPromo);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Failed to apply code' };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Something went wrong' };
        }
    };

    const removePromo = () => {
        setSelectedPromo(null);
    };

    const addToCart = (newItem: CartItem) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === newItem.id &&
                item.selectedSize === newItem.selectedSize &&
                item.selectedColor === newItem.selectedColor
            );

            let updatedCart: CartItem[];
            if (existing) {
                updatedCart = prev.map(item =>
                    item === existing ? { ...item, quantity: item.quantity + newItem.quantity } : item
                );
            } else {
                updatedCart = [...prev, newItem];
            }

            // Sync abandoned cart after adding item
            syncAbandonedCart(updatedCart);

            return updatedCart;
        });
        setLastAddedItem(newItem);
        setIsPopupOpen(true);
    };

    const removeFromCart = (id: string, size?: string, color?: string) => {
        setCart(prev => prev.filter(item =>
            !(item.id === id && item.selectedSize === size && item.selectedColor === color)
        ));
    };

    const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
        if (quantity <= 0) {
            removeFromCart(id, size, color);
            return;
        }
        setCart(prev => prev.map(item =>
            (item.id === id && item.selectedSize === size && item.selectedColor === color)
                ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        // Clear abandoned checkout ID when cart is cleared (order completed)
        setAbandonedCheckoutId(null);
        localStorage.removeItem('anose_abandoned_checkout_id');
        hasSyncedRef.current = false;
    };

    const closePopup = () => setIsPopupOpen(false);

    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            isPopupOpen, closePopup, lastAddedItem, abandonedCheckoutId,
            selectedPromo, applyPromo, removePromo
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
