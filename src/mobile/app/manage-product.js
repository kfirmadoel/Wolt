import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ProductForm from '../components/ProductForm';
import LoadMessage from '../components/LoadMessage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getData, sendData } from '../services/api';

const PICKER_OPTIONS = { mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.5, base64: true };
const IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export default function ManageProductScreen() {
  const params = useLocalSearchParams();
  const restaurantId = typeof params.restaurantId === 'string' ? params.restaurantId : '';
  const productId = typeof params.id === 'string' ? params.id : '';
  const { refresh } = params;
  const { token, userId, profile, profileError, reloadProfile } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isOwner = profile?.id === userId && profile?.role === 'restaurant_owner';
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState('');
  const [actionError, setActionError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const versionRef = useRef(0);
  const requestRef = useRef(null);
  const sessionRef = useRef(null);
  sessionRef.current = { token, userId, restaurantId, productId, refresh, isOwner };

  useEffect(() => {
    const version = ++versionRef.current;
    const scope = { token, userId, restaurantId, productId, refresh };
    requestRef.current = null;
    setForm(null);
    setSubmitted(false);
    setPending('');
    setActionError('');
    setResult({ ...scope, loading: true, error: '', restaurantName: '' });
    if (token && userId && isOwner) {
      const load = async () => {
        try {
          if (!restaurantId || (params.id !== undefined && typeof params.id !== 'string')) {
            const error = new Error('Restaurant or dish not found.');
            error.status = 404;
            throw error;
          }
          const restaurant = await getData(`/api/restaurants/${encodeURIComponent(restaurantId)}`, token);
          if (!restaurant || restaurant.id !== restaurantId || restaurant.ownerId !== userId) {
            const error = new Error('You cannot manage this menu.');
            error.status = 403;
            throw error;
          }
          const product = productId ? await getData(`/api/restaurants/${encodeURIComponent(restaurantId)}/products/${encodeURIComponent(productId)}`, token) : null;
          if (productId && (!product || product.id !== productId || product.restaurantId !== restaurantId)) {
            const error = new Error('Dish not found.');
            error.status = 404;
            throw error;
          }
          if (version !== versionRef.current) return;
          setForm({
            name: product?.name || '', description: product?.description || '', category: product?.category || '',
            picture: product?.picture || '', price: product?.price === undefined ? '' : String(product.price),
          });
          setResult({ ...scope, loading: false, error: '', restaurantName: restaurant.name });
        } catch (err) {
          let message = 'Could not load the dish form. Please try again.';
          if (err.status === 404) message = 'Restaurant or dish not found.';
          else if (err.status === 403) message = 'You cannot manage this menu.';
          else if (err.status === 401) message = 'Log out and log in again to manage the menu.';
          if (version === versionRef.current) setResult({ ...scope, loading: false, error: message, restaurantName: '' });
        }
      };
      load();
    }
    return () => { versionRef.current += 1; requestRef.current = null; };
  }, [token, userId, isOwner, restaurantId, productId, refresh, reloadVersion]);

  const sameSession = () => sessionRef.current?.token === token && sessionRef.current?.userId === userId &&
    sessionRef.current?.restaurantId === restaurantId && sessionRef.current?.productId === productId &&
    sessionRef.current?.refresh === refresh && sessionRef.current?.isOwner === isOwner;
  const current = result?.token === token && result?.userId === userId && result?.restaurantId === restaurantId && result?.productId === productId && result?.refresh === refresh ? result : null;
  const openMenu = () => router.replace({ pathname: '/manage-menu', params: { restaurantId, refresh: String(Date.now()) } });
  const reload = () => { if (!requestRef.current) setReloadVersion((value) => value + 1); };
  const changeField = (field, value) => {
    if (requestRef.current || !sameSession()) return;
    setForm((values) => ({ ...values, [field]: value }));
    setActionError('');
  };

  const errors = {};
  if (form) {
    if (!form.name.trim()) errors.name = 'Dish name is required.';
    const price = Number(form.price);
    if (!form.price.trim() || !Number.isFinite(price) || price <= 0) errors.price = 'Enter a price greater than zero.';
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
    } catch (err) {
      if (isCurrent()) setActionError('Could not open the picture. Please try again.');
    } finally {
      if (isCurrent()) { requestRef.current = null; setPending(''); }
    }
  };

  const choosePicture = () => {
    if (requestRef.current || !sameSession()) return;
    const version = versionRef.current;
    Alert.alert('Dish picture', 'Where should the picture come from?', [
      { text: 'Take a photo', onPress: () => pickPicture(true, version) },
      { text: 'Choose from gallery', onPress: () => pickPicture(false, version) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveProduct = async () => {
    if (!form || !current || current.loading || requestRef.current || !sameSession() || !isOwner) return;
    setSubmitted(true);
    setActionError('');
    if (Object.keys(errors).length) return;
    const request = { version: versionRef.current };
    requestRef.current = request;
    setPending('save');
    const payload = { name: form.name.trim(), description: form.description.trim(), category: form.category.trim(), picture: form.picture, price: Number(form.price) };
    const path = `/api/restaurants/${encodeURIComponent(restaurantId)}/products${productId ? `/${encodeURIComponent(productId)}` : ''}`;
    try {
      await sendData(path, token, productId ? 'PATCH' : 'POST', payload);
      if (requestRef.current === request && request.version === versionRef.current && sameSession()) {
        setForm(null);
        openMenu();
      }
    } catch (err) {
      if (requestRef.current !== request || request.version !== versionRef.current || !sameSession()) return;
      setActionError(!err.status || err.status >= 500
        ? 'Could not confirm the save. Your changes were kept. Check the menu before trying again.'
        : err.message || 'Could not save the dish. Your changes were kept.');
    } finally {
      if (requestRef.current === request && sameSession()) { requestRef.current = null; setPending(''); }
    }
  };

  const confirmDelete = () => {
    if (!productId || !form || requestRef.current || !sameSession() || !isOwner) return;
    const version = versionRef.current;
    Alert.alert('Delete dish?', 'This will remove the dish from the menu.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (version !== versionRef.current || requestRef.current || !sameSession()) return;
        const request = { version };
        requestRef.current = request;
        setPending('delete');
        setActionError('');
        try {
          await sendData(`/api/restaurants/${encodeURIComponent(restaurantId)}/products/${encodeURIComponent(productId)}`, token, 'DELETE');
          if (requestRef.current === request && version === versionRef.current && sameSession()) { setForm(null); openMenu(); }
        } catch (err) {
          if (requestRef.current !== request || version !== versionRef.current || !sameSession()) return;
          setActionError(!err.status || err.status >= 500
            ? 'Could not confirm the deletion. Check the menu before trying again.'
            : err.message || 'Could not delete the dish.');
        } finally {
          if (requestRef.current === request && sameSession()) { requestRef.current = null; setPending(''); }
        }
      } },
    ]);
  };

  if (!token || !userId) return <View style={styles.content}><Text style={styles.message}>Log in to manage your menu.</Text><TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkButton}><Text style={styles.link}>Log in</Text></TouchableOpacity></View>;
  if (profile?.id !== userId) return <View style={styles.content}><LoadMessage loading={!profileError} error={profileError} onRetry={reloadProfile} /></View>;
  if (!isOwner) return <View style={styles.content}><Text style={styles.message}>Menu management is available to restaurant owners.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity disabled={!!pending} onPress={openMenu} style={styles.linkButton}><Text style={styles.link}>Back to menu</Text></TouchableOpacity>
      <Text style={styles.title}>{productId ? 'Edit dish' : 'Add dish'}</Text>
      {!current || current.loading || current.error || !form ? (
        <LoadMessage loading={!current || current.loading || (!form && !current.error)} error={current?.error} onRetry={reload} />
      ) : (
        <>
          <Text style={styles.heading}>{current.restaurantName}</Text>
          <ProductForm form={form} errors={submitted ? errors : {}} disabled={!!pending} onChange={changeField} onChoosePicture={choosePicture} />
          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
          {pending === 'picture' ? <ActivityIndicator color={colors.primary} /> : null}
          <TouchableOpacity onPress={saveProduct} disabled={!!pending} style={[styles.button, !!pending && styles.disabled]}>
            {pending === 'save' ? <ActivityIndicator color="#002a33" /> : null}
            <Text style={styles.buttonText}>{pending === 'save' ? 'Saving...' : 'Save dish'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={!!pending} onPress={openMenu} style={styles.cancel}><Text style={styles.link}>Cancel</Text></TouchableOpacity>
          {productId ? <TouchableOpacity onPress={confirmDelete} disabled={!!pending} style={[styles.deleteButton, !!pending && styles.disabled]}>
            {pending === 'delete' ? <ActivityIndicator color={colors.error} /> : null}
            <Text style={styles.error}>{pending === 'delete' ? 'Deleting...' : 'Delete dish'}</Text>
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
  heading: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
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
