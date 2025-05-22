import { useEffect, useState } from 'react';
import './InstallPrompt.css';

const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState(null); // 'android' | 'ios'

  useEffect(() => {
    const hasDismissed = localStorage.getItem('pwaPromptDismissed');

    if (hasDismissed || isInStandaloneMode()) return;

    if (isAndroid()) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPlatform('android');
        setShowModal(true);
        console.log('📱 Android: Mostrando modal con botón instalar');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    if (isIOS()) {
      setPlatform('ios');
      setShowModal(true);
      console.log('🍏 iOS: Mostrando instrucciones manuales');
    }
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        console.log('✅ App instalada');
      } else {
        console.log('❌ Instalación cancelada');
      }
      setDeferredPrompt(null);
      setShowModal(false);
    });
  };

  const handleClose = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="pwa-modal-overlay">
      <div className="pwa-modal">
        {platform === 'android' && (
          <>
            <p>¿Quieres instalar la app Skate School en tu dispositivo?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleInstall}>Instalar App</button>
              <button onClick={handleClose}>Cerrar</button>
            </div>
          </>
        )}

        {platform === 'ios' && (
          <>
            <p>Para instalar la app en iPhone:</p>
            <p>
              Pulsa el botón <strong>Compartir</strong> en Safari (
              <span style={{ fontSize: '1.2em' }}>⬆️</span>) y luego elige{' '}
              <strong>“Añadir a pantalla de inicio”</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button onClick={handleClose}>Entendido</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InstallPrompt;
