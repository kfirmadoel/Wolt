import React from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CartItem from '../components/CartItem';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen() {
  const { token, userId } = useAuth();
  const { restaurantId, restaurantName, items, itemCount, total, changeQuantity, removeItem } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!token || !userId) {
    return (
      <View style={styles.empty}>
        <Text style={styles.message}>Log in to use your cart.</Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.button}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.product.id}
      renderItem={({ item }) => (
        <CartItem item={item} onIncrease={() => changeQuantity(item.product.id, 1)} onDecrease={() => changeQuantity(item.product.id, -1)} onRemove={() => removeItem(item.product.id)} />
      )}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Your cart</Text>
          {restaurantId ? (
            <TouchableOpacity onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurantId } })} style={styles.restaurantLink}>
              <Text style={styles.link}>{restaurantName}</Text>
              <Text style={styles.hint}>Back to menu</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.heading}>Your cart is empty</Text>
          <Text style={styles.message}>Choose a restaurant and add dishes to your cart.</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.button}>
            <Text style={styles.buttonText}>Browse restaurants</Text>
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={items.length > 0 ? (
        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text style={styles.message}>Items</Text><Text style={styles.message}>{itemCount}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.heading}>Total</Text><Text style={styles.heading}>₪{total.toFixed(2)}</Text></View>
        </View>
      ) : null}
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  restaurantLink: { paddingVertical: 12, marginBottom: 8 },
  link: { color: colors.accentText, fontSize: 17, fontWeight: 'bold' },
  hint: { color: colors.muted, marginTop: 5 },
  empty: { padding: 24, alignItems: 'center', backgroundColor: colors.background },
  message: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  heading: { color: colors.text, fontSize: 21, fontWeight: 'bold', marginVertical: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 14, marginTop: 20 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  summary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginTop: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
