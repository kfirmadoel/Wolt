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
