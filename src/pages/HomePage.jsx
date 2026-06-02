import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EXPERIENCE_THEMES, locations } from '../data/locations';
import { Compass, Calendar, MapPin, Star, X, CheckCircle, Bed, ArrowRight, Music, Plane, Landmark, Waves, Utensils, Zap, Sparkles, Camera, History, Bookmark, User } from 'lucide-react';
import ChatAssistant from '../components/ChatAssistant';
import Mascot from '../components/Mascot';

function FloatingParticle({ delay, duration, left, size, icon: Icon, text, color }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div className="floating-particle">
        {Icon ? (
          <Icon
            style={{
              width: size,
              height: size,
              color: color,
              opacity: 0.85,
              filter: `drop-shadow(0 0 10px ${color})`,
            }}
          />
        ) : (
          <span
            className="font-black uppercase tracking-[0.25em] whitespace-nowrap select-none"
            style={{
              fontSize: size,
              color: color,
              opacity: 0.80,
              textShadow: `0 0 12px ${color}`,
            }}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [hasSharedSession, setHasSharedSession] = useState(false);
  const [sharedEmail, setSharedEmail] = useState('');

  useEffect(() => {
    const backup = localStorage.getItem('mangalore_original_user');
    if (backup) {
      setHasSharedSession(true);
      const email = localStorage.getItem('mangalore_user_email');
      setSharedEmail(email || 'Shared User');
    }
  }, []);

  const handleDisconnectSharedSession = async () => {
    const backup = localStorage.getItem('mangalore_original_user');
    if (!backup) return;

    try {
      const originalUser = JSON.parse(backup);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('mangalore_session_token') || '';
      const res = await fetch(`${API_URL}/api/user-data?email=${encodeURIComponent(originalUser.email.toLowerCase())}&requestorEmail=${encodeURIComponent(originalUser.email.toLowerCase())}&token=${encodeURIComponent(token)}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (window.__setSyncLoading) window.__setSyncLoading(true);
        
        localStorage.setItem('mangalore_user_name', data.name || '');
        localStorage.setItem('mangalore_user_email', data.email);
        localStorage.setItem('mangalore_user_phone', data.phone || '');
        localStorage.setItem('mangalore_user_squad_size', data.squadSize || '4');
        localStorage.setItem('mangalore_user_expedition_days', data.expeditionDays || '5');
        localStorage.setItem('mangalore_session_token', originalUser.sessionToken || '');
        localStorage.setItem('mangalore_saved_circuits', data.savedCircuits || '[]');
        localStorage.setItem('mangalore_circuit_history', data.circuitHistory || '[]');
        localStorage.setItem('mangalore_favorites', data.favorites || '[]');
        
        localStorage.removeItem('mangalore_original_user');
        
        if (window.__setSyncLoading) window.__setSyncLoading(false);
        
        window.location.reload();
      }
    } catch (err) {
      console.warn("Failed to disconnect session:", err);
      localStorage.removeItem('mangalore_original_user');
      window.location.reload();
    }
  };

  const handleExplore = (e) => {
    e.preventDefault();
    setIsLaunching(true);
  };

  return (
    <div className="min-h-screen bg-amazon-navy text-white flex flex-col font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden relative">
      
      {/* Active Shared Session Banner */}
      {hasSharedSession && (
        <div className="w-full bg-gradient-to-r from-amazon-orange/95 via-amazon-yellow to-amazon-orange/95 backdrop-blur-md py-3 px-8 flex justify-between items-center z-[100] text-amazon-navy border-b border-amazon-orange/30 font-bold sticky top-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-amazon-navy text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shrink-0">
              Shared Mode
            </span>
            <p className="text-xs font-black tracking-wide leading-none">
              ⚡ CONNECTED TO SHARE: You are viewing and editing {sharedEmail}'s planner.
            </p>
          </div>
          <button 
            onClick={handleDisconnectSharedSession}
            className="px-4 py-1.5 bg-amazon-navy hover:bg-[#232f3e] text-white hover:text-amazon-yellow text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 shrink-0"
          >
            Disconnect & Return
          </button>
        </div>
      )}

      {/* Floating Top Header */}
      <nav className={`absolute left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-transparent ${hasSharedSession ? 'top-10 md:top-12' : 'top-0'}`}>
        <div className="flex items-center gap-3 text-white font-black text-xl tracking-tight select-none">
          <span className="text-amazon-yellow">MANGLORE</span>.NAV
        </div>
        <div className="flex items-center gap-6">
          <Link to="/saved-circuits" className="text-white/70 hover:text-amazon-yellow text-xs font-black uppercase tracking-widest transition-colors no-underline flex items-center gap-1.5">
            <Bookmark className="w-4 h-4" /> Saved Circuits
          </Link>
          <Link to="/history" className="text-white/70 hover:text-amazon-yellow text-xs font-black uppercase tracking-widest transition-colors no-underline flex items-center gap-1.5">
            <History className="w-4 h-4" /> History Log
          </Link>
          <Link to="/account" className="text-white/70 hover:text-amazon-yellow text-xs font-black uppercase tracking-widest transition-colors no-underline flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-amazon-yellow/50 px-4 py-2 rounded-2xl">
            <User className="w-4 h-4 text-amazon-yellow" /> Account
          </Link>
        </div>
      </nav>

      {/* ── Immersive Hero Section ── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1590059393160-5627f1234988?auto=format&fit=crop&q=80&w=2000" 
            alt="Mangalore Coastal View" 
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amazon-navy/70 via-amazon-navy/90 to-amazon-navy"></div>
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none animate-bg-slide" style={{ opacity: 0.70 }} />
        </div>

        {/* Floating Particles Background Drawings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {/* Floating Icons */}
          <FloatingParticle delay={0} duration={18} left={8} size={24} icon={Waves} color="#38bdf8" />
          <FloatingParticle delay={3} duration={20} left={22} size={20} icon={Compass} color="#febd69" />
          <FloatingParticle delay={6} duration={15} left={40} size={26} icon={Landmark} color="#f0c14b" />
          <FloatingParticle delay={1} duration={24} left={60} size={22} icon={Plane} color="#38bdf8" />
          <FloatingParticle delay={4} duration={19} left={78} size={18} icon={Sparkles} color="#febd69" />
          <FloatingParticle delay={7} duration={17} left={92} size={25} icon={Star} color="#f59e0b" />
          
          {/* Floating Words (Dakshina Kannada Themes) */}
          <FloatingParticle delay={2} duration={22} left={15} size="14px" text="COASTAL" color="#38bdf8" />
          <FloatingParticle delay={5} duration={25} left={33} size="12px" text="CULINARY" color="#febd69" />
          <FloatingParticle delay={8} duration={21} left={50} size="13px" text="EXPEDITIONS" color="#f0c14b" />
          <FloatingParticle delay={3.5} duration={23} left={68} size="12px" text="HERITAGE" color="#38bdf8" />
          <FloatingParticle delay={9} duration={26} left={85} size="14px" text="ADVENTURES" color="#febd69" />
          <FloatingParticle delay={11} duration={19} left={12} size="11px" text="RITUALS" color="#f59e0b" />
          <FloatingParticle delay={13} duration={24} left={45} size="15px" text="KUDLA" color="#a855f7" />
          <FloatingParticle delay={15} duration={27} left={75} size="13px" text="TULUNADU" color="#ec4899" />
          <FloatingParticle delay={17} duration={23} left={28} size="16px" text="MANGALORE" color="#38bdf8" />
          <FloatingParticle delay={20} duration={25} left={62} size="12px" text="NAV" color="#f0c14b" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full mb-10 border border-white/20 animate-in fade-in slide-in-from-top duration-700">
            <span className="w-2 h-2 bg-amazon-yellow rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amazon-yellow">Explore the Gateway to Karnataka</span>
          </div>
          
          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] animate-in zoom-in duration-700 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">MANGLORE</span><br/>
            <span className="bg-gradient-to-r from-amazon-yellow to-amazon-orange bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(254,189,105,0.45)]">NAV</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/70 max-w-3xl mb-16 font-bold leading-relaxed animate-in fade-in duration-1000 delay-300">
            Discover the perfect blend of coastal serenity, spiritual heritage, and vibrant local culture. Your premium guide to the Port City.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom duration-700 delay-500">
            <button 
              onClick={handleExplore}
              className="group bg-amazon-yellow text-amazon-navy px-12 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(254,189,105,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Start Your Expedition
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <Link 
              to="/culture" 
              className="px-12 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest text-white border-2 border-white/10 hover:bg-white/5 transition-all flex items-center gap-4"
            >
              <Landmark className="w-5 h-5 text-amazon-yellow" />
              Heritage Archive
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-35 pointer-events-none w-full max-w-4xl px-6">
           <div className="flex flex-col items-center gap-1">
              <Waves className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Coastal</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <Utensils className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Culinary</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <Landmark className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Heritage</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <Plane className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Expeditions</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <Compass className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Adventures</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-7 h-7 text-amazon-yellow mb-1 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-white/70">Rituals</span>
           </div>
        </div>
      </div>

      {/* ── Strategic Highlights Section ── */}
      <section className="py-32 px-6 bg-white text-amazon-navy relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
            <div className="space-y-6">
              <div className="w-16 h-2 bg-amazon-orange rounded-full" />
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-black">
                SELECT YOUR<br/><span className="text-amazon-orange">EXPERIENCE</span>
              </h2>
            </div>
            <p className="max-w-md text-lg font-bold text-gray-500 leading-relaxed">
              Curated expedition modules designed for deep sector immersion. Choose your objective and launch the navigator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXPERIENCE_THEMES.map((theme, idx) => (
              <Link 
                key={theme.id}
                to={`/map?theme=${theme.id}`}
                className="group relative h-[550px] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-4"
              >
                <div className="absolute inset-0">
                   <img 
                    src={theme.image}
                    alt={theme.label}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy via-amazon-navy/20 to-transparent" />
                </div>

                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                   <div className="mb-8 transform transition-transform duration-500 group-hover:-translate-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-amazon-yellow shadow-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                       {theme.icon === 'Sparkles' ? <Zap className="w-10 h-10 text-amazon-navy" /> : 
                        theme.icon === 'Camera' ? <Camera className="w-10 h-10 text-amazon-navy" /> :
                        theme.icon === 'Compass' ? <Compass className="w-10 h-10 text-amazon-navy" /> :
                        theme.icon === 'Mountain' ? <Waves className="w-10 h-10 text-amazon-navy" /> :
                        theme.icon === 'Leaf' ? <CheckCircle className="w-10 h-10 text-amazon-navy" /> :
                        theme.icon === 'Music' ? <Music className="w-10 h-10 text-amazon-navy" /> :
                        <Utensils className="w-10 h-10 text-amazon-navy" />}
                    </div>
                    <h4 className="text-4xl font-black text-white mb-3 tracking-tight">{theme.label}</h4>
                    <p className="text-amazon-yellow text-xs font-black uppercase tracking-[0.3em]">{theme.desc}</p>
                  </div>
                  
                  <div className="pt-8 border-t border-white/20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <span className="text-xs font-black text-amazon-yellow uppercase tracking-widest">Launch Module</span>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                       <ArrowRight className="w-6 h-6 text-amazon-navy" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hidden Gems Discovery ── */}
      <section className="py-32 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amazon-yellow/40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amazon-orange/10 rounded-full flex items-center justify-center mb-8 animate-pulse border-2 border-amazon-orange/20">
            <Sparkles className="w-10 h-10 text-amazon-orange" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-tight">
            UNMAP THE <span className="text-amazon-orange">UNDERRATED?</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-bold leading-relaxed mb-12">
            Our sensors have detected several "Hidden Gem" frequencies within the Kudla sector. These nodes are off the typical tourist grid. Do you wish to investigate?
          </p>
          
          <Link 
            to="/hidden-gems" 
            className="group relative inline-flex items-center gap-6 px-16 py-8 bg-amazon-yellow text-amazon-navy rounded-full font-black text-2xl uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(254,189,105,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <div className="absolute -inset-1 bg-amazon-yellow rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <span className="relative">YES, DISCOVER SECRETS</span>
            <ArrowRight className="w-8 h-8 relative group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Mobility & Tours Section ── */}
      <section className="py-32 px-6 bg-white text-amazon-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-6">
              <div className="w-16 h-2 bg-amazon-orange rounded-full" />
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-black">
                MOBILITY &<br/><span className="text-amazon-orange">GUIDED TOURS</span>
              </h2>
            </div>
            <p className="max-w-md text-lg font-bold text-gray-500 leading-relaxed">
              Whether you want the freedom of your own wheels or the structured expertise of a KSRTC package, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rentals Card */}
            <Link 
              to="/rentals"
              className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-amazon-orange/20 transition-all duration-700 hover:-translate-y-2 flex flex-col justify-end p-10"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200" 
                  alt="Vehicle Rentals"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy via-amazon-navy/40 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-amazon-yellow flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <Plane className="w-8 h-8 text-amazon-navy" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">Vehicle Rentals</h3>
                <p className="text-amazon-yellow text-xs font-black uppercase tracking-widest mb-6">2-Wheelers & 4-Wheelers</p>
                <div className="inline-flex items-center gap-3 text-white font-bold text-sm bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 group-hover:bg-amazon-yellow group-hover:text-amazon-navy group-hover:border-amazon-yellow transition-all">
                  Browse Fleet <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Packages Card */}
            <Link 
              to="/packages"
              className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-amazon-orange/20 transition-all duration-700 hover:-translate-y-2 flex flex-col justify-end p-10"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1547989453-11e67ffb3885?auto=format&fit=crop&q=80&w=1200" 
                  alt="Tour Packages"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy via-amazon-navy/40 to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-amazon-orange flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black text-white mb-2">Curated Packages</h3>
                <p className="text-amazon-orange text-xs font-black uppercase tracking-widest mb-6">KSRTC & Private Agencies</p>
                <div className="inline-flex items-center gap-3 text-white font-bold text-sm bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 group-hover:bg-amazon-orange group-hover:border-amazon-orange transition-all">
                  View Itineraries <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ready to Explore Section ── */}
      <section className="py-40 px-6 relative bg-amazon-navy overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amazon-yellow rounded-full blur-[150px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amazon-orange rounded-full blur-[150px] animate-pulse-slow" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-[8rem] font-black text-white mb-12 leading-tight tracking-tighter">
            READY FOR<br/><span className="text-amazon-yellow">DEPARTURE?</span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/60 text-xl font-bold leading-relaxed mb-16">
            Join thousands of explorers mapping the coastal sector. Real-time pathfinding, cultural insights, and culinary destinations await.
          </p>
          <div className="flex gap-4 items-center justify-center">
            <button 
              onClick={handleExplore}
              className="px-8 py-4 bg-amazon-yellow text-amazon-navy rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-colors"
            >
              Start Explorer Mode
            </button>
            <Link to="/culture" className="px-8 py-4 border-2 border-white/20 rounded-full font-black text-sm uppercase tracking-widest hover:border-amazon-yellow hover:text-amazon-yellow transition-colors">
              Culture Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ── Premium Footer ── */}
      <footer className="bg-black py-20 text-center relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col items-center gap-10 mb-20">
              <div className="flex items-center gap-4 text-white font-black text-4xl">
                 <span className="text-amazon-yellow tracking-tighter">MANGLORE</span>.NAV
              </div>
               <div className="flex gap-12 text-white/40 text-xs font-black uppercase tracking-widest flex-wrap justify-center">
                  <Link to="/map?theme=coastal" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">Coastal</Link>
                  <Link to="/culture" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">Heritage</Link>
                  <Link to="/map?theme=taste" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">Culinary</Link>
                  <Link to="/map?theme=adventure" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">Adventure</Link>
                  <Link to="/saved-circuits" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">Saved Circuits</Link>
                  <Link to="/history" className="hover:text-amazon-yellow transition-colors text-white/40 no-underline">History Log</Link>
               </div>
           </div>
           <p className="font-black text-[10px] text-white/20 uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} MANGLORE.NAV. ALL SYSTEMS OPERATIONAL.</p>
        </div>
        <ChatAssistant 
          locations={locations} 
          activeTab="explore"
        />

        {/* Mascot */}
        <Mascot isLaunching={isLaunching} onLaunchComplete={() => navigate('/map')} />
      </footer>
    </div>
  );
}
