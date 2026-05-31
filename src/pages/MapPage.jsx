import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';
import LocationDetail from '../components/LocationDetail';
import CircuitDetail from '../components/CircuitDetail';
import ChatAssistant from '../components/ChatAssistant';
import { locations, EXPERIENCE_THEMES } from '../data/locations';
import { hiddenGems } from '../data/hiddenGems';
import { hotels } from '../data/hotels';
import { Home, Route, History, Bookmark } from 'lucide-react';
import { calculateDistance } from '../utils/haversine';

const MANGALORE_CENTER = [12.9141, 74.856];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeLocations, setRouteLocations] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [userLocation, setUserLocation] = useState(null);
  const [customStops, setCustomStops] = useState([]);
  const [showCircuitDetail, setShowCircuitDetail] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('mangalore_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('mangalore_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddReview = (review) => {
    const storedName = localStorage.getItem('mangalore_user_name') || 'Ajith';
    setReviews(prev => {
      const next = [...prev, { 
        ...review, 
        author: storedName,
        id: Date.now(), 
        timestamp: new Date().toISOString() 
      }];
      localStorage.setItem('mangalore_reviews', JSON.stringify(next));
      return next;
    });
  };

  // Real-time tracking of user position
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          let coords = [pos.coords.latitude, pos.coords.longitude];
          const dist = calculateDistance(coords[0], coords[1], MANGALORE_CENTER[0], MANGALORE_CENTER[1]);
          // Snap to Mangalore if they are testing from more than 50km away
          if (dist > 50) {
            coords = MANGALORE_CENTER;
          }
          setUserLocation(coords);
        },
        (err) => console.warn("Location tracking denied or failed", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Handle initial theme from URL
  useEffect(() => {
    const themeId = searchParams.get('theme');
    if (themeId) {
      if (themeId === 'stays' || themeId === 'dining') {
        setActiveTab(themeId);
      } else {
        const theme = EXPERIENCE_THEMES.find(t => t.id === themeId);
        if (theme) setActiveCategory(theme.label);
      }
    }
  }, [searchParams]);

  // Handle navigation from hidden gems page
  useEffect(() => {
    const navId = searchParams.get('navigate');
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const name = searchParams.get('name');

    if (navId && lat && lng) {
      const dest = { id: navId, name: name || 'Destination', lat, lng, category: 'Heritage' };
      const startPoint = userLocation
        ? { id: 'user', name: 'Your Location', lat: userLocation[0], lng: userLocation[1] }
        : { id: 'user', name: 'Your Location', lat: MANGALORE_CENTER[0], lng: MANGALORE_CENTER[1] };
      setSelectedLocation(dest);
      setRouteLocations([startPoint, dest]);
    }
  }, [searchParams, userLocation]);

  // Handle circuit loading from URL parameters (e.g. /map?circuit=id1,id2)
  useEffect(() => {
    const circuitParam = searchParams.get('circuit');
    if (circuitParam) {
      const stopIds = circuitParam.split(',');
      const allSearchable = [...locations, ...hotels, ...hiddenGems];
      const resolvedStops = stopIds
        .map(id => allSearchable.find(l => String(l.id) === id))
        .filter(Boolean);

      if (resolvedStops.length > 0) {
        const startPoint = userLocation
          ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
          : { id: 'user', name: 'User Node', lat: MANGALORE_CENTER[0], lng: MANGALORE_CENTER[1] };
        
        setCustomStops(resolvedStops.map(s => s.id));
        setRouteLocations([startPoint, ...resolvedStops]);
        setSelectedLocation(null);
        setShowCircuitDetail(true);
      }
    }
  }, [searchParams, userLocation]);
  const filteredLocations =
    activeCategory === 'All'
      ? locations
      : locations.filter(loc => loc.category === activeCategory || loc.experience === activeCategory);

  const displayedLocations = 
    activeTab === 'stays' ? hotels : 
    activeTab === 'dining' ? locations.filter(l => l.category === 'Culinary') :
    filteredLocations;

  const handleViewCustomTrip = () => {
    if (customStops.length > 0) {
      const allSearchable = [...locations, ...hotels];
      const customLocs = customStops.map(id => allSearchable.find(l => l.id === id)).filter(Boolean);
      const startPoint = userLocation 
        ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
        : { id: 'user', name: 'User Node', lat: 12.9141, lng: 74.856 };
      setRouteLocations([startPoint, ...customLocs]);
      setSelectedLocation(null);
    }
  };

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc);
    setRouteLocations(null);
    setShowCircuitDetail(false);
  };

  const handleCircuitSelect = (circuitLocations) => {
    const startPoint = userLocation 
      ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
      : { id: 'user', name: 'User Node', lat: MANGALORE_CENTER[0], lng: MANGALORE_CENTER[1] };
    setRouteLocations([startPoint, ...circuitLocations]);
    setSelectedLocation(null);
    setShowCircuitDetail(true);
  };

  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('mangalore_favorites', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-full bg-alien-obsidian overflow-hidden relative">
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        locations={locations}
        onLocationClick={handleLocationClick}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectCircuit={handleCircuitSelect}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        routeLocations={routeLocations}
        customStops={customStops}
        setCustomStops={setCustomStops}
        reviews={reviews}
        hotels={hotels}
        userLocation={userLocation || MANGALORE_CENTER}
      />
      <div className="flex-1 relative h-[50vh] md:h-screen z-10">
        {/* Subtle Overlay for Map */}
        <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

        {/* Floating Home Button - Holographic Portal */}
        <Link 
          to="/home" 
          className="absolute top-6 left-6 z-[4000] alien-glass p-3 rounded-full border-alien-cyan/30 text-alien-cyan hover:bg-alien-cyan/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-110 active:scale-95"
          title="Return to Core"
        >
          <Home className="w-5 h-5 animate-pulse-glow" />
        </Link>

        {/* Floating History Button - Log Chronicles */}
        <Link 
          to="/history" 
          className="absolute top-6 left-20 z-[4000] alien-glass p-3 rounded-full border-alien-cyan/30 text-alien-cyan hover:bg-alien-cyan/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-110 active:scale-95"
          title="Expeditions History"
        >
          <History className="w-5 h-5" />
        </Link>

        {/* Floating Saved Circuits Button - Bookmarked Routes */}
        <Link 
          to="/saved-circuits" 
          className="absolute top-6 left-[136px] z-[4000] alien-glass p-3 rounded-full border-alien-cyan/30 text-alien-cyan hover:bg-alien-cyan/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all transform hover:scale-110 active:scale-95"
          title="Saved Custom Circuits"
        >
          <Bookmark className="w-5 h-5" />
        </Link>

        {/* Floating View Trip Button - Command Interface */}
        {customStops.length > 0 && (
          <button
            onClick={handleViewCustomTrip}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2000] alien-glass text-alien-cyan px-8 py-4 rounded-full border-alien-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)] flex items-center gap-3 font-alien text-xs tracking-widest uppercase hover:bg-alien-cyan/10 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <Route className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
            Execute Mission ({customStops.length} Targets)
            <div className="absolute inset-0 rounded-full border border-alien-cyan/20 animate-ping opacity-20 pointer-events-none" />
          </button>
        )}
        
        {/* Popped Custom Circuit Header */}
        {customStops.length > 0 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top-6 duration-300">
            <button
              onClick={() => {
                const allSearchable = [...locations, ...hotels, ...hiddenGems];
                const customLocs = customStops.map(id => allSearchable.find(l => l.id === id)).filter(Boolean);
                const startPoint = userLocation 
                  ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
                  : { id: 'user', name: 'User Node', lat: MANGALORE_CENTER[0], lng: MANGALORE_CENTER[1] };
                
                setRouteLocations([startPoint, ...customLocs]);
                setSelectedLocation(null);
                setShowCircuitDetail(true);
              }}
              className="bg-amazon-navy text-white px-6 py-3 rounded-full border border-amazon-yellow/30 shadow-2xl flex items-center gap-3 font-sans text-xs font-black uppercase tracking-widest hover:bg-amazon-yellow hover:text-amazon-navy transition-all transform hover:scale-105 active:scale-95 group"
            >
              <span className="w-2 h-2 rounded-full bg-amazon-yellow animate-ping animate-pulse" />
              {customStops.length} Destination{customStops.length > 1 ? 's' : ''} Selected
              <span className="text-white/45 font-bold">•</span>
              <span className="text-amazon-yellow group-hover:text-amazon-navy transition-colors">Reveal Circuit</span>
            </button>
          </div>
        )}
        
        <MapComponent
          locations={displayedLocations}
          selectedLocation={selectedLocation}
          routeLocations={routeLocations}
          userLocation={userLocation}
          onLocationClick={handleLocationClick}
        />
        
        {selectedLocation && (
          <LocationDetail
            location={selectedLocation}
            userLocation={userLocation}
            onClose={() => setSelectedLocation(null)}
            isFavorite={favorites.includes(selectedLocation.id)}
            onToggleFavorite={handleToggleFavorite}
            onPreviewRide={(dest) => {
              const startPoint = userLocation 
                ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
                : { id: 'user', name: 'User Node', lat: 12.9141, lng: 74.856 };
              setRouteLocations([startPoint, dest]);
            }}
            onCancelRidePreview={() => setRouteLocations(null)}
            customStops={customStops}
            setCustomStops={setCustomStops}
            reviews={reviews}
            onAddReview={handleAddReview}
          />
        )}

        {showCircuitDetail && (
          <CircuitDetail
            customStops={customStops}
            locations={locations}
            hiddenGems={hiddenGems}
            userLocation={userLocation}
            onClose={() => {
              setShowCircuitDetail(false);
              setRouteLocations(null);
            }}
            onClearCircuit={() => {
              setCustomStops([]);
              setShowCircuitDetail(false);
              setRouteLocations(null);
            }}
          />
        )}
        <ChatAssistant 
          locations={locations} 
          activeTab={activeTab} 
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          onUpdateCustomStops={setCustomStops}
          onSwitchTab={setActiveTab}
          onPreviewRide={(dest) => {
            const startPoint = userLocation 
              ? { id: 'user', name: 'User Node', lat: userLocation[0], lng: userLocation[1] }
              : { id: 'user', name: 'User Node', lat: 12.9141, lng: 74.856 };
            setRouteLocations([startPoint, dest]);
          }}
        />
      </div>
    </div>
  );
}
