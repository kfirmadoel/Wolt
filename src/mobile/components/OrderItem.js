import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function OrderItem({ item, editing, disabled, onIncrease, onDecrease, onRemove }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const name = item.name || `Menu item ${item.productId || ''}`;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.picture ? <Image source={{ uri: item.picture }} style={styles.image} /> : null}
        <View style={styles.details}>
          <Text style={styles.name}>{name}</Text>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          <Text style={styles.price}>{Number.isFinite(item.price) ? `₪${item.price.toFixed(2)} each` : 'Saved price unavailable'}</Text>
          {!editing ? <Text style={styles.quantity}>Quantity: {item.quantity}</Text> : null}
        </View>
      </View>
      {editing ? (
        <View style={[styles.actions, disabled && styles.disabled]}>
          <View style={styles.controls}>
            <TouchableOpacity onPress={onDecrease} disabled={disabled} style={styles.button} accessibilityRole="button" accessibilityLabel={`Decrease ${name} quantity`}>
              <Text style={styles.symbol}>−</Text>
            </TouchableOpacity>
            <Text style={styles.count}>{item.quantity}</Text>
            <TouchableOpacity onPress={onIncrease} disabled={disabled} style={styles.button} accessibilityRole="button" accessibilityLabel={`Increase ${name} quantity`}>
              <Text style={styles.symbol}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRemove} disabled={disabled} style={styles.remove} accessibilityRole="button" accessibilityLabel={`Remove ${name}`}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.selected },
  details: { flex: 1 },
  name: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  description: { color: colors.muted, lineHeight: 21, marginTop: 6 },
  price: { color: colors.muted, marginTop: 8 },
  quantity: { color: colors.text, fontWeight: 'bold', marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  symbol: { color: colors.accentText, fontSize: 24 },
  count: { color: colors.text, minWidth: 28, textAlign: 'center', fontWeight: 'bold' },
  remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 },
  removeText: { color: colors.error, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
});
