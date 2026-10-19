// app/_layout.js - the only layout: AuthProvider + route guard + Drawer
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

const AUTH_SCREENS = ['login', 'register'];

function AppDrawer() {
  const { token, loading, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Route guard: guests can only see login/register; logged-in users can't go back to them
  useEffect(() => {
    if (loading) return;
    const onAuthScreen = AUTH_SCREENS.includes(segments[0]);
    if (!token && !onAuthScreen) router.replace('/login');
    else if (token && onAuthScreen) router.replace('/');
  }, [token, loading, segments]);

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut }, // the guard sends you to /login
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
          swipeEnabled: !!token,
          headerRight: () => (
            <TouchableOpacity onPress={confirmLogout} style={{ paddingHorizontal: 16 }}>
              <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Log out</Text>
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