import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Play, Pause, Sun, Moon, RotateCcw, 
  Sparkles, Compass, MapPin, Target, Landmark, Waves, 
  HelpCircle, ShieldAlert, Clock, Globe, Briefcase, Zap, 
  DollarSign, TrendingUp, Users, Award, Percent, Printer,
  Layers, ChevronRight, ChevronLeft, Map, BarChart2, Star, Check
} from 'lucide-react';

/* ─── THEME CONFIGURATIONS ─── */
const themes = {
  coastal: {
    name: 'Coastal Breeze',
    bg: 'bg-[#080d19]',
    text: 'text-white',
    primary: '#06b6d4', // cyan
    accent: '#f59e0b', // amber
    gradient: 'from-cyan-900/30 via-slate-900/80 to-slate-900/95',
    cardBg: 'bg-white/[0.04]',
    cardBorder: 'border-white/10',
    highlight: 'text-cyan-400',
    accentText: 'text-amber-400',
    btnBg: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950',
    dotColor: 'bg-cyan-500',
    orbitGradient: 'from-cyan-500/10 to-blue-500/10',
    matrixPoint: 'bg-cyan-500'
  },
  sunset: {
    name: 'Sunset Glow',
    bg: 'bg-[#140b18]',
    text: 'text-white',
    primary: '#ec4899', // pink
    accent: '#f97316', // orange
    gradient: 'from-pink-900/20 via-slate-950/80 to-slate-950/95',
    cardBg: 'bg-white/[0.03]',
    cardBorder: 'border-white/5',
    highlight: 'text-pink-400',
    accentText: 'text-orange-400',
    btnBg: 'bg-pink-500 hover:bg-pink-600 text-white',
    dotColor: 'bg-pink-500',
    orbitGradient: 'from-pink-500/10 to-orange-500/10',
    matrixPoint: 'bg-pink-500'
  },
  emerald: {
    name: 'Forest Coast',
    bg: 'bg-[#050f0c]',
    text: 'text-white',
    primary: '#10b981', // emerald
    accent: '#10b981', // emerald
    gradient: 'from-emerald-950/30 via-[#030a08]/90 to-[#030a08]',
    cardBg: 'bg-white/[0.04]',
    cardBorder: 'border-emerald-500/10',
    highlight: 'text-emerald-400',
    accentText: 'text-teal-300',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950',
    dotColor: 'bg-emerald-500',
    orbitGradient: 'from-emerald-500/10 to-teal-500/10',
    matrixPoint: 'bg-emerald-500'
  }
};

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTheme, setActiveTheme] = useState('coastal');
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = themes[activeTheme];
  
  const deckRef = useRef(null);
  const TOTAL_SLIDES = 10;

  /* Autoplay Loop */
  useEffect(() => {
    let timer;
    if (isAutoplay) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isAutoplay]);

  /* Keyboard Navigation */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Fullscreen Control */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  /* Slide Transitions */
  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  /* ────────────────────────────────────────────────────────
     INTERACTIVE COMPONENT STATES
     ──────────────────────────────────────────────────────── */
  // Slide 4: Market TAM/SAM/SOM Selector
  const [marketTier, setMarketTier] = useState('som');

  // Slide 5: Revenue Projection Calculator
  const [monthlyBookings, setMonthlyBookings] = useState(2500);
  const [avgTicketPrice, setAvgTicketPrice] = useState(1500);
  const [commissionRate, setCommissionRate] = useState(12);
  const [businessPartners, setBusinessPartners] = useState(80);

  // Computed projections
  const monthlyBookingVol = monthlyBookings * avgTicketPrice;
  const monthlyCommissionRev = monthlyBookingVol * (commissionRate / 100);
  const monthlySubscriptionRev = businessPartners * 1500; // Average ₹1500 subscription revenue per month
  const totalMonthlyRevenue = monthlyCommissionRev + monthlySubscriptionRev;
  const projectedAnnualRevenue = totalMonthlyRevenue * 12;

  // Slide 6: Traction Timeline
  const [activeTimelineNode, setActiveTimelineNode] = useState(2); // Initial Q3 Walk
  const timelineData = [
    { title: 'Q1 Wireframes', status: '100% Completed', desc: 'Comprehensive tourism website and mobile app mockups fully validated with user testing.' },
    { title: 'Q2 Partnerships', status: 'Completed', desc: 'Over 15 early hotel partnerships and 5 premium tour agencies signed via Letters of Intent.' },
    { title: 'Q3 Heritage Walk', status: 'Pilot Launching', desc: 'Designed, test-run, and highly rated "Kudla Heritage & Food Trail" with 4.9/5 stars.' },
    { title: 'Q4 Social Launch', status: 'Active Community', desc: 'Reaching 3,000+ organic travel enthusiasts across Instagram and WhatsApp newsletter.' }
  ];

  // Slide 7: GTM Funnel Selector
  const [gtmChannel, setGtmChannel] = useState('partnerships');
  const gtmChannels = {
    social: { title: 'Social & Influencers', desc: 'Partnering with travel micro-influencers from Bengaluru and Kerala to showcase the scenic coastal rail route, beaches, and food. Run YouTube shorts and Instagram campaigns.', impact: 'High awareness and rapid community growth.' },
    partnerships: { title: 'Colleges & Corporates', desc: 'Tailoring budget-friendly student getaway packages for NITK Surathkal, Manipal Academy, and corporate retreats for Bengaluru-based IT companies.', impact: 'Steady bulk booking volumes during weekends.' },
    organic: { title: 'Google Maps & SEO', desc: 'Aggressive local SEO mapping out hidden gems like bioluminescent beaches and Sasihithlu surf waves, capturing long-tail travel planning keywords.', impact: 'Highest ROI, consistent zero-cost organic leads.' },
    alliances: { title: 'Government & Dasara', desc: 'Collaborating with KSTDC/Tourism department. Curating exclusive, high-ticket culture passes during the iconic 800-year-old Mangaluru Dasara festival.', impact: 'Authentic local authority & premium sponsorships.' }
  };

  // Slide 8: Competitor Matrix Selector
  const [selectedComp, setSelectedComp] = useState('discover');
  const competitors = {
    discover: { name: 'manglore.nav', focus: '100% Hyperlocal', itineraries: 'AI Custom & Interactive', connection: 'Deep local ties & unique heritage packages', cost: 'Affordable (Free planner, commissions from bookings)' },
    makemytrip: { name: 'MakeMyTrip', focus: 'Generic National', itineraries: 'Static predefined packages', connection: 'Transactional hotel booking agent', cost: 'Standard price, generic markup commissions' },
    tripadvisor: { name: 'TripAdvisor', focus: 'Global Directories', itineraries: 'User-review forums only', connection: 'No active local operations or guides', cost: 'Free listings with heavy external advertising' },
    local: { name: 'Local Travel Agencies', focus: 'Regional (Manual)', itineraries: 'Fixed offline tours only', connection: 'Traditional operators', cost: 'High manual quotes, slow bookings' }
  };

  return (
    <div ref={deckRef} className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-500 select-none flex flex-col justify-between overflow-x-hidden font-sans relative`}>
      {/* ─── PRINT CONTENT (Hidden on screen, shown in print) ─── */}
      <div className="hidden print:block bg-white text-black p-0 m-0">
        <PrintLayout theme={theme} />
      </div>

      {/* ─── SCREEN PRESENTATION SHELL ─── */}
      <div className="flex-1 flex flex-col justify-between print:hidden">
        
        {/* UPPER CONTROLS & HEADER */}
        <header className="sticky top-0 z-50 bg-[#080d19]/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 group transition-all">
              <ArrowLeft className="w-5 h-5 text-white/80 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-[#06b6d4]">Startup Pitch Deck</span>
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Coastal Connect
              </span>
            </div>
          </div>

          {/* Core Deck Controls */}
          <div className="flex items-center gap-2">
            
            {/* Theme Selector */}
            <div className="flex items-center bg-white/[0.04] p-1.5 rounded-full border border-white/10 gap-1 mr-2">
              {Object.keys(themes).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTheme(key)}
                  className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${
                    activeTheme === key 
                      ? themes[key].btnBg + ' scale-105 shadow-md' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {themes[key].name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Slide Count */}
            <div className="bg-white/[0.04] border border-white/10 text-xs px-4 py-2 rounded-full font-black text-cyan-400">
              {String(currentSlide + 1).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
            </div>

            {/* Autoplay */}
            <button 
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`p-2 rounded-full border border-white/10 transition-all ${isAutoplay ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
              title="Toggle Auto Play"
            >
              {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Print / PDF Export */}
            <button 
              onClick={handlePrint}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title="Export as Landscape PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all hidden md:block"
              title="Toggle Fullscreen"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ACTIVE SLIDE CONTAINER */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
          
          {/* Animated Themed Radial Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full blur-[150px] opacity-15 bg-gradient-to-br ${theme.orbitGradient}`} />
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          </div>

          <div className="w-full max-w-7xl relative z-10 transition-all duration-500 ease-in-out h-full flex flex-col justify-center">
            
            {/* SLIDE 1: TITLE SLIDE */}
            {currentSlide === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 animate-in fade-in duration-500">
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">Team Coastal Connect Presents</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white">
                    MANGLORE <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(6,182,212,0.35)]">
                      .NAV
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-widest leading-relaxed">
                    "Where Culture Meets the Coast."
                  </p>

                  <p className="text-sm md:text-lg text-white/50 max-w-xl font-bold leading-relaxed">
                    An investor-ready, hyper-focused digital travel ecosystem unlocking the hidden tourism gems and rich coastal heritage of Karnataka, India.
                  </p>

                  <div className="pt-4 flex items-center gap-4">
                    <button onClick={nextSlide} className="px-8 py-4 bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                      View Pitch Deck <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Press Space or Right Arrow</span>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  {/* Decorative glowing back ring */}
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-[3rem] blur-2xl rotate-3 pointer-events-none" />
                  
                  <div className="relative border border-white/10 p-4 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                    <img 
                      src="https://images.unsplash.com/photo-1590059393160-5627f1234988?auto=format&fit=crop&q=80&w=600" 
                      alt="Mangaluru Coastline"
                      className="w-full h-80 object-cover rounded-[2.5rem] grayscale-[30%] hover:grayscale-0 transition-all duration-700 shadow-md"
                    />
                    <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-400 text-slate-900 rounded-lg flex items-center justify-center font-black">
                          🌊
                        </div>
                        <div>
                          <p className="text-white text-xs font-black">Panambur Beach & Temples</p>
                          <p className="text-white/40 text-[9px] font-bold">Mangaluru, Karnataka, India</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: THE PROBLEM */}
            {currentSlide === 1 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Market Friction & Pain Points
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">The Tourist & Local Business Gap</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 02</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { icon: Layers, title: 'No Consolidated Platform', desc: 'Tourists struggle to plan, booking hotels on one site, transport on another, and finding local experiences across outdated blogs.' },
                      { icon: HelpCircle, title: 'Hidden Gems Undiscovered', desc: 'Beautiful sites like Sasihithlu Surf Beach, backwaters, and pristine basadis remain completely off the standard tourist radar.' },
                      { icon: Clock, title: 'Short Trip Planning Hurdle', desc: 'Travelers from Bengaluru or Kerala find it difficult to map out efficient, time-saving 2-day itineraries for weekend trips.' },
                      { icon: Globe, title: 'Fragmented Tourism Info', desc: 'Critical travel information is scattered across 10+ government and private agency sites, many lacking real-time updates.' }
                    ].map((p, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-white/[0.04] p-6 rounded-[2rem] transition-all duration-300 group flex gap-4 text-left">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/10 group-hover:scale-110 transition-transform">
                          <p.icon className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors mb-2">{p.title}</h3>
                          <p className="text-xs text-white/50 leading-relaxed font-bold">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-4 bg-gradient-to-b from-red-950/20 via-slate-900/40 to-slate-900 border border-red-950/30 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4">Immediate Investor Impact</h4>
                      <p className="text-sm font-bold text-white/70 leading-relaxed">
                        Due to these massive operational gaps, visitors experience immense friction. This directly leads to:
                      </p>
                    </div>

                    <div className="space-y-6 my-8">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-red-400">-30%</div>
                        <div className="text-xs font-extrabold text-white/50 uppercase tracking-wider">Average Tourist Spending</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-red-400">-2.5 Days</div>
                        <div className="text-xs font-extrabold text-white/50 uppercase tracking-wider">Shorter Visitor Stays</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-red-400">LOST</div>
                        <div className="text-xs font-extrabold text-white/50 uppercase tracking-wider">Local Business Opportunities</div>
                      </div>
                    </div>

                    <div className="text-[10px] font-black text-red-400/80 uppercase tracking-widest bg-red-500/5 border border-red-500/10 px-4 py-2.5 rounded-xl text-center">
                      We bridges this gap natively.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: THE SOLUTION */}
            {currentSlide === 2 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> Platform Showcase
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">manglore.nav Platform</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 03</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <p className="text-lg font-bold text-white/70 leading-relaxed">
                      A robust digital ecosystem that streamlines the entire coastal travel lifecycle—from inspiration and customized planning to bookings and on-ground exploration.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Personalized AI Itineraries', desc: 'Algorithmic route building aligned with budget, travel type, and preferred vibes.' },
                        { title: 'Guided Local Tourism Trails', desc: 'Food tasting, ocean surfing, temple architecture, and private beach walks.' },
                        { title: 'Full Booking Integration', desc: 'Single-checkout rentals, local homestays, tables, and bus tickets.' },
                        { title: 'Lesser-Known Promotion', desc: 'Empowering regional artisans, homestays, and local coastal guides.' },
                        { title: 'Multilingual Accessibility', desc: 'Full support in Kannada, English, Hindi, and Tulu for all tourists.' }
                      ].map((s, idx) => (
                        <div key={idx} className="flex gap-3 bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 p-4 rounded-2xl transition-all">
                          <div className="w-7 h-7 bg-cyan-400/10 text-cyan-400 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/10 mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{s.title}</h4>
                            <p className="text-[11px] font-bold text-white/40 leading-relaxed mt-1">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    {/* Simulated Mobile Mockup */}
                    <div className="absolute inset-0 bg-cyan-500/5 rounded-[2.5rem] blur-2xl pointer-events-none" />
                    
                    <div className="relative max-w-sm mx-auto bg-[#0d1628] border-4 border-slate-800 rounded-[3rem] shadow-2xl p-6 overflow-hidden">
                      {/* Top notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl flex items-center justify-center">
                        <div className="w-12 h-1.5 bg-slate-900 rounded-full" />
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between mt-4 mb-6 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                          <span className="text-xs font-black uppercase tracking-wider text-white">manglore.nav</span>
                        </div>
                        <span className="text-[9px] bg-cyan-400 text-slate-900 px-2 py-0.5 rounded-full font-black">ACTIVE</span>
                      </div>

                      {/* Simulated Screen Body */}
                      <div className="space-y-4 text-left">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Custom Weekend Circuit</p>
                          <h5 className="text-sm font-black text-white mt-1">Culture & Surf Combo</h5>
                          <div className="flex items-center gap-1.5 mt-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] text-white/60 font-bold">Kudroli Temple → Surf School</span>
                          </div>
                        </div>

                        {/* Itinerary Stops */}
                        <div className="space-y-3 relative pl-4 border-l border-cyan-500/20 ml-2 py-1">
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 bg-cyan-400 rounded-full ring-4 ring-cyan-400/20" />
                            <p className="text-[10px] font-black text-white leading-tight">Stop 1: Mangaladi Heritage Lunch</p>
                            <p className="text-[9px] text-white/40 font-bold">Authentic Neer Dosa & Ghee Roast</p>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-6 top-1 w-3 h-3 bg-amber-400 rounded-full ring-4 ring-amber-400/20" />
                            <p className="text-[10px] font-black text-white leading-tight">Stop 2: Sasihithlu Wave Ride</p>
                            <p className="text-[9px] text-white/40 font-bold">Guided surfing lesson with instructor</p>
                          </div>
                        </div>

                        {/* Booking Card */}
                        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-2xl p-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-white/40">Total Guided Pass</p>
                            <p className="text-sm font-black text-cyan-400">₹1,499 / person</p>
                          </div>
                          <button className="bg-cyan-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-lg">
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: MARKET OPPORTUNITY */}
            {currentSlide === 3 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" /> Market Potential
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Millions of Coastal Travelers</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 04</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <p className="text-lg font-bold text-white/70 leading-relaxed">
                      Coastal Karnataka represents one of India's fastest growing tourism belts, drawing visitors from high-income urban hubs looking for micro-holidays.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-4xl font-black text-cyan-400">7.2%</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-2">India GDP Tourism Share</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-4xl font-black text-cyan-400">200M+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-2">Annual Domestic Travelers (KA)</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-4xl font-black text-amber-400">10M+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-2">Coastal Region Visitors</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-4xl font-black text-amber-400">150%</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-2">Growth in Digital Travel Apps</div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 text-left space-y-6">
                    <h3 className="text-xl font-black text-white">Target Addressable Market Breakdown</h3>
                    
                    {/* Interactive TAM/SAM/SOM Chips */}
                    <div className="flex gap-2">
                      {[
                        { id: 'tam', label: 'TAM (All India)', value: '₹12,000 Cr', desc: 'All digital travel planning, local hotel reservations, and experience bookings nationwide.' },
                        { id: 'sam', label: 'SAM (Karnataka Coast)', value: '₹800 Cr', desc: 'Targeting hotel commissions, rentals, and organized local tours in Coastal Karnataka.' },
                        { id: 'som', label: 'SOM (manglore.nav)', value: '₹45 Cr', desc: 'Capturing 15% booking commission market share in Mangaluru within 36 months.' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setMarketTier(t.id)}
                          className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                            marketTier === t.id 
                              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-xl' 
                              : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <p className="text-[10px] font-black text-white/45 uppercase tracking-wider">{t.label}</p>
                          <p className="text-lg font-black text-white mt-1">{t.value}</p>
                        </button>
                      ))}
                    </div>

                    {/* Explanatory Tier card */}
                    <div className="bg-[#0b1322] border border-white/10 rounded-3xl p-6 min-h-36 flex flex-col justify-center">
                      {marketTier === 'tam' && (
                        <div className="animate-in fade-in duration-300">
                          <h4 className="text-base font-black text-cyan-400 uppercase tracking-widest">TAM: Total Addressable Market</h4>
                          <p className="text-sm font-bold text-white/60 leading-relaxed mt-2">
                            The massive Indian digital travel market valued at over **₹12,000 Crores**. Rapid digitization, smartphone penetrations, and growing weekend travel trends fuel this segment.
                          </p>
                        </div>
                      )}
                      {marketTier === 'sam' && (
                        <div className="animate-in fade-in duration-300">
                          <h4 className="text-base font-black text-cyan-400 uppercase tracking-widest">SAM: Serviceable Addressable Market</h4>
                          <p className="text-sm font-bold text-white/60 leading-relaxed mt-2">
                            Targeting Coastal Karnataka (Mangaluru, Udupi, Karwar, and Gokarna) which attracts millions of weekenders, religious pilgrims, and surfers, generating **₹800 Crores** of addressable revenue.
                          </p>
                        </div>
                      )}
                      {marketTier === 'som' && (
                        <div className="animate-in fade-in duration-300">
                          <h4 className="text-base font-black text-amber-400 uppercase tracking-widest">SOM: Serviceable Obtainable Market (Our Share)</h4>
                          <p className="text-sm font-bold text-white/60 leading-relaxed mt-2">
                            Our projected Year 3 share: capturing **₹45 Crores** in booking commission volume via manglore.nav by focusing heavily on hyperlocal, high-retention tourist workflows.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5: BUSINESS MODEL */}
            {currentSlide === 4 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-cyan-400" /> Revenue & Economics
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Five Lucrative Revenue Streams</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 05</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Side: Streams */}
                  <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                    {[
                      { num: '1', title: 'Hotel & Rental Commission (10-15%)', desc: 'Charged on hotels, home-stays, vehicles, and active boat tour operators.' },
                      { num: '2', title: 'Premium Guided Packages', desc: 'High-ticket tours (₹999 to ₹4,999/person) for heritage walks, marine sports.' },
                      { num: '3', title: 'Featured Business Subscriptions', desc: 'Prominent advertising placement for local restaurants, cafes, and shops.' },
                      { num: '4', title: 'Local Brand Sponsorships', desc: 'Strategic ad partnerships with local brands, cab operators, and events.' },
                      { num: '5', title: 'Corporate & School Outings', desc: 'Bulk custom packages for corporate team retreats and collegiate study tours.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-cyan-500/10 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                          {item.num}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{item.title}</h4>
                          <p className="text-[11px] font-bold text-white/40 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Side: Interactive Earnings Calculator */}
                  <div className="lg:col-span-6 bg-gradient-to-br from-slate-900/60 to-[#0e162a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-3 py-1 rounded-full uppercase tracking-wider">Investor Tool</span>
                        <h3 className="text-lg font-black text-white">Live Year 1 Earnings Calculator</h3>
                      </div>
                      
                      {/* Sliders Container */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-white/60">
                            <span>Monthly Bookings (Total Trips)</span>
                            <span className="text-cyan-400 font-extrabold">{monthlyBookings.toLocaleString()}</span>
                          </div>
                          <input 
                            type="range" 
                            min="500" 
                            max="10000" 
                            step="500"
                            value={monthlyBookings}
                            onChange={(e) => setMonthlyBookings(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-white/60">
                            <span>Avg Ticket Price (₹)</span>
                            <span className="text-cyan-400 font-extrabold">₹{avgTicketPrice}</span>
                          </div>
                          <input 
                            type="range" 
                            min="500" 
                            max="5000" 
                            step="250"
                            value={avgTicketPrice}
                            onChange={(e) => setAvgTicketPrice(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-white/60">
                            <span>Commission Rate (%)</span>
                            <span className="text-cyan-400 font-extrabold">{commissionRate}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="20" 
                            step="1"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-white/60">
                            <span>Local Business Listing Partners</span>
                            <span className="text-cyan-400 font-extrabold">{businessPartners}</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="200" 
                            step="10"
                            value={businessPartners}
                            onChange={(e) => setBusinessPartners(Number(e.target.value))}
                            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Projections Reveal */}
                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Est. Monthly Revenue</p>
                        <p className="text-2xl font-black text-cyan-400 mt-1">₹{Math.round(totalMonthlyRevenue).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Est. Year 1 ARR</p>
                        <p className="text-2xl font-black text-amber-400 mt-1">₹{Math.round(projectedAnnualRevenue).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 6: TRACTION */}
            {currentSlide === 5 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-cyan-400" /> Milestones & Prototypes
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Prototype & Year 1 Growth</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 06</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Interactive Timeline */}
                  <div className="lg:col-span-8 flex flex-col justify-between py-2 text-left">
                    <div>
                      <h3 className="text-xl font-black text-white mb-6">Execution & Timeline Roadmap</h3>
                      
                      <div className="relative pl-6 border-l border-white/10 space-y-6">
                        {timelineData.map((node, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveTimelineNode(i)}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                              activeTimelineNode === i ? 'scale-[1.02] pl-2' : 'opacity-55 hover:opacity-90'
                            }`}
                          >
                            {/* Marker dot */}
                            <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 transition-all ${
                              activeTimelineNode === i ? 'bg-cyan-400 scale-125' : 'bg-white/30'
                            }`} />
                            
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">{node.title}</h4>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-cyan-400 px-2.5 py-0.5 rounded-full">
                                {node.status}
                              </span>
                            </div>
                            
                            {activeTimelineNode === i && (
                              <p className="text-xs font-bold text-white/50 mt-2 leading-relaxed max-w-xl animate-in fade-in slide-in-from-left-2 duration-300">
                                {node.desc}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Targets */}
                  <div className="lg:col-span-4 bg-gradient-to-b from-slate-900/40 to-slate-950/80 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Projected Year 1 Goals</h4>
                      <p className="text-sm font-bold text-white/60 leading-relaxed mb-6">
                        Backed by initial feedback from local heritage walks and pilot operator registrations.
                      </p>
                    </div>

                    <div className="space-y-6 my-auto">
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
                          👤
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">5,000+</p>
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Registered Active Users</p>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
                          🎫
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">500+</p>
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Completed Paid Bookings</p>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
                          🏢
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">50+</p>
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Business Partners</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center pt-4">
                      Roadmap to regional dominance.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 7: GO-TO-MARKET STRATEGY */}
            {currentSlide === 6 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" /> Marketing Funnel
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Sleek Customer Acquisition</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 07</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Acquisition Channels Selector */}
                  <div className="lg:col-span-7 flex flex-col justify-between py-2 text-left">
                    <div className="space-y-4">
                      <p className="text-sm md:text-base font-bold text-white/60 leading-relaxed">
                        We deploy a multi-channel acquisition strategy, leveraging local content marketing and smart corporate tie-ups to acquire users at zero to low acquisition costs.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        {Object.keys(gtmChannels).map((key) => (
                          <div
                            key={key}
                            onClick={() => setGtmChannel(key)}
                            className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                              gtmChannel === key 
                                ? 'bg-cyan-500/10 border-cyan-500/30 scale-[1.02]' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                            }`}
                          >
                            <h4 className="text-sm font-black text-white">{gtmChannels[key].title}</h4>
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-2">Selected Channel</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Channel Impact Details */}
                  <div className="lg:col-span-5 bg-[#0b1322] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <div className="w-12 h-12 bg-cyan-400/10 rounded-2xl border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                        📢
                      </div>
                      
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Strategy Insight</span>
                        <h3 className="text-xl font-black text-white mt-2 mb-4">{gtmChannels[gtmChannel].title}</h3>
                        <p className="text-xs font-bold text-white/55 leading-relaxed">
                          {gtmChannels[gtmChannel].desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Expected Outcome / ROI</p>
                      <p className="text-sm font-extrabold text-cyan-400 mt-1.5">{gtmChannels[gtmChannel].impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 8: COMPETITION */}
            {currentSlide === 7 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" /> Competitive Positioning
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Unmatched Hyperlocal Advantage</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 08</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Mapped Competitor Plot */}
                  <div className="lg:col-span-7 flex flex-col items-center">
                    <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-4">Competitor Landscape Matrix</p>
                    
                    {/* Visual 2D X/Y Axis Chart */}
                    <div className="w-full max-w-md aspect-square bg-[#0b1322] border border-white/10 rounded-2xl relative p-6 font-bold text-[9px] text-white/45">
                      {/* Grid center axis */}
                      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />

                      {/* Axis Labels */}
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left uppercase tracking-widest text-[8px]">Low Local Focus</span>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 origin-right uppercase tracking-widest text-[8px] text-cyan-400">High Local Focus</span>
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 uppercase tracking-widest text-[8px]">Static Packages</span>
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 uppercase tracking-widest text-[8px] text-cyan-400">Custom Itineraries</span>

                      {/* Competitors Plotted */}
                      {/* MakeMyTrip (Low Local, High Tech) */}
                      <button 
                        onClick={() => setSelectedComp('makemytrip')}
                        className={`absolute top-[25%] left-[20%] p-2 rounded-full border text-[9px] transition-all flex items-center gap-1.5 ${
                          selectedComp === 'makemytrip' ? 'bg-[#ef4444]/20 border-red-500 text-white scale-110 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        🔴 MakeMyTrip
                      </button>

                      {/* TripAdvisor (Low Local, Med Tech) */}
                      <button 
                        onClick={() => setSelectedComp('tripadvisor')}
                        className={`absolute top-[60%] left-[25%] p-2 rounded-full border text-[9px] transition-all flex items-center gap-1.5 ${
                          selectedComp === 'tripadvisor' ? 'bg-[#eab308]/20 border-yellow-500 text-white scale-110 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        🟡 TripAdvisor
                      </button>

                      {/* Local Agencies (High Local, Low Tech) */}
                      <button 
                        onClick={() => setSelectedComp('local')}
                        className={`absolute top-[70%] right-[15%] p-2 rounded-full border text-[9px] transition-all flex items-center gap-1.5 ${
                          selectedComp === 'local' ? 'bg-[#a855f7]/20 border-purple-500 text-white scale-110 shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        🟣 Local Agencies
                      </button>

                      {/* manglore.nav (High Local, High Tech - Leader) */}
                      <button 
                        onClick={() => setSelectedComp('discover')}
                        className={`absolute top-[12%] right-[8%] p-3 rounded-full border text-xs font-black transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] ${
                          selectedComp === 'discover' ? 'bg-cyan-500 text-slate-950 border-cyan-400 scale-115' : 'bg-cyan-950/40 border-cyan-500/40 hover:border-cyan-400 text-cyan-400'
                        }`}
                      >
                        🚀 manglore.nav
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Selected Competitor Details */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-[#0e162a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-3 py-1 rounded-full uppercase tracking-wider">Analysis Card</span>
                      <h3 className="text-2xl font-black text-white mt-3 mb-4">{competitors[selectedComp].name}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Regional Focus</p>
                          <p className="text-sm font-bold text-white mt-1">{competitors[selectedComp].focus}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Itinerary Framework</p>
                          <p className="text-sm font-bold text-white mt-1">{competitors[selectedComp].itineraries}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Local Heritage Connection</p>
                          <p className="text-sm font-bold text-white mt-1">{competitors[selectedComp].connection}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-white/35 uppercase tracking-widest">Pricing Structure</p>
                        <p className="text-xs font-extrabold text-cyan-400 mt-1">{competitors[selectedComp].cost}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 9: THE TEAM */}
            {currentSlide === 8 && (
              <div className="space-y-6 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" /> Operational Leadership
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-1.5">Team Coastal Connect</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 09</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Ajith', 'Pranava', 'Anagha', 'Sachin', 'Sudharshini'].map((name, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 p-5 rounded-2xl flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-500/20 flex items-center justify-center shrink-0 font-bold text-white text-lg">
                          👤
                        </div>
                        <div>
                          <h4 className="text-base font-black text-white">{name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Advisors & Contact */}
                  <div className="md:col-span-3 bg-[#0d1627] border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Strategic Advisors</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-black text-white">Shreyas Sensei</p>
                          <p className="text-[9px] text-white/40 font-bold leading-tight">Strategic Advisor</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                          <p className="text-[11px] font-black text-white">Karthik Sir</p>
                          <p className="text-[9px] text-white/40 font-bold leading-tight">Strategic Advisor</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                          <p className="text-[11px] font-black text-white">Sushma Mama</p>
                          <p className="text-[9px] text-white/40 font-bold leading-tight">Strategic Advisor</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Connect With Us</p>
                      <p className="text-[10px] font-extrabold text-cyan-400 mt-1.5">contact@coastalconnect.in</p>
                      <p className="text-[9px] font-bold text-white/40">www.manglorenav.in</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 10: THE ASK */}
            {currentSlide === 9 && (
              <div className="space-y-8 py-6 text-left animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-cyan-400" /> Capital Allocation
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-2">Seed Round Ask & Expected Outcomes</h2>
                  </div>
                  <span className="text-white/35 font-extrabold text-sm uppercase tracking-widest">Slide 10</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Ask & Allocation */}
                  <div className="lg:col-span-8 flex flex-col justify-between py-2 text-left">
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="bg-gradient-to-r from-cyan-400 to-teal-400 p-6 rounded-3xl text-slate-950 font-black shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Seed Round Required</p>
                          <p className="text-4xl md:text-5xl font-black mt-1">₹25 Lakhs</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/70 leading-relaxed max-w-sm">
                            Securing crucial early runway to launch operations, conclude developer builds, and initiate aggressive user acquisition.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Planned Fund Allocation</h4>
                        
                        {/* Beautiful progress allocation bar */}
                        <div className="space-y-3.5 pt-2">
                          {[
                            { name: 'Product Development', share: '40%', amt: '₹10L', color: 'bg-cyan-400' },
                            { name: 'Marketing & Acquisition', share: '25%', amt: '₹6.25L', color: 'bg-amber-400' },
                            { name: 'Partnership Development', share: '20%', amt: '₹5L', color: 'bg-emerald-400' },
                            { name: 'Operations', share: '10%', amt: '₹2.5L', color: 'bg-purple-400' },
                            { name: 'Legal & Compliance', share: '5%', amt: '₹1.25L', color: 'bg-red-400' }
                          ].map((alloc, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-white/60">
                                <span className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${alloc.color}`} />
                                  {alloc.name}
                                </span>
                                <span>{alloc.share} ({alloc.amt})</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className={`${alloc.color} h-full rounded-full`} style={{ width: alloc.share }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Outcomes */}
                  <div className="lg:col-span-4 bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Milestone Outcomes</h4>
                      <p className="text-sm font-bold text-white/60 leading-relaxed mb-6">
                        Where we will stand 18 months post-funding.
                      </p>
                    </div>

                    <div className="space-y-6 my-auto">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <p className="text-xs font-bold text-white/70 leading-relaxed">
                          Launch fully integrated tours across **Udupi, Karwar, and Gokarna**.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <p className="text-xs font-bold text-white/70 leading-relaxed">
                          Scale platform size to **25,000 active users** within 18 months.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <p className="text-xs font-bold text-white/70 leading-relaxed">
                          Establish Mangaluru as a flagship **Smart Tourism Destination** in Karnataka.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCurrentSlide(0)}
                      className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> Restart Presentation
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* BOTTOM NAVIGATION TRACK */}
        <footer className="bg-[#080d19]/40 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center justify-between no-print">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              currentSlide === 0 
                ? 'opacity-30 border-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all border ${
                  currentSlide === idx 
                    ? 'bg-cyan-500 border-cyan-500 scale-125 shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                    : 'bg-white/10 border-transparent hover:bg-white/30'
                }`}
                title={`Go to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            disabled={currentSlide === TOTAL_SLIDES - 1}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              currentSlide === TOTAL_SLIDES - 1 
                ? 'opacity-30 border-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:scale-105 active:scale-95'
            }`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </footer>

      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PRINT-ONLY COMPONENT (Renders beautifully landscape)
   ──────────────────────────────────────────────────────── */
function PrintLayout({ theme }) {
  return (
    <div className="bg-white text-slate-900 p-0 m-0 w-full">
      
      {/* CSS style block injected into DOM when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-slide-page {
            width: 100vw !important;
            height: 100vh !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 2.5rem !important;
            box-sizing: border-box !important;
            border-bottom: 2px solid #e2e8f0 !important;
          }
        }
      `}} />

      {/* Slide 1 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Startup Pitch Deck • Coastal Connect</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-6 leading-tight">MANGLORE.NAV</h1>
          <p className="text-lg font-bold text-amber-600 mt-2">"Where Culture Meets the Coast."</p>
        </div>
        <div className="my-8 grid grid-cols-2 gap-8 items-center">
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            An investor-ready, hyper-focused digital travel platform and ecosystem unlocking the hidden tourism potential and rich coastal heritage of Mangaluru, Karnataka, India.
          </p>
          <div className="border border-slate-200 p-2 rounded-2xl">
            <div className="bg-slate-100 h-32 rounded-xl flex items-center justify-center text-slate-400 font-extrabold text-xs">
              [ Mangaluru Coastline Landscape Image ]
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 1 of 10</span>
        </div>
      </div>

      {/* Slide 2 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-red-600 uppercase tracking-widest">Slide 2: The Problem</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">The Tourist & Local Business Gap</h2>
        </div>
        <div className="my-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="border border-slate-100 p-4 rounded-xl">
              <h3 className="text-sm font-extrabold text-slate-800">1. No Consolidated Platform</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Tourists struggle to plan, booking hotels on one site, transport on another, and looking up blogs.</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl">
              <h3 className="text-sm font-extrabold text-slate-800">2. Hidden Gems Undiscovered</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Beautiful sites like Sasihithlu Beach and pristine basadis remain completely off standard radars.</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl">
              <h3 className="text-sm font-extrabold text-slate-800">3. Short Trip Planning Hurdles</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Difficult to map out efficient 2-day itineraries for weekend travelers.</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Direct Economic Impacts</h4>
            <div className="space-y-4 my-4 text-xs font-extrabold text-slate-700">
              <p>• -30% lower average tourist spending</p>
              <p>• -2.5 Days shorter visitor stays</p>
              <p>• Reduced revenues for small homestays</p>
            </div>
            <div className="text-[9px] bg-red-50 text-red-700 p-2 rounded-lg font-black text-center uppercase">Severe Market Leakage</div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 2 of 10</span>
        </div>
      </div>

      {/* Slide 3 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 3: The Solution</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">manglore.nav Digital Platform</h2>
        </div>
        <div className="my-8 grid grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              A comprehensive digital portal streamlining the tourist lifecycle from booking to exploration:
            </p>
            <ul className="space-y-2 text-xs font-bold text-slate-700 list-disc pl-4">
              <li>**Personalized Itineraries**: Algorithmic routes matching user style</li>
              <li>**Local Cultural Trails**: Food tasting, heritage walks, beach adventure</li>
              <li>**Integrated Bookings**: Last-mile vehicles, homestays, tables</li>
              <li>**Artisan & Guide Empowerment**: Local business support</li>
              <li>**Multilingual Access**: Kannada, English, Hindi, and Tulu</li>
            </ul>
          </div>
          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Simulated App Experience</h4>
            <div className="bg-white p-3 border border-slate-200 rounded-xl text-left space-y-2">
              <p className="text-[9px] font-black text-cyan-600 uppercase">Interactive Itinerary</p>
              <p className="text-xs font-extrabold text-slate-800">Culture & Surf Pass</p>
              <p className="text-[10px] text-slate-500 font-semibold">• Stop 1: Heritage Tulu Lunch at Machali</p>
              <p className="text-[10px] text-slate-500 font-semibold">• Stop 2: Surfing lesson at Sasihithlu Beach</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 3 of 10</span>
        </div>
      </div>

      {/* Slide 4 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 4: Market Opportunity</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Sizable Target Addressable Segment</h2>
        </div>
        <div className="my-8 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">Tourism Growth Facts</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="border border-slate-100 p-3 rounded-lg">
                <p className="text-xl font-black text-cyan-600">7.2%</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-1">India GDP Contribution</p>
              </div>
              <div className="border border-slate-100 p-3 rounded-lg">
                <p className="text-xl font-black text-cyan-600">200M+</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Domestic Visitors (KA)</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              We capture high-income urban weekenders from Bengaluru, Mysuru, and Kasaragod looking for easy seaside getaways.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">TAM / SAM / SOM Mappings</h3>
            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <p>• **TAM (All India Digital Tourism)**: ₹12,000 Crores</p>
              <p>• **SAM (Karnataka Coast Travel)**: ₹800 Crores</p>
              <p>• **SOM (manglore.nav Target)**: ₹45 Crores</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 4 of 10</span>
        </div>
      </div>

      {/* Slide 5 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 5: Business Model</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Lucrative Streams & Unit Economics</h2>
        </div>
        <div className="my-6 grid grid-cols-2 gap-8">
          <div className="space-y-3.5 text-xs font-bold text-slate-700">
            <p>**1. Booking Commissions (10-15%)**: Hotels, cabs, rentals, and guides.</p>
            <p>**2. Premium Trails**: Packages ranging from ₹999 to ₹4,999/person.</p>
            <p>**3. Listing Subscriptions**: ₹5k to ₹25k annually from local shops.</p>
            <p>**4. Brand Sponsorships**: Strategic local ads and banner spots.</p>
            <p>**5. Corporate Packages**: Custom team getaways for IT firms.</p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 text-left">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Year 1 Base Projections</h4>
            <div className="space-y-3 mt-4 text-xs font-extrabold text-slate-700">
              <p>• **Average Booking Value**: ₹1,500</p>
              <p>• **Base Target Monthly Bookings**: 2,500</p>
              <p>• **Local Listed Merchants**: 80 partners</p>
              <p className="text-cyan-600 text-sm font-black pt-2">Est. Annual Recurring Revenue (ARR): ₹64.8L</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 5 of 10</span>
        </div>
      </div>

      {/* Slide 6 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 6: Traction</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Prototype & Execution Status</h2>
        </div>
        <div className="my-6 grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800">Timeline Milestones Completed</h3>
            <div className="space-y-2 text-xs text-slate-600 font-semibold">
              <p>• **Q1 Prototype**: Completed website and app user-flow wireframes.</p>
              <p>• **Q2 Partnerships**: Signed Letters of Intent with 15+ hotels and 5 local agencies.</p>
              <p>• **Q3 Pilot Run**: Designed and highly rated "Kudla Heritage & Food Trail" tour.</p>
              <p>• **Q4 Community**: Reaching 3,000+ travel enthusiasts organically on socials.</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-around">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Projected Year 1 Scale</h4>
            <div className="space-y-2 text-xs font-extrabold text-slate-700">
              <p>• **Users**: 5,000+ registered explorers</p>
              <p>• **Bookings**: 500+ premium completed tours</p>
              <p>• **Partners**: 50+ local merchants and stays</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 6 of 10</span>
        </div>
      </div>

      {/* Slide 7 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 7: Go-To-Market</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Smart Customer Acquisition Funnel</h2>
        </div>
        <div className="my-8 grid grid-cols-4 gap-6">
          <div className="border border-slate-100 p-4 rounded-xl text-center">
            <h3 className="text-xs font-extrabold text-slate-800">Social Campaigns</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-2">Targeted micro-influencers and coastal rail rail reels.</p>
          </div>
          <div className="border border-slate-100 p-4 rounded-xl text-center">
            <h3 className="text-xs font-extrabold text-slate-800">Colleges & Tech</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-2">Outings for NITK, Manipal, and corporate retreats.</p>
          </div>
          <div className="border border-slate-100 p-4 rounded-xl text-center">
            <h3 className="text-xs font-extrabold text-slate-800">Google Maps SEO</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-2">Long-tail search capture for hidden travel keywords.</p>
          </div>
          <div className="border border-slate-100 p-4 rounded-xl text-center">
            <h3 className="text-xs font-extrabold text-slate-800">Festivals & Alliances</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-2">Dasara passes, collaboration with Tourism Dept.</p>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 7 of 10</span>
        </div>
      </div>

      {/* Slide 8 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 8: Competition</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Unmatched Hyperlocal Focus</h2>
        </div>
        <div className="my-6 grid grid-cols-2 gap-8 items-center">
          <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase mb-4">Competitors Grid Mapping</h3>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <p>• **MakeMyTrip**: High Tech but Generic National focus</p>
              <p>• **TripAdvisor**: Global Listings but Transactional forums only</p>
              <p>• **Local Travel Agencies**: Offline manuals, lack customized itineraries</p>
              <p className="text-cyan-600 font-black">• **manglore.nav**: High local depth + Automated tech (Leader)</p>
            </div>
          </div>
          <div className="space-y-4 text-xs font-semibold text-slate-500">
            <p>**Our Edge**: Deep integration with home-grown guides, regional restaurants, and auto-generated customizable GIS paths that giant aggregators cannot service.</p>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 8 of 10</span>
        </div>
      </div>

      {/* Slide 9 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 9: Team</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Operational Leadership Team</h2>
        </div>
        <div className="my-6 grid grid-cols-5 gap-4">
          {['Ajith', 'Pranava', 'Anagha', 'Sachin', 'Sudharshini'].map((name, i) => (
            <div key={i} className="border border-slate-100 p-4 rounded-xl text-left flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm mb-2">
                👤
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">{name}</h3>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 9 of 10</span>
        </div>
      </div>

      {/* Slide 10 */}
      <div className="print-slide-page">
        <div>
          <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">Slide 10: The Ask</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Capital Runway & ROI Outcomes</h2>
        </div>
        <div className="my-6 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-slate-100 p-5 rounded-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase">Capital Asked (Seed Round)</p>
              <p className="text-2xl font-black text-slate-900">₹25 Lakhs</p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 font-bold">
              <p>• **Product Development**: 40% (₹10 Lakhs)</p>
              <p>• **Marketing & Ads**: 25% (₹6.25 Lakhs)</p>
              <p>• **Operator Partnerships**: 20% (₹5 Lakhs)</p>
              <p>• **General Operations**: 10% (₹2.5 Lakhs)</p>
              <p>• **Legal & IP Protection**: 5% (₹1.25 Lakhs)</p>
            </div>
          </div>
          <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50 space-y-4 text-xs font-extrabold text-slate-700">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">18-Month Post-Funding Outcomes</h4>
            <p>✓ Launch fully integrated operations across Coastal Karnataka (Udupi, Gokarna)</p>
            <p>✓ Scale size to 25,000 active registered travelers</p>
            <p>✓ Cement Mangaluru as a smart-city premier tourism leader</p>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-bold uppercase">
          <span>Confidential • Investor Presentation</span>
          <span>Slide 10 of 10</span>
        </div>
      </div>

    </div>
  );
}
