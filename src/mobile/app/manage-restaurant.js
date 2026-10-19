import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, useSegments } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import RestaurantForm from '../components/RestaurantForm';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData, sendData } from '../services/api';

const PICKER_OPTIONS = { mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true };
const IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export default function ManageRestaurantScreen() {
  const { id, refresh } = useLocalSearchParams();
  const restaurantId = typeof id === 'string' ? id : '';
  const segments = useSegments();
  const isActive = segments[0] === 'manage-restaurant';
  const { token, userId, profile, profileError, reloadProfile } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isOwner = profile?.id === userId && profile?.role === 'restaurant_owner';
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(null);
  const [pictureChanged, setPictureChanged] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const versionRef = useRef(0);
  const requestRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = { token, userId, restaurantId, refresh, isOwner, isActive };

  useEffect(() => {
    const version = ++versionRef.current;
    const scope = { token, userId, restaurantId, refresh };
    requestRef.current = null;
    setForm(null);
    setPictureChanged(false);
    setSubmitted(false);
    setPending('');
    setActionError('');
    setResult({ ...scope, loading: true, error: '', categories: [] });
    if (token && userId && isOwner && isActive) {
      const load = async () => {
        try {
          if (id !== undefined && typeof id !== 'string') throw new Error('Invalid restaurant ID.');
          const categories = await getData('/api/restaurants/categories', token);
          if (!Array.isArray(categories) || !categories.length || categories.some((category) => typeof category !== 'string')) throw new Error('Invalid categories response.');
          const restaurant = restaurantId ? await getData(`/api/restaurants/${encodeURIComponent(restaurantId)}`, token) : null;
          if (restaurantId && (!restaurant || restaurant.id !== restaurantId || restaurant.ownerId !== userId)) {
            const error = new Error('You cannot manage this restaurant.');
            error.status = 403;
            throw error;
          }
          if (version !== versionRef.current) return;
          setForm({
            name: restaurant?.name || '', description: restaurant?.description || '', address: restaurant?.address || '',
            phone: restaurant?.phone || '', category: restaurant?.category || '',
            isPromoted: restaurant ? restaurant.isPromoted : null, picture: restaurant?.picture || '',
            latitude: restaurant?.location?.x === undefined ? '' : String(restaurant.location.x),
            longitude: restaurant?.location?.y === undefined ? '' : String(restaurant.location.y),
          });
          setResult({ ...scope, loading: false, error: '', categories });
        } catch (err) {
          let message = 'Could not load the restaurant form. Please try again.';
          if (err.status === 404) message = 'Restaurant not found.';
          else if (err.status === 403) message = 'You cannot manage this restaurant.';
          else if (err.status === 401) message = 'Log out and log in again to manage restaurants.';
          if (version === versionRef.current) setResult({ ...scope, loading: false, error: message, categories: [] });
        }
      };
      load();
    }
    return () => { versionRef.current += 1; requestRef.current = null; };
  }, [token, userId, isOwner, restaurantId, refresh, reloadVersion, isActive]);

  const sameSession = () => sessionRef.current?.token === token && sessionRef.current?.userId === userId &&
    sessionRef.current?.restaurantId === restaurantId && sessionRef.current?.refresh === refresh && sessionRef.current?.isOwner === isOwner && sessionRef.current?.isActive === isActive;
  const current = result?.token === token && result?.userId === userId && result?.restaurantId === restaurantId && result?.refresh === refresh && isActive ? result : null;
  const openRestaurants = () => router.replace({ pathname: '/my-restaurants', params: { refresh: String(Date.now()) } });
  const reload = () => { if (!requestRef.current) setReloadVersion((value) => value + 1); };
  const changeField = (field, value) => {
    if (requestRef.current || !sameSession()) return;
    setForm((values) => ({ ...values, [field]: value }));
    setActionError('');
  };

  const errors = {};
  if (form) {
    if (!form.name.trim()) errors.name = 'Restaurant name is required.';
    if (form.phone && !/^\d+$/.test(form.phone)) errors.phone = 'Phone number must contain digits only.';
    if (!current?.categories.includes(form.category)) errors.category = 'Choose an available category.';
    if (typeof form.isPromoted !== 'boolean') errors.isPromoted = 'Choose Yes or No.';
    const x = Number(form.latitude);
    const y = Number(form.longitude);
    if (!form.latitude.trim() || !Number.isFinite(x) || x < -90 || x > 90) errors.latitude = 'Enter a latitude between -90 and 90.';
    if (!form.longitude.trim() || !Number.isFinite(y) || y < -180 || y > 180) errors.longitude = 'Enter a longitude between -180 and 180.';
    if ((!restaurantId || pictureChanged) && !IMAGE_PATTERN.test(form.picture)) errors.picture = 'Choose a PNG, JPEG, or WebP restaurant picture.';
  }

  const pickPicture = async (camera, version) => {
    if (version !== versionRef.current || requestRef.current || !sameSession()) return;
    const request = { version };
    requestRef.current = request;
    setPending('picture');
    setActionError('');
    const isCurrent = () => requestRef.current === request && version === versionRef.current && sameSession();
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!isCurrent()) return;
        if (!permission.granted) {
          setActionError('Allow camera access in your phone settings to take a picture.');
          return;
        }
      }
      // The gallery uses the system chooser without requesting broad photo access.
      const selection = camera ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS) : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (!isCurrent() || selection.canceled) return;
      const asset = selection.assets?.[0];
      const picture = `data:${asset?.mimeType || 'image/jpeg'};base64,${asset?.base64 || ''}`;
      if (!IMAGE_PATTERN.test(picture)) {
        setActionError('Choose a PNG, JPEG, or WebP picture.');
        return;
      }
      if (asset.base64.length > 4 * 1024 * 1024) {
        setActionError('Choose a picture that is 3 MB or smaller.');
        return;
      }
      setForm((values) => ({ ...values, picture }));
      setPictureChanged(true);
    } catch (err) {
      if (isCurrent()) setActionError('Could not open the picture. Please try again.');
    } finally {
      if (isCurrent()) { requestRef.current = null; setPending(''); }
    }
  };

  const choosePicture = () => {
    if (requestRef.current || !sameSession()) return;
    const version = versionRef.current;
    Alert.alert('Restaurant picture', 'Where should the picture come from?', [
      { text: 'Take a photo', onPress: () => pickPicture(true, version) },
      { text: 'Choose from gallery', onPress: () => pickPicture(false, version) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveRestaurant = async () => {
    if (!form || !current || current.loading || requestRef.current || !sameSession() || !isOwner) return;
    setSubmitted(true);
    setActionError('');
    if (Object.keys(errors).length) return;
    const request = { version: versionRef.current };
    requestRef.current = request;
    setPending('save');
    const payload = {
      name: form.name.trim(), description: form.description.trim(), address: form.address.trim(), phone: form.phone,
      category: form.category, isPromoted: form.isPromoted, location: { x: Number(form.latitude), y: Number(form.longitude) },
    };
    if (!restaurantId || pictureChanged) payload.picture = form.picture;
    try {
      await sendData(restaurantId ? `/api/restaurants/${encodeURIComponent(restaurantId)}` : '/api/restaurants', token, restaurantId ? 'PATCH' : 'POST', payload);
      if (requestRef.current === request && request.version === versionRef.current && sameSession()) {
        setForm(null);
        openRestaurants();
      }
    } catch (err) {
      if (requestRef.current !== request || request.version !== versionRef.current || !sameSession()) return;
      setActionError(!err.status || err.status >= 500
        ? 'Could not confirm the save. Your changes were kept. Check My restaurants before trying again.'
        : err.message || 'Could not save the restaurant. Your changes were kept.');
    } finally {
      if (requestRef.current === request && sameSession()) { requestRef.current = null; setPending(''); }
    }
  };

  const confirmDelete = () => {
    if (!restaurantId || !form || requestRef.current || !sameSession() || !isOwner) return;
    const version = versionRef.current;
    Alert.alert('Delete restaurant?', 'This will delete the restaurant and its menu.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (version !== versionRef.current || requestRef.current || !sameSession()) return;
        const request = { version };
        requestRef.current = request;
        setPending('delete');
        setActionError('');
        try {
          await sendData(`/api/restaurants/${encodeURIComponent(restaurantId)}`, token, 'DELETE');
          if (requestRef.current === request && version === versionRef.current && sameSession()) { setForm(null); openRestaurants(); }
        } catch (err) {
          if (requestRef.current !== request || version !== versionRef.current || !sameSession()) return;
          setActionError(!err.status || err.status >= 500
            ? 'Could not confirm the deletion. Check My restaurants before trying again.'
            : err.message || 'Could not delete the restaurant.');
        } finally {
          if (requestRef.current === request && sameSession()) { requestRef.current = null; setPending(''); }
        }
      } },
    ]);
  };

  if (!token || !userId) return <View style={styles.content}><Text style={styles.message}>Log in to manage restaurants.</Text><TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity></View>;
  if (profile?.id !== userId) return <View style={styles.content}><LoadMessage loading={!profileError} error={profileError} onRetry={reloadProfile} /></View>;
  if (!isOwner) return <View style={styles.content}><Text style={styles.message}>Restaurant management is available to restaurant owners.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity disabled={!!pending} onPress={openRestaurants} style={styles.linkButton}><Text style={styles.link}>Back to My restaurants</Text></TouchableOpacity>
      <Text style={styles.title}>{restaurantId ? 'Edit restaurant' : 'Add restaurant'}</Text>
      {!current || current.loading || current.error || !form ? (
        <LoadMessage loading={!current || current.loading || (!form && !current.error)} error={current?.error} onRetry={reload} />
      ) : (
        <>
          <RestaurantForm form={form} categories={current.categories} errors={submitted ? errors : {}} disabled={!!pending} onChange={changeField} onChoosePicture={choosePicture} />
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
          {pending === 'picture' ? <ActivityIndicator color={colors.primary} /> : null}
          <TouchableOpacity onPress={saveRestaurant} disabled={!!pending} style={[styles.button, !!pending && styles.disabled]}>
            {pending === 'save' ? <ActivityIndicator color="#002a33" /> : null}
            <Text style={styles.buttonText}>{pending === 'save' ? 'Saving...' : 'Save restaurant'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={!!pending} onPress={openRestaurants} style={styles.cancel}><Text style={styles.link}>Cancel</Text></TouchableOpacity>
          {restaurantId ? <TouchableOpacity onPress={confirmDelete} disabled={!!pending} style={[styles.deleteButton, !!pending && styles.disabled]}>
            {pending === 'delete' ? <ActivityIndicator color={colors.error} /> : null}
            <Text style={styles.error}>{pending === 'delete' ? 'Deleting...' : 'Delete restaurant'}</Text>
          </TouchableOpacity> : null}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginVertical: 14 },
  message: { color: colors.muted, lineHeight: 23 },
  linkButton: { paddingVertical: 12 },
  link: { color: colors.accentText, fontWeight: 'bold' },
  error: { color: colors.error, lineHeight: 23, marginVertical: 8 },
  button: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 8, padding: 16, marginTop: 18 },
  buttonText: { color: '#002a33', fontWeight: 'bold' },
  cancel: { padding: 16, alignItems: 'center' },
  deleteButton: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: 8, marginTop: 16 },
  disabled: { opacity: 0.5 },
});
