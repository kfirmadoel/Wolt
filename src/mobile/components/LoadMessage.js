import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function LoadMessage({ loading, error, empty, onRetry }) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
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

const styles = StyleSheet.create({
  container: { paddingVertical: 28, alignItems: 'center' },
  text: { color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  error: { color: COLORS.error },
  button: { marginTop: 14, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.primary },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
});
