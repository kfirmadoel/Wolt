import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SearchBar({ onSearch, onClear, loading }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleClear = () => {
    setQuery('');
    onClear();
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search restaurants or dishes"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Search restaurants or dishes"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          onSubmitEditing={() => { if (!loading) onSearch(query); }}
        />
        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={() => onSearch(query)} disabled={loading}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {query ? <TouchableOpacity onPress={handleClear} style={styles.clear}><Text style={styles.clearText}>Clear search</Text></TouchableOpacity> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { marginVertical: 18 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.card, color: colors.text, padding: 12, fontSize: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  disabled: { opacity: 0.6 },
  clear: { alignSelf: 'flex-end', padding: 8 },
  clearText: { color: colors.accentText },
});
