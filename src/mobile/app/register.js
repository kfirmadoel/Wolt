// app/register.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../components/InputField';
import { API_URL, COLORS } from '../config.js';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5, // keeps the base64 string small
  base64: true,
};

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [role, setRole] = useState('customer');
  const [picture, setPicture] = useState('');
  const [submitted, setSubmitted] = useState(false); // show field errors only after first attempt
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ---- validation (recomputed on every render, so it is live) ----
  const isLongEnough = password.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  const x = Number(latitude);
  const y = Number(longitude);

  const errors = {};
  if (!username.trim()) errors.username = 'Username is required';
  else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters';
  if (!isLongEnough || !hasLetterAndNumber) errors.password = 'Password does not meet the requirements below';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!name.trim()) errors.name = 'Display name is required';
  if (latitude === '' || !Number.isFinite(x) || x < -90 || x > 90) errors.latitude = 'Latitude must be between -90 and 90';
  if (longitude === '' || !Number.isFinite(y) || y < -180 || y > 180) errors.longitude = 'Longitude must be between -180 and 180';
  if (!picture) errors.picture = 'A profile picture is required';

  const show = (field) => (submitted ? errors[field] : undefined);
  // confirm-password mismatch is shown live as soon as the user starts typing it
  const confirmError = confirmPassword && password !== confirmPassword ? errors.confirmPassword : show('confirmPassword');

  // ---- picture: gallery or camera ----
  const handleResult = (result) => {
    if (!result.canceled) {
      const asset = result.assets[0];
      setPicture(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access in your phone settings to choose a picture.');
      return;
    }
    handleResult(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access in your phone settings to take a picture.');
      return;
    }
    handleResult(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const choosePicture = () =>
    Alert.alert('Profile picture', 'Where should the picture come from?', [
      { text: 'Take a photo', onPress: takePhoto },
      { text: 'Choose from gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);

  // ---- submit ----
  const handleRegister = async () => {
    setSubmitted(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          name: name.trim(),
          role,
          picture,
          location: { x, y },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Registration failed');
        return;
      }
      Alert.alert('Account created', 'You can now log in.', [{ text: 'OK', onPress: () => router.replace('/login') }]);
    } catch (err) {
      setServerError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const rule = (ok, text) => (
    <Text style={{ color: ok ? COLORS.ok : COLORS.error, fontSize: 12 }}>{ok ? '✓' : '✗'} {text}</Text>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create account</Text>
      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <InputField placeholder="Username * (min 3 characters)" value={username} onChangeText={setUsername}
        autoCapitalize="none" error={show('username')} />

      <InputField placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry error={show('password')}>
        {rule(isLongEnough, 'At least 8 characters')}
        {rule(hasLetterAndNumber, 'Letters and numbers')}
      </InputField>

      <InputField placeholder="Confirm password *" value={confirmPassword} onChangeText={setConfirmPassword}
        secureTextEntry error={confirmError} />

      <InputField placeholder="Display name *" value={name} onChangeText={setName} error={show('name')} />

      <View style={styles.row}>
        <InputField placeholder="Latitude *" value={latitude} onChangeText={setLatitude} keyboardType="numeric"
          style={{ flex: 1 }} error={show('latitude')} />
        <View style={{ width: 10 }} />
        <InputField placeholder="Longitude *" value={longitude} onChangeText={setLongitude} keyboardType="numeric"
          style={{ flex: 1 }} error={show('longitude')} />
      </View>
      <Text style={styles.hint}>Coordinates are used to sort nearby restaurants.</Text>

      <TouchableOpacity style={[styles.imageButton, show('picture') && { borderColor: COLORS.error }]} onPress={choosePicture}>
        <Text style={styles.imageButtonText}>{picture ? 'Change picture' : '+ Add profile picture *'}</Text>
      </TouchableOpacity>
      {show('picture') ? <Text style={styles.fieldError}>{errors.picture}</Text> : null}
      {picture ? <Image source={{ uri: picture }} style={styles.previewImage} /> : null}

      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleButton, role === 'customer' && styles.roleActive]} onPress={() => setRole('customer')}>
          <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleButton, role === 'restaurant_owner' && styles.roleActive]} onPress={() => setRole('restaurant_owner')}>
          <Text style={[styles.roleText, role === 'restaurant_owner' && styles.roleTextActive]}>Restaurant owner</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, submitting && { opacity: 0.6 }]} onPress={handleRegister} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.primary },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  fieldError: { color: COLORS.error, fontSize: 12, marginBottom: 10, paddingLeft: 5 },
  row: { flexDirection: 'row' },
  hint: { fontSize: 12, color: 'gray', marginBottom: 15, textAlign: 'center' },
  imageButton: { height: 50, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  imageButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  previewImage: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 15 },
  roleContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#e6f9fc', borderColor: COLORS.primary },
  roleText: { color: '#555' },
  roleTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  button: { backgroundColor: COLORS.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center', marginBottom: 30 },
  linkText: { color: '#555', fontSize: 16 },
});