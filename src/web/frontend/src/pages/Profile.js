// src/pages/Profile.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../helper/api';
import RestaurantOwnerManager from '../components/RestaurantOwnerManager';
import '../css/Profile.css';

function Profile() {
    const { user, userId, profileError, refreshUser } = useAuth();

    // Coordinate inputs initialized from the user's saved profile location
    const [latInput, setLatInput] = useState(
        user?.location?.x !== undefined ? String(user.location.x) : ''
    );
    const [lngInput, setLngInput] = useState(
        user?.location?.y !== undefined ? String(user.location.y) : ''
    );
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', msg: string }

    if (!user) {
        return (
            <div className="profile-page">
                {profileError ? (
                    <>
                        <p className="profile-feedback error" role="alert">{profileError}</p>
                        <button type="button" className="profile-save-btn" onClick={refreshUser}>Try again</button>
                    </>
                ) : <p>Loading profile...</p>}
            </div>
        );
    }

    const displayName = user.name || user.username;
    const userInitial = displayName.charAt(0).toUpperCase();
    const hasLocation = user.location &&
        typeof user.location.x === 'number' &&
        typeof user.location.y === 'number';

    /**
     * Save the new geolocation coordinates to the server.
     * Coordinates are sent as { location: { x: latitude, y: longitude } }
     * matching the format used by the restaurant model.
     */
    const handleSaveLocation = async (e) => {
        e.preventDefault();
        setFeedback(null);

        const x = parseFloat(latInput);
        const y = parseFloat(lngInput);

        if (isNaN(x) || isNaN(y)) {
            setFeedback({ type: 'error', msg: 'Please enter valid numeric coordinates.' });
            return;
        }

        if (x < -90 || x > 90) {
            setFeedback({ type: 'error', msg: 'Latitude must be between -90 and 90.' });
            return;
        }

        if (y < -180 || y > 180) {
            setFeedback({ type: 'error', msg: 'Longitude must be between -180 and 180.' });
            return;
        }

        setSaving(true);
        try {
            const res = await apiFetch(`/api/users/${userId}/location`, {
                method: 'PATCH',
                body: JSON.stringify({ location: { x, y } })
            });

            if (!res.ok) {
                const data = await res.json();
                setFeedback({ type: 'error', msg: data.error || 'Failed to update location.' });
                return;
            }

            // Refresh the user profile in global state so the home screen uses the new coordinates
            await refreshUser();
            setFeedback({ type: 'success', msg: 'Location updated! Nearby restaurants will now reflect your position.' });
        } catch (err) {
            setFeedback({ type: 'error', msg: 'Could not reach the server. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-page">
            <Link to="/" className="profile-back-link">← Back</Link>
            <h1>My Profile</h1>

            {/* User information card */}
            <div className="profile-info-card">
                {user.picture ? (
                    <img src={user.picture} alt={displayName} className="profile-avatar-large" />
                ) : (
                    <div className="profile-avatar-placeholder-large">{userInitial}</div>
                )}
                <div className="profile-info-text">
                    <h2>{displayName}</h2>
                    {user.name && <p>@{user.username}</p>}
                    {user.phone && <p>📞 {user.phone}</p>}
                    {user.address && <p>🏠 {user.address}</p>}
                    <span className="profile-role-badge">
                        {user.role === 'restaurant_owner' ? '🍽️ Restaurant Owner' : '🛒 Customer'}
                    </span>
                </div>
            </div>

            {/* Delivery Location Section */}
            <div className="profile-section-card">
                <h3>
                    <span>📍</span>
                    <span>My Delivery Location</span>
                </h3>
                <p className="profile-section-desc">
                    Set your geolocation coordinates so Wolt can sort nearby restaurants by real distance.
                    You can find your coordinates using Google Maps.
                </p>

                {/* Display current saved location */}
                <div className="current-location-display">
                    <span>📌</span>
                    {hasLocation ? (
                        <span>
                            Latitude: <strong>{user.location.x}</strong> &nbsp;|&nbsp;
                            Longitude: <strong>{user.location.y}</strong>
                        </span>
                    ) : (
                        <span className="location-not-set">No location set yet</span>
                    )}
                </div>

                {/* Coordinate update form */}
                <form onSubmit={handleSaveLocation}>
                    <div className="location-inputs-row">
                        <div className="location-input-group">
                            <label htmlFor="lat-input">Latitude (X)</label>
                            <input
                                id="lat-input"
                                type="number"
                                step="any"
                                placeholder="e.g. 32.0853"
                                value={latInput}
                                onChange={(e) => setLatInput(e.target.value)}
                            />
                        </div>
                        <div className="location-input-group">
                            <label htmlFor="lng-input">Longitude (Y)</label>
                            <input
                                id="lng-input"
                                type="number"
                                step="any"
                                placeholder="e.g. 34.7818"
                                value={lngInput}
                                onChange={(e) => setLngInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="location-hint">
                        💡 Tip: Latitude (X) is north/south (-90 to 90). Longitude (Y) is east/west (-180 to 180).
                    </p>

                    <button type="submit" className="profile-save-btn" disabled={saving}>
                        {saving ? 'Saving...' : '📍 Save My Location'}
                    </button>

                    {feedback && (
                        <div className={`profile-feedback ${feedback.type}`}>
                            {feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}
                        </div>
                    )}
                </form>
            </div>

            {user.role === 'restaurant_owner' && <RestaurantOwnerManager user={user} />}
        </div>
    );
}

export default Profile;
