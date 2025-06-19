import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const requestFCMPermissionAndSaveToken = async (email: string) => {
  try {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Permiso de notificaciones denegado');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const deviceToken = tokenData.data;

    console.log('📲 Token Expo:', deviceToken);

    // Guardar en backend
    await fetch('https://skate-school-backend.onrender.com/api/users/save-device-token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, deviceToken }),
    });
  } catch (err) {
    console.error('❌ Error obteniendo FCM token:', err);
  }
};
