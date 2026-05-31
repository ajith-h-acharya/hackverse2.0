import React, { useEffect, useState } from 'react';
import { 
  X, MapPin, Compass, Car, CheckCircle, Navigation, 
  ArrowRight, Shield, Zap, Calendar, ArrowLeftRight, Bookmark
} from 'lucide-react';
import { calculateDistance } from '../utils/haversine';

export default function CircuitDetail({ 
  customStops = [], 
  locations = [], 
  hiddenGems = [], 
  userLocation, 
  onClose,
  onClearCircuit
}) {
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, confirming, success
  const [panelWidth, setPanelWidth] = useState(480);
  const isDragging = React.useRef(false);

  // Combine standard locations and hidden gems for lookups
  const allSearchable = React.useMemo(() => {
    const list = [...locations, ...hiddenGems];
    // Remove duplicates by ID
    const unique = [];
    const seen = new Set();
    list.forEach(item => {
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    });
    return unique;
  }, [locations, hiddenGems]);

  // Resolve stop locations in order
  const circuitStops = React.useMemo(() => {
    return customStops
      .map(id => allSearchable.find(loc => loc.id === id))
      .filter(Boolean);
  }, [customStops, allSearchable]);

  // Set up panels resizer
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(320, Math.min(700, newWidth)));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  if (circuitStops.length === 0) return null;

  // Calculate segment distances
  // Start from userLocation (or default Mangalore Center)
  const startCoords = userLocation || [12.9141, 74.856];
  
  const segments = [];
  let totalDistance = 0;
  let prevCoords = startCoords;

  circuitStops.forEach((stop, idx) => {
    const lat = stop.lat || (stop.coordinates && stop.coordinates[0]);
    const lng = stop.lng || (stop.coordinates && stop.coordinates[1]);
    
    if (lat && lng) {
      // Distance from previous waypoint in circuit
      const distFromPrev = calculateDistance(prevCoords[0], prevCoords[1], lat, lng);
      // Distance of this waypoint from the current userLocation
      const distFromUser = calculateDistance(startCoords[0], startCoords[1], lat, lng);
      
      segments.push({
        stop,
        distFromPrev,
        distFromUser,
        coords: [lat, lng]
      });
      
      totalDistance += distFromPrev;
      prevCoords = [lat, lng];
    }
  });

  const handleBookCircuit = () => {
    setBookingStatus('confirming');
    try {
      const history = JSON.parse(localStorage.getItem('mangalore_circuit_history') || '[]');
      const newCircuit = {
        id: `circuit-${Date.now()}`,
        type: 'Custom Circuit',
        timestamp: new Date().toISOString(),
        stops: circuitStops.map(s => ({
          id: s.id,
          name: s.name,
          image: s.image,
          category: s.category || s.type || 'Waypoint'
        })),
        totalDistance: totalDistance.toFixed(2)
      };
      localStorage.setItem('mangalore_circuit_history', JSON.stringify([newCircuit, ...history]));
    } catch (err) {
      console.warn("Failed to save circuit to history", err);
    }
    setTimeout(() => {
      setBookingStatus('success');
    }, 1800);
  };

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('mangalore_saved_circuits') || '[]');
      const match = savedList.some(saved => {
        if (saved.stops.length !== customStops.length) return false;
        return saved.stops.every((stop, idx) => stop.id === customStops[idx]);
      });
      setIsSaved(match);
    } catch {
      setIsSaved(false);
    }
  }, [customStops]);

  const handleSaveCircuit = () => {
    if (circuitStops.length === 0) return;
    const defaultName = `Circuit: ${circuitStops[0]?.name} -> ${circuitStops[circuitStops.length - 1]?.name}`;
    const nameInput = window.prompt("Enter a custom name for this circuit:", defaultName);
    if (nameInput === null) return; // User cancelled
    
    const finalName = nameInput.trim() || `Custom Circuit (${circuitStops.length} Stops)`;
    
    try {
      const savedList = JSON.parse(localStorage.getItem('mangalore_saved_circuits') || '[]');
      const newSaved = {
        id: `saved-${Date.now()}`,
        name: finalName,
        timestamp: new Date().toISOString(),
        stops: circuitStops.map(s => ({
          id: s.id,
          name: s.name,
          image: s.image,
          category: s.category || s.type || 'Waypoint'
        })),
        totalDistance: totalDistance.toFixed(2)
      };
      localStorage.setItem('mangalore_saved_circuits', JSON.stringify([newSaved, ...savedList]));
      setIsSaved(true);
      alert(`Circuit "${finalName}" has been saved successfully!`);
    } catch (err) {
      console.warn("Failed to save custom circuit", err);
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full bg-white z-[3000] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-gray-100 font-sans overflow-hidden animate-in slide-in-from-right duration-500" style={{ width: `${panelWidth}px` }}>
      {/* Draggable Divider */}
      <div
        onMouseDown={startDrag}
        className="absolute top-0 left-0 w-2 h-full z-50 cursor-col-resize group flex items-center justify-center hover:bg-amazon-yellow/20 transition-colors"
      >
        <div className="absolute left-0 top-0 w-1 h-full bg-transparent group-hover:bg-amazon-yellow transition-colors" />
        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-4 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-0.5">
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Premium Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-amazon-navy hover:text-white rounded-2xl transition-all shadow-sm">
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black text-amazon-orange uppercase tracking-[0.2em]">
              Custom Circuit Panel
            </span>
            <span className="text-xs font-bold text-gray-400">Mangalore Navigator</span>
          </div>
        </div>
        <button 
          onClick={onClearCircuit}
          className="px-4 py-2 border-2 border-red-100 hover:border-red-500 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
        >
          Reset List
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {bookingStatus === 'success' ? (
          <CircuitSuccessView onClose={onClose} onClear={onClearCircuit} stopsCount={circuitStops.length} totalDist={totalDistance.toFixed(2)} />
        ) : (
          <div className="p-8 space-y-8">
            {/* Total Circuit Info Card */}
            <div className="bg-amazon-navy p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group text-left">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amazon-yellow/10 rounded-full blur-3xl group-hover:bg-amazon-yellow/20 transition-colors" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Circuit Length</span>
                 <Compass className="w-5 h-5 text-amazon-yellow animate-spin-slow" />
              </div>
              <div className="text-4xl font-black text-white relative z-10">
                {totalDistance.toFixed(2)} <span className="text-lg text-amazon-yellow font-bold">KM</span>
              </div>
              <p className="text-xs font-bold text-white/50 mt-2">Connected path through {circuitStops.length} waypoints.</p>
            </div>

            {/* Waypoints Pathway */}
            <div className="space-y-6 text-left">
              <h3 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-amazon-orange rounded-full" /> 
                Waypoint Protocol
              </h3>

              {/* Connected Dots Waypoints List */}
              <div className="relative pl-8 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-amazon-yellow before:via-amazon-orange before:to-gray-200">
                
                {/* User Starting Node */}
                <div className="relative">
                  <div className="absolute left-[-23px] top-1 w-4 h-4 rounded-full bg-amazon-yellow border-4 border-white shadow-md" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-amazon-yellow uppercase tracking-widest block">Core Hub</span>
                    <h4 className="text-sm font-black text-black">Your Location</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Starting Node</p>
                  </div>
                </div>

                {segments.map((seg, idx) => {
                  const isLast = idx === segments.length - 1;
                  return (
                    <div key={seg.stop.id} className="relative group animate-in slide-in-from-bottom duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                      {/* Connection Line segment display */}
                      <div className="absolute left-[-35px] top-[-30px] w-5 py-0.5 bg-white border border-gray-100 rounded-md text-[8px] font-black text-center text-amazon-orange shadow-sm">
                        +{seg.distFromPrev.toFixed(2)}
                      </div>

                      {/* Timeline Node Point */}
                      <div className={`absolute left-[-25px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors duration-500 ${isLast ? 'bg-green-500' : 'bg-amazon-orange'}`}>
                        <span className="text-[8px] font-black text-white">{idx + 1}</span>
                      </div>

                      {/* Waypoint details */}
                      <div className="bg-gray-50 border-2 border-white rounded-[2rem] p-5 shadow-sm space-y-4 hover:border-amazon-yellow transition-all duration-300">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-inner shrink-0 bg-gray-200">
                            <img src={seg.stop.image} alt={seg.stop.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black text-amazon-navy uppercase tracking-widest block">{seg.stop.category || 'Waypoint'}</span>
                            <h4 className="text-base font-black text-black truncate">{seg.stop.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{seg.stop.region || 'Mangalore Sector'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                          <div className="text-left">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">From Start Node</span>
                            <span className="text-xs font-black text-black">{seg.distFromUser.toFixed(2)} KM</span>
                          </div>
                          <div className="text-left">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Leg Segment</span>
                            <span className="text-xs font-black text-amazon-orange flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 shrink-0" />
                              {seg.distFromPrev.toFixed(2)} KM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Deck */}
            <div className="pt-6 space-y-4 pb-12">
              <button
                onClick={handleBookCircuit}
                className="w-full py-4.5 bg-amazon-navy text-white rounded-3xl text-sm font-black shadow-xl hover:shadow-amazon-navy/20 hover:bg-amazon-navy/95 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5 text-amazon-yellow" /> Schedule Circuit Ride
              </button>

              <button
                onClick={handleSaveCircuit}
                className={`w-full py-4 rounded-3xl text-sm font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isSaved 
                    ? 'bg-green-50 border-2 border-green-500 text-green-600 cursor-default' 
                    : 'bg-white border-2 border-amazon-navy text-amazon-navy hover:bg-amazon-navy/5'
                }`}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" /> Circuit Saved!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-5 h-5 text-amazon-orange" /> Save Custom Circuit
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CircuitSuccessView({ onClose, onClear, stopsCount, totalDist }) {
  return (
    <div className="p-8 text-center animate-in zoom-in duration-500 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <div className="w-24 h-24 bg-amazon-yellow/10 rounded-[2.5rem] flex items-center justify-center shadow-inner">
        <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-black mb-3">Circuit Active!</h2>
        <p className="text-base text-gray-500 font-bold max-w-[280px] mx-auto">
          Your circuit with {stopsCount} waypoints has been calculated and synchronized.
        </p>
      </div>
      <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-white shadow-xl w-full max-w-sm space-y-4 text-left">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
          <span className="text-sm font-black text-black">CUSTOM CIRCUIT</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Circuit stops</span>
          <span className="text-sm font-black text-black">{stopsCount} Stops</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total distance</span>
          <span className="text-sm font-black text-green-700">{totalDist} KM</span>
        </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={onClose}
          className="w-full py-5 bg-amazon-yellow text-amazon-navy rounded-[2rem] text-sm font-black shadow-xl hover:shadow-amazon-yellow/20 transition-all active:scale-95 uppercase tracking-widest"
        >
          Confirm & Map
        </button>
        <button 
          onClick={() => {
            onClear();
            onClose();
          }}
          className="w-full py-4 bg-transparent border-2 border-gray-200 hover:border-black text-black rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Clear & Close
        </button>
      </div>
    </div>
  );
}
