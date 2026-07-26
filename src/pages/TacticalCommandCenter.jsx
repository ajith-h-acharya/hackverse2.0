import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  Polyline, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Shield, 
  Activity, 
  Truck, 
  AlertTriangle, 
  Send, 
  Radio, 
  Database, 
  Cpu, 
  Play, 
  Trash2, 
  Zap, 
  Check, 
  Compass, 
  Heart, 
  MapPin, 
  Clock, 
  Flame, 
  Droplet, 
  FileText, 
  AlertOctagon, 
  Layers, 
  PlusCircle, 
  Navigation,
  Sparkles
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";
const WS_URL = "ws://localhost:8000/api/ws";

// =====================================================================
// LOCAL SIMULATOR DICTIONARY & HELPER FOR OFFLINE FALLBACK
// =====================================================================
const REGION_BBOX = { min_lat: 12.75, max_lat: 13.45, min_lon: 74.65, max_lon: 74.98 };

const LOCAL_LANDMARKS = {
  "hampankatta": [12.8698, 74.8431],
  "manipal": [13.3409, 74.7865],
  "kuntikan": [12.8911, 74.8435],
  "ullal": [12.8020, 74.8510],
  "lalbagh": [12.8837, 74.8430],
  "bejai": [12.8906, 74.8385],
  "kadri": [12.8790, 74.8576],
  "pumpwell": [12.8631, 74.8632],
  "panambur beach": [12.9525, 74.7961],
  "kadiyali": [13.3444, 74.7937],
  "tannirbhavi": [12.8943, 74.8105],
  "jeppu": [12.8511, 74.8422],
  "urwa": [12.8950, 74.8285],
  "surathkal": [13.0084, 74.7963],
  "jyothi circle": [12.8715, 74.8475],
  "bendoorwell": [12.8696, 74.8560],
  "malpe": [13.3484, 74.7042],
  "udupi": [13.3409, 74.7421],
  "padubidri": [13.1250, 74.7950],
  "mulki": [13.0800, 74.7980]
};

// Seed values for local frontend simulation
const SEED_CAMPS = [
  { id: "camp_alpha", name: "Camp Alpha (Lalbagh)", lat: 12.8837, lng: 74.8430, resources: { food_kg: 500, water_liters: 1200, medical_kits: 80, boats: 3, trucks: 4, helicopters: 1 } },
  { id: "camp_beta", name: "Camp Beta (Manipal Center)", lat: 13.3409, lng: 74.7865, resources: { food_kg: 800, water_liters: 2000, medical_kits: 150, boats: 1, trucks: 6, helicopters: 2 } },
  { id: "camp_coastal", name: "Coastal Rescue Unit (Ullal)", lat: 12.8020, lng: 74.8510, resources: { food_kg: 300, water_liters: 800, medical_kits: 50, boats: 5, trucks: 2, helicopters: 0 } }
];

const SEED_VEHICLES = [
  { id: "v_amb_1", name: "Ambulance Alpha-1", type: "Ambulance", status: "Idle", camp_id: "camp_alpha", lat: 12.8837, lng: 74.8430, speed_kmh: 45, route_geometry: [], route_index: 0, destinations: [], current_supplies: {} },
  { id: "v_boat_1", name: "Rescue Boat Alpha-2", type: "Boat", status: "Idle", camp_id: "camp_alpha", lat: 12.8837, lng: 74.8430, speed_kmh: 25, route_geometry: [], route_index: 0, destinations: [], current_supplies: {} },
  { id: "v_truck_1", name: "Supply Truck Beta-1", type: "Truck", status: "Idle", camp_id: "camp_beta", lat: 13.3409, lng: 74.7865, speed_kmh: 35, route_geometry: [], route_index: 0, destinations: [], current_supplies: {} },
  { id: "v_heli_1", name: "Helo Lifesaver Beta-2", type: "Helicopter", status: "Idle", camp_id: "camp_beta", lat: 13.3409, lng: 74.7865, speed_kmh: 120, route_geometry: [], route_index: 0, destinations: [], current_supplies: {} },
  { id: "v_boat_2", name: "Speed Rescue Ullal-1", type: "Boat", status: "Idle", camp_id: "camp_coastal", lat: 12.8020, lng: 74.8510, speed_kmh: 30, route_geometry: [], route_index: 0, destinations: [], current_supplies: {} }
];

const SEED_BLOCKED_ROADS = [
  { id: "block_1", name: "Kuntikan Flyover Waterlogged", lat: 12.8911, lng: 74.8435, radius_km: 0.4 }
];

const SEED_SOS = [
  { id: "sos_seed_1", source: "Twitter/X", username: "@suresh_k", text: "Water levels rising rapidly in Hampankatta! 4 people trapped on first floor, one elderly needs medicine!", timestamp: new Date().toISOString(), is_emergency: true, pytorch_prob: 0.98, emergency_type: "Rescue", location: "Hampankatta", lat: 12.8698, lng: 74.8431, count: 4, urgency_score: 8, priority_score: 24.0, status: "Pending", assigned_vehicle: null, is_estimated_zone: false },
  { id: "sos_seed_2", source: "Twitter/X", username: "@kavitha_m", text: "Landslide block road in Manipal road near Kadiyali. Heavy rocks blocking vehicle entry, emergency rescue crew required", timestamp: new Date().toISOString(), is_emergency: true, pytorch_prob: 0.94, emergency_type: "Hazard", location: "Kadiyali", lat: 13.3444, lng: 74.7937, count: 1, urgency_score: 6, priority_score: 12.0, status: "Pending", assigned_vehicle: null, is_estimated_zone: false }
];

const MOCK_TWEETS = [
  { text: "Help! Flood waters rising near Hampankatta! We are trapped on our roof, 4 people!", is_sos: true, category: "Rescue", loc: "Hampankatta", count: 4, urgency: 8 },
  { text: "Building collapsed in Manipal near the campus. Need emergency ambulance and rescue, 2 trapped under debris!", is_sos: true, category: "Medical", loc: "Manipal", count: 2, urgency: 9 },
  { text: "Heavy rain has caused a mudslide near Kuntikan flyover. The main road is blocked!", is_sos: true, category: "Hazard", loc: "Kuntikan", count: 0, urgency: 5 },
  { text: "No drinking water or dry food remaining at the primary school relief camp in Bejai. Please send supplies, 10 people.", is_sos: true, category: "Food/Water", loc: "Bejai", count: 10, urgency: 6 },
  { text: "Family trapped near Ullal beach due to high tide, water flowing into living room, 5 people", is_sos: true, category: "Rescue", loc: "Ullal", count: 5, urgency: 7 },
  { text: "Enjoying the delicious Mangalore buns at Jyothi Circle café, beautiful cloudy weather", is_sos: false, category: "None", loc: "", count: 0, urgency: 0 },
  { text: "Normal traffic flow observed near Pumpwell circle today, roads are wet though", is_sos: false, category: "None", loc: "", count: 0, urgency: 0 },
  { text: "Beautiful views of Udupi Krishna Temple in the monsoon rain", is_sos: false, category: "None", loc: "", count: 0, urgency: 0 }
];

