import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ProductCard from '../components/ProductCard';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData } from '../services/api';

export default function ManageMenuScreen() {
  const params = useLocalSearchParams();
  const restaurantId = typeof params.restaurantId === 'string' ? params.restaurantId : '';
  const { refresh } = params;
  const { token, userId, profile, profileError, reloadProfile } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isOwner = profile?.id === userId && profile?.role === 'restaurant_owner';
  const [result, setResult] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const scope = { token, userId, restaurantId, refresh };
    setResult({ ...scope, loading: true, error: '', restaurant: null, products: [] });
    if (!token || !userId || !isOwner) return;
    const load = async () => {
      try {
        if (!restaurantId) throw Object.assign(new Error('Restaurant not found.'), { status: 404 });
        const restaurant = await getData(`/api/restaurants/${encodeURIComponent(restaurantId)}`, token);
        if (!restaurant || restaurant.id !== restaurantId || restaurant.ownerId !== userId) throw Object.assign(new Error('You cannot manage this restaurant.'), { status: 403 });
        const products = await getData(`/api/restaurants/${encodeURIComponent(restaurantId)}/products`, token);
        if (!Array.isArray(products)) throw new Error('Invalid menu response.');
        if (active) setResult({ ...scope, loading: false, error: '', restaurant, products });
      } catch (err) {
        let message = 'Could not load the menu. Please try again.';
        if (err.status === 404) message = 'Restaurant not found.';
        else if (err.status === 403) message = 'You cannot manage this restaurant.';
        else if (err.status === 401) message = 'Log out and log in again to manage the menu.';
        if (active) setResult({ ...scope, loading: false, error: message, restaurant: null, products: [] });
      }
    };
    load();
    return () => { active = false; };
  }, [token, userId, isOwner, restaurantId, refresh, reloadVersion]);

  const current = result?.token === token && result?.userId === userId && result?.restaurantId === restaurantId && result?.refresh === refresh ? result : null;
  const reload = () => setReloadVersion((value) => value + 1);
  const openProduct = (id) => router.push({ pathname: '/manage-product', params: { restaurantId, id: id || '', refresh: String(Date.now()) } });
  const openRestaurants = () => router.replace({ pathname: '/my-restaurants', params: { refresh: String(Date.now()) } });

  if (!token || !userId) return <View style={styles.content}><Text style={styles.message}>Log in to manage your menu.</Text><TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity></View>;
  if (profile?.id !== userId) return <View style={styles.content}><LoadMessage loading={!profileError} error={profileError} onRetry={reloadProfile} /></View>;
  if (!isOwner) return <View style={styles.content}><Text style={styles.message}>Menu management is available to restaurant owners.</Text></View>;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={current?.products || []}
      keyExtractor={(item) => item.id}
      refreshing={!current || current.loading}
      onRefresh={reload}
      renderItem={({ item }) => (
        <View>
          <ProductCard product={item} onPress={() => openProduct(item.id)} />
          <TouchableOpacity onPress={() => openProduct(item.id)} style={styles.editButton}><Text style={styles.link}>Edit {item.name}</Text></TouchableOpacity>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <TouchableOpacity onPress={openRestaurants} style={styles.linkButton}><Text style={styles.link}>Back to My restaurants</Text></TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Manage menu</Text>
            <TouchableOpacity onPress={reload} disabled={!current || current.loading} style={styles.linkButton}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
          </View>
          {current?.restaurant ? <>
            <Text style={styles.heading}>{current.restaurant.name}</Text>
            <TouchableOpacity onPress={() => openProduct()} style={styles.button}><Text style={styles.buttonText}>Add dish</Text></TouchableOpacity>
          </> : null}
        </View>
      }
      ListEmptyComponent={<LoadMessage loading={!current || current.loading} error={current?.error} empty="This restaurant has no dishes yet." onRetry={reload} />}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, color: colors.text, fontSize: 27, fontWeight: 'bold' },
  heading: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  message: { color: colors.muted, lineHeight: 23 },
  linkButton: { paddingVertical: 12 },
  editButton: { paddingVertical: 12, paddingHorizontal: 4, marginTop: -8, marginBottom: 18 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  button: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginVertical: 18 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
});
