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
  
  // Use stringified versions for dependency array to prevent infinite re-renders
  // since center and bounds are new array instances on every render.
  const centerStr = center ? `${center[0]},${center[1]}` : '';
  const boundsStr = bounds ? `${bounds[0][0]},${bounds[0][1]},${bounds[1][0]},${bounds[1][1]}` : '';

  useEffect(() => {
    map.invalidateSize();
    if (bounds) {
      map.fitBounds(bounds, { padding: [100, 100], duration: 1.5 });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerStr, zoom, boundsStr, map]);
  
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
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [mapFocus, setMapFocus] = useState('auto');

  useEffect(() => {
    setMapFocus('auto');
  }, [selectedLocation, routeLocations]);
  
  const center = [12.9141, 74.856];
  const defaultZoom = 13;
  const validRouteLocs = React.useMemo(() => (routeLocations || []).filter(Boolean), [routeLocations]);

  const prevDeps = React.useRef({ validRouteLocs: [], selectedLocation: null });

  useEffect(() => {
    let timeoutId;
    const getRoadPath = async () => {
      const points = [];
      
      if (validRouteLocs.length > 0) {
        points.push(...validRouteLocs);
      } else if (selectedLocation) {
        if (userLocation) points.push({ lat: userLocation[0], lng: userLocation[1] });
        points.push({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      }

      if (points.length < 2) {
        setRouteGeometry([]);
        return;
      }

      try {
        const coordsString = points.map(loc => `${loc.lng},${loc.lat}`).join(';');
        const radiusesString = points.map(() => '5000').join(';'); // 5km snap radius
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&radiuses=${radiusesString}`, { signal: controller.signal });
        clearTimeout(fetchTimeout);
        
        const data = await response.json();
        if (data.routes?.[0]) {
          const roadPoints = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteGeometry(roadPoints);
        } else {
          setRouteGeometry(points.map(l => [l.lat, l.lng]));
        }
      } catch (error) {
        console.warn("OSRM Route failed, falling back to direct path", error);
        setRouteGeometry(points.map(l => [l.lat, l.lng]));
      }
    };
    
    const isRouteChanged = prevDeps.current.validRouteLocs !== validRouteLocs || prevDeps.current.selectedLocation !== selectedLocation;
    prevDeps.current = { validRouteLocs, selectedLocation };

    if (isRouteChanged) {
      getRoadPath(); // Immediate response for user clicks
    } else {
      timeoutId = setTimeout(getRoadPath, 1000); // Throttled response for GPS tracking movement
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

  const allLocationsToRender = React.useMemo(() => {
    const locMap = new Map();
    (locations || []).forEach(l => locMap.set(l.id, l));
    
    validRouteLocs.forEach(l => {
      if (l.id !== 'user' && !locMap.has(l.id)) locMap.set(l.id, l);
    });
    
    if (selectedLocation && selectedLocation.id !== 'user' && !locMap.has(selectedLocation.id)) {
      locMap.set(selectedLocation.id, selectedLocation);
    }
    
    return Array.from(locMap.values());
  }, [locations, validRouteLocs, selectedLocation]);

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

  return (
    <div className="w-full h-full bg-gray-100 relative">
      {/* Precision Controls */}
      <div className="absolute top-24 right-8 z-[1000] flex flex-col gap-4">
        <button
          onClick={() => setShowAllMarkers(!showAllMarkers)}
          className={`bg-white p-4 rounded-2xl shadow-2xl border-2 ${!showAllMarkers ? 'border-red-500 text-red-500' : 'border-white text-amazon-navy'} hover:bg-amazon-yellow hover:text-amazon-navy hover:border-white transition-all active:scale-90`}
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
