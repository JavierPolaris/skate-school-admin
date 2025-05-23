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
  // ENVÍALO A TU BACKEND
  const email = JSON.parse(localStorage.getItem('user'))?.email;
  if (email) {
    fetch('http://localhost:3001/api/users/save-device-token', {
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
