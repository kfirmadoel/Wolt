// app/_layout.js - the only layout: AuthProvider + route guard + Drawer
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

const AUTH_SCREENS = ['login', 'register'];
const PUBLIC_SCREENS = [undefined, 'index', 'search', 'restaurant'];

function AppDrawer() {
  const { token, loading, signOut, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Browsing is public; account actions still require a login.
  useEffect(() => {
    if (loading) return;
    const onAuthScreen = AUTH_SCREENS.includes(segments[0]);
    if (!token && !onAuthScreen && !PUBLIC_SCREENS.includes(segments[0])) router.replace('/login');
    else if (token && onAuthScreen) router.replace('/');
  }, [token, loading, segments]);

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        try {
          await signOut();
          router.replace('/login');
        } catch (err) {
          Alert.alert('Log out failed', 'Please try again.');
        }
      } },
    ]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const authScreenOptions = {
    headerShown: false,                    // no header on login/register
    swipeEnabled: false,                   // can't swipe the drawer open as a guest
    drawerItemStyle: { display: 'none' },  // not listed in the drawer
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerTitleAlign: 'center',
          drawerActiveTintColor: COLORS.primary,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 170 }}>
              {profile?.picture ? <Image source={{ uri: profile.picture }} style={{ width: 30, height: 30, borderRadius: 15 }} /> : null}
              <Text numberOfLines={1} style={{ color: COLORS.text, fontWeight: 'bold', flexShrink: 1 }}>{profile?.name || 'Wolt Clone'}</Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={token ? confirmLogout : () => router.push('/login')} style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: token ? COLORS.error : COLORS.text, fontWeight: 'bold' }}>{token ? 'Log out' : 'Log in'}</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: 'Restaurants', title: 'Wolt Clone' }} />
        <Drawer.Screen name="login" options={authScreenOptions} />
        <Drawer.Screen name="register" options={authScreenOptions} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDrawer />
    </AuthProvider>
  );
}
