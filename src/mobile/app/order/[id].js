import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OrderItem from '../../components/OrderItem';
import LoadMessage from '../../components/LoadMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getData, sendData } from '../../services/api';

export default function OrderScreen() {
  const { id, refresh } = useLocalSearchParams();
  const orderId = typeof id === 'string' ? id : '';
  const { token, userId } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [result, setResult] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draftItems, setDraftItems] = useState([]);
  const [pending, setPending] = useState('');
  const [actionError, setActionError] = useState('');
  const versionRef = useRef(0);
  const requestRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = { token, userId, orderId, refresh };

  useEffect(() => {
    const version = ++versionRef.current;
    const scope = { token, userId, orderId, refresh };
    requestRef.current = null;
    setEditing(false);
    setDraftItems([]);
    setPending('');
    setActionError('');
    setResult({ ...scope, loading: true, error: '', order: null });
    if (token && userId) {
      if (!orderId) {
        setResult({ ...scope, loading: false, error: 'Order not found.', order: null });
      } else {
        getData(`/api/orders/${encodeURIComponent(orderId)}`, token)
          .then((order) => {
            if (!order || order.id !== orderId || !Array.isArray(order.items)) throw new Error('Invalid order response.');
            if (version === versionRef.current) setResult({ ...scope, loading: false, error: '', order });
          })
          .catch((err) => {
            let message = 'Could not load the order. Please try again.';
            if (err.status === 404) message = 'Order not found.';
            else if (err.status === 403) message = 'You cannot access this order.';
            else if (err.status === 401) message = 'Log out and log in again to view the order.';
            if (version === versionRef.current) setResult({ ...scope, loading: false, error: message, order: null });
          });
      }
    }
    return () => {
      versionRef.current += 1;
      requestRef.current = null;
    };
  }, [token, userId, orderId, reloadVersion, refresh]);

  const current = result?.token === token && result?.userId === userId && result?.orderId === orderId && result?.refresh === refresh ? result : null;
  const order = current?.order;
  const sameSession = () => sessionRef.current?.token === token && sessionRef.current?.userId === userId && sessionRef.current?.orderId === orderId && sessionRef.current?.refresh === refresh;
  const openOrders = () => router.replace({ pathname: '/orders', params: { refresh: String(Date.now()) } });
  const reload = () => { if (!editing && !requestRef.current) setReloadVersion((value) => value + 1); };

  const startEditing = () => {
    if (!order || requestRef.current) return;
    setDraftItems(order.items.map((item) => ({ ...item })));
    setActionError('');
    setEditing(true);
  };

  const changeQuantity = (index, delta) => {
    if (requestRef.current) return;
    setDraftItems((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
    setActionError('');
  };

  const removeItem = (index) => {
    if (requestRef.current) return;
    setDraftItems((items) => items.filter((item, itemIndex) => itemIndex !== index));
    setActionError('');
  };

  const saveOrder = async () => {
    if (!order || !editing || requestRef.current || !sameSession()) return;
    if (!draftItems.length || draftItems.some((item) => typeof item.productId !== 'string' || !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      setActionError('Keep at least one dish with a valid product ID and a positive whole quantity.');
      return;
    }
    const request = { version: versionRef.current };
    requestRef.current = request;
    setPending('save');
    setActionError('');
    try {
      await sendData(`/api/orders/${encodeURIComponent(orderId)}`, token, 'PATCH', {
        items: draftItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      if (requestRef.current === request && request.version === versionRef.current && sameSession()) {
        setEditing(false);
        setDraftItems([]);
        openOrders();
      }
    } catch (err) {
      if (requestRef.current !== request || request.version !== versionRef.current || !sameSession()) return;
      setActionError(!err.status || err.status >= 500
        ? 'Could not confirm the update. Your changes were kept. Check order history before saving again.'
        : err.message || 'Could not update the order. Your changes were kept.');
    } finally {
      if (requestRef.current === request && sameSession()) {
        requestRef.current = null;
        setPending('');
      }
    }
  };

  const confirmDelete = () => {
    if (!order || requestRef.current || !sameSession()) return;
    const version = versionRef.current;
    Alert.alert('Delete order?', 'This will delete the order from your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (version !== versionRef.current || requestRef.current || !sameSession()) return;
        const request = { version };
        requestRef.current = request;
        setPending('delete');
        setActionError('');
        try {
          await sendData(`/api/orders/${encodeURIComponent(orderId)}`, token, 'DELETE');
          if (requestRef.current === request && version === versionRef.current && sameSession()) openOrders();
        } catch (err) {
          if (requestRef.current !== request || version !== versionRef.current || !sameSession()) return;
          setActionError(!err.status || err.status >= 500
            ? 'Could not confirm the deletion. Check order history before trying again.'
            : err.message || 'Could not delete the order.');
        } finally {
          if (requestRef.current === request && sameSession()) {
            requestRef.current = null;
            setPending('');
          }
        }
      } },
    ]);
  };

  if (!token || !userId) {
    return (
      <View style={styles.content}>
        <Text style={styles.message}>Log in to view your order.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity>
      </View>
    );
  }

  const items = order ? (editing ? draftItems : order.items) : [];
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item, index) => `${item.productId || 'item'}-${index}`}
      refreshing={!current || current.loading}
      onRefresh={reload}
      renderItem={({ item, index }) => <OrderItem item={item} editing={editing} disabled={!!pending} onIncrease={() => changeQuantity(index, 1)} onDecrease={() => changeQuantity(index, -1)} onRemove={() => removeItem(index)} />}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <TouchableOpacity disabled={!!pending} onPress={openOrders} style={styles.linkButton}><Text style={styles.link}>Back to orders</Text></TouchableOpacity>
            <TouchableOpacity disabled={!!pending || editing || !current || current.loading} onPress={reload} style={styles.linkButton}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
          </View>
          <Text style={styles.title}>Order details</Text>
          {order ? (
            <View style={styles.summary}>
              <Text style={styles.heading}>{order.restaurantName || 'Restaurant order'}</Text>
              <Text style={styles.message}>Order {order.id}</Text>
              <Text style={styles.status}>{order.status || 'Submitted'}</Text>
              <Text style={styles.total}>{editing ? 'Last saved total: ' : 'Total: '}{Number.isFinite(order.totalPrice) ? `₪${order.totalPrice.toFixed(2)}` : 'Unavailable'}</Text>
              {!editing ? <TouchableOpacity onPress={startEditing} disabled={!!pending} style={styles.linkButton}><Text style={styles.link}>Edit order</Text></TouchableOpacity> : null}
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={order && editing
        ? <Text style={styles.error}>Keep at least one dish, or cancel editing to restore the items.</Text>
        : <LoadMessage loading={!current || current.loading} error={current?.error} empty="No order items available." onRetry={reload} />}
      ListFooterComponent={order ? (
        <View>
          {editing ? <Text style={styles.message}>The server recalculates the total using current menu prices when you save.</Text> : null}
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
          {editing ? (
            <>
              <TouchableOpacity onPress={saveOrder} disabled={!!pending || draftItems.length === 0} style={[styles.button, (!!pending || draftItems.length === 0) && styles.disabled]}>
                {pending === 'save' ? <ActivityIndicator color="#002a33" /> : null}
                <Text style={styles.buttonText}>{pending === 'save' ? 'Saving...' : 'Save changes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={!!pending} onPress={() => { setEditing(false); setActionError(''); }} style={styles.cancel}><Text style={styles.link}>Cancel editing</Text></TouchableOpacity>
            </>
          ) : null}
          <TouchableOpacity onPress={confirmDelete} disabled={!!pending} style={[styles.deleteButton, !!pending && styles.disabled]}>
            {pending === 'delete' ? <ActivityIndicator color={colors.error} /> : null}
            <Text style={styles.deleteText}>{pending === 'delete' ? 'Deleting...' : 'Delete order'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
  heading: { color: colors.text, fontSize: 21, fontWeight: 'bold', marginBottom: 10 },
  summary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 16 },
  message: { color: colors.muted, lineHeight: 23 },
  status: { color: colors.accentText, textTransform: 'capitalize', fontWeight: 'bold', marginTop: 10 },
  total: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  linkButton: { paddingVertical: 12 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  error: { color: colors.error, lineHeight: 23, marginVertical: 12 },
  button: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 8, padding: 16, marginTop: 18 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  cancel: { padding: 16, alignItems: 'center' },
  deleteButton: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 16, marginTop: 16 },
  deleteText: { color: colors.error, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
});
