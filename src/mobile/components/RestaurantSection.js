import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import RestaurantCard from './RestaurantCard';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantSection({ title, restaurants, onSelect }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (restaurants.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard restaurant={item} horizontal onPress={onSelect ? () => onSelect(item) : undefined} />
        )}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  section: { marginBottom: 22 },
  title: { fontSize: 21, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
});
