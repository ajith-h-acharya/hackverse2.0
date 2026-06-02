import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Compass, Trash2, Calendar, MapPin, 
  Map, Route, Navigation, History, CheckCircle, Info, Bookmark 
} from 'lucide-react';
import { locations } from '../data/locations';
import { hiddenGems } from '../data/hiddenGems';
import { generateGoogleMapsDirUrl } from '../utils/maps';

export default function CircuitHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mangalore_circuit_history');
      setHistory(saved ? JSON.parse(saved) : []);
    } catch (err) {
      console.error("Failed to load circuit history", err);
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire expedition log?")) {
      try {
        localStorage.removeItem('mangalore_circuit_history');
        setHistory([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteItem = (id) => {
    try {
      const next = history.filter(item => item.id !== id);
      localStorage.setItem('mangalore_circuit_history', JSON.stringify(next));
      setHistory(next);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate metrics
  const totalCircuits = history.filter(h => h.type === 'Custom Circuit').length;
  const totalRides = history.filter(h => h.type === 'Single Waypoint').length;
  const totalStays = history.filter(h => h.type === 'Stay Booking').length;

  const totalDistance = history.reduce((acc, curr) => {
    const dist = parseFloat(curr.totalDistance);
    return acc + (isNaN(dist) ? 0 : dist);
  }, 0).toFixed(2);

  const totalStopsCount = history.reduce((acc, curr) => {
    return acc + (curr.stops ? curr.stops.length : 0);
  }, 0);

  const handlePlotOnMap = (item) => {
    if (item.stops && item.stops.length > 0) {
      const stopIds = item.stops.map(s => s.id).join(',');
      navigate(`/map?circuit=${stopIds}`);
    }
  };

  const handleExportToGoogleMaps = (item) => {
    if (item.stops && item.stops.length > 0) {
      const allSearchable = [...locations, ...hiddenGems];
      const resolvedStops = item.stops
        .map(s => allSearchable.find(loc => loc.id === s.id))
        .filter(Boolean);
        
      if (resolvedStops.length > 0) {
        const url = generateGoogleMapsDirUrl(resolvedStops);
        if (url) {
          window.open(url, '_blank');
        } else {
          alert("Could not generate Google Maps route (no valid coordinates found).");
        }
      } else {
        alert("Could not resolve circuit stops coordinate details.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-amazon-navy text-white font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden">
      
      {/* Navigation Header */}
      <nav className="sticky top-0 z-[100] bg-amazon-navy/80 backdrop-blur-xl border-b border-white/10 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 group-hover:bg-amazon-yellow transition-all group-hover:border-amazon-yellow group-hover:text-amazon-navy">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none text-left">KUDLA</span>
              <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest mt-1">Expeditions Log</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/saved-circuits" 
              className="px-5 py-2.5 bg-white/5 hover:bg-white/15 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/80 border border-white/10 transition-all flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-amazon-yellow" />
              Saved Circuits
            </Link>
            <Link 
              to="/map" 
              className="px-5 py-2.5 bg-white/10 hover:bg-white/25 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 transition-all flex items-center gap-2"
            >
              <Map className="w-4 h-4 text-amazon-yellow" />
              Explorer Map
            </Link>
            {history.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Clear Log
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative pt-16 pb-20 px-8 overflow-hidden text-center max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter leading-none">
           HISTORY
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amazon-yellow/10 border-2 border-amazon-yellow/20 text-amazon-yellow text-[11px] font-black uppercase tracking-[0.4em] mb-4">
            <History className="w-5 h-5 text-white" /> Expedition Annals
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            YOUR ARCHIVED<br />
            <span className="text-amazon-yellow drop-shadow-2xl">ITINERARIES</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/50 text-base md:text-lg font-bold leading-relaxed">
            Review and map previously planned custom circuits, scheduled transport paths, and hotel reservations across the Mangalore sector.
          </p>
        </div>
      </header>

      {/* Metrics Section */}
      {history.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Distance', value: `${totalDistance} KM`, desc: 'Kilometers traversed', color: 'text-amazon-yellow' },
              { label: 'Circuits Created', value: totalCircuits, desc: 'Multi-stop custom itineraries', color: 'text-amazon-orange' },
              { label: 'Rides Scheduled', value: totalRides, desc: 'Single point navigations', color: 'text-blue-400' },
              { label: 'Stays Reserved', value: totalStays, desc: 'Hotel room reservations', color: 'text-purple-400' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-left shadow-lg">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">{stat.label}</span>
                <h3 className={`text-3xl font-black mt-2 mb-1 ${stat.color}`}>{stat.value}</h3>
                <p className="text-[10px] font-bold text-white/30">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Log Section */}
      <section className="max-w-4xl mx-auto px-8 pb-32">
        {history.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-amazon-yellow/10 rounded-full flex items-center justify-center mx-auto border border-amazon-yellow/20">
              <Compass className="w-10 h-10 text-amazon-yellow animate-spin-slow" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Expeditions Logged Yet</h3>
              <p className="text-white/40 text-sm font-bold max-w-sm mx-auto">
                Any custom circuits you build and bookings you secure will be logged in this terminal for quick loading.
              </p>
            </div>
            <Link 
              to="/map" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-amazon-yellow text-amazon-navy rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Start Explorer Map
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => {
              const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              // Determine type badge colors
              const isCircuit = item.type === 'Custom Circuit';
              const isStay = item.type === 'Stay Booking';
              const typeColor = isCircuit
                ? 'bg-amazon-yellow/10 border-amazon-yellow/30 text-amazon-yellow'
                : isStay
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400';

              return (
                <div 
                  key={item.id} 
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-[2.5rem] p-6 md:p-8 text-left shadow-lg transition-all duration-300 relative group"
                >
                  {/* Delete Item Button */}
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-full ${typeColor}`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] font-black text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {isCircuit ? `Circuit Route with ${item.stops.length} Stops` : item.stops[0]?.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-white/30 uppercase block">Distance</span>
                        <span className="text-lg font-black text-white">{item.totalDistance} KM</span>
                      </div>
                    </div>
                  </div>

                  {/* Waypoints visual timeline or item details */}
                  <div className="py-6 flex flex-col gap-4 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-4 min-w-max py-2">
                      {item.stops && item.stops.map((stop, sIdx) => {
                        const isLastStop = sIdx === item.stops.length - 1;
                        return (
                          <React.Fragment key={sIdx}>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl max-w-xs shadow-sm">
                              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-inner shrink-0 bg-white/10">
                                <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left max-w-[120px]">
                                <span className="text-[8px] font-black text-amazon-yellow uppercase block leading-none mb-1">
                                  Stop {sIdx + 1}
                                </span>
                                <h4 className="text-xs font-black text-white truncate leading-tight">{stop.name}</h4>
                                <span className="text-[8px] font-bold text-white/40 uppercase block leading-none mt-1">
                                  {stop.category}
                                </span>
                              </div>
                            </div>
                            
                            {!isLastStop && (
                              <div className="w-6 h-[2px] bg-gradient-to-r from-amazon-yellow to-amazon-orange rounded-full shrink-0 flex items-center justify-center">
                                <ArrowRight className="w-3.5 h-3.5 text-amazon-orange rotate-[-90deg] md:rotate-0" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      Secure Ledger MN-{item.id.split('-')[1] || item.id}
                    </span>
                    <div className="flex items-center gap-3">
                      {item.stops && item.stops.length > 0 && (
                        <button 
                          onClick={() => handleExportToGoogleMaps(item)}
                          className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/15 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Map className="w-4 h-4 text-amazon-yellow" />
                          Export to Google Maps
                        </button>
                      )}
                      <button 
                        onClick={() => handlePlotOnMap(item)}
                        className="px-6 py-3 bg-amazon-yellow hover:bg-[#FA8900] text-amazon-navy hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Plot on Map
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
