import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept localStorage to enable automatic database syncing
let isSyncLoading = false;
window.__setSyncLoading = (val) => {
  isSyncLoading = val;
};

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);

  const keysToSync = [
    'mangalore_user_name',
    'mangalore_user_email',
    'mangalore_user_phone',
    'mangalore_user_squad_size',
    'mangalore_user_expedition_days',
    'mangalore_session_token',
    'mangalore_saved_circuits',
    'mangalore_circuit_history',
    'mangalore_favorites'
  ];

  if (keysToSync.includes(key) && !isSyncLoading) {
    const email = localStorage.getItem('mangalore_user_email');
    if (email) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const originalUserStr = localStorage.getItem('mangalore_original_user');
      const requestorEmail = originalUserStr ? JSON.parse(originalUserStr).email : email;
      const token = localStorage.getItem('mangalore_session_token') || '';

      const data = {
        email,
        requestorEmail,
        token,
        name: localStorage.getItem('mangalore_user_name') || '',
        phone: localStorage.getItem('mangalore_user_phone') || '',
        squadSize: localStorage.getItem('mangalore_user_squad_size') || '',
        expeditionDays: localStorage.getItem('mangalore_user_expedition_days') || '',
        savedCircuits: localStorage.getItem('mangalore_saved_circuits') || '[]',
        circuitHistory: localStorage.getItem('mangalore_circuit_history') || '[]',
        favorites: localStorage.getItem('mangalore_favorites') || '[]'
      };

      fetch(`${API_URL}/api/user-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.warn("Background sync failed:", err));
    }
  }
};

// Register PWA Service Worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW: Registered successfully with scope:', reg.scope))
      .catch(err => console.error('SW: Registration failed:', err));
  });
}

// Auto-sync when connectivity recovers
window.addEventListener('online', () => {
  console.log("Telemetry link established. Dispatching offline changes...");
  const email = localStorage.getItem('mangalore_user_email');
  const days = localStorage.getItem('mangalore_user_expedition_days');
  if (email && days) {
    // Re-setting this triggers the custom localStorage.setItem interceptor to run a unified sync fetch
    localStorage.setItem('mangalore_user_expedition_days', days);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

