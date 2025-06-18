import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

if (__DEV__ && Platform.OS === 'android') {
  WebView.setWebContentsDebuggingEnabled?.(true);
}

export default function Home() {
  const handleMessage = (event) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('FCM_TOKEN:')) {
      const token = message.replace('FCM_TOKEN:', '');
      console.log('📲 Token recibido desde WebView:', token);
      Alert.alert('Token recibido', token); // 👈 Para confirmar en el móvil

      const email = 'torkoprueba@gmail.com'; // 👈 De momento estático, ya lo haremos dinámico

      fetch('https://skate-school-backend.onrender.com/api/users/save-device-token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, deviceToken: token })
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
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: 'https://skate-school-admin.vercel.app/' }}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={`
          window.addEventListener('message', (event) => {
            if (event.data === 'SEND_TOKEN') {
              const token = localStorage.getItem('fcm_token');
              if (token && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('FCM_TOKEN:' + token);
              }
            }
          });
        `}
      />
    </SafeAreaView>
  );
}
