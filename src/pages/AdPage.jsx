import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── SCENE DATA ─── */
const scenes = [
  {
    id: 0,
    duration: 5000,
    bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=90&w=1800',
    overlayGradient: 'from-[#020d1a]/20 via-[#020d1a]/60 to-[#020d1a]',
    eyebrow: 'Coastal Karnataka · Arabia Sea',
    headline: 'Where Every\nSunrise Tells\na New Story.',
    tagline: '"Have you ever felt the whisper of a coast that holds a thousand stories?"',
    accentColor: '#06b6d4',
    label: '10+ Pristine Beaches',
    labelIcon: '🌊',
    position: 'left',
  },
  {
    id: 1,
    duration: 5000,
    bg: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=90&w=1800',
    overlayGradient: 'from-[#1a0a00]/20 via-[#1a0a00]/65 to-[#1a0a00]',
    eyebrow: '800 Years of Living Culture',
    headline: 'Ancient Rhythms,\nLiving Heritage.',
    tagline: '"Where the ocean\u2019s rhythm beats in sync with an ancient, breathing tradition."',
    accentColor: '#f59e0b',
    label: 'Yakshagana & Temple Arts',
    labelIcon: '🎭',
    position: 'right',
  },
  {
    id: 2,
    duration: 5000,
    bg: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&q=90&w=1800',
    overlayGradient: 'from-[#0a0800]/20 via-[#0a0800]/65 to-[#0a0800]',
    eyebrow: 'Coastal Culinary Heritage',
    headline: 'Flavors That\nLinger Long After\nYou Leave.',
    tagline: '"Savor the bold, spiced coastal cuisine that defines the spirit of Kudla."',
    accentColor: '#ef4444',
    label: 'Neer Dosa · Ghee Roast · Gadbad',
    labelIcon: '🍜',
    position: 'left',
  },
  {
    id: 3,
    duration: 5000,
    bg: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=90&w=1800',
    overlayGradient: 'from-[#001a0a]/20 via-[#001a0a]/65 to-[#001a0a]',
    eyebrow: 'Hidden Gems Await',
    headline: 'Secrets the\nMaps Never\nShowed You.',
    tagline: '"Mangroves, bioluminescent shores, and thousand-year cave temples."',
    accentColor: '#10b981',
    label: 'Pilikula · Kudroli · Surathkal',
    labelIcon: '🌿',
    position: 'right',
  },
  {
    id: 4,
    duration: 6000,
    bg: 'https://images.unsplash.com/photo-1590059393160-5627f1234988?auto=format&fit=crop&q=90&w=1800',
    overlayGradient: 'from-[#000d1a]/20 via-[#000d1a]/70 to-[#000d1a]',
    eyebrow: 'manglore.nav · By Coastal Connect',
    headline: 'Where Culture\nMeets\nThe Coast.',
    tagline: '"One platform. Infinite possibilities. Your coastal adventure starts here."',
    accentColor: '#06b6d4',
    label: 'Start Exploring Today',
    labelIcon: '🚀',
    position: 'center',
    isCta: true,
  },
];

