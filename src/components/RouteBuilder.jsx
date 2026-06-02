import React, { useState } from 'react';
import { circuits } from '../data/locations';
import { calculateTotalDistance, calculateDistance } from '../utils/haversine';
import { 
  MapPin, Route, Plus, Minus, 
  ChevronUp, ChevronDown, Trash2, 
  Navigation, Info, Zap, Bus, Car, 
  Clock, Shield, Activity, X, Compass, Map as MapIcon, Star, ChevronRight, Search
} from 'lucide-react';

export default function RouteBuilder({ locations = [], onSelectCircuit, customStops = [], setCustomStops, userLocation }) {
  const [activeCircuitId, setActiveCircuitId] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [activeRouteLocs, setActiveRouteLocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStop = (id) => {
    if (setCustomStops) {
      setCustomStops(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    }
  };

  const moveStop = (index, dir) => {
    if (setCustomStops) {
      setCustomStops(prev => {
        const next = [...prev];
        const target = index + dir;
        if (target < 0 || target >= next.length) return prev;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    }
  };

  const handleExecute = (locs, id) => {
    if (!locs || locs.length === 0) return;
    setActiveCircuitId(id);
    setActiveRouteLocs(locs);
    if (onSelectCircuit) onSelectCircuit(locs);
    setShowBriefing(true);
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-8 bg-gray-50 custom-scrollbar text-left animate-in fade-in duration-500">
      
      {/* ── Expedition Briefing ── */}
      {showBriefing && activeRouteLocs.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-2xl mb-8 animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-amazon-navy rounded-2xl flex items-center justify-center text-amazon-yellow">
                  <Compass className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-black">Expedition Map</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Active Itinerary • {activeRouteLocs.length > 1 ? calculateTotalDistance(activeRouteLocs) : '0'} KM
                  </p>
               </div>
            </div>
            <button onClick={() => setShowBriefing(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
               <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="space-y-8 relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gradient-to-b from-amazon-navy to-amazon-yellow rounded-full opacity-20" />
            {activeRouteLocs.map((loc, idx) => (
              <div key={`brief-${loc.id}-${idx}`} className="flex items-start gap-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-amazon-navy border-4 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base font-black text-black uppercase tracking-tight">{loc.name}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">Waypoint {idx + 1}</p>
                  {idx < activeRouteLocs.length - 1 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-2xl border-2 border-white shadow-sm inline-flex items-center gap-3 text-[11px] text-amazon-navy font-black">
                       <Bus className="w-4 h-4 text-amazon-orange" /> Local connectivity synchronized
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowBriefing(false)}
            className="mt-10 w-full py-4 bg-amazon-navy text-white hover:bg-black rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95"
          >
            Modify Expedition
          </button>
        </div>
      )}

      {/* ── Expert Circuits ── */}
      {!showBriefing && (
        <div className="space-y-4 px-1">
          <div className="flex items-center gap-3 px-1">
             <div className="w-2 h-6 bg-amazon-orange rounded-full" />
             <h2 className="text-lg font-black text-black">Curated Circuits</h2>
          </div>
          <div className="grid gap-5">
              {(circuits || []).map(circuit => {
                const isFeatured = circuit.id === 'ultimate';
                const locs = (circuit.locations || []).map(id => locations.find(l => l.id === id)).filter(Boolean);
                const dist = locs.length > 1 ? calculateTotalDistance(locs) : '0';
                return (
                  <div 
                    key={circuit.id} 
                    className={`group bg-white p-6 rounded-[2rem] border-2 cursor-pointer transition-all relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                      isFeatured ? 'border-amazon-yellow bg-amazon-yellow/5' : 'border-white hover:border-amazon-navy'
                    }`}
                    onClick={() => handleExecute(locs, circuit.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-black text-black leading-tight group-hover:text-amazon-navy transition-colors">{circuit.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="flex text-amazon-yellow">
                              <Star className="w-3.5 h-3.5 fill-current" />
                           </div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{locs.length} Destinations</span>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border-2 border-gray-50 shadow-sm">
                         <span className="text-xs font-black text-amazon-navy">{dist} KM</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2">{circuit.description}</p>
                    <div className="mt-6 flex items-center justify-between">
                       <span className="text-[10px] font-black text-amazon-navy uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100">Optimized Path</span>
                       <div className="w-8 h-8 bg-amazon-navy text-white rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Path Designer ── */}
      {!showBriefing && (
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-black">Design Custom Itinerary</h2>
            <button 
              onClick={() => setCustomStops && setCustomStops([])}
              className="text-xs font-black text-amazon-orange hover:underline uppercase tracking-widest"
            >
              Reset
            </button>
          </div>

          {/* Location Search Bar */}
          <div className="px-1">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 text-black placeholder:text-gray-400 px-5 py-3 rounded-2xl focus:border-amazon-navy focus:outline-none focus:ring-4 focus:ring-amazon-navy/10 transition-all text-sm font-bold shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="h-6 w-px bg-gray-200" />
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-amazon-navy transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 px-1 max-h-64 overflow-y-auto custom-scrollbar pr-2 pb-2">
            {locations.filter(loc => 
                searchQuery === '' || 
                loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                loc.category.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(loc => {
              const isSelected = (customStops || []).includes(loc.id);
              const distFromUser = userLocation && loc.lat && loc.lng ? calculateDistance(userLocation[0], userLocation[1], loc.lat, loc.lng) : null;
              
              return (
                <button
                  key={loc.id}
                  onClick={() => toggleStop(loc.id)}
                  className={`flex flex-col justify-center px-4 py-3 rounded-2xl border-2 text-[10px] font-black transition-all ${
                    isSelected 
                      ? 'border-amazon-navy bg-amazon-navy text-white shadow-lg scale-105' 
                      : 'border-white text-gray-400 bg-white hover:border-gray-200 hover:text-black'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate pr-2 uppercase tracking-tighter">{loc.name}</span>
                    {isSelected ? <Minus className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 opacity-40 shrink-0" />}
                  </div>
                  {distFromUser !== null && (
                    <div className={`mt-1 text-[9px] uppercase tracking-widest text-left ${isSelected ? 'text-amazon-yellow' : 'text-amazon-orange'}`}>
                      {distFromUser} KM AWAY
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {customStops && customStops.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-amazon-yellow shadow-2xl space-y-6 mx-1">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amazon-yellow rounded-xl flex items-center justify-center text-amazon-navy shadow-lg">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-black">Your Custom Path</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         {customStops.length} Stops • {customStops.length > 1 ? (calculateTotalDistance(customStops.map(id => locations.find(l => l.id === id)).filter(Boolean)) || '0') : '0'} KM
                      </p>
                    </div>
                 </div>
               </div>
               <div className="space-y-3">
                 {customStops.map((id, idx) => {
                   const loc = locations.find(l => l.id === id);
                   if (!loc) return null;
                   return (
                     <div key={`custom-${id}-${idx}`} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-white shadow-sm">
                       <span className="text-xs font-black text-amazon-navy/40">{idx + 1}</span>
                       <span className="flex-1 text-xs font-black text-black uppercase truncate">{loc.name}</span>
                       <div className="flex gap-2">
                         <button onClick={() => moveStop(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-black disabled:opacity-0 transition-transform active:scale-125"><ChevronUp className="w-5 h-5" /></button>
                         <button onClick={() => moveStop(idx, 1)} disabled={idx === customStops.length - 1} className="text-gray-400 hover:text-black disabled:opacity-0 transition-transform active:scale-125"><ChevronDown className="w-5 h-5" /></button>
                       </div>
                     </div>
                   );
                 })}
               </div>
               <button
                 onClick={() => {
                   const locs = customStops.map(id => locations.find(l => l.id === id)).filter(Boolean);
                   handleExecute(locs, 'custom');
                 }}
                 className="w-full bg-amazon-orange hover:bg-[#FA8900] py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
               >
                 Generate Expedition
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
