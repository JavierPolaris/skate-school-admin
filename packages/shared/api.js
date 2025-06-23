// packages/shared/api.js

// Detectar si estamos en web: existe window y document
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// URL base para web: usa la variable VITE_API_URL o fallback a localhost
const WEB_API_URL = import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api';

// URL base para móvil: lee de app.json.extra.apiUrl o fallback a WEB_API_URL
let MOBILE_API_URL = WEB_API_URL;
if (!isWeb) {
  try {
    const Constants = require('expo-constants');
    MOBILE_API_URL = Constants.expoConfig?.extra?.apiUrl || MOBILE_API_URL;
  } catch (e) {
    console.warn('expo-constants no disponible, usando WEB_API_URL', e);
  }
}

// Exportar la URL definitiva
export const API_URL = isWeb ? WEB_API_URL : MOBILE_API_URL;

// Funciones de API compartidas
export const loginUser = async (email, password) => {
  const url = `${API_URL}/users/login`;
  console.log('➡️ LOGIN URL:', url);
  console.log('➡️ PAYLOAD:', { email, password });

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
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to get profile');
  return res.json();
};

export const fetchEvents = async () => {
  const url = `${API_URL}/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return res.json();
};

export const getGroupDetails = async (groupId) => {
  const url = `${API_URL}/groups/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener detalles del grupo');
  return res.json();
};

export const getUpcomingClasses = async (groupId) => {
  const url = `${API_URL}/groups/upcoming-classes/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener próximas clases');
  return res.json();
};

export const getGroupNotifications = async (groupId) => {
  const url = `${API_URL}/notifications/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
};
