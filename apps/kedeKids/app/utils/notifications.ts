// app/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@shared/api';

// 📌 sigue manejando el handler igual
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAndSave() {
  if (Platform.OS === 'web') return null;

  // 1️⃣ permisos
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Permiso notificaciones denegado');
    return null;
  }

  // 2️⃣ 👉 Token FCM nativo
  // (antes usábamos getExpoPushTokenAsync, ahora:
  const tokenObj = await Notifications.getDevicePushTokenAsync();
  const deviceToken = tokenObj.data;
  console.log('🔑 FCM Device Token:', deviceToken);

  // 3️⃣ guardarlo en backend
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const { email } = JSON.parse(userJson);
      if (email) {
        const res = await fetch(`${API_URL}/users/save-device-token`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, deviceToken }),
        });
        console.log('✅ Token FCM guardado:', await res.json());
      }
    }
  } catch (err) {
    console.error('❌ Error guardando token FCM:', err);
  }

  return deviceToken;
}
