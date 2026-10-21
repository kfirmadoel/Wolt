// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from '../helper/config';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import '../css/Auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // ProtectedRoute sends the user here with state.from, so we can return them to the page they wanted
    const redirectTo = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Username and password are required');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(res.status === 401 ? 'Wrong username or password' : data.error || 'Login failed');
                return;
            }

            await login(data.token, data.id);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError('Could not reach the server. Please try again.');
        } finally {
            setSubmitting(false);
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
                <InputField type="text" placeholder="Username *" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <InputField type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>

                <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', margin: '4px 0 0 0', textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--wolt-blue)', fontWeight: 700 }}>Sign up</Link>
                </p>

                <p style={{ fontSize: '0.8em', color: 'var(--text-muted)', margin: 0 }}>* Required fields</p>
            </form>
        </div>
    );
}

export default Login;