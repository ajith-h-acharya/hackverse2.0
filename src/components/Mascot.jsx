import React, { useState, useEffect, useRef } from 'react';
import { Map, Briefcase, Music, Sparkles, Smile, Bot, Compass, X } from 'lucide-react';

export default function Mascot({ isLaunching, onLaunchComplete }) {
  const [action, setAction] = useState('idle');
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Pixels from center-bottom
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const isDraggingRef = useRef(false);
  const tapCount = useRef(0);
  const resetTapTimeout = useRef(null);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Launch Sequence
  useEffect(() => {
    if (isLaunching) {
      // 1. Teleport to top
      setPosition({ x: 0, y: -window.innerHeight });
      setAction('falling');

      // 2. Fall to center
      setTimeout(() => {
        setPosition({ x: 0, y: -200 });
      }, 50);

      // 3. Say "Let's go"
      setTimeout(() => {
        setAction('letsgo');
      }, 1050);

      // 4. Walk out of screen
      setTimeout(() => {
        setDirection(1);
        setAction('walking');
        setPosition({ x: window.innerWidth, y: -200 });
      }, 2500);

      // 5. Navigate
      setTimeout(() => {
        if (onLaunchComplete) onLaunchComplete();
      }, 3500);
    }
  }, [isLaunching, onLaunchComplete]);

  useEffect(() => {
    const actions = ['idle', 'map', 'luggage', 'dancing', 'walking', 'idle'];
    
    const interval = setInterval(() => {
      // Don't act while user is interacting or if dizzy/launching
      if (isDraggingRef.current || action === 'hit' || action === 'dizzy' || isLaunching) return; 
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setAction(randomAction);
      
      if (randomAction === 'walking') {
        setDirection(prevDir => {
          const newDir = Math.random() > 0.5 ? 1 : -1;
          setPosition(prev => {
            let newX = prev.x + (newDir * Math.floor(Math.random() * 200 + 50));
            // Keep roughly within bounds
            if (newX < -500) newX = -500;
            if (newX > 500) newX = 500;
            return { ...prev, x: newX };
          });
          return newDir;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [action, isLaunching]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    dragRef.current.startX = e.clientX - position.x;
    dragRef.current.startY = e.clientY - position.y;
    dragRef.current.initialX = e.clientX;
    dragRef.current.initialY = e.clientY;
    
    // Tap logic
    tapCount.current += 1;
    if (tapCount.current >= 4) {
      setAction('dizzy');
    } else {
      setAction('hit');
    }

    clearTimeout(resetTapTimeout.current);
    resetTapTimeout.current = setTimeout(() => {
      tapCount.current = 0;
      setAction(prev => (prev === 'hit' || prev === 'dizzy' || prev === 'dragged' ? 'idle' : prev));
    }, 1500);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    // Distinguish between a tap and a drag
    const diffX = Math.abs(e.clientX - dragRef.current.initialX);
    const diffY = Math.abs(e.clientY - dragRef.current.initialY);
    
    if (diffX > 5 || diffY > 5) {
      if (action !== 'dragged') {
        setAction('dragged');
        tapCount.current = 0; // Reset taps if they drag
      }
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
    if (action === 'dragged') {
      setAction('idle');
    }
  };

  const getActionStyle = () => {
    switch (action) {
      case 'dancing': return 'animate-spin-slow scale-110 border-amazon-yellow';
      case 'walking': return 'animate-bounce border-amazon-yellow';
      case 'map': return 'scale-110 -rotate-12 border-amazon-yellow';
      case 'luggage': return 'scale-95 translate-y-2 border-amazon-yellow';
      case 'dragged': return 'scale-110 rotate-6 border-amazon-yellow';
      case 'hit': return 'scale-90 -rotate-6 !bg-red-900 !border-red-500';
      case 'dizzy': return 'scale-95 rotate-12 !bg-purple-900 !border-purple-500 animate-pulse';
      case 'falling': return 'scale-y-125 !bg-amazon-yellow !border-white';
      case 'letsgo': return 'scale-125 rotate-6 !bg-amazon-orange !border-white shadow-[0_0_50px_rgba(255,153,0,0.8)]';
      default: return 'animate-pulse-glow border-amazon-yellow';
    }
  };

  return (
    <div 
      className={`fixed bottom-10 left-1/2 z-[3000] flex flex-col items-center ${isDragging && action === 'dragged' ? 'cursor-grabbing transition-none' : 'cursor-grab transition-all duration-1000 ease-in-out'}`}
      style={{ transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Action Indicator Bubble */}
      <div 
        className={`absolute -top-12 bg-white text-amazon-navy px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all duration-300 flex items-center gap-2 pointer-events-none whitespace-nowrap
          ${action !== 'idle' && action !== 'walking' && action !== 'falling' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-50'}`}
      >
        {action === 'letsgo' && <>Let's Go! 🚀</>}
        {action === 'hit' && <>Ouch! 💥</>}
        {action === 'dizzy' && <>Stop hitting me! 🤕</>}
        {action === 'dragged' && <>Whoa! Where are we going?! 😵‍💫</>}
        {action === 'map' && <><Map className="w-4 h-4 text-amazon-orange" /> Checking Route!</>}
        {action === 'luggage' && <><Briefcase className="w-4 h-4 text-blue-500" /> Packing Bags!</>}
        {action === 'dancing' && <><Music className="w-4 h-4 text-pink-500" /> Vibe Check!</>}
      </div>

      {/* Mascot Body */}
      <div 
        className={`relative w-20 h-20 bg-amazon-navy border-4 rounded-3xl shadow-[0_0_30px_rgba(254,189,105,0.4)] flex items-center justify-center transition-all duration-500 pointer-events-none ${getActionStyle()}`}
        style={{ transform: `scaleX(${direction})` }}
      >
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 ${action === 'hit' || action === 'dizzy' ? 'bg-white' : 'bg-amazon-yellow'}`}>
          <div className={`absolute -top-2 -left-1 w-3 h-3 rounded-full animate-ping ${action === 'hit' || action === 'dizzy' ? 'bg-white' : 'bg-amazon-yellow'}`} />
        </div>

        <div className="flex flex-col items-center">
          {action === 'falling' ? (
            <div className="flex gap-2">
              <div className="w-3 h-4 bg-amazon-navy rounded-full" />
              <div className="w-3 h-4 bg-amazon-navy rounded-full" />
            </div>
          ) : action === 'letsgo' ? (
            <Smile className="w-10 h-10 text-white" />
          ) : action === 'hit' ? (
            <div className="flex gap-1 animate-bounce">
              <X className="w-5 h-5 text-white" />
              <X className="w-5 h-5 text-white" />
            </div>
          ) : action === 'dizzy' ? (
            <div className="flex gap-2 animate-spin-slow">
              <div className="w-4 h-4 border-2 border-dashed border-white rounded-full animate-spin" />
              <div className="w-4 h-4 border-2 border-dashed border-white rounded-full animate-spin" />
            </div>
          ) : action === 'dragged' ? (
            <div className="flex gap-2 animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
              </div>
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
              </div>
            </div>
          ) : action === 'dancing' ? <Smile className="w-10 h-10 text-amazon-yellow" /> : 
           action === 'map' ? <Compass className="w-10 h-10 text-amazon-yellow animate-spin-slow" /> : 
           action === 'luggage' ? (
            <div className="flex gap-2">
              <div className="w-3 h-1 bg-amazon-yellow rounded-full" />
              <div className="w-3 h-1 bg-amazon-yellow rounded-full" />
            </div>
          ) : <Bot className="w-10 h-10 text-amazon-yellow" />}
        </div>

        {action === 'dancing' && (
          <>
            <Sparkles className="absolute -top-6 -right-6 w-6 h-6 text-amazon-yellow animate-bounce" />
            <Music className="absolute -bottom-4 -left-6 w-6 h-6 text-pink-500 animate-pulse" />
          </>
        )}
      </div>

      {/* Shadow */}
      <div className="w-12 h-2 bg-black/20 rounded-full mt-4 blur-sm pointer-events-none" />
    </div>
  );
}
