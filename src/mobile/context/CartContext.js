import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const emptyCart = (ownerId) => ({ ownerId, restaurantId: null, restaurantName: '', items: [] });

export function CartProvider({ children }) {
  const { token, userId } = useAuth();
  const [cart, setCart] = useState(() => emptyCart(userId));
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const changeVersion = useRef(0);
  const checkoutRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = { token, userId };

  useEffect(() => {
    changeVersion.current += 1;
    setCart(emptyCart(userId));
    checkoutRef.current = null;
    setCheckoutPending(false);
    setCheckoutResult(null);
    return () => { changeVersion.current += 1; checkoutRef.current = null; };
  }, [token, userId]);

  const currentCart = token && cart.ownerId === userId ? cart : emptyCart(userId);

  const addItem = (restaurant, product) => {
    if (!token || !userId) {
      router.push('/login');
      return;
    }
    const version = ++changeVersion.current;
    const add = () => {
      if (version !== changeVersion.current) return;
      setCart((current) => {
        const sameRestaurant = current.ownerId === userId && current.restaurantId === restaurant.id;
        const items = sameRestaurant ? current.items : [];
        const existing = items.find((item) => item.product.id === product.id);
        return {
          ownerId: userId,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: existing
            ? items.map((item) => item.product.id === product.id ? { product, quantity: item.quantity + 1 } : item)
            : [...items, { product, quantity: 1 }],
        };
      });
    };
    if (currentCart.items.length > 0 && currentCart.restaurantId !== restaurant.id) {
      Alert.alert('Start a new cart?', 'Your cart has dishes from another restaurant. Replace them with this dish?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace cart', style: 'destructive', onPress: add },
      ]);
    } else {
      add();
    }
  };

  const changeQuantity = (productId, delta) => {
    if (!token || !userId) return;
    changeVersion.current += 1;
    setCart((current) => {
      if (current.ownerId !== userId) return current;
      const items = current.items
        .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0);
      return items.length ? { ...current, items } : emptyCart(userId);
    });
  };

  const removeItem = (productId) => {
    if (!token || !userId) return;
    changeVersion.current += 1;
    setCart((current) => {
      if (current.ownerId !== userId) return current;
      const items = current.items.filter((item) => item.product.id !== productId);
      return items.length ? { ...current, items } : emptyCart(userId);
    });
  };

  const clearCart = (expectedItems) => {
    changeVersion.current += 1;
    setCart((current) => {
      if (current.ownerId !== userId || (expectedItems && current.items !== expectedItems)) return current;
      return emptyCart(userId);
    });
  };

  const beginCheckout = () => {
    if (checkoutRef.current || !token || !userId || !currentCart.restaurantId || currentCart.items.length === 0 ||
        sessionRef.current.token !== token || sessionRef.current.userId !== userId) return null;
    const request = { token, userId, restaurantId: currentCart.restaurantId, items: currentCart.items };
    checkoutRef.current = request;
    setCheckoutPending(true);
    setCheckoutResult(null);
    return request;
  };

  const finishCheckout = (request, result) => {
    if (checkoutRef.current !== request || sessionRef.current.token !== request.token || sessionRef.current.userId !== request.userId) return;
    if (result?.order) {
      changeVersion.current += 1;
      setCart((current) => current.ownerId === request.userId && current.items === request.items ? emptyCart(request.userId) : current);
    }
    if (result) setCheckoutResult({ ...request, ...result });
    checkoutRef.current = null;
    setCheckoutPending(false);
  };

  const itemCount = currentCart.items.reduce((count, item) => count + item.quantity, 0);
  const total = currentCart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ ...currentCart, itemCount, total, addItem, changeQuantity, removeItem, clearCart,
      checkoutPending: checkoutPending && checkoutRef.current?.token === token && checkoutRef.current?.userId === userId,
      checkoutResult: checkoutResult?.token === token && checkoutResult?.userId === userId ? checkoutResult : null,
      beginCheckout, finishCheckout }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
