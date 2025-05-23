import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'
import { AuthProvider } from './context/AuthContext';
import { requestPermissionAndGetToken, listenToForegroundMessages } from './firebase';

if ('Notification' in window && navigator.serviceWorker) {
  requestPermissionAndGetToken().then(token => {
    if (token) {
      console.log('🔐 Token FCM:', token);
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
