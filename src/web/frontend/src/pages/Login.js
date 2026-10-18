// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../helper/config';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import '../css/Auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            // Persist the token and update global auth state via AuthContext
            await login(data.token, data.id);
            navigate('/', { replace: true });
        } catch (err) {
            setError('Could not reach the server. Please try again.');
        }
    };

    return (
        <div className="Auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Wolt home">
                <span>wolt</span>
            </Link>
            <h1>Log in</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form className="Auth-form" onSubmit={handleSubmit}>
                <InputField
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <InputField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Log in</button>

                <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', margin: '4px 0 0 0', textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--wolt-blue)', fontWeight: 700 }}>Sign up</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;