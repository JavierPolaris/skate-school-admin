import { useEffect, useState } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const alreadyClosed = localStorage.getItem('hideInstallPrompt');

    if (!isPWA && isMobile && !alreadyClosed) {
      setShowPrompt(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hideInstallPrompt', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="install-modal">
      <button className="close-button" onClick={handleClose}>✖</button>
      <div className="install-content">
        <p>¿Quieres instalar la app de Skate School en tu dispositivo?</p>
        <p>Pulsa <strong>“Agregar a pantalla de inicio”</strong> desde el menú de tu navegador 📱</p>
      </div>
    </div>
  );
};

export default InstallPrompt;
