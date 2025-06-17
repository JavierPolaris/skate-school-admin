import { WebView } from 'react-native-webview';
import { SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  const handleMessage = (event) => {
    const message = event.nativeEvent.data;

    if (message.startsWith('FCM_TOKEN:')) {
      const token = message.replace('FCM_TOKEN:', '');
      console.log('📲 Token recibido desde WebView:', token);
      Alert.alert('Token recibido', token); // ⚠️ solo para pruebas
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
