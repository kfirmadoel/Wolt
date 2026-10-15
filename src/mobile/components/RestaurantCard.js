import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantCard({ restaurant, onPress, horizontal = false }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

const createStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  horizontal: { width: 260, marginRight: 12, marginBottom: 4 },
  image: { width: '100%', height: 145, backgroundColor: colors.selected },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 42, fontWeight: 'bold', color: colors.primary },
  details: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 19, fontWeight: 'bold', color: colors.text },
  badge: { fontSize: 10, color: colors.accentText, backgroundColor: colors.selected, padding: 5, borderRadius: 5 },
  category: { color: colors.muted, marginTop: 5, fontSize: 13 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  distance: { color: colors.text, marginTop: 10, fontSize: 12 },
});
