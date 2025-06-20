import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';

export default function useFCMToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    messaging()
      .requestPermission()
      .then(() => messaging().getToken())
      .then((token) => {
        console.log('🔥 FCM token generado:', token);
        setToken(token);
      })
      .catch((err) => {
        console.warn('⚠️ Error al obtener FCM token:', err);
      });
  }, []);

  return token;
}
