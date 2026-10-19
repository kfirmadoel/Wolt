// app/login.js
import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { API_URL, COLORS } from '../config.js';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setServerError('');
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(res.status === 401 ? 'Wrong username or password' : data.error || 'Login failed');
        return;
      }
      await signIn(data.token, data.id); // saves to device; Gate then opens the app
    } catch (err) {
      setServerError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Welcome back</Text>
      {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

      <InputField
        placeholder="Username *"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        error={errors.username}
      />
      <InputField
        placeholder="Password *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      <TouchableOpacity style={[styles.button, submitting && { opacity: 0.6 }]} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkButton}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.primary },
  errorText: { color: COLORS.error, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  button: { backgroundColor: COLORS.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#555', fontSize: 16 },
});