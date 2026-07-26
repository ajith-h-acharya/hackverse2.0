import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TacticalCommandCenter from './pages/TacticalCommandCenter';
import { WifiOff, CheckCircle } from 'lucide-react';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineStatus(true);
      const timer = setTimeout(() => setShowOnlineStatus(false), 4000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      {isOffline && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0b0f19]/95 border-2 border-red-500/40 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(239,68,68,0.25)] flex items-center gap-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-wider font-orbitron">OFFLINE SYSTEM STATUS</h4>
              <p className="text-[10px] text-gray-300 font-bold leading-tight mt-0.5">
                Local telemetry simulation active. State localized.
              </p>
            </div>
          </div>
        </div>
      )}

      {showOnlineStatus && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0b0f19]/95 border-2 border-cyan-500/40 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(6,182,212,0.25)] flex items-center gap-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0 relative">
              <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full animate-ping absolute" />
              <CheckCircle className="w-5 h-5 relative z-10" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-orbitron">TELEMETRY LINK ACTIVE</h4>
              <p className="text-[10px] text-gray-300 font-bold leading-tight mt-0.5">
                Link to Python FastAPI backend established successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<TacticalCommandCenter />} />
        <Route path="*" element={<TacticalCommandCenter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
