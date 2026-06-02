import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import CulturePage from './pages/CulturePage';
import LoginPage from './pages/LoginPage';
import HiddenGemsPage from './pages/HiddenGemsPage';
import RentalsPage from './pages/RentalsPage';
import PackagesPage from './pages/PackagesPage';
import CircuitHistoryPage from './pages/CircuitHistoryPage';
import SavedCircuitsPage from './pages/SavedCircuitsPage';
import PitchDeckPage from './pages/PitchDeckPage';
import AdPage from './pages/AdPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0e1626]/95 border-2 border-amazon-orange/40 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(255,153,0,0.25)] flex items-center gap-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-amazon-orange/20 flex items-center justify-center text-amazon-orange shrink-0">
              <WifiOff className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-amazon-orange uppercase tracking-wider">OFFLINE MODE ACTIVE</h4>
              <p className="text-[10px] text-gray-300 font-bold leading-tight mt-0.5">
                Sector local files and cached maps active. Sync queued.
              </p>
            </div>
          </div>
        </div>
      )}

      {showOnlineStatus && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-[#0e1626]/95 border-2 border-green-500/40 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(34,197,94,0.25)] flex items-center gap-3.5 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 shrink-0 relative">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full animate-ping absolute" />
              <CheckCircle className="w-5 h-5 relative z-10" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-green-400 uppercase tracking-wider">TELEMETRY RE-ESTABLISHED</h4>
              <p className="text-[10px] text-gray-300 font-bold leading-tight mt-0.5">
                Link active. Database changes synchronized.
              </p>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/culture" element={<CulturePage />} />
        <Route path="/hidden-gems" element={<HiddenGemsPage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/history" element={<CircuitHistoryPage />} />
        <Route path="/saved-circuits" element={<SavedCircuitsPage />} />
        <Route path="/pitch" element={<PitchDeckPage />} />
        <Route path="/ad" element={<AdPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

