import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, MapPin, Waves, Utensils, Landmark, Camera, Sparkles,
  ArrowRight, ArrowDown, Sun, Moon, Palmtree, Shell, Ship,
  Mountain, Music, Heart, Star, Plane, Anchor, Fish,
  ChevronDown, Zap, Globe, Navigation
} from 'lucide-react';

/* ─── Floating Particle Component ─── */
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
              opacity: 0.90,
              filter: `drop-shadow(0 0 10px ${color})`,
            }}
          />
        ) : (
          <span
            className="font-black uppercase tracking-[0.25em] whitespace-nowrap select-none"
            style={{
              fontSize: size,
              color: color,
              opacity: 0.85,
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

/* ─── Fun Fact Ticker ─── */
const funFacts = [
  "🌊 Mangalore has 10+ pristine beaches along the Arabian Sea",
  "🍦 Home of the legendary 'Gadbad' ice cream since 1975",
  "🏛️ The 'Sistine Chapel of India' — St. Aloysius Chapel — is here",
  "🐢 Panambur Beach runs sea turtle conservation programs",
  "⛵ Take a ferry to the hidden Tannirbhavi Beach",
  "🎭 Experience the 800-year-old Dasara festival at Kudroli Temple",
  "🏄 Sasihithlu Beach is Karnataka's premier surf spot",
  "🌿 Pilikula Bio-Park spans over 370 acres of nature",
];

/* ─── Category Bubbles ─── */
const categories = [
  { icon: Waves, label: 'Beaches', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
  { icon: Landmark, label: 'Temples', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { icon: Utensils, label: 'Food', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  { icon: Mountain, label: 'Nature', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  { icon: Camera, label: 'Heritage', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  { icon: Music, label: 'Culture', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
];

/* ─── Highlight Cards ─── */
const highlights = [
  {
    title: 'Coastal Paradise',
    subtitle: '10+ pristine beaches',
    description: 'Crystal clear waters, golden sunsets, and the gentle whisper of the Arabian Sea await you.',
    icon: Waves,
    gradient: 'from-cyan-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Sacred Heritage',
    subtitle: '1000+ years of history',
    description: 'Ancient temples, Jain basadis, and colonial churches tell stories of a rich cultural tapestry.',
    icon: Landmark,
    gradient: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Culinary Treasure',
    subtitle: 'Flavors of the coast',
    description: 'From the golden crispy vada sambar to legendary Gadbad ice cream — a foodie\'s ultimate destination.',
    icon: Utensils,
    gradient: 'from-red-500 to-pink-600',
    image: '/vada_sambar.png',
  },
];

/* ─── Stats ─── */
const stats = [
  { value: '50+', label: 'Locations', icon: MapPin },
  { value: '7', label: 'Experience Themes', icon: Compass },
  { value: '3', label: 'Regions', icon: Globe },
  { value: '∞', label: 'Memories', icon: Heart },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const observerRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % funFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-amazon-navy text-white font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden">

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ HERO SECTION ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Floating Top Right Pitch Deck Badge */}
        <Link
          to="/pitch"
          className="absolute top-6 right-6 z-50 flex items-center gap-2.5 px-6 py-3.5 bg-white/[0.06] hover:bg-amazon-yellow hover:text-amazon-navy backdrop-blur-2xl border border-white/10 hover:border-amazon-yellow rounded-full transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] text-xs font-black uppercase tracking-widest text-amazon-yellow hover:scale-105 group no-underline"
        >
          <Sparkles className="w-4 h-4 text-amazon-yellow group-hover:text-amazon-navy group-hover:rotate-12 transition-all" />
          <span>Investor Pitch 🚀</span>
        </Link>

        {/* Layered Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1590059393160-5627f1234988?auto=format&fit=crop&q=80&w=2000"
            alt="Mangalore Coastal Panorama"
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${1.1 + scrollY * 0.0003}) translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0.3, 0.7 - scrollY * 0.001),
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amazon-navy/60 via-amazon-navy/80 to-amazon-navy" />
          {/* Animated Gradient Orbs */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full blur-[200px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #febd69, transparent)',
              top: `${20 + mousePos.y * 10}%`,
              left: `${10 + mousePos.x * 15}%`,
              transition: 'top 1s ease-out, left 1s ease-out',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[200px] opacity-15"
            style={{
              background: 'radial-gradient(circle, #38bdf8, transparent)',
              bottom: `${10 + (1 - mousePos.y) * 10}%`,
              right: `${10 + (1 - mousePos.x) * 15}%`,
              transition: 'bottom 1.5s ease-out, right 1.5s ease-out',
            }}
          />
          {/* Noise Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none animate-bg-slide" style={{ opacity: 0.70 }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {/* Floating Icons */}
          <FloatingParticle delay={0} duration={15} left={10} size={24} icon={Waves} color="#38bdf8" />
          <FloatingParticle delay={2} duration={18} left={25} size={20} icon={Shell} color="#febd69" />
          <FloatingParticle delay={4} duration={12} left={45} size={28} icon={Anchor} color="#f0c14b" />
          <FloatingParticle delay={1} duration={20} left={65} size={22} icon={Fish} color="#38bdf8" />
          <FloatingParticle delay={3} duration={16} left={80} size={18} icon={Star} color="#febd69" />
          <FloatingParticle delay={5} duration={14} left={90} size={26} icon={Sun} color="#f59e0b" />
          <FloatingParticle delay={6} duration={17} left={5} size={20} icon={Sparkles} color="#a855f7" />
          <FloatingParticle delay={7} duration={19} left={55} size={16} icon={Heart} color="#ec4899" />
          
          {/* Floating Words */}
          <FloatingParticle delay={1.5} duration={22} left={18} size="13px" text="DISCOVER" color="#38bdf8" />
          <FloatingParticle delay={3.5} duration={24} left={38} size="15px" text="KUDLA" color="#febd69" />
          <FloatingParticle delay={5.5} duration={20} left={52} size="12px" text="EXPLORE" color="#f0c14b" />
          <FloatingParticle delay={7.5} duration={26} left={72} size="14px" text="COASTAL" color="#a855f7" />
          <FloatingParticle delay={9.5} duration={23} left={88} size="11px" text="BEACHES" color="#ec4899" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Logo / Brand Badge */}
          <div
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/[0.08] backdrop-blur-2xl rounded-full mb-10 border border-white/[0.12] landing-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-10 h-10 bg-amazon-yellow rounded-xl flex items-center justify-center rotate-6 shadow-lg">
              <Compass className="w-6 h-6 text-amazon-navy" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.35em] text-amazon-yellow">
              manglore.nav
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8 landing-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="block text-white/90">DISCOVER</span>
            <span className="block text-amazon-yellow drop-shadow-[0_10px_40px_rgba(254,189,105,0.35)]">
              KUDLA
            </span>
          </h1>

          <p
            className="text-base md:text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto mb-6 font-bold leading-relaxed landing-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            Where the Western Ghats kiss the Arabian Sea — a coastal paradise of
            ancient temples, legendary seafood, and secret beaches.
          </p>

          {/* Fun Fact Ticker */}
          <div
            className="mb-14 h-8 landing-fade-in"
            style={{ animationDelay: '1s' }}
          >
            <p
              key={factIndex}
              className="text-sm md:text-base font-bold text-amazon-yellow/80 fact-slide-in"
            >
              {funFacts[factIndex]}
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 landing-fade-in"
            style={{ animationDelay: '1.2s' }}
          >
            <Link
              to="/login"
              className="group relative px-12 py-6 bg-amazon-yellow text-amazon-navy rounded-full font-black text-sm uppercase tracking-widest shadow-[0_20px_60px_rgba(254,189,105,0.3)] hover:shadow-[0_25px_70px_rgba(254,189,105,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" />
              <span className="relative">Start Exploring</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/ad"
              className="group px-12 py-6 rounded-full font-black text-sm uppercase tracking-widest text-white/70 border-2 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amazon-yellow/20 transition-colors">
                <svg className="w-3.5 h-3.5 text-amazon-yellow fill-current translate-x-0.5" viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg>
              </span>
              Watch Our Story
            </Link>
            <Link
              to="/login"
              className="group px-12 py-6 rounded-full font-black text-sm uppercase tracking-widest text-white/70 border-2 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-3"
            >
              <Navigation className="w-5 h-5 text-amazon-yellow" />
              See What Awaits
            </Link>
          </div>

          {/* Category Bubbles */}
          <div
            className="flex flex-wrap justify-center gap-3 md:gap-4 landing-fade-in"
            style={{ animationDelay: '1.5s' }}
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to="/login"
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.1] hover:border-white/20 hover:scale-110 transition-all duration-300 cursor-pointer category-pop-in no-underline"
                style={{ animationDelay: `${1.6 + i * 0.1}s` }}
              >
                <cat.icon
                  className="w-4 h-4 group-hover:rotate-12 transition-transform"
                  style={{ color: cat.color }}
                />
                <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-white/90">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 landing-fade-in" style={{ animationDelay: '2s' }}>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-1.5 bg-amazon-yellow rounded-full scroll-dot" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ STATS BAR ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-16 bg-gradient-to-r from-amazon-squid via-amazon-navy to-amazon-squid border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              id={`stat-${i}`}
              data-animate
              className={`flex flex-col items-center text-center transition-all duration-700 ${isVisible[`stat-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-amazon-yellow/10 flex items-center justify-center mb-4 border border-amazon-yellow/20">
                <stat.icon className="w-7 h-7 text-amazon-yellow" />
              </div>
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{stat.value}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ DISCOVER SECTION ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="discover" className="py-32 px-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amazon-yellow/[0.03] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div
            id="discover-header"
            data-animate
            className={`text-center mb-24 transition-all duration-1000 ${isVisible['discover-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-amazon-yellow/10 rounded-full border border-amazon-yellow/20 mb-8">
              <Sparkles className="w-4 h-4 text-amazon-yellow" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amazon-yellow">Why Mangalore?</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-8">
              THREE WORLDS,{' '}
              <span className="text-amazon-yellow">ONE CITY</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-white/40 font-bold leading-relaxed">
              From sun-kissed shorelines to misty hilltop temples, from sizzling street food to serene backwater cruises — Mangalore is an experience that defies expectation.
            </p>
          </div>

          {/* Highlight Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <Link
                key={item.title}
                to="/login"
                id={`highlight-${i}`}
                data-animate
                className={`group relative rounded-[2.5rem] overflow-hidden h-[520px] transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl cursor-pointer block no-underline ${isVisible[`highlight-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Card Image */}
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[60%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="transform transition-all duration-500 group-hover:-translate-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-amazon-yellow text-[10px] font-black uppercase tracking-[0.3em] mb-3">{item.subtitle}</p>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">{item.title}</h3>
                    <p className="text-white/50 font-bold text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-sm">
                      {item.description}
                    </p>
                  </div>

                  {/* Hover Reveal */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 mt-4">
                    <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest">Explore</span>
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-amazon-yellow group-hover:border-amazon-yellow transition-all">
                      <ArrowRight className="w-5 h-5 text-white group-hover:text-amazon-navy" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ INTERACTIVE JOURNEY SECTION ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-gradient-to-b from-amazon-navy via-amazon-squid to-amazon-navy relative overflow-hidden">
        {/* Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amazon-yellow/20 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <div
            id="journey-header"
            data-animate
            className={`text-center mb-24 transition-all duration-1000 ${isVisible['journey-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8">
              YOUR ADVENTURE{' '}
              <span className="text-amazon-yellow">STARTS HERE</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-white/40 font-bold leading-relaxed">
              From planning to exploring — manglore.nav guides every step of your coastal journey.
            </p>
          </div>

          {/* Journey Steps */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amazon-yellow/40 via-amazon-yellow/20 to-transparent md:-translate-x-px" />

            {[
              {
                step: '01',
                title: 'Pick Your Vibe',
                desc: 'Beaches? Temples? Street food? Choose from 7 curated experience themes that match your travel style.',
                icon: Sparkles,
                color: '#febd69',
              },
              {
                step: '02',
                title: 'Navigate Smart',
                desc: 'Our interactive GIS map shows real-time routes, last-mile transport, and infrastructure scores for every location.',
                icon: Navigation,
                color: '#38bdf8',
              },
              {
                step: '03',
                title: 'Discover Secrets',
                desc: 'Unlock hidden gems that most tourists never find — from bioluminescent beaches to ancient cave temples.',
                icon: Star,
                color: '#a855f7',
              },
              {
                step: '04',
                title: 'Create Memories',
                desc: 'Book tours, rent vehicles, and let our AI assistant craft the perfect itinerary just for you.',
                icon: Heart,
                color: '#ec4899',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                id={`step-${i}`}
                data-animate
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 mb-20 last:mb-0 transition-all duration-700 ${isVisible[`step-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Step Dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-amazon-navy z-10"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}40` }}
                />

                {/* Content */}
                <div className={`pl-20 md:pl-0 md:w-1/2 ${i % 2 === 1 ? 'md:text-right md:pr-16' : 'md:pl-16'}`}>
                  <span className="text-6xl md:text-7xl font-black opacity-10 tracking-tighter block leading-none mb-2" style={{ color: item.color }}>
                    {item.step}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">{item.title}</h3>
                  <p className="text-white/40 font-bold leading-relaxed">{item.desc}</p>
                </div>

                {/* Icon Card */}
                <div className={`pl-20 md:pl-0 md:w-1/2 flex ${i % 2 === 1 ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16'}`}>
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 hover:scale-110 hover:rotate-6 transition-all duration-500 cursor-default"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon className="w-12 h-12" style={{ color: item.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ FINAL CTA SECTION ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="py-40 px-6 relative overflow-hidden">
        {/* Glowing Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amazon-yellow/[0.05] rounded-full blur-[200px] animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[150px]" />
        </div>

        <div
          id="final-cta"
          data-animate
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible['final-cta'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
        >
          <div className="w-24 h-24 mx-auto bg-amazon-yellow/10 rounded-full flex items-center justify-center mb-10 border-2 border-amazon-yellow/20 cta-glow">
            <Compass className="w-12 h-12 text-amazon-yellow cta-spin" />
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-black text-white tracking-tighter leading-[0.85] mb-10">
            READY TO{' '}
            <span className="text-amazon-yellow block md:inline">EXPLORE?</span>
          </h2>

          <p className="max-w-2xl mx-auto text-xl text-white/40 font-bold leading-relaxed mb-14">
            Join thousands of explorers who've discovered the magic of coastal Karnataka.
            Your next unforgettable adventure is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/login"
              className="group relative px-16 py-7 bg-amazon-yellow text-amazon-navy rounded-full font-black text-lg uppercase tracking-widest shadow-[0_20px_60px_rgba(254,189,105,0.35)] hover:shadow-[0_30px_80px_rgba(254,189,105,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Begin Your Journey</span>
              <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/20">
            {[
              { icon: Zap, text: 'Real-time Maps' },
              { icon: Globe, text: 'AI-Powered' },
              { icon: Star, text: '50+ Destinations' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2">
                <badge.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ══ FOOTER ══ */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="bg-black py-16 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 text-white font-black text-3xl mb-8">
            <div className="w-10 h-10 bg-amazon-yellow rounded-xl flex items-center justify-center rotate-3">
              <Compass className="w-6 h-6 text-amazon-navy" />
            </div>
            <span className="tracking-tighter">
              <span className="text-amazon-yellow">MANGLORE</span>.NAV
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-white/30 text-[10px] font-black uppercase tracking-widest mb-10">
            <Link to="/login" className="hover:text-amazon-yellow transition-colors cursor-pointer text-white/30 no-underline">Beaches</Link>
            <Link to="/login" className="hover:text-amazon-yellow transition-colors cursor-pointer text-white/30 no-underline">Temples</Link>
            <Link to="/login" className="hover:text-amazon-yellow transition-colors cursor-pointer text-white/30 no-underline">Food</Link>
            <Link to="/login" className="hover:text-amazon-yellow transition-colors cursor-pointer text-white/30 no-underline">Adventure</Link>
            <Link to="/login" className="hover:text-amazon-yellow transition-colors cursor-pointer text-white/30 no-underline">Heritage</Link>
          </div>
          <p className="text-[10px] font-black text-white/15 uppercase tracking-[0.5em]">
            &copy; {new Date().getFullYear()} manglore.nav. Crafted with ❤️ for Kudla.
          </p>
        </div>
      </footer>
    </div>
  );
}
