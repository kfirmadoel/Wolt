import { API_URL } from '../config';

export async function getData(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || 'Could not load data. Please try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function sendData(path, token, method, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      const error = new Error('The server returned an unreadable response.');
      error.status = res.status;
      throw error;
    }
  }
  if (!res.ok) {
    const error = new Error(typeof data?.error === 'string' ? data.error : 'Could not save the changes. Please try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}
