import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Car, Bike, Shield, Clock, MapPin, Zap, ChevronRight, Check, Phone, Globe } from 'lucide-react';

const vehicles = [
  {
    id: 'scooter-1',
    type: '2-Wheeler',
    model: 'Honda Activa 6G',
    price: '₹399 / day',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    tags: ['Best for City', 'High Mileage'],
    specs: ['110cc Engine', 'Automatic', '2 Helmets Included']
  },
  {
    id: 'bike-1',
    type: '2-Wheeler',
    model: 'Royal Enfield Classic 350',
    price: '₹899 / day',
    image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=800',
    tags: ['Cruiser', 'Perfect for Ghats'],
    specs: ['350cc Engine', 'Manual', 'Roadside Assistance']
  },
  {
    id: 'car-1',
    type: '4-Wheeler',
    model: 'Maruti Suzuki Swift',
    price: '₹1,499 / day',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    tags: ['Hatchback', 'A/C'],
    specs: ['5 Seater', 'Manual', 'Unlimited KMs']
  },
  {
    id: 'car-2',
    type: '4-Wheeler',
    model: 'Mahindra Thar (4x4)',
    price: '₹3,499 / day',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    tags: ['Off-Road', 'Premium'],
    specs: ['4 Seater', 'Automatic', '4x4 capability']
  },
  {
    id: 'car-3',
    type: '4-Wheeler',
    model: 'Toyota Innova Crysta',
    price: '₹2,999 / day',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    tags: ['SUV', 'Family Trip'],
    specs: ['7 Seater', 'Manual/Auto', 'Chauffeur Optional']
  },
  {
    id: 'bike-2',
    type: '2-Wheeler',
    model: 'Yamaha MT-15',
    price: '₹699 / day',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    tags: ['Sports', 'Agile'],
    specs: ['155cc Engine', 'Manual', 'Premium Maintenance']
  }
];

export default function RentalsPage() {
  const [filter, setFilter] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);

  const handleReserve = (vehicle) => {
    setSelectedVehicle(vehicle.id);
    setTimeout(() => {
      setActiveReservation(vehicle);
      setSelectedVehicle(null);
    }, 800);
  };

  const filteredVehicles = filter === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.type === filter);

  return (
    <div className="min-h-screen bg-[#080b11] text-white selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden pb-20">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-amazon-navy/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-3 text-white hover:text-amazon-yellow transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amazon-yellow/20">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-black text-sm uppercase tracking-widest">Return to Base</span>
        </Link>
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
          MOBILITY<span className="text-amazon-yellow">.RENTALS</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amazon-yellow rounded-full blur-[120px] opacity-10 pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6 relative z-10 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          EXPLORE THE COAST<br />ON YOUR <span className="bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-yellow bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(254,189,105,0.4)]">OWN TERMS</span>
        </h1>
        <p className="max-w-2xl text-lg font-bold text-white/85 leading-relaxed">
          From nimble scooters for city streets to robust 4x4s for the Western Ghats. Secure your vehicle, grab the keys, and start your expedition.
        </p>

        {/* Filters */}
        <div className="flex gap-4 mt-10">
          {['All', '2-Wheeler', '4-Wheeler'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-amazon-yellow text-amazon-navy shadow-[0_0_20px_rgba(254,189,105,0.4)]' 
                  : 'bg-black/40 text-white/95 hover:bg-black/60 hover:text-white border border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-black/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amazon-yellow/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-amazon-yellow" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-white">Instant Booking</h4>
              <p className="text-white text-xs font-bold leading-relaxed">Zero paperwork. Digital KYC and instant approval.</p>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-black/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amazon-orange/20 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-amazon-orange" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-white">Fully Insured</h4>
              <p className="text-white text-xs font-bold leading-relaxed">Comprehensive coverage for a stress-free journey.</p>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-black/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-white">24/7 Support</h4>
              <p className="text-white text-xs font-bold leading-relaxed">Roadside assistance anywhere in the coastal belt.</p>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-black/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-white">Drop Anywhere</h4>
              <p className="text-white text-xs font-bold leading-relaxed">Flexible pickup and drop points across the city.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-amazon-yellow/30 transition-all hover:bg-black/60 shadow-2xl">
              <div className="relative h-56 overflow-hidden bg-black/20">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.model} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy to-transparent opacity-80" />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  {vehicle.type === '2-Wheeler' ? <Bike className="w-4 h-4 text-amazon-yellow" /> : <Car className="w-4 h-4 text-amazon-yellow" />}
                  <span className="text-xs font-black uppercase tracking-widest text-white">{vehicle.type}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex gap-2 mb-4">
                  {vehicle.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-amazon-yellow bg-amazon-yellow/10 px-3 py-1 rounded-full border border-amazon-yellow/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-black mb-2">{vehicle.model}</h3>
                <div className="text-3xl font-black text-white/90 mb-6">{vehicle.price}</div>
                
                <ul className="space-y-3 mb-8">
                  {vehicle.specs.map(spec => (
                    <li key={spec} className="flex items-center gap-3 text-sm font-bold text-white">
                      <Check className="w-4 h-4 text-amazon-yellow shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleReserve(vehicle)}
                  className="w-full py-4 bg-white text-amazon-navy rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amazon-yellow transition-colors flex items-center justify-center gap-2"
                >
                  {selectedVehicle === vehicle.id ? 'Processing...' : 'Reserve Vehicle'}
                  {selectedVehicle !== vehicle.id && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Pop/Dashboard */}
      {activeReservation && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            onClick={() => setActiveReservation(null)} 
          />
          
          {/* Modal Container */}
          <div className="bg-[#0b0f19] border-2 border-white/15 rounded-[3rem] w-full max-w-lg relative z-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 animate-in zoom-in-95 duration-300">
            {/* Visual Header */}
            <div className="w-20 h-20 bg-amazon-yellow/10 rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-amazon-yellow/20">
              <Check className="w-10 h-10 text-amazon-yellow animate-pulse" />
            </div>

            <div className="text-center space-y-3">
              <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-[0.3em]">Reservation Request Sent</span>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                {activeReservation.model}
              </h3>
              <p className="text-sm font-bold text-white/90 max-w-xs mx-auto leading-relaxed">
                Your booking request has been successfully transmitted to the fleet provider.
              </p>
            </div>

            {/* Dashboard Pop Content */}
            <div className="mt-8 p-6 bg-black/60 border border-white/10 rounded-3xl space-y-5">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-4">
                <span>ESTIMATED RATE:</span>
                <span className="text-amazon-yellow font-black text-sm">{activeReservation.price}</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-black text-amazon-orange uppercase tracking-wider block">Contact Details:</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amazon-orange/10 flex items-center justify-center text-amazon-orange shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-white/90 tracking-wide">+91 98450 12345 / +91 824 244 8888</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-amazon-orange uppercase tracking-wider block">Shop Owner's Website:</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amazon-yellow/10 flex items-center justify-center text-amazon-yellow shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <a 
                    href="https://www.mangalorerentals.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-black text-amazon-yellow hover:text-white transition-colors underline decoration-2 underline-offset-4"
                  >
                    www.mangalorerentals.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setActiveReservation(null)}
                className="w-full py-4 bg-amazon-yellow text-amazon-navy rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-amazon-navy transition-all shadow-lg active:scale-95"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
