// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../helper/config';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { setLightTheme } = useTheme();
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const profileRequest = useRef(null);

    // Fetch user details from backend using userId
    const fetchUserDetails = useCallback(async (currentUserId, currentToken) => {
        if (profileRequest.current?.token !== currentToken || profileRequest.current?.userId !== currentUserId) {
            setUser(null);
            setLoading(true);
        }
        const request = { token: currentToken, userId: currentUserId };
        profileRequest.current = request;
        const isCurrentRequest = () => profileRequest.current === request &&
            localStorage.getItem('token') === currentToken &&
            localStorage.getItem('userId') === currentUserId;

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
            if (!isCurrentRequest()) return;

            if (res.ok) {
                const userData = await res.json();
                if (isCurrentRequest()) setUser(userData);
            } else if (res.status === 401 || res.status === 403 || res.status === 404) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setToken(null);
                setUserId(null);
                setUser(null);
                setLoading(false);
            }
        } catch (err) {
            if (isCurrentRequest()) console.error('Error fetching user profile:', err);
        } finally {
            if (isCurrentRequest()) setLoading(false);
        }
    }, []);

    // Sync state with localStorage
    const syncWithLocalStorage = useCallback(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        
        setToken(storedToken);
        setUserId(storedUserId);
        return fetchUserDetails(storedUserId, storedToken);
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
            profileRequest.current = null;
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
        profileRequest.current = null;
        setLightTheme();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUserId(null);
        setUser(null);
        setLoading(false);
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

