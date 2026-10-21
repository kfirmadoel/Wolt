import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import InputField from './InputField';
import { useTheme } from '../context/ThemeContext';

export default function RestaurantForm({ form, categories, errors, disabled, onChange, onChoosePicture }) {
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
      {field('name', 'Restaurant name *')}
      {field('description', 'Description', { multiline: true, style: [styles.input, styles.description] })}
      {field('address', 'Address')}
      {field('phone', 'Phone', { keyboardType: 'phone-pad' })}
      <Text style={styles.label}>Category *</Text>
      <View style={styles.options}>
        {categories.map((category) => (
          <TouchableOpacity key={category} disabled={disabled} onPress={() => onChange('category', category)} style={[styles.option, form.category === category && styles.selected]}>
            <Text style={form.category === category ? styles.selectedText : styles.optionText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}
      <Text style={styles.label}>Promoted restaurant? *</Text>
      <View style={styles.options}>
        {[true, false].map((value) => (
          <TouchableOpacity key={String(value)} disabled={disabled} onPress={() => onChange('isPromoted', value)} style={[styles.option, form.isPromoted === value && styles.selected]}>
            <Text style={form.isPromoted === value ? styles.selectedText : styles.optionText}>{value ? 'Yes' : 'No'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.isPromoted ? <Text style={styles.error}>{errors.isPromoted}</Text> : null}
      {field('latitude', 'Latitude *', { keyboardType: 'numeric' })}
      {field('longitude', 'Longitude *', { keyboardType: 'numeric' })}
      <Text style={styles.hint}>Latitude: -90 to 90. Longitude: -180 to 180.</Text>
      <TouchableOpacity disabled={disabled} onPress={onChoosePicture} style={styles.pictureButton}>
        <Text style={styles.selectedText}>{form.picture ? 'Change restaurant picture' : 'Add restaurant picture *'}</Text>
      </TouchableOpacity>
      {errors.picture ? <Text style={styles.error}>{errors.picture}</Text> : null}
      {form.picture ? <Image source={{ uri: form.picture }} style={styles.picture} /> : null}
      <Text style={styles.hint}>Choose a PNG, JPEG, or WebP image up to 3 MB.</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  label: { color: colors.text, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  input: { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
  invalid: { borderColor: colors.error },
  description: { minHeight: 90, height: 90, textAlignVertical: 'top', paddingTop: 12 },
  error: { color: colors.error, lineHeight: 20, marginBottom: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  option: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  selected: { backgroundColor: colors.selected, borderColor: colors.accentText },
  optionText: { color: colors.text },
  selectedText: { color: colors.accentText, fontWeight: 'bold' },
  hint: { color: colors.muted, lineHeight: 22, marginBottom: 12 },
  pictureButton: { padding: 16, borderWidth: 1, borderColor: colors.accentText, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  picture: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
});
