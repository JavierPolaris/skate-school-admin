// hooks/useRegisterFCM.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';

export const useRegisterFCM = (email: string | null) => {
  useEffect(() => {
    const registerToken = async () => {
      if (!Device.isDevice || !email) return;

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

      console.log('📲 Token generado:', token);
      localStorage.setItem('fcm_token', token); // 👈 Se guarda para que la WebView lo pueda leer luego

      await fetch('https://skate-school-backend.onrender.com/api/users/save-device-token', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceToken: token }),
      })
        .then(res => res.json())
        .then(data => console.log('✅ Token guardado en backend:', data))
        .catch(err => console.error('❌ Error guardando token:', err));
    };

    registerToken();
  }, [email]);
};
