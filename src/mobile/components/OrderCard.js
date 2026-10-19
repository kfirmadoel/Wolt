import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function OrderCard({ order, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const date = Date.parse(order.createdAt);
  const count = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} accessibilityRole="button">
      <Text style={styles.name}>{order.restaurantName || 'Restaurant order'}</Text>
      <Text style={styles.details}>{Number.isFinite(date) ? new Date(date).toLocaleString() : 'Date unavailable'}</Text>
      <Text style={styles.status}>{order.status || 'Submitted'}</Text>
      <Text style={styles.details}>{count} {count === 1 ? 'item' : 'items'}</Text>
      <Text style={styles.total}>{Number.isFinite(order.totalPrice) ? `₪${order.totalPrice.toFixed(2)}` : 'Total unavailable'}</Text>
      <Text style={styles.link}>View or edit order</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 18, marginBottom: 12 },
  name: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
  details: { color: colors.muted, lineHeight: 22, marginTop: 6 },
  status: { color: colors.accentText, textTransform: 'capitalize', marginTop: 10, fontWeight: 'bold' },
  total: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  link: { color: colors.accentText, fontWeight: 'bold', marginTop: 16 },
});
