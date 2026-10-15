import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LoadMessage({ loading, error, empty, onRetry }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
        <>
          <Text style={[styles.text, error && styles.error]}>{error || empty}</Text>
          {error && onRetry ? (
            <TouchableOpacity onPress={onRetry} style={styles.button} accessibilityRole="button">
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { paddingVertical: 28, alignItems: 'center' },
  text: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
  error: { color: colors.error },
  button: { marginTop: 14, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
});
