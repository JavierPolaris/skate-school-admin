// packages/shared/api.js

import Constants from 'expo-constants';

/**
 * Base URL for Web (Vite) — lee la var de entorno VITE_API_URL o fallback a localhost
 */
const WEB_BASE_URL =
  (import.meta?.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000') + '/api';

/**
 * Base URL para Mobile (Expo) — lee de app.json → expo.extra.apiUrl o usa WEB_BASE_URL
 */
const MOBILE_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? WEB_BASE_URL;

/**
 * Detectar si estamos en Web (document definido) o Mobile (React Native)
 */
const isWeb = typeof document !== 'undefined';

/**
 * URL final a usar según plataforma
 */
export const API_URL = isWeb ? WEB_BASE_URL : MOBILE_BASE_URL;

// ————————————————————————————————
// Funciones de API
// ————————————————————————————————

/**
 * Login de usuario
 */
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

/**
 * Obtener perfil del usuario (requiere token Bearer)
 */
export const getUserProfile = async (token) => {
  const url = `${API_URL}/users/profile`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to get profile');
  return await res.json();
};

/**
 * Listado de clases o eventos
 */
export const fetchEvents = async () => {
  const url = `${API_URL}/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return await res.json();
};

/**
 * Obtener detalles del grupo por ID
 */
export const getGroupDetails = async (groupId) => {
  const url = `${API_URL}/groups/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener los detalles del grupo');
  return await res.json();
};

/**
 * Obtener próximas clases de un grupo
 */
export const getUpcomingClasses = async (groupId) => {
  const url = `${API_URL}/groups/upcoming-classes/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener las próximas clases');
  return await res.json();
};

/**
 * Obtener notificaciones del grupo
 */
export const getGroupNotifications = async (groupId) => {
  const url = `${API_URL}/notifications/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return await res.json();
};
