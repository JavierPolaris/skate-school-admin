import { useEffect, useState } from 'react';
import './InstallPrompt.css';

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const hasDismissed = localStorage.getItem('pwaPromptDismissed');
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (hasDismissed || isStandalone) return;

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowModal(true);
            console.log('➡️ Mostrando modal...')
        };

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] beforeinstallprompt capturado ✅');
            e.preventDefault();

        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(result => {
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
                <p>¿Quieres instalar la app Skate School en tu dispositivo?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleInstall}>Instalar App</button>
                    <button onClick={handleClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default InstallPrompt;
