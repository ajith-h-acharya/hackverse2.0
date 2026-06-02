import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, Tooltip, useMap, Polyline, TileLayer, Circle, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Maximize2, Compass, Navigation2, Crosshair, Target, ChevronRight, Eye, EyeOff } from 'lucide-react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Standard Leaflet Icon Fix
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CATEGORY_COLORS = {
  Coastal: '#007185',
  Religious: '#f0c14b',
  Heritage: '#131921',
  Nature: '#232f3e',
  Culinary: '#fbbf24',
  Urban: '#565959',
  Hospitality: '#1a1a1a'
};

const iconCache = {};

const createExpeditionIcon = (color, isHighlighted = false, order = null) => {
  const cacheKey = `${color}-${isHighlighted}-${order}`;
  if (iconCache[cacheKey]) return iconCache[cacheKey];

  const size = isHighlighted ? 48 : 38;
  const stroke = isHighlighted ? '#ffffff' : 'black';
  const strokeWidth = isHighlighted ? 3 : 2.5;
  const shadow = isHighlighted ? 'filter: drop-shadow(0 0 8px rgba(240, 193, 75, 0.8));' : '';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="${shadow}">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3" fill="white" stroke="black" stroke-width="1.5"></circle>
    ${order !== null ? `<text x="12" y="11" font-size="6" font-family="Arial" font-weight="900" text-anchor="middle" fill="black" stroke="none">${order}</text>` : ''}
  </svg>`;

  const icon = L.divIcon({
    html: svg,
    className: `expedition-marker ${isHighlighted ? 'marker-pulse' : ''}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  });

  iconCache[cacheKey] = icon;
  return icon;
};

