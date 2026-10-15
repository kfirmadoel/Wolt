import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import InputField from '../components/InputField';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData, sendData } from '../services/api';

export default function ProfileScreen() {
  const { token, userId, reloadProfile } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const segments = useSegments();
  const isActive = segments[0] === 'profile';
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const versionRef = useRef(0);
  const requestRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = { token, userId, isActive };

  useEffect(() => {
    const version = ++versionRef.current;
    const scope = { token, userId };
    requestRef.current = null;
    setForm(null);
    setSubmitted(false);
    setSaving(false);
    setFeedback(null);
    setResult({ ...scope, profile: null, loading: true, error: '' });
    if (token && userId && isActive) {
      getData(`/api/users/${encodeURIComponent(userId)}`, token)
        .then((profile) => {
          if (!profile || profile.id !== userId) throw new Error('Invalid profile response.');
          if (version !== versionRef.current) return;
          setForm({
            latitude: profile.location?.x === undefined ? '' : String(profile.location.x),
            longitude: profile.location?.y === undefined ? '' : String(profile.location.y),
          });
          setResult({ ...scope, profile, loading: false, error: '' });
          reloadProfile();
        })
        .catch((err) => {
          const message = err.status === 401 || err.status === 403
            ? 'Log out and log in again to view your profile.'
            : 'Could not load your profile. Please try again.';
          if (version === versionRef.current) setResult({ ...scope, profile: null, loading: false, error: message });
        });
    }
    return () => { versionRef.current += 1; requestRef.current = null; };
  }, [token, userId, isActive, reloadVersion]);

  const current = result?.token === token && result?.userId === userId && isActive ? result : null;
  const profile = current?.profile;
  const sameAccount = () => sessionRef.current?.token === token && sessionRef.current?.userId === userId;
  const sameSession = () => sameAccount() && sessionRef.current?.isActive === isActive;
  const reload = () => { if (!requestRef.current) setReloadVersion((value) => value + 1); };
  const changeField = (field, value) => {
    if (requestRef.current || !sameSession()) return;
    setForm((values) => ({ ...values, [field]: value }));
    setFeedback(null);
  };

  const errors = {};
  if (form) {
    const x = Number(form.latitude);
    const y = Number(form.longitude);
    if (!form.latitude.trim() || !Number.isFinite(x) || x < -90 || x > 90) errors.latitude = 'Enter a latitude between -90 and 90.';
    if (!form.longitude.trim() || !Number.isFinite(y) || y < -180 || y > 180) errors.longitude = 'Enter a longitude between -180 and 180.';
  }

  const saveLocation = async () => {
    if (!profile || !form || !token || !userId || !isActive || requestRef.current || !sameSession()) return;
    setSubmitted(true);
    setFeedback(null);
    if (Object.keys(errors).length) return;
    const request = { version: versionRef.current };
    requestRef.current = request;
    setSaving(true);
    try {
      const saved = await sendData(`/api/users/${encodeURIComponent(userId)}/location`, token, 'PATCH', {
        location: { x: Number(form.latitude), y: Number(form.longitude) },
      });
      if (!Number.isFinite(saved?.location?.x) || !Number.isFinite(saved?.location?.y)) throw new Error('Location confirmation is missing.');
      if (sameAccount()) reloadProfile();
      if (requestRef.current !== request || request.version !== versionRef.current || !sameSession()) return;
      setResult({ ...current, profile: { ...profile, location: saved.location } });
      setFeedback({ error: false, message: 'Location saved. Nearby restaurants will use your updated coordinates.' });
    } catch (err) {
      if (requestRef.current !== request || request.version !== versionRef.current || !sameSession()) return;
      setFeedback({ error: true, message: !err.status || err.status >= 500
        ? 'Could not confirm the update. Your changes were kept. Check your saved location before trying again.'
        : err.message || 'Could not save your location. Your changes were kept.' });
    } finally {
      if (requestRef.current === request && sameSession()) { requestRef.current = null; setSaving(false); }
    }
  };

  if (!token || !userId) return <View style={styles.content}><Text style={styles.message}>Log in to view your profile.</Text><TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>My profile</Text>
      {!profile || !form ? <LoadMessage loading={!current || current.loading} error={current?.error} onRetry={reload} /> : (
        <>
          <View style={styles.info}>
            {profile.picture ? <Image source={{ uri: profile.picture }} style={styles.picture} /> : null}
            <Text style={styles.heading}>{profile.name || profile.username}</Text>
            <Text style={styles.message}>@{profile.username}</Text>
            <Text style={styles.role}>{profile.role === 'restaurant_owner' ? 'Restaurant owner' : 'Customer'}</Text>
            {Number.isFinite(profile.location?.x) && Number.isFinite(profile.location?.y) ? <Text style={styles.message}>Saved location: {profile.location.x}, {profile.location.y}</Text> : null}
          </View>
          <Text style={styles.heading}>Your saved location</Text>
          <Text style={styles.message}>These coordinates are used to sort nearby restaurants.</Text>
          <Text style={styles.label}>Latitude</Text>
          <InputField value={form.latitude} onChangeText={(value) => changeField('latitude', value)} editable={!saving} keyboardType="numeric"
            placeholder="Latitude" placeholderTextColor={colors.muted} style={[styles.input, submitted && errors.latitude && styles.invalid]}>
            {submitted && errors.latitude ? <Text style={styles.error}>{errors.latitude}</Text> : null}
          </InputField>
          <Text style={styles.label}>Longitude</Text>
          <InputField value={form.longitude} onChangeText={(value) => changeField('longitude', value)} editable={!saving} keyboardType="numeric"
            placeholder="Longitude" placeholderTextColor={colors.muted} style={[styles.input, submitted && errors.longitude && styles.invalid]}>
            {submitted && errors.longitude ? <Text style={styles.error}>{errors.longitude}</Text> : null}
          </InputField>
          <Text style={styles.message}>Latitude: -90 to 90. Longitude: -180 to 180.</Text>
          {feedback ? <Text style={feedback.error ? styles.error : styles.success}>{feedback.message}</Text> : null}
          <TouchableOpacity onPress={saveLocation} disabled={saving} style={[styles.button, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color="#002a33" /> : null}
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save location'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={saving} onPress={reload} style={styles.linkButton}><Text style={styles.link}>Reload saved location</Text></TouchableOpacity>
          <TouchableOpacity disabled={saving} onPress={() => router.replace('/')} style={styles.linkButton}><Text style={styles.link}>Browse restaurants</Text></TouchableOpacity>
          {profile.role === 'restaurant_owner' ? <TouchableOpacity disabled={saving} onPress={() => router.push({ pathname: '/my-restaurants', params: { refresh: String(Date.now()) } })} style={styles.linkButton}><Text style={styles.link}>My restaurants</Text></TouchableOpacity> : null}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 18 },
  info: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 18, marginBottom: 22 },
  picture: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  heading: { color: colors.text, fontSize: 21, fontWeight: 'bold', marginBottom: 10 },
  role: { color: colors.accentText, fontWeight: 'bold', marginVertical: 12 },
  message: { color: colors.muted, lineHeight: 23 },
  label: { color: colors.text, fontWeight: 'bold', marginTop: 18, marginBottom: 8 },
  input: { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
  invalid: { borderColor: colors.error },
  error: { color: colors.error, lineHeight: 23, marginVertical: 10 },
  success: { color: colors.ok, lineHeight: 23, marginVertical: 10 },
  linkButton: { paddingVertical: 14 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  button: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 8, padding: 16, marginVertical: 18 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
});
