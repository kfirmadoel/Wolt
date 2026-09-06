// src/pages/Register.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../helper/config';
import InputField from '../components/InputField';
import '../css/Auth.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('customer');
    const [picture, setPicture] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isLongEnough = password.length >= 8;
    const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'Password must be at least 8 characters long';
        if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'Password must contain both letters and numbers';
        return null;
    };
    const phoneDigits = phone.replace(/\D/g, '');
    const isPhoneInvalid = phone.length > 0 && phoneDigits.length !== 10;

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPicture(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Name הוסר מהחובה כדי להתאים לשרת
        if (!username || !password || !confirmPassword) {
            setError('Username, password and confirm password are required');
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
                // הוספנו את phone ו-address לאובייקט שנשלח לשרת
                body: JSON.stringify({ username, password, name, phone, address, role, picture }) 
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            navigate('/login');
        } catch (err) {
            setError('Could not reach the server. Please try again.');
        }
    };

    return (
        <div className="Auth-page">
            <h1>Register</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form className="Auth-form" onSubmit={handleSubmit}>
                <InputField type="text" placeholder="Username *" value={username} onChange={(e) => setUsername(e.target.value)} />

                <InputField type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)}>
                    <ul style={{listStyleType: 'none', fontSize: '0.8em', margin: 0, paddingLeft: '20px' }}>
                        <li style={{ color: isLongEnough ? 'green' : 'red' }}>{isLongEnough ? '✓' : '✗'} At least 8 characters</li>
                        <li style={{ color: hasLetterAndNumber ? 'green' : 'red' }}>{hasLetterAndNumber ? '✓' : '✗'} Letters and numbers</li>
                    </ul>
                </InputField>

                <InputField type="password" placeholder="Confirm Password *" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}>
                    {confirmPassword.length > 0 && (
                        <p style={{ fontSize: '0.8em', margin: 0, color: passwordsMatch ? 'green' : 'red' }}>
                            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                    )}
                </InputField>
                
                <InputField type="text" placeholder="Name(optional)" value={name} onChange={(e) => setName(e.target.value)} />
                <InputField type="text" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}>
                    {isPhoneInvalid && (
                        <p style={{ fontSize: '0.8em', color: '#e68a00', margin: '2px 0 0 0' }}>
                            ⚠️ Note: Phone number format looks unusual, but it's okay to proceed.
                        </p>
                    )}
                </InputField>
                <InputField type="text" placeholder="Address(optional)" value={address} onChange={(e) => setAddress(e.target.value)} />

                <InputField type="file" accept="image/*" onChange={handlePictureChange}>
                    {picture && <img src={picture} alt="Preview" style={{ width: '80px', height: '80px', marginTop: '4px' }} />}
                </InputField>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                    <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '6px' }}>
                        <option value="customer">Customer</option>
                        <option value="restaurant_owner">Restaurant Owner</option>
                    </select>
                </div>

                <button type="submit">Register</button>

                <p style={{ fontSize: '0.85em', color: 'gray', alignSelf: 'flex-start', margin: '0 0 10px 0' }}>
                    * Required fields
                </p>
            </form>
        </div>
    );
}

export default Register;