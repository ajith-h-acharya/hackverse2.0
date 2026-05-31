import React, { useState } from 'react';
import { Map, List, Compass, Heart, Search, Star, MapPin, Menu, ChevronRight, Filter, Compass as Explorer, Utensils, Bed } from 'lucide-react';
import RouteBuilder from './RouteBuilder';
import { calculateDistance } from '../utils/haversine';
import { hiddenGems } from '../data/hiddenGems';

export default function Sidebar({
  activeCategory,
  setActiveCategory,
  locations,
  onLocationClick,
  activeTab,
  setActiveTab,
  onSelectCircuit,
  favorites,
  onToggleFavorite,
  customStops = [],
  setCustomStops,
  reviews = [],
  hotels = [],
  userLocation
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations
    .filter(loc => activeCategory === 'All' || loc.category === activeCategory || loc.experience === activeCategory)
    .filter(loc =>
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const categories = ['All', 'Coastal', 'Religious', 'Heritage', 'Nature', 'Culinary', 'Urban'];

  return (
    <div className="w-full md:w-96 bg-gray-50 h-[50vh] md:h-screen flex flex-col z-20 relative font-sans border-r border-gray-200">
      {/* Premium Header */}
      <div className="bg-amazon-navy p-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-amazon-yellow rounded-xl flex items-center justify-center rotate-3 shadow-lg">
              <Explorer className="w-6 h-6 text-amazon-navy" />
           </div>
           <div className="flex flex-col">
              <h1 className="text-white font-black text-xl tracking-tight leading-none">MANGALORE</h1>
              <p className="text-amazon-yellow text-[10px] font-black tracking-[0.2em] uppercase mt-1">Tourism Navigator</p>
           </div>
        </div>

        {/* Minimal Search */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3 rounded-2xl focus:bg-white focus:text-black focus:outline-none focus:ring-4 focus:ring-amazon-yellow/20 transition-all text-sm font-bold"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="h-6 w-px bg-white/10" />
            <Search className="w-5 h-5 text-white/40 group-focus-within:text-amazon-navy transition-colors" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white px-2 py-3 gap-2 shrink-0 border-b border-gray-200 overflow-x-auto custom-scrollbar pb-2">
        {[
          { id: 'explore', label: 'Explore', icon: List },
          { id: 'dining', label: 'Dining', icon: Utensils },
          { id: 'stays', label: 'Stays', icon: Bed },
          { id: 'routes', label: 'Itineraries', icon: Map },
          { id: 'favorites', label: 'Saved', icon: Heart },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all shrink-0 ${
              activeTab === id 
                ? 'bg-amazon-yellow text-amazon-navy shadow-md scale-105' 
                : 'bg-transparent text-gray-400 hover:text-black hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'explore' && (
          <div className="p-5 space-y-6 animate-in fade-in duration-300">
             {/* Category Chips */}
             <div className="space-y-3">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Categories</h3>
               <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                   <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                      activeCategory === cat 
                        ? 'bg-amazon-navy text-white border-amazon-navy shadow-lg' 
                        : 'bg-white text-black border-gray-100 hover:border-amazon-yellow hover:bg-amazon-yellow/5'
                    }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>

             {/* Results Section */}
             <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-black text-black">{filteredLocations.length} Destinations</span>
                <Filter className="w-4 h-4 text-gray-400 cursor-pointer hover:text-black" />
              </div>

              <div className="space-y-4">
                {filteredLocations.map(loc => (
                  <DestinationCard
                    key={loc.id}
                    loc={loc}
                    isFavorite={favorites.includes(loc.id)}
                    onToggleFavorite={onToggleFavorite}
                    onLocationClick={onLocationClick}
                    reviews={reviews}
                    userLocation={userLocation}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dining' && (
          <div className="p-5 space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amazon-orange" />
                  Premium Dining
                </h3>
             </div>
             <div className="space-y-4">
                {locations.filter(l => l.category === 'Culinary').map(loc => (
                  <DestinationCard
                    key={loc.id}
                    loc={loc}
                    isFavorite={favorites.includes(loc.id)}
                    onToggleFavorite={onToggleFavorite}
                    onLocationClick={onLocationClick}
                    reviews={reviews}
                    userLocation={userLocation}
                  />
                ))}
             </div>
          </div>
        )}

        {activeTab === 'stays' && (
          <div className="p-5 space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amazon-navy" />
                  Luxury Stays
                </h3>
             </div>
             <div className="space-y-4">
                {hotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onLocationClick={onLocationClick}
                    userLocation={userLocation}
                  />
                ))}
             </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <RouteBuilder 
              locations={[...locations, ...hiddenGems]} 
              onSelectCircuit={onSelectCircuit} 
              customStops={customStops}
              setCustomStops={setCustomStops}
              userLocation={userLocation}
            />
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-amazon-orange" />
                </div>
                <h3 className="text-xl font-black text-black">Your Collection</h3>
                <p className="text-sm text-gray-500 font-bold">Destinations you want to explore later.</p>
                {favorites.length > 0 && (
                  <button
                    onClick={() => {
                      if (setCustomStops) setCustomStops(favorites);
                      const allSearchable = [...locations, ...hiddenGems];
                      const resolvedFavorites = favorites.map(id => allSearchable.find(l => l.id === id)).filter(Boolean);
                      if (onSelectCircuit && resolvedFavorites.length > 0) {
                        onSelectCircuit(resolvedFavorites);
                      }
                      setActiveTab('routes');
                    }}
                    className="w-full mt-4 bg-amazon-orange hover:bg-[#FA8900] py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    Create Circuit
                  </button>
                )}
             </div>
             {[...locations, ...hiddenGems].filter(l => favorites.includes(l.id)).map(loc => (
                <DestinationCard
                  key={loc.id}
                  loc={loc}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onLocationClick={onLocationClick}
                  reviews={reviews}
                  userLocation={userLocation}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HotelCard({ hotel, onLocationClick, userLocation }) {
  const lat = hotel.lat || (hotel.coordinates && hotel.coordinates[0]);
  const lng = hotel.lng || (hotel.coordinates && hotel.coordinates[1]);
  const distFromUser = userLocation && lat && lng ? calculateDistance(userLocation[0], userLocation[1], lat, lng) : null;

  return (
    <div
      className="group bg-white border-2 border-gray-100 rounded-3xl p-4 cursor-pointer hover:border-amazon-navy hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onLocationClick(hotel)}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative shadow-md">
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-2 left-2 bg-amazon-yellow px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-amazon-navy">
             {hotel.type}
          </div>
        </div>
        <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-black leading-tight line-clamp-1">{hotel.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-3.5 h-3.5 text-amazon-yellow fill-current" />
              <span className="text-xs font-black text-black">{hotel.rating}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{hotel.region}</span>
              {distFromUser !== null && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[10px] font-black text-amazon-orange uppercase tracking-wider">{distFromUser} KM</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
             <div className="text-sm font-black text-amazon-navy">
                {hotel.price} <span className="text-[10px] text-gray-400 font-bold">/ night</span>
             </div>
             <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-amazon-navy group-hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinationCard({ loc, isFavorite, onToggleFavorite, onLocationClick, reviews = [], userLocation }) {
  const lat = loc.lat || (loc.coordinates && loc.coordinates[0]);
  const lng = loc.lng || (loc.coordinates && loc.coordinates[1]);
  const distFromUser = userLocation && lat && lng ? calculateDistance(userLocation[0], userLocation[1], lat, lng) : null;

  const locReviews = reviews.filter(r => r.locationId === loc.id);
  const avg = locReviews.length 
    ? (locReviews.reduce((acc, curr) => acc + curr.rating, 0) / locReviews.length).toFixed(1)
    : '4.8';

  return (
    <div
      className="group bg-white border-2 border-gray-100 rounded-3xl p-4 cursor-pointer hover:border-amazon-yellow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onLocationClick(loc)}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden relative shadow-md">
          <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="flex-1 min-w-0 text-left flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-black leading-tight line-clamp-1">{loc.name}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-3.5 h-3.5 text-amazon-yellow fill-current" />
              <span className="text-xs font-black text-black">{avg}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[10px] font-black text-amazon-navy uppercase tracking-wider">{loc.category}</span>
              {distFromUser !== null && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-[10px] font-black text-amazon-orange uppercase tracking-wider">{distFromUser} KM</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${loc.id + i}`} alt="avatar" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-amazon-navy flex items-center justify-center text-[8px] text-white font-black">
                  +{locReviews.length || 12}
                </div>
             </div>
             <button 
              className={`p-2.5 rounded-xl transition-all ${isFavorite ? 'bg-amazon-orange text-white shadow-lg' : 'bg-gray-50 text-gray-300 hover:bg-amazon-orange hover:text-white'}`}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(loc.id); }}
             >
               <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
