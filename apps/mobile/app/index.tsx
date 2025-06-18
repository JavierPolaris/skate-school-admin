import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRegisterFCM } from '../hooks/useFCMToken'; 
import { useState, useEffect } from 'react';

if (__DEV__ && Platform.OS === 'android') {
  WebView.setWebContentsDebuggingEnabled?.(true);
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Extraer email de localStorage (inyectado por la web)
    const storedEmail = localStorage.getItem('user_email'); // 👈 la web debe guardarlo
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useRegisterFCM(email); // 👈 genera y envía token solo si hay email

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
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          if (message.startsWith('EMAIL:')) {
            const userEmail = message.replace('EMAIL:', '');
            localStorage.setItem('user_email', userEmail);
            setEmail(userEmail);
            Alert.alert('Login detectado', `Email: ${userEmail}`);
          }
        }}
        injectedJavaScriptBeforeContentLoaded={`
          window.addEventListener('load', () => {
            const user = localStorage.getItem('user');
            if (user) {
              const email = JSON.parse(user).email;
              if (window.ReactNativeWebView && email) {
                window.ReactNativeWebView.postMessage("EMAIL:" + email);
              }
            }
          });
        `}
      />
    </SafeAreaView>
  );
}
