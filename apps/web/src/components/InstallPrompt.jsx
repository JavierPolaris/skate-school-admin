import { useEffect, useState } from 'react';
import './InstallPrompt.css';

const isIOS = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;

const isAndroid = () => /Android/i.test(navigator.userAgent);

// PWA instalada (standalone) o Chrome iOS (navigator.standalone)
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// Heurística de TWA: cuando abre como app Android empaquetada
const isTWA = () => typeof document !== 'undefined' &&
  !!document.referrer && document.referrer.startsWith('android-app://');

const DISMISS_KEY = 'pwaPromptDismissed';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState(null); // 'android' | 'ios'

  useEffect(() => {
    // No mostrar si ya está instalada, o si corre como TWA, o si el usuario lo cerró antes
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    if (dismissed || isInStandaloneMode() || isTWA()) return;

    const onAppInstalled = () => {
      // Si el usuario la instala, ocultamos y no molestamos más
      localStorage.setItem(DISMISS_KEY, 'true');
      setShowModal(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onAppInstalled);

    if (isAndroid()) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPlatform('android');
        setShowModal(true);
        // console.log('📱 Android: Mostrar botón instalar');
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', onAppInstalled);
      };
    }

    if (isIOS()) {
      // En iOS solo se puede instalar desde Safari (Añadir a pantalla de inicio)
      setPlatform('ios');
      setShowModal(true);
      return () => window.removeEventListener('appinstalled', onAppInstalled);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // accepted | dismissed
    setDeferredPrompt(null);
    setShowModal(false);
    if (outcome !== 'accepted') {
      // Si lo rechaza, no insistas más
      localStorage.setItem(DISMISS_KEY, 'true');
    }
  };

  const handleClose = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="pwa-modal-overlay">
      <div className="pwa-modal">
        {platform === 'android' && (
          <>
            <p>¿Quieres instalar la app <strong>KedeKids</strong> en tu dispositivo?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleInstall}>Instalar</button>
              <button onClick={handleClose}>Cerrar</button>
            </div>
          </>
        )}

        {platform === 'ios' && (
          <>
            <p>Para instalar la app en iPhone:</p>
            <p>
              Abre en <strong>Safari</strong>, pulsa <strong>Compartir</strong> (⬆️) y elige
              <strong> “Añadir a pantalla de inicio”</strong>.
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
