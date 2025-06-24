import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@shared/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAndSave() {
  if (Platform.OS === 'web') {
    console.warn('Push notifications: ejecutado en web, omitiendo.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('Permiso de notificaciones denegado');
    return null;
  }

  const tokenObj = await Notifications.getExpoPushTokenAsync();
  const pushToken = tokenObj.data;
  console.log('🔐 Expo Push Token:', pushToken);

  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user.email) {
        const res = await fetch(
          `${API_URL}/users/save-device-token`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, deviceToken: pushToken }),
          }
        );
        console.log('✅ Token guardado en backend:', await res.json());
      }
    }
  } catch (err) {
    console.error('❌ Error al guardar token en backend:', err);
  }

  return pushToken;
}
