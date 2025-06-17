import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const USER_TOKEN = '...'; // ⚠️ Aquí mete el token JWT del usuario logueado

export default function Home() {
  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message.startsWith('FCM_TOKEN:')) {
      const token = message.replace('FCM_TOKEN:', '');
      console.log('📲 Token recibido desde WebView:', token);
      Alert.alert('Token recibido', token);

      // 👉 Enviar token al backend
      fetch('https://TU_BACKEND_DOMAIN/api/users/update-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${USER_TOKEN}`, // ⚠️ Cambia esto si usas otro auth
        },
        body: JSON.stringify({ deviceToken: token }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('✅ Token guardado en backend:', data);
        })
        .catch(err => {
          console.error('❌ Error guardando token:', err);
        });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'green' }}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: 'https://skate-school-admin.vercel.app/' }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}
