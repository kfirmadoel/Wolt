import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProductCard({ product, restaurantName, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} accessibilityLabel={`View ${product.name}`}>
      <View style={styles.details}>
        {restaurantName ? <Text style={styles.restaurant}>{restaurantName}</Text> : null}
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        <Text style={styles.price}>₪{Number(product.price).toFixed(2)}</Text>
      </View>
      {product.picture ? <Image source={{ uri: product.picture }} style={styles.image} /> : null}
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  details: { flex: 1 },
  restaurant: { color: colors.accentText, fontSize: 12, marginBottom: 6 },
  name: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  description: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6 },
  price: { color: colors.text, fontWeight: 'bold', marginTop: 10 },
  image: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.selected },
});
