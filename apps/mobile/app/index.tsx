import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRegisterFCM } from '../hooks/useFCMToken'; // Ajusta ruta
import { useState } from 'react';

if (__DEV__ && Platform.OS === 'android') {
  WebView.setWebContentsDebuggingEnabled?.(true);
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  useRegisterFCM(email); // solo lanza efecto si email no es null

  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message.startsWith('EMAIL:')) {
      const userEmail = message.replace('EMAIL:', '');
      setEmail(userEmail);
      Alert.alert('Email recibido', userEmail);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: 'https://skate-school-admin.vercel.app/' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={`
          window.addEventListener('load', () => {
            const user = localStorage.getItem('user');
            if (user) {
              const email = JSON.parse(user).email;
              if (email && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage("EMAIL:" + email);
              }
            }
          });
        `}
      />
    </SafeAreaView>
  );
}
