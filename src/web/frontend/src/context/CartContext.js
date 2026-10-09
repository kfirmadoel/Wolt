import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const emptyCart = (ownerId) => ({
    ownerId,
    restaurantId: null,
    restaurantName: '',
    items: []
});

export function CartProvider({ children }) {
    const { userId } = useAuth();
    const [cart, setCart] = useState(() => emptyCart(userId));

    useEffect(() => {
        setCart((current) => current.ownerId === userId ? current : emptyCart(userId));
    }, [userId]);

    const addItem = useCallback((restaurant, product) => {
        setCart((current) => {
            const sameCart = current.ownerId === userId && current.restaurantId === restaurant.id;
            const items = sameCart ? current.items : [];
            const existing = items.find((item) => item.product.id === product.id);
            const nextItems = existing
                ? items.map((item) => item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item)
                : [...items, { product, quantity: 1 }];

            return {
                ownerId: userId,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                items: nextItems
            };
        });
    }, [userId]);

    const changeQuantity = useCallback((productId, delta) => {
        setCart((current) => ({
            ...current,
            items: current.items
                .map((item) => item.product.id === productId
                    ? { ...item, quantity: item.quantity + delta }
                    : item)
                .filter((item) => item.quantity > 0)
        }));
    }, []);

    const removeItem = useCallback((productId) => {
        setCart((current) => ({
            ...current,
            items: current.items.filter((item) => item.product.id !== productId)
        }));
    }, []);

    const clearCart = useCallback(() => setCart(emptyCart(userId)), [userId]);

    const value = useMemo(() => {
        const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
        const total = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
        return { ...cart, itemCount, total, addItem, changeQuantity, removeItem, clearCart };
    }, [cart, addItem, changeQuantity, removeItem, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}