// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../helper/config';
import InputField from '../components/InputField';
import '../css/Auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

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

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.id);
            navigate(from);
        } catch (err) {
            setError('Could not reach the server. Please try again.');
        }
    };

return (
        <div className="Auth-page">
            <h1>Login</h1>
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
                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default Login;