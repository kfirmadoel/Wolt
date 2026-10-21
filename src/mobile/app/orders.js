import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import OrderCard from '../components/OrderCard';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData } from '../services/api';

export default function OrdersScreen() {
  const { token, userId } = useAuth();
  const { refresh } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    const scope = { token, userId };
    setResult({ ...scope, orders: [], loading: true, error: '' });
    if (!token || !userId) return;
    getData('/api/orders', token)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid orders response.');
        const orders = [...data].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
        if (active) setResult({ ...scope, orders, loading: false, error: '' });
      })
      .catch((err) => {
        const message = err.status === 401 || err.status === 403
          ? 'Log out and log in again to view your orders.'
          : 'Could not load your orders. Please try again.';
        if (active) setResult({ ...scope, orders: [], loading: false, error: message });
      });
    return () => { active = false; };
  }, [token, userId, reloadVersion, refresh]);

  const current = result?.token === token && result?.userId === userId ? result : null;
  const reload = () => setReloadVersion((value) => value + 1);

  if (!token || !userId) {
    return (
      <View style={styles.content}>
        <Text style={styles.message}>Log in to view your orders.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={current?.orders || []}
      keyExtractor={(item) => item.id}
      refreshing={!current || current.loading}
      onRefresh={reload}
      renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id, refresh: String(Date.now()) } })} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Your orders</Text>
          <TouchableOpacity onPress={reload} disabled={!current || current.loading} style={styles.linkButton}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
        </View>
      }
      ListEmptyComponent={<LoadMessage loading={!current || current.loading} error={current?.error} empty="No orders yet." onRetry={reload} />}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold' },
  message: { color: colors.muted, lineHeight: 23 },
  linkButton: { paddingVertical: 12, paddingHorizontal: 8 },
  link: { color: colors.accentText, fontWeight: 'bold' },
});
