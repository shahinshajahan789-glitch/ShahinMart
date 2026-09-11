import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect if embedded inside Google AI Studio preview iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect standalone mode (already installed or launched from home screen)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices (Safari does not support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // If user came with ?install=1 or ?install=direct, trigger prompt immediately
      if (window.location.search.includes('install=')) {
        setTimeout(() => {
          (e as BeforeInstallPromptEvent).prompt().catch(() => {});
        }, 300);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    // If running in an iframe (e.g. AI Studio preview), breakout to the standalone direct site
    if (isInIframe) {
      openDirectSite();
      return true;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    }

    return false;
  };

  const openDirectSite = () => {
    const directUrl = 'https://ais-pre-lz633kk42vciqwegxngo4s-310607474640.asia-east1.run.app';
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = directUrl;
        return;
      }
    } catch {
      // Cross-origin iframe fallback
    }
    window.open(directUrl, '_blank');
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isInIframe,
    install,
    openDirectSite,
  };
}
