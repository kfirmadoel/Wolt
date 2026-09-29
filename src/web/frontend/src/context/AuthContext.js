// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../helper/config';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { setLightTheme } = useTheme();
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user details from backend using userId
    const fetchUserDetails = useCallback(async (currentUserId, currentToken) => {
        if (!currentUserId || !currentToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else if (res.status === 401 || res.status === 403 || res.status === 404) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setToken(null);
                setUserId(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sync state with localStorage
    const syncWithLocalStorage = useCallback(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        
        setToken(storedToken);
        setUserId(storedUserId);
        fetchUserDetails(storedUserId, storedToken);
    }, [fetchUserDetails]);

    // Initial load and sync
    useEffect(() => {
        syncWithLocalStorage();

        const handleStorageChange = () => {
            syncWithLocalStorage();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleStorageChange);
        };
    }, [syncWithLocalStorage]);

    const login = async (newToken, newUserId) => {
        setLightTheme();
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        setToken(newToken);
        setUserId(newUserId);
        window.dispatchEvent(new Event('authChange'));
        await fetchUserDetails(newUserId, newToken);
    };

    const logout = () => {
        setLightTheme();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUserId(null);
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
    };

    const refreshUser = () => {
        return syncWithLocalStorage();
    };

    const isAuthenticated = Boolean(token && userId);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                userId,
                loading,
                isAuthenticated,
                login,
                logout,
                refreshUser,
                syncWithLocalStorage
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

