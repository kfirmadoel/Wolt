import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import InputField from './InputField';
import { useTheme } from '../context/ThemeContext';

export default function ProductForm({ form, errors, disabled, onChange, onChoosePicture }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const field = (key, label, props = {}) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <InputField value={form[key]} onChangeText={(value) => onChange(key, value)} editable={!disabled}
        placeholder={label} placeholderTextColor={colors.muted} style={[styles.input, errors[key] && styles.invalid]} {...props}>
        {errors[key] ? <Text style={styles.error}>{errors[key]}</Text> : null}
      </InputField>
    </View>
  );

  return (
    <View>
      {field('name', 'Dish name *')}
      {field('price', 'Price (₪) *', { keyboardType: 'decimal-pad' })}
      {field('description', 'Description', { multiline: true, style: [styles.input, styles.description] })}
      {field('category', 'Category')}
      <TouchableOpacity disabled={disabled} onPress={onChoosePicture} style={styles.pictureButton}>
        <Text style={styles.link}>{form.picture ? 'Change dish picture' : 'Add dish picture'}</Text>
      </TouchableOpacity>
      {form.picture ? <>
        <Image source={{ uri: form.picture }} style={styles.picture} />
        <TouchableOpacity disabled={disabled} onPress={() => onChange('picture', '')} style={styles.removeButton}><Text style={styles.link}>Remove picture</Text></TouchableOpacity>
      </> : null}
      <Text style={styles.hint}>Picture is optional. Choose a PNG, JPEG, or WebP image up to 3 MB.</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  label: { color: colors.text, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  input: { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
  invalid: { borderColor: colors.error },
  description: { minHeight: 90, height: 90, textAlignVertical: 'top', paddingTop: 12 },
  error: { color: colors.error, lineHeight: 20, marginBottom: 8 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  hint: { color: colors.muted, lineHeight: 22, marginBottom: 12 },
  pictureButton: { padding: 16, borderWidth: 1, borderColor: colors.accentText, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  picture: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  removeButton: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
});
