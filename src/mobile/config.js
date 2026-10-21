// config.js
// Android emulator -> host machine is 10.0.2.2
// Real phone or iOS simulator -> use your computer's LAN IP, e.g. http://192.168.1.20:5000
// Set it without editing code:  EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
export const COLORS = {
  primary: '#00c2e8', error: '#d93025', ok: '#1e8e3e',
  background: '#f5f6f7', card: '#fff', text: '#202125', muted: '#666',
  border: '#e5e7eb', selected: '#e6f9fc', accentText: '#00677e',
};
export const DARK_COLORS = {
  primary: '#00c2e8', error: '#ff8a80', ok: '#81c995',
  background: '#15191d', card: '#22282e', text: '#f4f5f6', muted: '#b9c1c9',
  border: '#3c454e', selected: '#163943', accentText: '#76e2f5',
};
