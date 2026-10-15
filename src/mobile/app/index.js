import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import RestaurantCard from '../components/RestaurantCard';
import CategoryFilter from '../components/CategoryFilter';
import RestaurantSection from '../components/RestaurantSection';
import { COLORS } from '../config';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [...new Set(restaurants.map((restaurant) => restaurant.category).filter(Boolean))].sort();
  const filtered = selectedCategory === 'All' ? restaurants : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hero}>
            <Text style={styles.label}>FOOD & MORE</Text>
            <Text style={styles.title}>What are you craving?</Text>
            <Text style={styles.subtitle}>Find your next meal from the restaurants around you.</Text>
          </View>
          <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          <RestaurantSection title="Promoted restaurants" restaurants={filtered.filter((restaurant) => restaurant.isPromoted)} />
          <Text style={styles.sectionTitle}>{selectedCategory === 'All' ? 'All restaurants' : selectedCategory}</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No restaurants available.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 32 },
  hero: { backgroundColor: COLORS.selected, padding: 22, borderRadius: 16 },
  label: { color: '#00677e', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  subtitle: { color: COLORS.muted, marginTop: 10, fontSize: 14, lineHeight: 21 },
  sectionTitle: { fontSize: 21, fontWeight: 'bold', color: COLORS.text, marginBottom: 14 },
  empty: { color: COLORS.muted, textAlign: 'center', paddingVertical: 32 },
});
