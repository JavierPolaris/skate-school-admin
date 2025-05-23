import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { AuthProvider } from './context/AuthContext';
import { messaging, getToken, onMessage } from './firebase';

if ('Notification' in window && navigator.serviceWorker) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      getToken(messaging, { vapidKey: 'BDhxw1hQ98JM0CZFcBNuLf1Lg-l5BtBHHnybjK4zf77B6Yn6yYV6PV70O8_9nFWtSf4mRA86_crubkx5bpiZEA8' }) // la sacas de Firebase settings
        .then(currentToken => {
          if (currentToken) {
            console.log('🔐 Token FCM:', currentToken);
            fetch('https://skate-school-admin.vercel.app/api/users/save-device-token', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: JSON.parse(localStorage.getItem('user') || '{}').email,
                deviceToken: currentToken,
              }),
            });

          } else {
            console.warn('⚠️ No se pudo obtener el token');
          }
        })
        .catch(err => console.error('❌ Error al obtener token FCM:', err));
    }
  });

  onMessage(messaging, payload => {
    console.log('📩 Mensaje recibido en foreground:', payload);
    // Opcional: muestra una notificación o toast
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
