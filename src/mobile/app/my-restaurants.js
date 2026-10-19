import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import RestaurantCard from '../components/RestaurantCard';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData } from '../services/api';

export default function MyRestaurantsScreen() {
  const { token, userId, profile, profileError, reloadProfile } = useAuth();
  const { refresh } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isOwner = profile?.id === userId && profile?.role === 'restaurant_owner';
  const [reloadVersion, setReloadVersion] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    const scope = { token, userId, refresh };
    setResult({ ...scope, restaurants: [], loading: true, error: '' });
    if (!token || !userId || !isOwner) return;
    getData('/api/restaurants/mine', token)
      .then((restaurants) => {
        if (!Array.isArray(restaurants)) throw new Error('Invalid restaurant response.');
        if (active) setResult({ ...scope, restaurants, loading: false, error: '' });
      })
      .catch((err) => {
        const message = err.status === 401 || err.status === 403
          ? 'You need a restaurant owner account to manage restaurants. Try logging in again.'
          : 'Could not load your restaurants. Please try again.';
        if (active) setResult({ ...scope, restaurants: [], loading: false, error: message });
      });
    return () => { active = false; };
  }, [token, userId, isOwner, refresh, reloadVersion]);

  const current = result?.token === token && result?.userId === userId && result?.refresh === refresh ? result : null;
  const reload = () => setReloadVersion((value) => value + 1);
  const openRestaurant = (id) => router.push({ pathname: '/manage-restaurant', params: { id: id || '', refresh: String(Date.now()) } });

  if (!token || !userId) {
    return <View style={styles.content}><Text style={styles.message}>Log in to manage your restaurants.</Text><TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity></View>;
  }
  if (profile?.id !== userId) {
    return <View style={styles.content}><LoadMessage loading={!profileError} error={profileError} onRetry={reloadProfile} /></View>;
  }
  if (!isOwner) {
    return <View style={styles.content}><Text style={styles.message}>Restaurant management is available to restaurant owners.</Text></View>;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={current?.restaurants || []}
      keyExtractor={(item) => item.id}
      refreshing={!current || current.loading}
      onRefresh={reload}
      renderItem={({ item }) => (
        <View>
          <RestaurantCard restaurant={item} onPress={() => openRestaurant(item.id)} />
          <TouchableOpacity onPress={() => openRestaurant(item.id)} style={styles.editButton}><Text style={styles.link}>Edit {item.name}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/manage-menu', params: { restaurantId: item.id, refresh: String(Date.now()) } })} style={styles.editButton}><Text style={styles.link}>Manage menu</Text></TouchableOpacity>
        </View>
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>My restaurants</Text>
            <TouchableOpacity onPress={reload} disabled={!current || current.loading} style={styles.linkButton}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => openRestaurant()} style={styles.button}><Text style={styles.buttonText}>Add restaurant</Text></TouchableOpacity>
        </View>
      }
      ListEmptyComponent={<LoadMessage loading={!current || current.loading} error={current?.error} empty="You have no restaurants yet." onRetry={reload} />}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, color: colors.text, fontSize: 27, fontWeight: 'bold' },
  message: { color: colors.muted, lineHeight: 23 },
  linkButton: { paddingVertical: 12 },
  editButton: { paddingVertical: 12, paddingHorizontal: 4, marginTop: -12, marginBottom: 18 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  button: { backgroundColor: colors.primary, borderRadius: 8, padding: 16, alignItems: 'center', marginVertical: 18 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
});
