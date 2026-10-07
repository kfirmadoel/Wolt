// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store'; // needs forum approval

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // true until we've checked the device

  // On app start, restore a previous login from the device
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const savedId = await SecureStore.getItemAsync('userId');
        if (savedToken && savedId) {
          setToken(savedToken);
          setUserId(savedId);
        }
      } catch (e) {
        // storage unreadable -> behave as logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (newToken, newUserId) => {
    await SecureStore.setItemAsync('token', newToken);
    await SecureStore.setItemAsync('userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userId');
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);