// Helper to compute coordinate distance
function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dlat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dlon/2)**2;
  const c = 2 * Math.atan2(math.sqrt(a), math.sqrt(1-a));
  return R * c;
}

// =====================================================================
// MAP LEAFLET CUSTOM CUSTOMIZER ICONS
// =====================================================================
const createSosMarker = (category, urgency) => {
  const pulseClass = urgency >= 8 ? 'sos-pulse-red bg-red-500 shadow-[0_0_12px_#ef4444]' : urgency >= 5 ? 'sos-pulse-orange bg-orange-500 shadow-[0_0_10px_#f97316]' : 'sos-pulse-yellow bg-yellow-500 shadow-[0_0_8px_#eab308]';
  return L.divIcon({
    className: 'sos-marker-div',
    html: `<div class="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${pulseClass}"><span class="text-[8px] font-black text-black font-orbitron">${urgency}</span></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const campIcon = L.divIcon({
  className: 'camp-marker-div',
  html: `<div class="w-8 h-8 rounded-lg border-2 border-green-400 bg-[#0b0f19] text-green-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const vehicleIcon = (type, status) => {
  const statusColor = status === "Idle" ? "text-cyan-400 border-cyan-400" : "text-amber-400 border-amber-400 animate-pulse";
  let svgPath = '';
  if (type === 'Helicopter') {
    svgPath = '<path d="m2 4 8 8M22 4l-8 8M12 12v10M12 12H2M12 12h10" />';
  } else if (type === 'Boat') {
    svgPath = '<path d="M2 17h20M2 20h20M2 14l3-3h14l3 3z" />';
  } else {
    svgPath = '<rect width="18" height="12" x="3" y="6" rx="2" /><path d="M7 18h.01M17 18h.01" />';
  }
  return L.divIcon({
    className: 'vehicle-marker-div',
    html: `<div class="w-8 h-8 rounded-full border-2 bg-[#0b0f19] flex items-center justify-center shadow-md ${statusColor}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const resolvedIcon = L.divIcon({
  className: 'resolved-marker-div',
  html: `<div class="w-4 h-4 rounded-full border-2 border-[#1e293b] bg-green-500/50 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Map View Adjuster Helper
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Map Click Listener to Draw Blocked Roads
function MapClickListener({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function TacticalCommandCenter() {
  // Telemetry Sync Mode: 'online' or 'simulation'
  const [telemetryMode, setTelemetryMode] = useState("simulation");
  
  // Database States
  const [camps, setCamps] = useState(SEED_CAMPS);
  const [vehicles, setVehicles] = useState(SEED_VEHICLES);
  const [activeSOS, setActiveSOS] = useState(SEED_SOS);
  const [resolvedSOS, setResolvedSOS] = useState([]);
  const [blockedRoads, setBlockedRoads] = useState(SEED_BLOCKED_ROADS);
  const [socialFeed, setSocialFeed] = useState([]);
  
  // Map control
  const [mapCenter, setMapCenter] = useState([12.8700, 74.8431]);
  const [drawingBlockage, setDrawingBlockage] = useState(false);
  
  // Dispatch Selection State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedSOSIds, setSelectedSOSIds] = useState([]);
  const [dispatchFood, setDispatchFood] = useState(50);
  const [dispatchWater, setDispatchWater] = useState(100);
  const [dispatchKits, setDispatchKits] = useState(5);
  
  // Manual SOS Form State
  const [manualReporter, setManualReporter] = useState("field_team_red");
  const [manualLocation, setManualLocation] = useState("Kadri");
  const [manualText, setManualText] = useState("Trapped citizens at Kadri Hills shelter need dry rations and a medic.");
  const [manualCategory, setManualCategory] = useState("Food/Water");
  const [manualCount, setManualCount] = useState(6);
  const [manualUrgency, setManualUrgency] = useState(7);
  
  // AI Advisor Chat States
  const [chatMessages, setChatMessages] = useState([
    { sender: "agis", text: "A.G.I.S. Command Advisor online. Linked to regional telemetry. Feed me operational queries or request resource optimizations." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Simulation Controller States
  const [simEvent, setSimEvent] = useState("Flood");
  const [simLocation, setSimLocation] = useState("Hampankatta");
  
  const wsRef = useRef(null);

  // =====================================================================
  // WEBSOCKET & DUAL MODE TELEMETRY CONTROL
  // =====================================================================
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    console.log("Connecting to A.G.I.S. WebSocket telemetry...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("FastAPI backend connection active. Switching to ONLINE telemetry mode.");
      setTelemetryMode("online");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "STATE_UPDATE") {
          const data = payload.data;
          setCamps(data.camps);
          setVehicles(data.vehicles);
          setActiveSOS(data.active_emergencies);
          setResolvedSOS(data.resolved_emergencies);
          setBlockedRoads(data.blocked_roads);
          setSocialFeed(data.social_feed);
        } else if (payload.type === "NEW_EMERGENCY") {
          // Play alert beep or flash UI
          console.log("NEW TACTICAL SOS INGESTED:", payload.data);
        }
      } catch (err) {
        console.error("Error processing websocket packet:", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("WebSocket telemetry error. Falling back to local frontend simulator.");
      setTelemetryMode("simulation");
    };

    ws.onclose = () => {
      console.warn("WebSocket closed. Reconnection queue starting in 10s...");
      setTelemetryMode("simulation");
      setTimeout(connectWebSocket, 10000);
    };
  };

  // =====================================================================
  // LOCAL TACTICAL SIMULATOR ENGINE (WHEN OFFLINE)
  // =====================================================================
  useEffect(() => {
    if (telemetryMode !== "simulation") return;
    
    // 1. Vehicle Movement Simulator Interval
    const movementInterval = setInterval(() => {
      setVehicles(prevVehicles => {
        let updated = false;
        const nextVehicles = prevVehicles.map(vehicle => {
          if (vehicle.status === "En Route" && vehicle.route_geometry.length > 0) {
            updated = true;
            const geom = vehicle.route_geometry;
            const idx = vehicle.route_index;
            
            let speedStep = 1;
            if (vehicle.type === "Helicopter") speedStep = 3;
            else if (vehicle.type === "Boat") speedStep = 1;
            else speedStep = 2;

            const nextIdx = Math.min(idx + speedStep, geom.length - 1);
            const nextPos = geom[nextIdx];
            
            // Check if vehicle arrived at any of its destinations
            let dests = [...vehicle.destinations];
            dests.forEach(dest => {
              const dist = haversineDist(nextPos[0], nextPos[1], dest.lat, dest.lng);
              if (dist < 0.25) { // Arrived at SOS
                // Remove SOS from active, push to resolved
                setActiveSOS(prevActive => {
                  const target = prevActive.find(e => e.id === dest.id);
                  if (target) {
                    setResolvedSOS(r => [...r, { ...target, status: "Resolved", assigned_vehicle: null }]);
                    return prevActive.filter(e => e.id !== dest.id);
                  }
                  return prevActive;
                });
                dests = dests.filter(d => d.id !== dest.id);
              }
            });

            // If completed the loop
            if (nextIdx === geom.length - 1) {
              return {
                ...vehicle,
                lat: nextPos[0],
                lng: nextPos[1],
                status: "Idle",
                route_geometry: [],
                route_index: 0,
                destinations: [],
                current_supplies: {}
              };
            }

            return {
              ...vehicle,
              lat: nextPos[0],
              lng: nextPos[1],
              route_index: nextIdx,
              destinations: dests
            };
          }
          return vehicle;
        });
        
        // Recalculate priority scores dynamically based on clustering
        if (updated) {
          setActiveSOS(prevActive => {
            return prevActive.map(e => ({
              ...e,
              priority_score: calculatePriorityLocal(e.emergency_type, e.urgency_score, e.lat, e.lng, prevActive)
            }));
          });
        }

        return nextVehicles;
      });
    }, 2000);

    // 2. Simulated Social Media Stream Ingestion
    const feedInterval = setInterval(() => {
      // Pick random tweet template
      const item = MOCK_TWEETS[Math.floor(Math.random() * MOCK_TWEETS.length)];
      const username = "@user_" + Math.floor(Math.random()*900 + 100);
      const newPost = {
        id: "sos_sim_feed_" + Date.now(),
        username,
        text: item.text,
        timestamp: new Date().toISOString(),
        is_emergency: item.is_sos,
        category: item.category
      };

      setSocialFeed(prev => [newPost, ...prev.slice(0, 25)]);

      if (item.is_sos) {
        // Resolve coordinates
        const landmarkName = item.loc.toLowerCase();
        let [lat, lng] = LOCAL_LANDMARKS[landmarkName] || [12.8700, 74.8800];
        
        // Scatter coords slightly
        lat += (Math.random() - 0.5) * 0.006;
        lng += (Math.random() - 0.5) * 0.006;

        setActiveSOS(prevActive => {
          const newSOS = {
            id: newPost.id,
            source: "Twitter/X Feed",
            username,
            text: item.text,
            timestamp: newPost.timestamp,
            is_emergency: true,
            pytorch_prob: 0.92,
            emergency_type: item.category,
            location: item.loc,
            lat,
            lng,
            count: item.count,
            urgency_score: item.urgency,
            priority_score: 0.0, // calculated below
            status: "Pending",
            assigned_vehicle: null,
            is_estimated_zone: !LOCAL_LANDMARKS[landmarkName]
          };

          const nextList = [...prevActive, newSOS];
          return nextList.map(e => ({
            ...e,
            priority_score: calculatePriorityLocal(e.emergency_type, e.urgency_score, e.lat, e.lng, nextList)
          }));
        });
      }
    }, 15000);

    return () => {
      clearInterval(movementInterval);
      clearInterval(feedInterval);
    };
  }, [telemetryMode]);

  // Local helper for priority score calculation
  const calculatePriorityLocal = (type, urgency, lat, lng, allActive) => {
    const weights = { "Medical": 5.0, "Rescue": 4.0, "Hazard": 3.0, "Food/Water": 2.0 };
    const baseWeight = weights[type] || 3.0;
    const urgencyWeight = baseWeight * (urgency / 5.0);
    
    let density = 1.0;
    allActive.forEach(other => {
      if (other.lat === lat && other.lng === lng) return;
      if (haversineDist(lat, lng, other.lat, other.lng) <= 1.5) {
        density += 1.0;
      }
    });
    return parseFloat((urgencyWeight * density).toFixed(2));
  };

  // Local TSP route optimizer
  const optimizeRouteLocal = (startCamp, dests, blockages) => {
    // 1. Build coordinate array
    const nodes = [startCamp, ...dests];
    const n = nodes.length;
    
    // 2. Compute matrix
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) matrix[i][j] = 0;
        else {
          let dist = haversineDist(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
          // Apply blockage penalty
          if (isPathBlockedLocal(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng, blockages)) {
            dist *= 50.0;
          }
          matrix[i][j] = dist * 90; // Convert to simulated seconds
        }
      }
    }

    // 3. Solve TSP Permutations if small, else Nearest Neighbor
    const solveTsp = (mat) => {
      const len = mat.length;
      const visited = new Set([0]);
      const path = [0];
      while (visited.size < len) {
        const curr = path[path.length - 1];
        let nextNode = -1;
        let minDist = Infinity;
        for (let i = 0; i < len; i++) {
          if (!visited.has(i) && mat[curr][i] < minDist) {
            minDist = mat[curr][i];
            nextNode = i;
          }
        }
        if (nextNode !== -1) {
          path.push(nextNode);
          visited.add(nextNode);
        } else break;
      }
      return path;
    };

    const pathIndices = solveTsp(matrix);
    const orderedNodes = pathIndices.map(idx => nodes[idx]);
    
    // Generate route coordinates loop (camp -> dests -> camp)
    const routeGeom = [];
    const fullLoop = [...orderedNodes, startCamp];
    
    // Generate simple linear segments for geometry mapping
    for (let i = 0; i < fullLoop.length - 1; i++) {
      const p1 = fullLoop[i];
      const p2 = fullLoop[i+1];
      // Generate intermediate interpolation points so it moves smoothly
      const steps = 15;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        routeGeom.push([
          p1.lat + t * (p2.lat - p1.lat),
          p1.lng + t * (p2.lng - p1.lng)
        ]);
      }
    }

    return {
      path: orderedNodes,
      route_geometry: routeGeom
    };
  };

  const isPathBlockedLocal = (lat1, lon1, lat2, lon2, blockages) => {
    for (let i = 1; i < 5; i++) {
      const t = i / 5.0;
      const plat = lat1 + t * (lat2 - lat1);
      const plon = lon1 + t * (lon2 - lon1);
      for (let b of blockages) {
        if (haversineDist(plat, plon, b.lat, b.lng) <= b.radius_km) {
          return true;
        }
      }
    }
    return false;
  };

  // =====================================================================
  // ACTIONS / HANDLERS
  // =====================================================================

  // Form submission: Manual Emergency Log
  const handleManualSOS = async (e) => {
    e.preventDefault();
    if (telemetryMode === "online") {
      try {
        const res = await fetch(`${API_BASE}/posts/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporter: manualReporter,
            text: manualText,
            location_name: manualLocation,
            emergency_type: manualCategory,
            count: parseInt(manualCount),
            urgency: parseInt(manualUrgency)
          })
        });
        if (res.ok) {
          setManualText("");
        }
      } catch (err) {
        console.error("Failed to post manual report:", err);
      }
    } else {
      // Local simulation add
      const landmarkLower = manualLocation.toLowerCase();
      let [lat, lng] = LOCAL_LANDMARKS[landmarkLower] || [12.8700, 74.8800];
      lat += (Math.random() - 0.5) * 0.002;
      lng += (Math.random() - 0.5) * 0.002;
      
      const newSOS = {
        id: "sos_manual_" + Date.now(),
        source: "Radio Dispatch",
        username: "@" + manualReporter,
        text: manualText,
        timestamp: new Date().toISOString(),
        is_emergency: true,
        pytorch_prob: 1.0,
        emergency_type: manualCategory,
        location: manualLocation,
        lat,
        lng,
        count: parseInt(manualCount),
        urgency_score: parseInt(manualUrgency),
        priority_score: 0.0,
        status: "Pending",
        assigned_vehicle: null,
        is_estimated_zone: !LOCAL_LANDMARKS[landmarkLower]
      };

      setActiveSOS(prev => {
        const nextList = [...prev, newSOS];
        return nextList.map(e => ({
          ...e,
          priority_score: calculatePriorityLocal(e.emergency_type, e.urgency_score, e.lat, e.lng, nextList)
        }));
      });

      setSocialFeed(prev => [{
        id: newSOS.id,
        username: newSOS.username,
        text: manualText,
        timestamp: newSOS.timestamp,
        is_emergency: true,
        category: manualCategory
      }, ...prev]);

      setManualText("");
    }
  };

  // Add road blockage double click
  const handleMapClick = async (latlng) => {
    if (!drawingBlockage) return;
    const blockName = prompt("Enter Road Blockage Identifier/Reason (e.g., 'Flooded Underpass'):", "Road Blockage Zone");
    if (!blockName) {
      setDrawingBlockage(false);
      return;
    }

    if (telemetryMode === "online") {
      try {
        await fetch(`${API_BASE}/blocked-roads/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: blockName,
            lat: latlng.lat,
            lng: latlng.lng,
            radius_km: 0.4
          })
        });
      } catch (err) {
        console.error("Failed to add block road:", err);
      }
    } else {
      // Local Simulator Add
      const newBlock = {
        id: "block_" + Date.now(),
        name: blockName,
        lat: latlng.lat,
        lng: latlng.lng,
        radius_km: 0.4
      };
      setBlockedRoads(prev => [...prev, newBlock]);
      
      // Auto-recalculate active routes in local mode
      recalculateAllLocalRoutes([...blockedRoads, newBlock]);
    }
    setDrawingBlockage(false);
  };

  // Remove road blockage
  const handleRemoveBlock = async (id) => {
    if (telemetryMode === "online") {
      try {
        await fetch(`${API_BASE}/blocked-roads/remove/${id}`, { method: 'POST' });
      } catch (err) {
        console.error("Failed to remove road blockage:", err);
      }
    } else {
      const nextBlocks = blockedRoads.filter(b => b.id !== id);
      setBlockedRoads(nextBlocks);
      recalculateAllLocalRoutes(nextBlocks);
    }
  };

  const recalculateAllLocalRoutes = (blocksList) => {
    setVehicles(prev => {
      return prev.map(v => {
        if (v.status === "En Route" && v.destinations.length > 0) {
          const camp = camps.find(c => c.id === v.camp_id);
          const route_details = optimizeRouteLocal(
            { lat: v.lat, lng: v.lng },
            v.destinations,
            blocksList
          );
          return {
            ...v,
            destinations: route_details.path.slice(1), // remove starting self coords
            route_geometry: route_details.route_geometry,
            route_index: 0
          };
        }
        return v;
      });
    });
  };

  // Dispatch Trigger Action
  const handleDispatch = async () => {
    if (!selectedVehicle || selectedSOSIds.length === 0) return;
    
    // Supplies package
    const supplies = {
      food_kg: dispatchFood,
      water_liters: dispatchWater,
      medical_kits: dispatchKits
    };

    if (telemetryMode === "online") {
      try {
        const res = await fetch(`${API_BASE}/dispatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_id: selectedVehicle.id,
            sos_ids: selectedSOSIds,
            supplies: supplies
          })
        });
        if (res.ok) {
          setSelectedSOSIds([]);
          setSelectedVehicle(null);
        } else {
          const errData = await res.json();
          alert("Error: " + errData.detail);
        }
      } catch (err) {
        console.error("Failed to dispatch vehicle:", err);
      }
    } else {
      // Local Simulator Dispatch
      const vehicle = vehicles.find(v => v.id === selectedVehicle.id);
      const camp = camps.find(c => c.id === vehicle.camp_id);
      
      // Deduct camp supplies
      setCamps(prev => prev.map(c => {
        if (c.id === camp.id) {
          return {
            ...c,
            resources: {
              food_kg: Math.max(0, c.resources.food_kg - dispatchFood),
              water_liters: Math.max(0, c.resources.water_liters - dispatchWater),
              medical_kits: Math.max(0, c.resources.medical_kits - dispatchKits),
              boats: c.resources.boats,
              trucks: c.resources.trucks,
              helicopters: c.resources.helicopters
            }
          };
        }
        return c;
      }));

      // Get SOS nodes
      const targetSOS = activeSOS.filter(s => selectedSOSIds.includes(s.id));
      const destCoords = targetSOS.map(s => ({ id: s.id, lat: s.lat, lng: s.lng }));
      
      // Optimize Local Route
      const startCampCoord = { lat: camp.lat, lng: camp.lng };
      const route_details = optimizeRouteLocal(startCampCoord, destCoords, blockedRoads);

      // Update vehicle status
      setVehicles(prev => prev.map(v => {
        if (v.id === vehicle.id) {
          return {
            ...v,
            status: "En Route",
            destinations: route_details.path,
            route_geometry: route_details.route_geometry,
            route_index: 0,
            current_supplies: supplies
          };
        }
        return v;
      }));

      // Mark SOS as responding
      setActiveSOS(prev => prev.map(s => {
        if (selectedSOSIds.includes(s.id)) {
          return { ...s, status: "Responding", assigned_vehicle: vehicle.name };
        }
        return s;
      }));

      setSelectedSOSIds([]);
      setSelectedVehicle(null);
    }
  };

  // AI Command Chat submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userQuery = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userQuery }]);
    setChatInput("");
    setChatLoading(true);

    if (telemetryMode === "online") {
      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userQuery })
        });
        if (res.ok) {
          const data = await res.json();
          setChatMessages(prev => [...prev, { sender: "agis", text: data.response }]);
        }
      } catch (err) {
        console.error("AI Advisor network link error:", err);
      } finally {
        setChatLoading(false);
      }
    } else {
      // Local Mock Chat response using in-memory state
      setTimeout(() => {
        const activeCount = activeSOS.length;
        const highestPriority = activeSOS.length > 0 
          ? [...activeSOS].sort((a,b) => b.priority_score - a.priority_score)[0]
          : null;
        
        let responseText = `**[A.G.I.S. TELEMETRY CORE - OFFLINE SIMULATION ADVISORY]**\n\n`;
        responseText += `The system is running localized telemetry. Count of active SOS units: **${activeCount}**.\n`;
        if (highestPriority) {
          responseText += `Primary Threat Grid: **${highestPriority.location}** (Priority Rating: ${highestPriority.priority_score}, Count: ${highestPriority.count} victims).\n`;
        }
        responseText += `\n**Strategic Command Suggestion:**\n`;
        
        if (userQuery.toLowerCase().includes("priority") || userQuery.toLowerCase().includes("who")) {
          responseText += `We recommend prioritizing **${highestPriority ? highestPriority.location : 'None'}** due to urgency criteria. Please dispatch resources immediately.`;
        } else if (userQuery.toLowerCase().includes("resource") || userQuery.toLowerCase().includes("food")) {
          responseText += `Inventories indicate Camp Alpha holds the highest medical store. Optimize routes around blockages: *${blockedRoads.map(b=>b.name).join(', ') || 'None'}*.`;
        } else {
          responseText += `Copy that, commander. Advise deploying Ambulance/Boat response loops. Please verify your coordinate boundaries prior to deployment.`;
        }
        
        setChatMessages(prev => [...prev, { sender: "agis", text: responseText }]);
        setChatLoading(false);
      }, 800);
    }
  };

  // Trigger Simulation Event
  const handleTriggerSimulation = async () => {
    if (telemetryMode === "online") {
      try {
        await fetch(`${API_BASE}/simulate/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: simEvent,
            location_name: simLocation
          })
        });
      } catch (err) {
        console.error("Failed to run simulated event:", err);
      }
    } else {
      // Local Simulator triggers 2-3 events in chosen location
      const textTemplates = {
        "Flood": [
          `Flash Flood warning! Water height 5ft in ${simLocation}! 5 people stuck on roof, need boats!`,
          `SOS drowning hazard at ${simLocation}. Flooding currents strong. Need rescue team!`,
          `No drinking water remaining in flooded zones around ${simLocation}. Send food.`
        ],
        "Earthquake": [
          `Tremor felt at ${simLocation}. Wall collapse trapped 3 people. Need urgent medical rescue!`,
          `Structure shaking at ${simLocation}, debris blocking houses, injured victims require rescue.`
        ],
        "Landslide": [
          `Mudslide crushed shelter near ${simLocation}, 4 casualties trapped. Road access blocked.`,
          `Landslide debris blocked highway crossing at ${simLocation}. Cars trapped.`
        ]
      };

      const selected = textTemplates[simEvent] || [`Emergency alert at ${simLocation}`];
      
      setActiveSOS(prevActive => {
        let newList = [...prevActive];
        selected.forEach((text, i) => {
          let [lat, lng] = LOCAL_LANDMARKS[simLocation.toLowerCase()] || [12.8700, 74.8800];
          lat += (Math.random() - 0.5) * 0.008;
          lng += (Math.random() - 0.5) * 0.008;

          newList.push({
            id: `sos_sim_local_${Date.now()}_${i}`,
            source: "Twitter/X Simulation",
            username: `@sim_alert_${i}`,
            text,
            timestamp: new Date().toISOString(),
            is_emergency: true,
            pytorch_prob: 0.95,
            emergency_type: simEvent === "Flood" ? (i === 2 ? "Food/Water" : "Rescue") : simEvent === "Earthquake" ? "Medical" : "Hazard",
            location: simLocation,
            lat,
            lng,
            count: i === 0 ? 5 : 2,
            urgency_score: 8,
            priority_score: 0.0,
            status: "Pending",
            assigned_vehicle: null,
            is_estimated_zone: !LOCAL_LANDMARKS[simLocation.toLowerCase()]
          });
        });

        // Recalculate priorities
        return newList.map(e => ({
          ...e,
          priority_score: calculatePriorityLocal(e.emergency_type, e.urgency_score, e.lat, e.lng, newList)
        }));
      });

      setSocialFeed(prev => [
        ...selected.map((text, i) => ({
          id: `sos_sim_local_${Date.now()}_${i}`,
          username: `@sim_alert_${i}`,
          text,
          timestamp: new Date().toISOString(),
          is_emergency: true,
          category: simEvent === "Flood" ? "Rescue" : "Medical"
        })),
        ...prev
      ]);
    }
  };

  // AI Auto-Resolve button logic
  const handleAIAutoResolve = () => {
    // 1. Group idle vehicles
    const idleVehicles = vehicles.filter(v => v.status === "Idle");
    // 2. Group pending SOS requests
    const pendingSOS = activeSOS.filter(s => s.status === "Pending");
    
    if (idleVehicles.length === 0 || pendingSOS.length === 0) {
      alert("AI Notice: No idle vehicles or pending SOS requests found to coordinate.");
      return;
    }

    // Connect vehicles to nearest SOS requests
    let assignedCount = 0;
    idleVehicles.forEach((vehicle, vIdx) => {
      const camp = camps.find(c => c.id === vehicle.camp_id);
      
      // Filter out close SOS requests
      const listSOS = pendingSOS.filter(s => s.status === "Pending");
      if (listSOS.length === 0) return;

      // Sort by proximity
      listSOS.sort((a, b) => {
        const dA = haversineDist(camp.lat, camp.lng, a.lat, a.lng);
        const dB = haversineDist(camp.lat, camp.lng, b.lat, b.lng);
        return dA - dB;
      });

      // Match 2 closest SOS requests to vehicle
      const targetSOS = listSOS.slice(0, 2);
      const sosIds = targetSOS.map(s => s.id);
      
      // Deduct mock resource
      const supplies = { food_kg: 40, water_liters: 80, medical_kits: 4 };

      // Dispatch
      if (telemetryMode === "online") {
        fetch(`${API_BASE}/dispatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_id: vehicle.id,
            sos_ids: sosIds,
            supplies: supplies
          })
        });
      } else {
        // Local Dispatch
        const destCoords = targetSOS.map(s => ({ id: s.id, lat: s.lat, lng: s.lng }));
        const route_details = optimizeRouteLocal({ lat: camp.lat, lng: camp.lng }, destCoords, blockedRoads);

        setVehicles(prev => prev.map(v => {
          if (v.id === vehicle.id) {
            return {
              ...v,
              status: "En Route",
              destinations: route_details.path,
              route_geometry: route_details.route_geometry,
              route_index: 0,
              current_supplies: supplies
            };
          }
          return v;
        }));

        setActiveSOS(prev => prev.map(s => {
          if (sosIds.includes(s.id)) {
            return { ...s, status: "Responding", assigned_vehicle: vehicle.name };
          }
          return s;
        }));

        setCamps(prev => prev.map(c => {
          if (c.id === camp.id) {
            return {
              ...c,
              resources: {
                food_kg: Math.max(0, c.resources.food_kg - 40),
                water_liters: Math.max(0, c.resources.water_liters - 80),
                medical_kits: Math.max(0, c.resources.medical_kits - 4),
                boats: c.resources.boats,
                trucks: c.resources.trucks,
                helicopters: c.resources.helicopters
              }
            };
          }
          return c;
        }));
      }
      assignedCount++;
    });

    alert(`AI Engine: Coordinated and dispatched ${assignedCount} response loops.`);
  };

  // Reset database state
  const handleResetData = async () => {
    if (confirm("Reset operations database to initial seed settings?")) {
      if (telemetryMode === "online") {
        // Since we don't have a direct reset endpoint in FastAPI, we can implement it or locally reset simulator.
        // Let's reload page as local fallback is easy.
        window.location.reload();
      } else {
        setCamps(SEED_CAMPS);
        setVehicles(SEED_VEHICLES);
        setActiveSOS(SEED_SOS);
        setResolvedSOS([]);
        setBlockedRoads(SEED_BLOCKED_ROADS);
        setSocialFeed([]);
      }
    }
  };

  // Toggle selected SOS for manual dispatch
  const toggleSOSSelection = (id) => {
    setSelectedSOSIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#050811] bg-tactical-grid flex flex-col font-rajdhani text-slate-200 select-none scanline-overlay">
      {/* =====================================================================
          HEADER SECTION
          ===================================================================== */}
      <header className="h-16 shrink-0 bg-[#090d16]/90 border-b border-cyan-500/25 flex items-center justify-between px-6 backdrop-blur-md relative z-[1000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black font-orbitron tracking-widest text-white leading-tight">
              A.G.I.S. COMMAND HUB
            </h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-orbitron">
              AI-Augmented Geodetic Operations // Sector: Karnataka Coastal
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-orbitron font-bold">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <span className="text-slate-400">ACTIVE:</span>{" "}
              <span className="text-red-400 text-sm font-black">{activeSOS.length} SOS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div>
              <span className="text-slate-400">RESOLVED:</span>{" "}
              <span className="text-green-400 text-sm font-black">{resolvedSOS.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400">FLEET ACTIVE:</span>{" "}
              <span className="text-cyan-400 text-sm font-black">
                {vehicles.filter(v => v.status !== "Idle").length}/{vehicles.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-slate-400">BLOCKS:</span>{" "}
              <span className="text-amber-500 text-sm font-black">{blockedRoads.length} ROAD</span>
            </div>
          </div>
        </div>

        {/* Status Indicator Badge */}
        <div className="flex items-center gap-4">
          {telemetryMode === "online" ? (
            <div className="bg-cyan-500/10 border border-cyan-400 text-cyan-400 px-3 py-1.5 rounded-full text-xs font-orbitron font-black tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              TELEMETRY: LINK ACTIVE
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-400 text-amber-400 px-3 py-1.5 rounded-full text-xs font-orbitron font-black tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              LOCAL SIMULATOR ACTIVE
            </div>
          )}
          
          <button 
            onClick={handleResetData}
            title="Reset telemetry databases"
            className="p-2 rounded bg-slate-800/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 cursor-pointer active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN DASHBOARD CONTAINER
          ===================================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        
        {/* =====================================================================
            LEFT PANEL: LIVE SOS TELEMETRY FEED (Col Span: 3)
            ===================================================================== */}
        <div className="lg:col-span-3 min-h-0 flex flex-col gap-4">
          {/* Active Incidents Header */}
          <div className="cyber-panel p-4 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-sm text-cyan-400 font-orbitron tracking-wider">
                  LIVE SOS TELEMETRY FEED
                </h3>
              </div>
              <span className="text-[10px] bg-red-500/20 border border-red-500/40 text-red-400 px-1.5 py-0.5 rounded font-black font-orbitron uppercase">
                {activeSOS.length} pending
              </span>
            </div>

            {/* Scrolling SOS List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 text-xs">
              {activeSOS.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-bold gap-2 py-8">
                  <Check className="w-8 h-8 text-green-500/60" />
                  <span>GRID SECURE: ZERO ACTIVE EMERGENCIES</span>
                </div>
              ) : (
                [...activeSOS].sort((a,b) => b.priority_score - a.priority_score).map(sos => {
                  const isSelected = selectedSOSIds.includes(sos.id);
                  let colorClass = "border-yellow-500/30 bg-yellow-500/5";
                  let badgeColor = "bg-yellow-500/20 border-yellow-500 text-yellow-400";
                  if (sos.urgency_score >= 8) {
                    colorClass = "border-red-500/30 bg-red-500/5 shadow-[inset_0_0_8px_rgba(239,68,68,0.05)]";
                    badgeColor = "bg-red-500/20 border-red-500 text-red-400";
                  } else if (sos.urgency_score >= 5) {
                    colorClass = "border-orange-500/30 bg-orange-500/5";
                    badgeColor = "bg-orange-500/20 border-orange-500 text-orange-400";
                  }

                  return (
                    <div 
                      key={sos.id} 
                      className={`border rounded-lg p-3 transition-all ${colorClass} ${
                        isSelected ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[10px] text-cyan-400 font-orbitron uppercase">
                          {sos.username} ({sos.source})
                        </span>
                        <div className="flex items-center gap-1.5">
                          {sos.is_estimated_zone && (
                            <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1 py-0.2 rounded font-black font-orbitron uppercase">
                              Est Zone
                            </span>
                          )}
                          <span className={`text-[9px] border px-1.5 py-0.2 rounded font-black font-orbitron uppercase ${badgeColor}`}>
                            {sos.emergency_type} P:{sos.priority_score}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300 font-medium leading-tight mb-2">
                        {sos.text}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-400 font-bold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-cyan-400 truncate max-w-[100px]">{sos.location}</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-amber-400">{sos.count} trapped</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setMapCenter([sos.lat, sos.lng]);
                            }}
                            className="text-cyan-400 hover:underline hover:text-cyan-300 cursor-pointer"
                          >
                            LOCATE
                          </button>
                          {sos.status === "Pending" ? (
                            <button 
                              onClick={() => toggleSOSSelection(sos.id)}
                              className={`px-2 py-0.5 rounded border text-[9px] cursor-pointer font-orbitron uppercase ${
                                isSelected 
                                  ? "bg-cyan-500 border-cyan-400 text-black font-black" 
                                  : "border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-400"
                              }`}
                            >
                              {isSelected ? "Deselect" : "Select"}
                            </button>
                          ) : (
                            <span className="text-[9px] text-amber-400 font-orbitron uppercase animate-pulse">
                              {sos.status} ({sos.assigned_vehicle})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Manual Dispatch Incident Log Form */}
          <div className="cyber-panel p-4 h-64 flex flex-col shrink-0">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 mb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-400 font-orbitron tracking-wider">
                MANUAL EMERGENCY LOG
              </h3>
            </div>
            
            <form onSubmit={handleManualSOS} className="flex-1 flex flex-col gap-2.5 text-[11px] overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">REPORTER / UNIT</label>
                  <input 
                    type="text" 
                    value={manualReporter}
                    onChange={(e) => setManualReporter(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">LOCATION LANDMARK</label>
                  <input 
                    type="text" 
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    required
                    placeholder="e.g. Hampankatta"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">UNSTRUCTURED CRISIS TEXT</label>
                <textarea 
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400 custom-scrollbar leading-snug"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CATEGORY</label>
                  <select 
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Rescue">Rescue</option>
                    <option value="Medical">Medical</option>
                    <option value="Food/Water">Food/Water</option>
                    <option value="Hazard">Hazard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">VICTIMS COUNT</label>
                  <input 
                    type="number" 
                    min={0}
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">URGENCY (1-10)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10}
                    value={manualUrgency}
                    onChange={(e) => setManualUrgency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full font-orbitron font-black text-center text-xs py-1.5 rounded cursor-pointer text-cyan-400 hover:text-white border border-cyan-400/50 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                LOG EMERGENCY REPORT
              </button>
            </form>
          </div>
        </div>

        {/* =====================================================================
            MIDDLE PANEL: GEODETIC TACTICAL MAP (Col Span: 6)
            ===================================================================== */}
        <div className="lg:col-span-6 min-h-0 flex flex-col gap-4 relative">
          <div className="cyber-panel p-2 flex-1 flex flex-col min-h-[400px] relative overflow-hidden">
            
            {/* Map Header Indicators */}
            <div className="absolute top-4 left-4 z-[999] flex flex-col gap-2">
              <div className="bg-[#0b0f19]/90 border border-cyan-500/40 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold backdrop-blur-md flex items-center gap-2 shadow-lg">
                <Compass className="w-4 h-4 animate-spin duration-1000" />
                GEODETIC FEED: MANGALURU GRID
              </div>
              
              <button 
                onClick={() => setDrawingBlockage(!drawingBlockage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold backdrop-blur-md flex items-center gap-2 shadow-lg border cursor-pointer select-none transition-all ${
                  drawingBlockage 
                    ? "bg-amber-500/25 border-amber-400 text-amber-400 animate-pulse" 
                    : "bg-[#0b0f19]/90 border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-400"
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                {drawingBlockage ? "Double-click map to place block..." : "Add Road Blockage"}
              </button>
            </div>

            {/* Map Reset Center */}
            <div className="absolute top-4 right-4 z-[999]">
              <button 
                onClick={() => setMapCenter([12.8700, 74.8431])}
                className="bg-[#0b0f19]/90 hover:bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 p-2 rounded-lg backdrop-blur-md cursor-pointer transition-all shadow-lg flex items-center justify-center"
                title="Recenter Map"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full h-full rounded border border-slate-800 overflow-hidden relative">
              <MapContainer 
                center={mapCenter} 
                zoom={12} 
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                {/* CartoDB Dark Matter base map tiles - Perfect dark tactical aesthetic */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Center view helper */}
                <MapUpdater center={mapCenter} />
                
                {/* Blocked roads click listener */}
                <MapClickListener onMapClick={handleMapClick} />

                {/* Draw Blocked Road circle overlays */}
                {blockedRoads.map(block => (
                  <React.Fragment key={block.id}>
                    <Circle 
                      center={[block.lat, block.lng]} 
                      radius={block.radius_km * 1000}
                      pathOptions={{
                        color: '#f97316',
                        fillColor: '#f97316',
                        fillOpacity: 0.15,
                        dashArray: '5, 8',
                        weight: 2
                      }}
                    />
                    <Marker 
                      position={[block.lat, block.lng]}
                      icon={L.divIcon({
                        className: 'blocked-marker',
                        html: `<div class="w-6 h-6 rounded-full border border-amber-500 bg-[#0b0f19] text-amber-500 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                      })}
                    >
                      <Popup>
                        <div className="text-xs p-1">
                          <h4 className="font-bold text-amber-500 uppercase font-orbitron">{block.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">OSRM Route Matrix bypass active.</p>
                          <button 
                            onClick={() => handleRemoveBlock(block.id)}
                            className="mt-2 text-[9px] bg-red-900/40 border border-red-500/40 text-red-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-red-500/20"
                          >
                            REMOVE BLOCK
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}

                {/* Draw Camps */}
                {camps.map(camp => (
                  <Marker 
                    key={camp.id} 
                    position={[camp.lat, camp.lng]}
                    icon={campIcon}
                  >
                    <Popup>
                      <div className="text-xs p-1 select-none">
                        <h4 className="font-bold text-green-400 font-orbitron mb-1">{camp.name}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-[10px] text-slate-300 font-mono">
                          <div>Food: <span className="font-bold text-white">{camp.resources.food_kg} kg</span></div>
                          <div>Water: <span className="font-bold text-white">{camp.resources.water_liters} L</span></div>
                          <div>MedKits: <span className="font-bold text-white">{camp.resources.medical_kits}</span></div>
                          <div>Boats: <span className="font-bold text-white">{camp.resources.boats}</span></div>
                          <div>Trucks: <span className="font-bold text-white">{camp.resources.trucks}</span></div>
                          <div>Helos: <span className="font-bold text-white">{camp.resources.helicopters}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Draw Active SOS Requests */}
                {activeSOS.map(sos => (
                  <Marker 
                    key={sos.id} 
                    position={[sos.lat, sos.lng]}
                    icon={createSosMarker(sos.emergency_type, sos.urgency_score)}
                  >
                    <Popup>
                      <div className="text-xs p-1 max-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                          <span className="font-bold text-cyan-400 uppercase font-orbitron">{sos.location}</span>
                          <span className="text-[9px] bg-red-900/40 text-red-300 px-1 rounded font-bold font-orbitron">P: {sos.priority_score}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight mb-2">"{sos.text}"</p>
                        <div className="text-[9px] text-slate-400 font-mono flex flex-col gap-0.5 mb-2">
                          <div>Source: {sos.source}</div>
                          <div>Urgency: {sos.urgency_score}/10</div>
                          <div>Type: {sos.emergency_type}</div>
                          <div>Trapped Count: {sos.count}</div>
                          {sos.is_estimated_zone && <div className="text-amber-500 font-black uppercase">Failsafe Est. Coordinates</div>}
                        </div>
                        
                        {sos.status === "Pending" ? (
                          <button 
                            onClick={() => toggleSOSSelection(sos.id)}
                            className={`w-full py-1 text-center font-orbitron font-black rounded text-[10px] cursor-pointer ${
                              selectedSOSIds.includes(sos.id)
                                ? "bg-cyan-500 text-black"
                                : "bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            }`}
                          >
                            {selectedSOSIds.includes(sos.id) ? "DESELECT FOR DISPATCH" : "SELECT FOR DISPATCH"}
                          </button>
                        ) : (
                          <div className="text-center font-bold text-amber-400 text-[10px] uppercase animate-pulse border border-amber-500/20 bg-amber-500/5 py-0.5 rounded">
                            Responders dispatched: {sos.assigned_vehicle}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Draw Resolved SOS markers (faded icons) */}
                {resolvedSOS.map(sos => (
                  <Marker 
                    key={sos.id} 
                    position={[sos.lat, sos.lng]}
                    icon={resolvedIcon}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <span className="text-green-400 font-bold font-orbitron uppercase">RESOLVED</span>
                        <h4 className="font-bold text-slate-300">{sos.location}</h4>
                        <p className="text-[10px] text-slate-400 leading-snug">"{sos.text}"</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Draw Vehicles */}
                {vehicles.map(v => (
                  <React.Fragment key={v.id}>
                    {/* Render active route line overlay if vehicle is en route */}
                    {v.status === "En Route" && v.route_geometry.length > 0 && (
                      <Polyline 
                        positions={v.route_geometry} 
                        pathOptions={{
                          color: '#06b6d4',
                          weight: 3.5,
                          opacity: 0.8,
                          className: 'path-flow'
                        }}
                      />
                    )}
                    
                    <Marker 
                      position={[v.lat, v.lng]}
                      icon={vehicleIcon(v.type, v.status)}
                    >
                      <Popup>
                        <div className="text-xs p-1 min-w-[150px]">
                          <h4 className="font-bold text-cyan-400 font-orbitron">{v.name}</h4>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            <div>Type: {v.type}</div>
                            <div>Status: <span className={v.status === "Idle" ? "text-cyan-400" : "text-amber-400 animate-pulse font-bold"}>{v.status}</span></div>
                            <div>Location: {v.lat.toFixed(4)}, {v.lng.toFixed(4)}</div>
                            
                            {v.status === "En Route" && (
                              <div className="border-t border-slate-700 mt-1.5 pt-1 text-slate-300">
                                <div className="font-bold text-white uppercase text-[8px] font-orbitron tracking-wider">CARRIER PAYLOAD:</div>
                                <div>Food: {v.current_supplies.food_kg || 0} kg</div>
                                <div>Water: {v.current_supplies.water_liters || 0} L</div>
                                <div>MedKits: {v.current_supplies.medical_kits || 0}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </MapContainer>
            </div>

            {/* Overlay Grid lines for cosmetic CRT dashboard feel */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10" />
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANEL: RESOURCE LOGISTICS & AI ADVISOR (Col Span: 3)
            ===================================================================== */}
        <div className="lg:col-span-3 min-h-0 flex flex-col gap-4">
          
          {/* Dispatch Control panel */}
          <div className="cyber-panel p-4 flex-[1.2] flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-cyan-400 font-orbitron tracking-wider">
                  LOGISTICS DISPATCH CONTROL
                </h3>
              </div>
              <button 
                onClick={handleAIAutoResolve}
                className="bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400 text-cyan-400 hover:text-black font-black font-orbitron text-[9px] px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                title="AI Auto dispatch coordinates"
              >
                <Sparkles className="w-3 h-3" />
                AI AUTO-ALLOCATE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1 text-xs">
              
              {/* Step 1: Select Vehicle */}
              <div>
                <label className="block text-[10px] text-slate-400 font-orbitron font-bold uppercase mb-1">
                  1. select responder vehicle
                </label>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar border border-slate-800 rounded p-1.5 bg-[#080d16]">
                  {vehicles.map(v => (
                    <div 
                      key={v.id}
                      onClick={() => v.status === "Idle" && setSelectedVehicle(v)}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer border text-[11px] font-medium transition-all ${
                        v.status !== "Idle"
                          ? "opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-transparent"
                          : selectedVehicle?.id === v.id
                            ? "bg-cyan-500/20 border-cyan-400 text-white font-bold"
                            : "border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/50"
                      }`}
                    >
                      <span className="truncate">{v.name} ({v.type})</span>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Targets indicator */}
              <div>
                <label className="block text-[10px] text-slate-400 font-orbitron font-bold uppercase mb-1">
                  2. select targets on live feed/map
                </label>
                <div className="border border-slate-800 rounded p-2.5 bg-[#080d16] font-mono text-[10px] flex items-center justify-between text-slate-400">
                  <span>Selected SOS Nodes:</span>
                  <span className={`font-bold font-orbitron text-xs ${selectedSOSIds.length > 0 ? "text-cyan-400" : "text-slate-600"}`}>
                    {selectedSOSIds.length} ACTIVE
                  </span>
                </div>
              </div>

              {/* Step 3: Logistics Allocation */}
              <div>
                <label className="block text-[10px] text-slate-400 font-orbitron font-bold uppercase mb-1.5">
                  3. cargo payload allocations
                </label>
                <div className="space-y-2.5 border border-slate-800 rounded p-2.5 bg-[#080d16]">
                  <div className="text-[10px]">
                    <div className="flex justify-between font-bold text-slate-300 font-mono mb-1">
                      <span>RATION SUPPLIES (FOOD):</span>
                      <span className="text-cyan-400">{dispatchFood} kg</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={200} 
                      step={10}
                      value={dispatchFood}
                      onChange={(e) => setDispatchFood(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="text-[10px]">
                    <div className="flex justify-between font-bold text-slate-300 font-mono mb-1">
                      <span>FRESH DRINKING WATER:</span>
                      <span className="text-cyan-400">{dispatchWater} liters</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={500} 
                      step={20}
                      value={dispatchWater}
                      onChange={(e) => setDispatchWater(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="text-[10px]">
                    <div className="flex justify-between font-bold text-slate-300 font-mono mb-1">
                      <span>TRAUMA MEDICAL KITS:</span>
                      <span className="text-cyan-400">{dispatchKits} units</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={20} 
                      step={1}
                      value={dispatchKits}
                      onChange={(e) => setDispatchKits(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Dispatch Action button */}
              <button 
                onClick={handleDispatch}
                disabled={!selectedVehicle || selectedSOSIds.length === 0}
                className={`w-full py-2.5 rounded font-orbitron font-black text-center text-xs tracking-wider border select-none transition-all flex items-center justify-center gap-1.5 ${
                  selectedVehicle && selectedSOSIds.length > 0
                    ? "bg-cyan-500 border-cyan-400 text-black hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                    : "opacity-45 bg-transparent border-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                EXECUTE TSP DISPATCH LOOP
              </button>

            </div>
          </div>

          {/* AI Command Advisor panel */}
          <div className="cyber-panel p-4 flex-[1.2] flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 mb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-400 font-orbitron tracking-wider">
                A.G.I.S. COGNITIVE CORE
              </h3>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1 text-xs mb-3">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`p-2.5 rounded-lg border text-left leading-relaxed ${
                    msg.sender === "agis"
                      ? "bg-cyan-950/10 border-cyan-500/15 text-slate-200"
                      : "bg-slate-900 border-slate-800 text-slate-300 font-medium"
                  }`}
                >
                  <div className="text-[9px] font-orbitron font-black tracking-widest text-slate-400 mb-1">
                    {msg.sender === "agis" ? "A.G.I.S. ADVISOR PROTOCOL" : "TACTICAL COMMANDER"}
                  </div>
                  <div className="whitespace-pre-line font-sans prose prose-invert prose-xs text-slate-300">
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="p-2.5 rounded-lg border bg-cyan-950/5 border-cyan-500/10 text-left animate-pulse">
                  <div className="text-[9px] font-orbitron font-black text-cyan-400 mb-1">AGIS SYNTHESIZING STATE DATA...</div>
                  <div className="w-8 h-2.5 bg-cyan-500/40 rounded mt-1.5" />
                </div>
              )}
            </div>

            {/* Chat submit form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AGIS for tactical routes..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button 
                type="submit"
                className="bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-400 text-cyan-400 hover:text-black p-2 rounded cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Simulation controller panel */}
          <div className="cyber-panel p-4 h-48 flex flex-col shrink-0">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-400 font-orbitron tracking-wider">
                SYNTHETIC CRISIS SIMULATOR
              </h3>
            </div>

            <div className="flex-1 flex flex-col gap-3 text-xs justify-center">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">CRISIS EVENT</label>
                  <select 
                    value={simEvent}
                    onChange={(e) => setSimEvent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Flood">Flash Flood</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Landslide">Landslide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">GRID COORDINATE</label>
                  <select 
                    value={simLocation}
                    onChange={(e) => setSimLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {Object.keys(LOCAL_LANDMARKS).map(loc => (
                      <option key={loc} value={loc.charAt(0).toUpperCase() + loc.slice(1)}>
                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleTriggerSimulation}
                className="w-full font-orbitron font-black text-center text-xs py-2 rounded cursor-pointer bg-red-950/20 hover:bg-red-500 border border-red-500/50 hover:border-red-400 text-red-400 hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.15)] active:scale-95"
              >
                <AlertOctagon className="w-4 h-4" />
                TRIGGER DISASTER SIMULATION
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
