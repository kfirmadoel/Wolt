// src/pages/Register.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../helper/config';
import InputField from '../components/InputField';
import '../css/Auth.css';

const MAX_PROFILE_IMAGE_SIZE = 3 * 1024 * 1024;

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [picture, setPicture] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    // Live validation state for password requirements
    const isLongEnough = password.length >= 8;
    const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'Password must be at least 8 characters long';
        if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'Password must contain both letters and numbers';
        return null;
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > MAX_PROFILE_IMAGE_SIZE) {
            setPicture('');
            setError('Profile image must be 3 MB or smaller.');
            return;
        }
        setError('');
        const reader = new FileReader();
        reader.onloadend = () => setPicture(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setError('');

        if (!username.trim() || !password || !confirmPassword || !name.trim() || !picture || !latitude || !longitude) {
            setError('All fields, including profile picture and coordinates, are required');
            return;
        }

        const x = Number(latitude);
        const y = Number(longitude);
        if (!Number.isFinite(x) || x < -90 || x > 90 || !Number.isFinite(y) || y < -180 || y > 180) {
            setError('Enter a valid latitude (-90 to 90) and longitude (-180 to 180).');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send only the fields the server expects; phone and address are omitted
                // because they are not required for registration — the user can set them later
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                    name: name.trim(),
                    role,
                    picture,
                    location: { x, y }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            // After successful registration, redirect to the login screen
            navigate('/login');
        } catch (err) {
            setError('Could not reach the server. Please try again.');
        }
    };

    return (
        <div className="Auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Wolt home">
                <span>wolt</span>
            </Link>
            <Link to="/login" className="auth-back-link">← Back to log in</Link>
            <h1>Create account</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form className="Auth-form" onSubmit={handleSubmit} onInvalid={() => setSubmitted(true)}>
                <InputField type="text" placeholder="Username *" value={username} onChange={(e) => setUsername(e.target.value)} required />

                <InputField type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} required>
                    <ul style={{ listStyleType: 'none', fontSize: '0.8em', margin: 0, paddingLeft: '20px' }}>
                        <li style={{ color: submitted ? (isLongEnough ? 'green' : 'red') : 'var(--text-muted)' }}>{submitted ? (isLongEnough ? '✓' : '✗') : ''} At least 8 characters</li>
                        <li style={{ color: submitted ? (hasLetterAndNumber ? 'green' : 'red') : 'var(--text-muted)' }}>{submitted ? (hasLetterAndNumber ? '✓' : '✗') : ''} Letters and numbers</li>
                    </ul>
                </InputField>

                <InputField type="password" placeholder="Confirm Password *" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required>
                    {confirmPassword.length > 0 && (
                        <p style={{ fontSize: '0.8em', margin: 0, color: submitted ? (passwordsMatch ? 'green' : 'red') : 'var(--text-muted)' }}>
                            {submitted ? (passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match') : 'Passwords must match'}
                        </p>
                    )}
                </InputField>

                <InputField type="text" placeholder="Display name *" value={name} onChange={(e) => setName(e.target.value)} required />

                <div className="register-coordinate-fields">
                    <label>
                        Latitude *
                        <input
                            type="number"
                            min="-90"
                            max="90"
                            step="any"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Longitude *
                        <input
                            type="number"
                            min="-180"
                            max="180"
                            step="any"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <p className="register-coordinate-hint">Coordinates are used to sort nearby restaurants and can be changed later in your profile.</p>

                {/* Profile picture upload */}
                <InputField type="file" accept="image/*" onChange={handlePictureChange} required>
                    {picture && <img src={picture} alt="Profile preview" style={{ width: '80px', height: '80px', marginTop: '4px', borderRadius: '50%', objectFit: 'cover' }} />}
                </InputField>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '6px', borderRadius: '8px' }}>
                        <option value="customer">Customer</option>
                        <option value="restaurant_owner">Restaurant Owner</option>
                    </select>
                </div>

                <button type="submit">Create account</button>

                <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', margin: '4px 0 0 0', textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--wolt-blue)', fontWeight: 700 }}>Log in</Link>
                </p>

                <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: 0 }}>* Required fields</p>
            </form>
        </div>
    );
}

export default Register;
