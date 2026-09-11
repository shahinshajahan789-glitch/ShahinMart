import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 text-white border border-amber-500/40 px-4 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md animate-bounce">
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Offline Mode — ShahinMART catalog &amp; cart cached offline</span>
    </div>
  );
};
