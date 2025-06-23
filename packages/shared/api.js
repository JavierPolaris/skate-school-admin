// packages/shared/api.js

/**
 * Monorepo-shared API URL resolver: picks correct base URL
 * - On React Native, reads expo.extra.apiUrl from app.json
 * - On Web, reads VITE_API_URL from import.meta.env or falls back
 */
const API_URL = (() => {
  // Detect React Native by navigator.product
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    try {
      const Constants = require('expo-constants');
      // extra.apiUrl must end with /api
      return Constants.expoConfig.extra.apiUrl;
    } catch (e) {
      console.warn('⚠️ expo-constants import failed, defaulting to prod URL', e);
      return 'https://skate-school-admin.onrender.com/api';
    }
  } else {
    // Web environment
    const envUrl = import.meta?.env?.VITE_API_URL;
    const base = envUrl ?? 'http://localhost:5000';
    // ensure single /api suffix
    return base.endsWith('/api') ? base : `${base}/api`;
  }
})();

export { API_URL };

// Shared API methods
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
    try { msg = JSON.parse(text).error || msg; } catch {};
    throw new Error(msg);
  }
  return JSON.parse(text);
};

export const getUserProfile = async (token) => {
  const url = `${API_URL}/users/profile`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to get profile');
  return res.json();
};

export const fetchEvents = async () => {
  const url = `${API_URL}/events`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error loading events');
  return res.json();
};

export const getGroupDetails = async (groupId) => {
  const url = `${API_URL}/groups/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error getting group details');
  return res.json();
};

export const getUpcomingClasses = async (groupId) => {
  const url = `${API_URL}/groups/upcoming-classes/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error getting upcoming classes');
  return res.json();
};

export const getGroupNotifications = async (groupId) => {
  const url = `${API_URL}/notifications/${groupId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error getting notifications');
  return res.json();
};
