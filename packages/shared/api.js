// packages/shared/api.js

// 1️⃣ Detectar si estamos en web (Vite) o en native (Hermes/Expo)
const isWeb = typeof document !== 'undefined';

// 2️⃣ URL base para web (lee VITE_API_URL o localhost)
const WEB_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000'
  ) + '/api';

// 3️⃣ URL base para mobile (lee de app.json) – se carga dinámicamente
let MOBILE_BASE_URL = WEB_BASE_URL;
if (!isWeb) {
  try {
    const Constants = require('expo-constants');
    MOBILE_BASE_URL = Constants.expoConfig.extra.apiUrl;
  } catch (e) {
    console.warn('⚠️ expo-constants no disponible, usando WEB_BASE_URL');
  }
}

// 4️⃣ Exportar la URL final según plataforma
export const API_URL = isWeb ? WEB_BASE_URL : MOBILE_BASE_URL;


// ————————————————————————————————
// Funciones de API (loginUser, getUserProfile, etc.)
// ————————————————————————————————

export const loginUser = async (email, password) => {
  const url = `${API_URL}/users/login`;
  console.log('➡️  LOGIN URL:', url);
  console.log('➡️  PAYLOAD:', { email, password });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  console.log('⬅️  RESPONSE STATUS:', res.status);
  console.log('⬅️  RESPONSE BODY:', text);

  if (!res.ok) {
    let msg = 'Login failed';
    try {
      msg = JSON.parse(text).error || msg;
    } catch {}
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
