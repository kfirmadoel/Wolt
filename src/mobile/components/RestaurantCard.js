import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function RestaurantCard({ restaurant, onPress, horizontal = false }) {
  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontal]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`Open ${restaurant.name}`}
    >
      {restaurant.picture ? (
        <Image source={{ uri: restaurant.picture }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}><Text style={styles.initial}>{restaurant.name?.[0]}</Text></View>
      )}
      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          {restaurant.isPromoted ? <Text style={styles.badge}>Promoted</Text> : null}
        </View>
        <Text style={styles.category}>{restaurant.category}</Text>
        {restaurant.description ? <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text> : null}
        {typeof restaurant.distance === 'number' ? <Text style={styles.distance}>{restaurant.distance.toFixed(1)} km away</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  horizontal: { width: 260, marginRight: 12, marginBottom: 4 },
  image: { width: '100%', height: 145, backgroundColor: COLORS.selected },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 42, fontWeight: 'bold', color: COLORS.primary },
  details: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 19, fontWeight: 'bold', color: COLORS.text },
  badge: { fontSize: 10, color: '#00677e', backgroundColor: COLORS.selected, padding: 5, borderRadius: 5 },
  category: { color: COLORS.muted, marginTop: 5, fontSize: 13 },
  description: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  distance: { color: COLORS.text, marginTop: 10, fontSize: 12 },
});
