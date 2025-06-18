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

// Solicita permiso y obtiene el token
export const requestPermissionAndGetToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BDhxw1hQ98JM0CZFcBNuLf1Lg-l5BtBHHnybjK4zf77B6Yn6yYV6PV70O8_9nFWtSf4mRA86_crubkx5bpiZEA8"
      });

      console.log("✅ Token generado:", token);

      // ✅ Guarda el token en localStorage
      localStorage.setItem('fcm_token', token);

      // 👇 ENVÍA EL TOKEN AL RN WebView (si existe)
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(`FCM_TOKEN:${token}`);
        console.log("📤 Enviado al WebView:", token);
      } else {
        console.warn("❗ WebView no disponible aún, reintentando...");
        setTimeout(() => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(`FCM_TOKEN:${token}`);
            console.log("📤 (Reintento) Enviado al WebView:", token);
          } else {
            console.error("❌ No se pudo enviar el token al WebView");
          }
        }, 2000);
      }

      return token;
    } else {
      console.warn("❌ Permiso de notificación denegado");
      return null;
    }
  } catch (err) {
    console.error("⚠️ Error al obtener el token FCM:", err);
    return null;
  }
};


// Escucha mensajes en primer plano
export const listenToForegroundMessages = (callback) => {
  onMessage(messaging, callback);
};
