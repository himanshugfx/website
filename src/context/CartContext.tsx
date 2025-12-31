'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('anose_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('anose_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (newItem: CartItem) => {
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === newItem.id &&
                item.selectedSize === newItem.selectedSize &&
                item.selectedColor === newItem.selectedColor
            );

            if (existing) {
                return prev.map(item =>
                    item === existing ? { ...item, quantity: item.quantity + newItem.quantity } : item
                );
            }
            return [...prev, newItem];
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

    const clearCart = () => setCart([]);
    const closePopup = () => setIsPopupOpen(false);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isPopupOpen, closePopup, lastAddedItem }}>
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
