import React, { useState } from 'react';
import { Download, Smartphone, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isInIframe, install, openDirectSite } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // If already running as standalone installed PWA, or user dismissed for this session
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInIframe) {
      openDirectSite();
      return;
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);

    await install();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 sm:px-6 py-2.5 shadow-sm border-b border-amber-300 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-950">
                {isInIframe ? '⚡ Direct ShahinMART App' : '📲 ShahinMART 1-Click App'}
              </span>
              <span className="hidden sm:inline text-slate-900 font-medium">
                {isInIframe
                  ? ' — Tap below to open directly in full browser for 1-click install (no preview frame).'
                  : ' — Direct 1-click install to phone home screen with official store icon.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="install-pwa-banner-btn"
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs active:scale-95"
            >
              {isInIframe ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open &amp; Direct Download</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Installing App...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Direct Download &amp; Install</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-amber-600/20 text-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const PWAInstallNavButton: React.FC = () => {
  const { isInstalled, isInIframe, install, openDirectSite } = usePWAInstall();
  const [downloading, setDownloading] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInIframe) {
      openDirectSite();
      return;
    }
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
    await install();
  };

  return (
    <button
      id="navbar-install-app-btn"
      type="button"
      onClick={handleClick}
      className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
      title="Direct download and install ShahinMART app"
    >
      <Download className="w-3.5 h-3.5 text-slate-950" />
      <span className="hidden sm:inline">
        {downloading ? 'Installing...' : 'Direct Download'}
      </span>
    </button>
  );
};

