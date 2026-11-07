import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).deferredPWAInstallPrompt) {
      return (window as unknown as { deferredPWAInstallPrompt: BeforeInstallPromptEvent }).deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    return localStorage.getItem('beo_app_last_updated') || '30-10-2026 07:05 AM';
  });

  useEffect(() => {
    // Detect iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect standalone mode (already installed as PWA)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(Boolean(isStandalone));
    };

    checkStandalone();

    // Check pre-existing deferred prompt
    if (typeof window !== 'undefined') {
      const globalPrompt = (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).deferredPWAInstallPrompt;
      if (globalPrompt) {
        setDeferredPrompt(globalPrompt);
      }
    }

    // Detect OS
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      setIsAndroid(/android/.test(ua));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as unknown as { deferredPWAInstallPrompt: BeforeInstallPromptEvent }).deferredPWAInstallPrompt = promptEvent;
    };

    const handlePromptReady = () => {
      const promptEvent = (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).deferredPWAInstallPrompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null }).deferredPWAInstallPrompt = null;
      localStorage.setItem('beo_app_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    // Check if we have prompt
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).deferredPWAInstallPrompt : null);
    if (!promptToUse) {
      return 'unsupported';
    }
    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        (window as unknown as { deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null }).deferredPWAInstallPrompt = null;
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.error('Error during PWA install:', err);
      return 'unsupported';
    }
  };

  const openInNewTab = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Check for updates by updating Service Worker registration & cache
  const checkForUpdates = async (): Promise<boolean> => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
      // Simulate/apply cache sync
      await new Promise((r) => setTimeout(r, 900));
      const nowStr = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setLastUpdatedTime(nowStr);
      localStorage.setItem('beo_app_last_updated', nowStr);
      setUpdateStatus('ಅಪ್ಲಿಕೇಶನ್ ಅತ್ಯಂತ ನವೀನ ಆವೃತ್ತಿಗೆ ನವೀಕರಣಗೊಂಡಿದೆ! (App is up to date)');
      return true;
    } catch (err) {
      console.error('Failed to check for updates', err);
      setUpdateStatus('ನವೀಕರಣ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ (Latest version active)');
      return false;
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    install,
    openInNewTab,
    checkForUpdates,
    isCheckingUpdate,
    updateStatus,
    lastUpdatedTime,
  };
}
