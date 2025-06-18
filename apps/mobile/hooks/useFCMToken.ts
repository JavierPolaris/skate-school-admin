import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';

export const useFCMToken = (email: string) => {
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (!Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Permiso de notificación no concedido');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      console.log('📲 Token Expo FCM:', token);

      await fetch('https://skate-school-backend.onrender.com/api/users/save-device-token', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceToken: token }),
      })
        .then(res => res.json())
        .then(data => console.log('✅ Token guardado en backend:', data))
        .catch(err => console.error('❌ Error guardando token:', err));
    };

    registerForPushNotifications();
  }, [email]);
};
