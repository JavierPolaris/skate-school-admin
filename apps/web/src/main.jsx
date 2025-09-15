import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './theme/theme.css'; // ← variables CSS base (se sobrescriben vía ThemeProvider)
import App from './App.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import { AuthProvider } from './context/AuthContext';
import { requestPermissionAndGetToken, listenToForegroundMessages } from './firebase';
import API_URL from './config.js';
import { ThemeProvider } from './context/ThemeContext'; // ← importa el provider

// Push / FCM
if ('Notification' in window && navigator.serviceWorker) {
  requestPermissionAndGetToken().then(token => {
    if (token) {
      console.log('🔐 Token FCM:', token);
      // ENVÍA AL BACKEND (usa la clave 'user' del localStorage)
      const email = JSON.parse(localStorage.getItem('user'))?.email;
      if (email) {
        fetch(`${API_URL}/users/save-device-token`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
    {/* ThemeProvider arriba para que las variables CSS estén listas desde el primer render */}
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);

// SW Firebase
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('🟢 SW de Firebase registrado:', registration);
    })
    .catch((err) => {
      console.error('🔴 Error registrando SW Firebase:', err);
    });
}