const userIcon = L.divIcon({
  html: '<div class="user-pulse"></div>',
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapUpdater({ center, zoom, bounds }) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  
  return null;
}

export default function MapComponent({ 
  locations = [], 
  selectedLocation, 
  routeLocations, 
  userLocation,
  onLocationClick
}) {
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [showAllMarkers, setShowAllMarkers] = useState(false);
  const [mapFocus, setMapFocus] = useState('auto');
  const lastFetchedCoords = React.useRef(null);
  const routeCache = React.useRef({});
  const lastFetchedKey = React.useRef('');

  const MAX_BG_MARKERS = 120; // Performance cap: show nearest 120 when no route active

  useEffect(() => {
    setMapFocus('auto');
  }, [selectedLocation, routeLocations]);
  
  const center = [12.9141, 74.856];
  const defaultZoom = 13;
  const validRouteLocs = React.useMemo(() => (routeLocations || []).filter(Boolean), [routeLocations]);

  useEffect(() => {
    let timeoutId;

    const getRoadPath = async () => {
      const rawPoints = [];
      
      if (validRouteLocs.length > 0) {
        rawPoints.push(...validRouteLocs);
      } else if (selectedLocation) {
        if (userLocation) rawPoints.push({ lat: userLocation[0], lng: userLocation[1] });
        rawPoints.push({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      }

      // Filter out points with invalid coordinates
      const points = rawPoints.filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng));

      if (points.length < 2) {
        setRouteGeometry([]);
        lastFetchedCoords.current = null;
        return;
      }

      // Check if coordinates changed significantly
      const coordsString = points.map(loc => `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`).join(';');
      if (lastFetchedCoords.current === coordsString) {
        return; // Skip duplicate fetch on minor GPS jitter
      }
      lastFetchedCoords.current = coordsString;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const pathSegments = [];

      // Fetch each consecutive leg individually to isolate errors (e.g. islands, rivers) and cache aggressively
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i+1];
        const legCacheKey = `${start.lat.toFixed(4)},${start.lng.toFixed(4)};${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
        
        if (routeCache.current[legCacheKey]) {
          pathSegments.push(...routeCache.current[legCacheKey]);
          continue;
        }
        
        // Add a pacing delay for subsequent uncached requests to prevent hitting rate limiters
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        const legCoordsString = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        let legPoints = null;
        
        // 1. Try local backend route proxy
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const response = await fetch(`${API_URL}/api/route?coords=${legCoordsString}`, { signal: controller.signal });
          clearTimeout(timeout);
          const data = await response.json();
          if (data.routes?.[0]?.geometry?.coordinates) {
            legPoints = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          }
        } catch (err) {
          console.warn(`Backend proxy failed for leg ${i}:`, err);
        }
        
        // 2. Try OpenStreetMap Germany Router
        if (!legPoints) {
          try {
            const controller1 = new AbortController();
            const timeout1 = setTimeout(() => controller1.abort(), 3500);
            const response = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${legCoordsString}?overview=full&geometries=geojson`, { signal: controller1.signal });
            clearTimeout(timeout1);
            const data = await response.json();
            if (data.routes?.[0]?.geometry?.coordinates) {
              legPoints = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
          } catch (err) {
            console.warn(`OSM Germany Router failed for leg ${i}:`, err);
          }
        }
        
        // 3. Try Backup Router
        if (!legPoints) {
          try {
            const controller2 = new AbortController();
            const timeout2 = setTimeout(() => controller2.abort(), 3500);
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${legCoordsString}?overview=full&geometries=geojson`, { signal: controller2.signal });
            clearTimeout(timeout2);
            const data = await response.json();
            if (data.routes?.[0]?.geometry?.coordinates) {
              legPoints = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
          } catch (err) {
            console.warn(`Backup Demo Router failed for leg ${i}:`, err);
          }
        }
        
        if (legPoints && legPoints.length > 0) {
          routeCache.current[legCacheKey] = legPoints;
          pathSegments.push(...legPoints);
        } else {
          // Fallback to straight line for this single leg only
          const fallbackLeg = [[start.lat, start.lng], [end.lat, end.lng]];
          routeCache.current[legCacheKey] = fallbackLeg;
          pathSegments.push(...fallbackLeg);
        }
      }
      
      setRouteGeometry(pathSegments);
    };
    
    // Determine structural changes vs coordinate jitter
    const currentRouteKey = `${validRouteLocs.map(l => l.id).join(';')}-${selectedLocation?.id || 'none'}`;
    const isStructureChanged = lastFetchedKey.current !== currentRouteKey;
    lastFetchedKey.current = currentRouteKey;

    if (isStructureChanged) {
      getRoadPath(); // Immediate response for user clicks (0ms debounce)
    } else {
      timeoutId = setTimeout(getRoadPath, 1200); // Debounced response for GPS tracking/movement to prevent spamming
    }
    
    return () => clearTimeout(timeoutId);
  }, [validRouteLocs, selectedLocation, userLocation]);

  let currentCenter = center;
  let currentZoom = defaultZoom;
  let bounds = null;

  if (mapFocus === 'user') {
    if (userLocation) {
      currentCenter = [userLocation[0], userLocation[1]];
    } else {
      currentCenter = center;
    }
    currentZoom = 15;
    bounds = null;
  } else if (mapFocus === 'global') {
    const points = (locations || []).map(l => [l.lat, l.lng]);
    if (points.length >= 2) {
      const lats = points.map(p => p[0]);
      const lngs = points.map(p => p[1]);
      bounds = [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
    } else {
      currentCenter = center;
      currentZoom = defaultZoom;
    }
  } else {
    // 'auto' mode
    const activePoints = [];
    if (userLocation) activePoints.push([userLocation[0], userLocation[1]]);
    if (validRouteLocs.length > 0) {
      activePoints.push(...validRouteLocs.map(l => [l.lat, l.lng]));
    } else if (selectedLocation) {
      activePoints.push([selectedLocation.lat, selectedLocation.lng]);
    } else if (locations && locations.length > 0) {
      activePoints.push(...locations.map(l => [l.lat, l.lng]));
    }

    if (activePoints.length >= 2) {
      const lats = activePoints.map(p => p[0]);
      const lngs = activePoints.map(p => p[1]);
      bounds = [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
    } else if (selectedLocation) {
      currentCenter = [selectedLocation.lat, selectedLocation.lng];
      currentZoom = 15;
    } else if (activePoints.length === 1) {
      currentCenter = activePoints[0];
      currentZoom = 13;
    }
  }

  const routeStructureKey = React.useMemo(() => {
    const routeIds = validRouteLocs.map(l => l.id).join(';');
    const selectedId = selectedLocation ? selectedLocation.id : 'none';
    let key = `${mapFocus}-${routeIds}-${selectedId}`;
    if (mapFocus === 'user' && userLocation) {
      key += `-${userLocation[0].toFixed(4)},${userLocation[1].toFixed(4)}`;
    }
    return key;
  }, [validRouteLocs, selectedLocation, mapFocus, userLocation]);

  const allLocationsToRender = React.useMemo(() => {
    const locMap = new Map();

    // Always include route stops and selected location
    const priorityIds = new Set();
    validRouteLocs.forEach(l => {
      if (l.id !== 'user') { locMap.set(l.id, l); priorityIds.add(l.id); }
    });
    if (selectedLocation && selectedLocation.id !== 'user') {
      locMap.set(selectedLocation.id, selectedLocation);
      priorityIds.add(selectedLocation.id);
    }

    if (showAllMarkers) {
      // Sort background markers by distance to map center, cap at MAX_BG_MARKERS
      const mapCenter = currentCenter; // [lat, lng]
      const bgLocs = (locations || []).filter(l => !priorityIds.has(l.id));
      bgLocs.sort((a, b) => {
        const da = Math.hypot(a.lat - mapCenter[0], a.lng - mapCenter[1]);
        const db = Math.hypot(b.lat - mapCenter[0], b.lng - mapCenter[1]);
        return da - db;
      });
      bgLocs.slice(0, MAX_BG_MARKERS).forEach(l => { if (!locMap.has(l.id)) locMap.set(l.id, l); });
    }

    return Array.from(locMap.values());
  }, [locations, validRouteLocs, selectedLocation, showAllMarkers, currentCenter, MAX_BG_MARKERS]);

  const markerComponents = React.useMemo(() => {
    return allLocationsToRender.map(loc => {
      const isSelected = selectedLocation?.id === loc.id;
      const routeIndex = validRouteLocs.findIndex(r => r.id === loc.id);
      const isPartOfRoute = routeIndex !== -1;
      
      if (!showAllMarkers && !isSelected && !isPartOfRoute) return null;
      
      let color = CATEGORY_COLORS[loc.category || 'Hospitality'] || '#131921';
      if (isSelected) color = '#f0c14b';
      if (isPartOfRoute) color = '#f0c14b'; // Circuit color

      return (
        <Marker 
          key={loc.id}
          position={[loc.lat, loc.lng]} 
          icon={createExpeditionIcon(color, isPartOfRoute || isSelected, isPartOfRoute ? routeIndex + 1 : null)}
          zIndexOffset={isPartOfRoute || isSelected ? 1000 : 0}
          eventHandlers={{ 
            click: (e) => {
              onLocationClick?.(loc);
              // Auto-close popup after 4 seconds
              setTimeout(() => {
                if (e.target && e.target.isPopupOpen && e.target.isPopupOpen()) {
                  e.target.closePopup();
                }
              }, 4000);
            } 
          }}
        >
          <Tooltip direction="top" offset={[0, -40]} opacity={1} className="custom-tooltip border-none bg-amazon-navy text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-xl p-2 z-[2000]">
            {loc.name} {isPartOfRoute && <span className="text-amazon-yellow ml-1">[{routeIndex + 1}]</span>}
          </Tooltip>
          <Popup className="expedition-popup">
            <div className="p-4 w-56 text-left space-y-3">
              <img src={loc.image} alt={loc.name} className="w-full h-24 object-cover rounded-2xl shadow-md" />
              <div>
                <h3 className="text-base font-black text-black leading-tight">{loc.name}</h3>
                <p className="text-[10px] font-black text-amazon-navy uppercase tracking-widest mt-1 opacity-60">
                  {isPartOfRoute ? `EXPEDITION STOP ${routeIndex + 1}` : `${loc.category || loc.type || 'Hospitality'} waypoint`}
                </p>
              </div>
              <button className="w-full py-2.5 bg-amazon-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">View Details</button>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [locations, selectedLocation, validRouteLocs, onLocationClick, showAllMarkers]);

  const handleMapInteract = React.useCallback(() => {
    setMapFocus('manual');
  }, []);

  return (
    <div className="w-full h-full bg-gray-100 relative">
      {/* Precision Controls */}
      <div className="absolute top-24 right-8 z-[1000] flex flex-col gap-4">
        <button
          onClick={() => setShowAllMarkers(!showAllMarkers)}
          className={`bg-white p-4 rounded-2xl shadow-2xl border-2 ${!showAllMarkers ? 'border-amazon-navy text-amazon-navy' : 'border-red-400 text-red-500'} hover:bg-amazon-yellow hover:text-amazon-navy hover:border-white transition-all active:scale-90`}
          title={showAllMarkers ? "Hide Background Markers" : "Show Nearby Places"}
        >
          {showAllMarkers ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
        <button
          onClick={() => setMapFocus('user')}
          className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-white text-amazon-navy hover:bg-amazon-yellow transition-all active:scale-90"
          title="Recenter Tracking"
        >
          <Target className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            setMapFocus('global');
            onLocationClick?.(null);
          }}
          className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-white text-amazon-navy hover:bg-amazon-yellow transition-all active:scale-90"
          title="Global Overview"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
      </div>

      <MapContainer center={center} zoom={defaultZoom} className="w-full h-full z-0" zoomControl={false}>
        <MapUpdater center={currentCenter} zoom={currentZoom} bounds={bounds} />
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

        {markerComponents}

        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {routeGeometry.length > 1 && (
          <>
            {/* Outer Glow Shadow */}
            <Polyline 
              positions={routeGeometry} 
              color="#131921" 
              weight={12} 
              opacity={0.1} 
              lineCap="round"
            />
            {/* Core Path Line */}
            <Polyline 
              positions={routeGeometry} 
              color="#f0c14b" 
              weight={6} 
              opacity={1} 
              lineCap="round"
            />
            {/* Animated Flow Overlay */}
            <Polyline 
              positions={routeGeometry} 
              className="path-flow"
              color="#ffffff" 
              weight={3} 
              opacity={0.8} 
              lineCap="round"
            />
          </>
        )}
      </MapContainer>

      {/* Explorer Legend */}
      <div className="absolute bottom-8 left-8 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border-2 border-white text-left animate-in slide-in-from-bottom duration-500">
        <h5 className="text-[10px] font-black text-amazon-navy mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
           <Compass className="w-4 h-4" /> Destination Spectrum
        </h5>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
              <span className="text-[10px] text-black font-black uppercase tracking-tight">{cat}</span>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm bg-amazon-yellow" />
            <span className="text-[10px] text-black font-black uppercase tracking-tight italic">Active Stop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