/* ─── PROGRESS BAR ─── */
function SceneProgressBar({ scenes, activeIdx, progress }) {
  return (
    <div className="flex gap-1.5 w-full">
      {scenes.map((scene, i) => (
        <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all ease-linear"
            style={{
              backgroundColor: scene.accentColor,
              width: i < activeIdx ? '100%' : i === activeIdx ? `${progress}%` : '0%',
              transition: i === activeIdx ? 'none' : 'width 0.3s ease',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function AdPage() {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScene, setPrevScene] = useState(null);
  const progressRef = useRef(null);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const scene = scenes[activeScene];
  const TICK_MS = 50;

  /* Scene auto-advance */
  useEffect(() => {
    if (!isPlaying) return;
    clearInterval(progressIntervalRef.current);
    setProgress(0);

    const tickStep = (TICK_MS / scene.duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          goToNext();
          return 100;
        }
        return prev + tickStep;
      });
    }, TICK_MS);

    return () => clearInterval(progressIntervalRef.current);
  }, [activeScene, isPlaying]);

  const goToNext = () => {
    setPrevScene(activeScene);
    setIsVisible(false);
    setTimeout(() => {
      setActiveScene((prev) => (prev + 1) % scenes.length);
      setProgress(0);
      setIsVisible(true);
      setPrevScene(null);
    }, 400);
  };

  const goToPrev = () => {
    setPrevScene(activeScene);
    setIsVisible(false);
    setTimeout(() => {
      setActiveScene((prev) => (prev - 1 + scenes.length) % scenes.length);
      setProgress(0);
      setIsVisible(true);
      setPrevScene(null);
    }, 400);
  };

  const jumpTo = (idx) => {
    if (idx === activeScene) return;
    setPrevScene(activeScene);
    setIsVisible(false);
    setTimeout(() => {
      setActiveScene(idx);
      setProgress(0);
      setIsVisible(true);
    }, 400);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (isPlaying) clearInterval(progressIntervalRef.current);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans flex flex-col">

      {/* ── CINEMATIC VIEWPORT ── */}
      <div className="relative w-full flex-1 min-h-screen overflow-hidden">

        {/* Background Image (crossfade) */}
        {scenes.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeScene ? 1 : 0, zIndex: 0 }}
          >
            <img
              src={s.bg}
              alt=""
              className="w-full h-full object-cover scale-105"
              style={{
                transform: i === activeScene && isPlaying
                  ? 'scale(1.08)'
                  : 'scale(1.02)',
                transition: 'transform 8s ease-out',
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${s.overlayGradient}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
          </div>
        ))}

        {/* Grain Texture */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* ── TOP HUD ── */}
        <div className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Coastal Connect</span>
              <span className="text-sm font-black text-white tracking-tight">manglore.nav</span>
            </div>
          </Link>

          {/* Scene progress bars */}
          <div className="hidden md:flex flex-col gap-2 flex-1 max-w-sm mx-8">
            <SceneProgressBar scenes={scenes} activeIdx={activeScene} progress={progress} />
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
              <span>Scene {activeScene + 1} of {scenes.length}</span>
              <span>{isPlaying ? 'Playing' : 'Paused'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
            </button>
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/50" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
            </button>
            <Link
              to="/pitch"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all no-underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              View Pitch Deck
            </Link>
          </div>
        </div>

        {/* ── SCENE CONTENT ── */}
        <div className={`absolute inset-0 z-10 flex items-end pb-24 px-8 md:px-16 lg:px-24 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`w-full flex ${scene.position === 'right' ? 'justify-end' : scene.position === 'center' ? 'justify-center text-center' : 'justify-start'}`}>
            <div className={`max-w-2xl space-y-5 ${scene.position === 'center' ? 'items-center' : ''}`}>

              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md text-xs font-black uppercase tracking-widest"
                style={{ borderColor: `${scene.accentColor}40`, backgroundColor: `${scene.accentColor}15`, color: scene.accentColor }}
              >
                <span className="animate-pulse w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scene.accentColor }} />
                {scene.eyebrow}
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                {scene.headline.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>

              {/* Tagline */}
              <p className="text-sm md:text-base text-white/60 font-bold leading-relaxed max-w-lg italic">
                {scene.tagline}
              </p>

              {/* Label Badge */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border backdrop-blur-md font-bold text-sm"
                  style={{ borderColor: `${scene.accentColor}30`, backgroundColor: `${scene.accentColor}10`, color: 'rgba(255,255,255,0.85)' }}
                >
                  <span>{scene.labelIcon}</span>
                  <span>{scene.label}</span>
                </div>

                {/* CTA only on last scene */}
                {scene.isCta && (
                  <Link
                    to="/login"
                    className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest no-underline shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: scene.accentColor, color: '#020d1a' }}
                  >
                    Start Exploring <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDE SCENE ARROWS ── */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* ── MOBILE PROGRESS DOTS ── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:hidden">
          {scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeScene ? '24px' : '6px',
                height: '6px',
                backgroundColor: i === activeScene ? s.accentColor : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {/* ── DESKTOP SCENE DOT RAIL ── */}
        <div className="absolute bottom-10 left-8 z-20 hidden md:flex flex-col gap-2">
          {scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className="group flex items-center gap-3 transition-all"
            >
              <div
                className="rounded-full transition-all"
                style={{
                  width: '6px',
                  height: i === activeScene ? '24px' : '6px',
                  backgroundColor: i === activeScene ? s.accentColor : 'rgba(255,255,255,0.2)',
                }}
              />
              {i === activeScene && (
                <span
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: s.accentColor }}
                >
                  {s.eyebrow.split(' · ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* ── FEATURE STRIP BELOW ── */}
      <div className="bg-[#020d1a] border-t border-white/5 py-10 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '10+', label: 'Pristine Beaches', icon: '🌊', color: '#06b6d4' },
            { stat: '50+', label: 'Hidden Destinations', icon: '🗺️', color: '#f59e0b' },
            { stat: '800+', label: 'Years of Culture', icon: '🎭', color: '#a855f7' },
            { stat: '∞', label: 'Memories to Create', icon: '❤️', color: '#ec4899' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-3xl font-black" style={{ color: item.color }}>{item.stat}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="max-w-6xl mx-auto mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10">
          <div>
            <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ready to{' '}
              <span className="text-cyan-400">manglore.nav?</span>
            </p>
            <p className="text-sm font-bold text-white/40 mt-1">
              Your next unforgettable coastal adventure is one tap away.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pitch"
              className="px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-white transition-all no-underline"
            >
              View Pitch Deck
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all no-underline"
            >
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
