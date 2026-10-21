import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CartItem({ item, onIncrease, onDecrease, onRemove, disabled = false }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { product, quantity } = item;

  return (
    <View style={styles.card}>
      <View style={styles.details}>
        {product.picture ? <Image source={{ uri: product.picture }} style={styles.image} /> : null}
        <View style={styles.description}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₪{Number(product.price).toFixed(2)} each</Text>
          <Text style={styles.lineTotal}>₪{(Number(product.price) * quantity).toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.actions, disabled && styles.disabled]}>
        <View style={styles.quantity}>
          <TouchableOpacity onPress={onDecrease} disabled={disabled} style={styles.quantityButton} accessibilityRole="button" accessibilityLabel={`Decrease ${product.name} quantity`}>
            <Text style={styles.quantityText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.count}>{quantity}</Text>
          <TouchableOpacity onPress={onIncrease} disabled={disabled} style={styles.quantityButton} accessibilityRole="button" accessibilityLabel={`Increase ${product.name} quantity`}>
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onRemove} disabled={disabled} style={styles.remove} accessibilityRole="button" accessibilityLabel={`Remove ${product.name}`}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  details: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.selected },
  description: { flex: 1 },
  name: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  price: { color: colors.muted, marginTop: 6 },
  lineTotal: { color: colors.text, fontWeight: 'bold', marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  quantity: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  quantityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quantityText: { color: colors.accentText, fontSize: 24 },
  count: { color: colors.text, minWidth: 28, textAlign: 'center', fontWeight: 'bold' },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  removeText: { color: colors.error, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
});
