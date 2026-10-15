import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CartItem from '../components/CartItem';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { sendData } from '../services/api';

export default function CartScreen() {
  const { token, userId } = useAuth();
  const { restaurantId, restaurantName, items, itemCount, total, changeQuantity, removeItem, clearCart } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const requestRef = useRef(null);

  useEffect(() => {
    requestRef.current = null;
    setSubmitting(false);
    setResult((current) => current?.order && items.length === 0 && current.userId === userId && current.token === token ? current : null);
    return () => { requestRef.current = null; };
  }, [token, userId, items]);

  const submitOrder = async () => {
    if (!token || !userId) {
      router.push('/login');
      return;
    }
    if (requestRef.current || !restaurantId || items.length === 0) return;
    const request = { token, userId, items };
    requestRef.current = request;
    setSubmitting(true);
    setResult(null);
    try {
      const order = await sendData('/api/orders', token, 'POST', {
        restaurantId,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      if (requestRef.current !== request) return;
      if (!order || typeof order.id !== 'string' || !order.id || !Number.isFinite(order.totalPrice) || order.totalPrice < 0) {
        throw new Error('Order confirmation is missing.');
      }
      clearCart(items);
      setResult({ ...request, order });
    } catch (err) {
      if (requestRef.current !== request) return;
      let message = err.message || 'Could not place your order. Please try again.';
      if (err.status === 401 || err.status === 403) {
        message = 'Your session expired. Log out and log in again before placing the order.';
      } else if (!err.status || err.status >= 500 || err.status < 400) {
        message = 'We could not confirm whether your order was placed. Your cart was kept. Check your orders before trying again to avoid placing it twice.';
      }
      setResult({ ...request, error: message });
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  const feedback = result && result.userId === userId && result.token === token &&
    (result.order ? items.length === 0 : result.items === items) ? result : null;
  const pending = submitting && requestRef.current?.userId === userId && requestRef.current?.token === token;

  if (!token || !userId) {
    return (
      <View style={styles.empty}>
        <Text style={styles.message}>Log in to use your cart.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.button}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.product.id}
      renderItem={({ item }) => (
        <CartItem item={item} disabled={pending} onIncrease={() => changeQuantity(item.product.id, 1)} onDecrease={() => changeQuantity(item.product.id, -1)} onRemove={() => removeItem(item.product.id)} />
      )}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Your cart</Text>
          {feedback?.order ? (
            <View style={styles.confirmation}>
              <Text style={styles.success}>Order placed</Text>
              <Text style={styles.message}>Order {feedback.order.id}</Text>
              <Text style={styles.heading}>Total: ₪{feedback.order.totalPrice.toFixed(2)}</Text>
            </View>
          ) : null}
          {restaurantId ? (
            <TouchableOpacity disabled={pending} onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurantId } })} style={styles.restaurantLink}>
              <Text style={styles.link}>{restaurantName}</Text>
              <Text style={styles.hint}>Back to menu</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.heading}>Your cart is empty</Text>
          <Text style={styles.message}>Choose a restaurant and add dishes to your cart.</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
            <Text style={styles.buttonText}>Browse restaurants</Text>
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={items.length > 0 ? (
        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text style={styles.message}>Items</Text><Text style={styles.message}>{itemCount}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.heading}>Total</Text><Text style={styles.heading}>₪{total.toFixed(2)}</Text></View>
          {feedback?.error ? <Text style={styles.error}>{feedback.error}</Text> : null}
          <TouchableOpacity onPress={submitOrder} disabled={pending} style={[styles.button, styles.checkoutButton, pending && styles.disabled]} accessibilityRole="button">
            {pending ? <ActivityIndicator color="#002a33" /> : null}
            <Text style={styles.buttonText}>{pending ? 'Placing order...' : 'Place order'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  restaurantLink: { paddingVertical: 12, marginBottom: 8 },
  link: { color: colors.accentText, fontSize: 17, fontWeight: 'bold' },
  hint: { color: colors.muted, marginTop: 5 },
  empty: { padding: 24, alignItems: 'center', backgroundColor: colors.background },
  message: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  heading: { color: colors.text, fontSize: 21, fontWeight: 'bold', marginVertical: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 14, marginTop: 20 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  summary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginTop: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  disabled: { opacity: 0.6 },
  error: { color: colors.error, lineHeight: 23, marginVertical: 12 },
  confirmation: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginVertical: 12 },
  success: { color: colors.ok, fontSize: 21, fontWeight: 'bold', marginBottom: 8 },
});
