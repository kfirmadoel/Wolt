import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import RestaurantCard from '../components/RestaurantCard';
import CategoryFilter from '../components/CategoryFilter';
import RestaurantSection from '../components/RestaurantSection';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { getData } from '../services/api';
import { calculateDistance } from '../utils/distance';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { token, profile, profileError, reloadProfile } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadRestaurants = async () => {
    setLoading(true);
    setServerError('');
    try {
      const data = await getData('/api/restaurants', token);
      setRestaurants(data);
      setSelectedCategory((category) => data.some((restaurant) => restaurant.category === category) ? category : 'All');
    } catch (err) {
      setRestaurants([]);
      setServerError('Could not load restaurants. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRestaurants(); }, [token]);

  const categories = [...new Set(restaurants.map((restaurant) => restaurant.category).filter(Boolean))].sort();
  const withDistance = restaurants.map((restaurant) => ({ ...restaurant, distance: calculateDistance(restaurant.location, profile?.location) }));
  const filtered = selectedCategory === 'All' ? withDistance : withDistance.filter((restaurant) => restaurant.category === selectedCategory);
  const nearby = filtered.filter((restaurant) => restaurant.distance !== null).sort((a, b) => a.distance - b.distance);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filtered}
      refreshing={loading}
      onRefresh={loadRestaurants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hero}>
            <Text style={styles.label}>FOOD & MORE</Text>
            <Text style={styles.title}>What are you craving?</Text>
            <Text style={styles.subtitle}>Find your next meal from the restaurants around you.</Text>
          </View>
          {profileError ? <LoadMessage error={profileError} onRetry={reloadProfile} /> : null}
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          <RestaurantSection title="Promoted restaurants" restaurants={filtered.filter((restaurant) => restaurant.isPromoted)} />
          <RestaurantSection title="Near your saved location" restaurants={nearby} />
          <Text style={styles.sectionTitle}>{selectedCategory === 'All' ? 'All restaurants' : selectedCategory}</Text>
        </View>
      }
      ListEmptyComponent={<LoadMessage loading={loading} error={serverError} empty="No restaurants available." onRetry={loadRestaurants} />}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
  hero: { backgroundColor: colors.selected, padding: 22, borderRadius: 16 },
  label: { color: colors.accentText, fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginTop: 10 },
  subtitle: { color: colors.muted, marginTop: 10, fontSize: 14, lineHeight: 21 },
  sectionTitle: { fontSize: 21, fontWeight: 'bold', color: colors.text, marginBottom: 14 },
});
