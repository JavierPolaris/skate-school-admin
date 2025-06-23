// packages/shared/api.js
import { Platform } from 'react-native';

// Web always uses the VITE_API_URL (which must end in /api)
const WEB_API_URL =
  import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000/api';

// Mobile will override it at runtime via expo-constants
let MOBILE_API_URL = WEB_API_URL;
if (Platform.OS !== 'web') {
  try {
    const Constants = require('expo-constants');
    MOBILE_API_URL =
      Constants.expoConfig?.extra?.apiUrl ?? MOBILE_API_URL;
  } catch (e) {
    console.warn(
      '⚠️ expo-constants not available, falling back to WEB_API_URL',
      e
    );
  }
}

// Export the correct one:
export const API_URL =
  Platform.OS === 'web' ? WEB_API_URL : MOBILE_API_URL;

// ————————————————————————————————
// Ahora tus llamadas a la API simplemente usan API_URL
// ————————————————————————————————

export const loginUser = async (email, password) => {
  const url = `${API_URL}/users/login`;
  console.log('➡️  LOGIN URL:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  console.log('⬅️ STATUS:', res.status, 'BODY:', text);
  if (!res.ok) {
    let msg = 'Login failed';
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(msg);
  }
  return JSON.parse(text);
};

export const getUserProfile = async (token) => {
  const url = `${API_URL}/users/profile`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get profile');
  return await res.json();
};

export const fetchEvents = async () => {
  const url = `${API_URL}/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return await res.json();
};

export const getGroupDetails = async (groupId) => {
  const url = `${API_URL}/groups/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener detalles del grupo');
  return await res.json();
};

export const getUpcomingClasses = async (groupId) => {
  const url = `${API_URL}/groups/upcoming-classes/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener próximas clases');
  return await res.json();
};

export const getGroupNotifications = async (groupId) => {
  const url = `${API_URL}/notifications/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return await res.json();
};
