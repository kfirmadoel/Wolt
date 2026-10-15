import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {['All', ...categories].map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onSelect(category)}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedCategory === category }}
          style={[styles.button, selectedCategory === category && styles.selected]}
        >
          <Text style={[styles.text, selectedCategory === category && styles.selectedText]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16, gap: 8 },
  button: { borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingHorizontal: 18, paddingVertical: 11 },
  selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  selectedText: { color: '#002a33' },
});
