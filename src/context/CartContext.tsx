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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAbandonedCheckoutId(localStorage.getItem('anose_abandoned_checkout_id'));
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

    // Save abandoned checkout ID to local storage
    useEffect(() => {
        if (abandonedCheckoutId) {
            localStorage.setItem('anose_abandoned_checkout_id', abandonedCheckoutId);
        }
    }, [abandonedCheckoutId]);

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

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isPopupOpen, closePopup, lastAddedItem, abandonedCheckoutId }}>
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
