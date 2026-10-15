import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {[null, ...categories].map((category) => (
        <TouchableOpacity
          key={category === null ? 'all' : `category-${category}`}
          onPress={() => onSelect(category)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedCategory === category }}
          style={[styles.button, selectedCategory === category && styles.selected]}
        >
          <Text style={[styles.text, selectedCategory === category && styles.selectedText]}>{category === null ? 'All categories' : category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { paddingVertical: 16, gap: 8 },
  button: { borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 18, paddingVertical: 11 },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 14, fontWeight: '600' },
  selectedText: { color: '#002a33' },
});
