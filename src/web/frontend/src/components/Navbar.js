// src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../css/Navbar.css';

function Navbar() {
    const { toggleTheme, isDark } = useTheme();
    const { user, isAuthenticated, logout, syncWithLocalStorage } = useAuth();
    const { itemCount } = useCart();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutRequested, setLogoutRequested] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Sync auth state on route changes
    useEffect(() => {
        syncWithLocalStorage();
    }, [location.pathname, syncWithLocalStorage]);

    // Leave protected pages before clearing the session.
    useEffect(() => {
        if (logoutRequested && location.pathname === '/') {
            logout();
            setLogoutRequested(false);
        }
    }, [logoutRequested, location.pathname, logout]);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Sync search input with URL search params if present
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const q = queryParams.get('q');
        if (q !== null) {
            setSearchQuery(q);
        } else {
            setSearchQuery('');
        }
    }, [location.search]);

    // Close user dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    if (isAuthPage) {
        return null;
    }

    // Handle search submission or typing
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            navigate(`/?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/');
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        navigate('/');
    };

    // Handle logout action
    const handleLogout = () => {
        setDropdownOpen(false);
        setLogoutRequested(true);
        navigate('/');
    };

    const displayName = user?.name || user?.username || 'User';
    const userInitial = displayName.charAt(0).toUpperCase();

    return (
        <header className="wolt-navbar">
            <div className="wolt-navbar-container">
                {/* Left: Brand and Location */}
                <div className="navbar-left">
                    <Link to="/" className="wolt-brand-link">
                        <span className="wolt-logo-text">wolt</span>
                    </Link>
                </div>

                {/* Center: Search Bar */}
                <div className="navbar-center">
                    <form className="navbar-search-wrapper" onSubmit={handleSearchSubmit}>
                        <span className="navbar-search-icon">🔍</span>
                        <input
                            type="text"
                            className="navbar-search-input"
                            placeholder="Search in Wolt..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="navbar-search-clear"
                                onClick={handleClearSearch}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </form>
                </div>

                {/* Right: Theme Toggle and Auth Controls */}
                <div className="navbar-right">
                    {isAuthenticated && (
                        <Link
                            to="/cart"
                            className="navbar-cart-btn"
                            aria-label="Shopping cart"
                            title="Shopping cart"
                        >
                            <span aria-hidden="true">🛒</span>
                            {itemCount > 0 && <span className="navbar-cart-count">{itemCount}</span>}
                        </Link>
                    )}

                    {/* Dark/Light Mode Switch */}
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
                    >
                        <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
                        <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
                    </button>

                    {/* Authenticated user menu */}
                    {isAuthenticated ? (
                        <div className="user-profile-menu-container" ref={dropdownRef}>
                            <button
                                type="button"
                                className="user-profile-trigger"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                aria-expanded={dropdownOpen}
                            >
                                {user?.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={displayName}
                                        className="user-avatar-img"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        {userInitial}
                                    </div>
                                )}
                                <span className="user-name-label">{displayName}</span>
                                <span className="user-menu-chevron">▼</span>
                            </button>

                            {dropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="user-dropdown-header">
                                        <div className="dropdown-user-name">{displayName}</div>
                                        {user?.username && (
                                            <div className="dropdown-user-handle">@{user.username}</div>
                                        )}
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="user-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span>👤</span> Profile
                                    </Link>

                                    <Link
                                        to="/orders"
                                        className="user-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <span>🧾</span> Order history
                                    </Link>

                                    <div className="user-dropdown-divider" />

                                    <button
                                        type="button"
                                        className="user-dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <span>🚪</span> Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Logged-out buttons */
                        <>
                            <Link to="/login" className="nav-btn-login">
                                Log in
                            </Link>
                            <Link to="/register" className="nav-btn-register">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
