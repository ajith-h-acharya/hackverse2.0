import React from 'react';
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

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
