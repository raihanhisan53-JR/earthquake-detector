'use client'
import { useEffect, useState } from 'react';

/**
 * usePWA
 * - Registers /sw.js service worker
 * - Tracks install prompt (beforeinstallprompt)
 * - Exposes installApp() to trigger native install
 * - swStatus: 'idle' | 'registering' | 'active' | 'error'
 */
export function usePWA() {
  const [swStatus, setSwStatus]         = useState('idle');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]   = useState(false);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    setSwStatus('registering');
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        setSwStatus('active');
        // Check for updates every 60s
        const id = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(id);
      })
      .catch((err) => {
        console.warn('[PWA] SW registration failed:', err);
        setSwStatus('error');
      });
  }, []);

  // Capture install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Detect if already installed (standalone mode)
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches || navigator.standalone === true);
    const handler = (e) => setIsInstalled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
    return outcome === 'accepted';
  };

  return { swStatus, installPrompt: !!installPrompt, isInstalled, installApp };
}
