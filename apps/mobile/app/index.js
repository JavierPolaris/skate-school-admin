import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: 'https://skate-school-admin.vercel.app/' }} // ✅ Página simple, 100% pública
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </SafeAreaView>
  );
}
