import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { AuthProvider } from './context/AuthContext';
import { requestPermissionAndGetToken, listenToForegroundMessages } from './firebase';
import API_URL from './config.js';

if ('Notification' in window && navigator.serviceWorker) {
  requestPermissionAndGetToken().then(token => {
    if (token) {
      console.log('🔐 Token FCM:', token);
      localStorage.setItem('fcm_token', token);

      // Detectar si estamos en WebView real y enviar token
      const isWebView = /\bwv\b/.test(navigator.userAgent) || window.ReactNativeWebView;
      if (isWebView && window.ReactNativeWebView) {
        console.log('📤 Enviando token desde React a WebView');
        window.ReactNativeWebView.postMessage(`FCM_TOKEN:${token}`);
      } else {
        console.log('🧱 NO es WebView, no se envía token');
      }

      // Guarda en backend como en web
      const email = JSON.parse(localStorage.getItem('user'))?.email;
      if (email) {
        fetch(`${API_URL}/users/save-device-token`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, deviceToken: token }),
        })
          .then(res => res.json())
          .then(data => console.log('✅ Token guardado en backend:', data))
          .catch(err => console.error('❌ Error al guardar token en backend:', err));
      }
    }
  });

  listenToForegroundMessages(payload => {
    console.log('📩 Mensaje recibido en foreground:', payload);
  });
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </AuthProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('🟢 SW de Firebase registrado:', registration);
    })
    .catch((err) => {
      console.error('🔴 Error registrando SW Firebase:', err);
    });
}

console.log('🟠 Este log debería verse siempre que se cargue la app');
window.addEventListener('message', (event) => {
  if (event.data === 'SEND_TOKEN') {
    const token = localStorage.getItem('fcm_token');
    if (token && window.ReactNativeWebView) {
      console.log('📤 Enviando token al WebView (on demand)');
      window.ReactNativeWebView.postMessage(`FCM_TOKEN:${token}`);
    } else {
      console.warn('❌ No se puede enviar token: faltan datos');
    }
  }
});
