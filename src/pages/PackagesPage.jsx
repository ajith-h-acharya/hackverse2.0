import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bus, Compass, Calendar, MapPin, Users, ChevronRight, Star, Clock } from 'lucide-react';

const packages = [
  {
    id: 'pkg-1',
    agency: 'KSRTC Mangaluru Darshana',
    title: 'Coastal Heritage Tour',
    price: '₹500 / person',
    duration: '1 Day (9 AM - 6 PM)',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800',
    type: 'Govt. Package',
    highlights: ['Kadri Temple', 'Pilikula Nisargadhama', 'Tannirbhavi Beach', 'St. Aloysius Chapel'],
    rating: 4.5,
    reviews: 1240,
    link: 'https://www.ksrtc.in'
  },
  {
    id: 'pkg-2',
    agency: 'Udupi Tourism Board',
    title: 'Temple & Beach Circuit',
    price: '₹850 / person',
    duration: '1 Day (8 AM - 7 PM)',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
    type: 'Govt. Package',
    highlights: ['Udupi Krishna Matha', 'Malpe Beach', 'St. Marys Island Boat Ride', 'Kaup Lighthouse'],
    rating: 4.8,
    reviews: 890,
    link: 'https://udupitourism.com'
  },
  {
    id: 'pkg-3',
    agency: 'Western Ghats Expeditions (Private)',
    title: 'Kudremukh Trekking Adventure',
    price: '₹2,500 / person',
    duration: '2 Days, 1 Night',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    type: 'Private Agency',
    highlights: ['Guided Forest Trek', 'Hanuman Gundi Falls', 'Tent Camping', 'All Meals Included'],
    rating: 4.9,
    reviews: 320,
    link: 'https://www.karnatakaecotourism.com'
  },
  {
    id: 'pkg-4',
    agency: 'Coastal Navigators Inc.',
    title: 'Luxury Culinary & Culture Tour',
    price: '₹4,000 / person',
    duration: '2 Days',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
    type: 'Private Agency',
    highlights: ['Premium AC Transport', 'Seafood Tasting at Machali', 'Heritage Village Tour', 'Private Beach Access'],
    rating: 4.7,
    reviews: 156,
    link: 'https://www.karnatakatourism.org'
  }
];

export default function PackagesPage() {
  const [filter, setFilter] = useState('All');
  const [selectedPkg, setSelectedPkg] = useState(null);

  const handleBookPackage = (pkg) => {
    setSelectedPkg(pkg.id);
    setTimeout(() => {
      window.open(pkg.link, '_blank', 'noopener,noreferrer');
      setSelectedPkg(null);
    }, 1200);
  };

  const filteredPackages = filter === 'All' 
    ? packages 
    : packages.filter(p => p.type === filter);

  return (
    <div className="min-h-screen bg-[#080b11] text-white selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden pb-20">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-[#080b11]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-3 text-white hover:text-amazon-yellow transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amazon-yellow/20">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">Return to Base</span>
        </Link>
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
          TOUR<span className="text-amazon-orange">.PACKAGES</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16 relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amazon-orange rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6 relative z-10 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          CURATED <span className="bg-gradient-to-r from-amazon-orange to-amazon-yellow bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,153,0,0.45)]">EXPEDITIONS</span><br />BY THE EXPERTS
        </h1>
        <p className="max-w-2xl text-lg font-bold text-white/85 leading-relaxed">
          Prefer a guided journey? Book official KSRTC Darshana buses or premium private tours to experience the best of the coastal belt without the hassle of planning.
        </p>

        {/* Filters */}
        <div className="flex gap-4 mt-10">
          {['All', 'Govt. Package', 'Private Agency'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-amazon-orange text-amazon-navy shadow-[0_0_20px_rgba(255,153,0,0.4)]' 
                  : 'bg-black/40 text-white/95 hover:bg-black/60 hover:text-white border border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packages List */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-8">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-amazon-orange/30 transition-all flex flex-col md:flex-row shadow-2xl hover:bg-black/60">
              <div className="relative md:w-2/5 h-64 md:h-auto overflow-hidden bg-black/20 shrink-0">
                <img 
                  src={pkg.image} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] to-transparent opacity-60 md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080b11] opacity-90 hidden md:block" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-amazon-orange" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">{pkg.type}</span>
                </div>
              </div>
              
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-center relative">
                <div className="flex items-center gap-2 text-amazon-orange mb-3">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">{pkg.agency}</span>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black mb-4 text-white">{pkg.title}</h3>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 text-white font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/60" />
                    {pkg.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amazon-yellow" />
                    {pkg.rating} ({pkg.reviews} reviews)
                  </div>
                </div>
                
                <div className="mb-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/70 mb-4">Itinerary Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.highlights.map(point => (
                      <span key={point} className="text-xs font-bold text-white bg-black/50 border border-white/20 px-4 py-2 rounded-full shadow-md">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-col md:flex-row md:items-center justify-end gap-6 pt-8 border-t border-white/10">
                  <button 
                    onClick={() => handleBookPackage(pkg)}
                    className="py-4 px-10 bg-white text-amazon-navy rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amazon-orange hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {selectedPkg === pkg.id ? `Redirecting to ${pkg.agency}...` : 'Book Package'}
                    {selectedPkg !== pkg.id && <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
