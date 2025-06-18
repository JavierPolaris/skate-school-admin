// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC26QKbn0YZGUQQRV1Q1Nu-HH1aO4Q7qUg",
  authDomain: "skate-app-cc014.firebaseapp.com",
  projectId: "skate-app-cc014",
  messagingSenderId: "1027397835625",
  appId: "1:1027397835625:android:2d5424a370aac04d71fbf8"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermissionAndGetToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("❌ Permiso de notificación denegado");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BDhxw1hQ98JM0CZFcBNuLf1Lg-l5BtBHHnybjK4zf77B6Yn6yYV6PV70O8_9nFWtSf4mRA86_crubkx5bpiZEA8"
    });

    console.log("✅ Token generado:", token);

    localStorage.setItem('fcm_token', token);

    // INTENTO DE ENVÍO AL WEBVIEW (si está)
    tryPostToWebView(token);

    return token;
  } catch (err) {
    console.error("⚠️ Error al obtener el token FCM:", err);
    return null;
  }
};

// Reintento para enviar token al WebView
function tryPostToWebView(token) {
  let retries = 0;

  const trySend = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(`FCM_TOKEN:${token}`);
      console.log("📤 Token enviado al WebView:", token);
    } else if (retries < 5) {
      retries++;
      console.warn("❗ WebView no disponible aún, reintentando...");
      setTimeout(trySend, 1500);
    } else {
      console.error("❌ No se pudo enviar el token al WebView");
    }
  };

  trySend();
}
