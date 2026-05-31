import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Compass, Zap, ChevronDown, CheckCircle, Mic, MicOff, BrainCircuit } from 'lucide-react';
import { getGeminiResponse } from '../utils/gemini';
import { hotels } from '../data/hotels';

export default function ChatAssistant({ 
  locations = [], 
  activeTab = 'explore', 
  selectedLocation = null,
  userLocation = null,
  onUpdateCustomStops,
  onSwitchTab,
  onPreviewRide
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: "Hello! I'm your Mangalore Navigator AI. You can now use your voice to command me! Click the microphone and say 'Plan a beach trip' to begin." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const [showHelpBubble, setShowHelpBubble] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowHelpBubble(false);
      return;
    }
    
    // Randomly pop up the help bubble every 15-25 seconds
    const interval = setInterval(() => {
      setShowHelpBubble(true);
      setTimeout(() => {
        setShowHelpBubble(false);
      }, 5000);
    }, 15000 + Math.random() * 10000);

    // Initial pop up after 3 seconds of mount
    const initialTimeout = setTimeout(() => {
      if (!isOpen) setShowHelpBubble(true);
      setTimeout(() => setShowHelpBubble(false), 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send after voice input
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (manualInput) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Real Gemini API (passing current history for local mode memory)
      const result = await getGeminiResponse(textToSend, locations, hotels, messages, userLocation);
      
      if (result.action) {
        if (result.action.type === 'SET_STOPS') {
          // Robustly parse array of IDs
          const validIds = Array.isArray(result.action.payload) 
            ? result.action.payload.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : [];
          onUpdateCustomStops?.(validIds);
          onSwitchTab?.('routes');
        } else if (result.action.type === 'SWITCH_TAB') {
          onSwitchTab?.(result.action.payload);
        } else if (result.action.type === 'ROUTE_TO') {
          // Robustly parse single ID
          const targetId = parseInt(result.action.payload, 10);
          const destLoc = locations.find(l => l.id === targetId);
          if (destLoc) {
            onPreviewRide?.(destLoc);
          }
        }
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: result.text,
        isAction: !!result.action
      }]);

      // Speak the response using Web Speech API
      try {
        const synth = window.speechSynthesis;
        // Clean up the text for speech (remove markdown asterisks and local mode warnings)
        const textToSpeak = result.text
          .replace(/\*\(Running in Local Mode\)\*/g, '')
          .replace(/\*\(Neural link error\)\*/g, '')
          .replace(/\*/g, '')
          .trim();
        
        if (textToSpeak) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 1.05;
          utterance.pitch = 1.1; // Slightly higher pitch for AI feel
          synth.speak(utterance);
        }
      } catch (e) {
        console.warn("Speech synthesis error", e);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Synchronization failed. Please check your neural link (API Key)."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[5000] font-sans">
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <div className="relative">
          {showHelpBubble && (
            <div className="absolute bottom-[80px] right-0 w-56 bg-white text-amazon-navy p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-gray-100 animate-bounce origin-bottom-right transition-all z-10 cursor-pointer" onClick={() => setIsOpen(true)}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amazon-orange" />
                <p className="text-sm font-black uppercase tracking-widest text-amazon-navy">Need Help?</p>
              </div>
              <p className="text-[10px] font-bold text-gray-500 leading-tight">Ask me to build a custom route or find hidden gems!</p>
              {/* Pointer triangle */}
              <div className="absolute -bottom-3 right-5 w-5 h-5 bg-white border-b-4 border-r-4 border-gray-100 rotate-45" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-amazon-navy text-amazon-yellow rounded-full shadow-[0_20px_50px_rgba(19,25,33,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white group relative"
          >
            <div className="absolute inset-0 bg-amazon-yellow rounded-full animate-ping opacity-20 pointer-events-none" />
            <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amazon-orange rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.3)] border-4 border-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="bg-amazon-navy p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amazon-yellow/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-amazon-yellow rounded-xl flex items-center justify-center text-amazon-navy shadow-lg">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-tight leading-none">Navigator AI</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest">Voice Protocol Ready</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10">
              <X className="w-6 h-6 text-white/40" />
            </button>
          </div>

          {/* Context Banner */}
          <div className="bg-gray-50 px-6 py-2 border-b border-gray-100 flex items-center justify-between">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
               {isListening ? 'Listening for command...' : 'Awaiting Mission Input'}
             </span>
             {selectedLocation && (
               <span className="text-[9px] font-black text-amazon-orange uppercase truncate max-w-[150px]">
                 Focus: {selectedLocation.name}
               </span>
             )}
          </div>

          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm ${
                  msg.role === 'bot' 
                    ? 'bg-gray-100 text-black border-2 border-white' 
                    : 'bg-amazon-navy text-white shadow-xl border-2 border-white/10'
                }`}>
                  {msg.content}
                  {msg.isAction && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-green-600 uppercase font-black tracking-widest bg-green-50 p-2 rounded-lg border border-green-100">
                      <CheckCircle className="w-3 h-3" /> System Synchronized
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-2xl flex gap-3 items-center border-2 border-white shadow-sm">
                  <div className="relative">
                    <BrainCircuit className="w-5 h-5 text-amazon-navy animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amazon-yellow rounded-full animate-ping" />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder={isListening ? "Speak now..." : "Ask Navigator..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  className="w-full pl-6 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black text-black placeholder:text-gray-400 focus:border-amazon-navy focus:bg-white transition-all outline-none shadow-inner"
                />
                <button
                  onClick={() => handleSend()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-amazon-navy hover:text-amazon-orange transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Voice Button */}
              <button
                onClick={toggleListening}
                className={`p-4 rounded-2xl transition-all shadow-lg border-2 ${
                  isListening 
                    ? 'bg-amazon-orange text-white border-amazon-orange animate-pulse shadow-[0_0_20px_rgba(240,193,75,0.4)]' 
                    : 'bg-gray-50 text-amazon-navy border-gray-100 hover:border-amazon-yellow'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
            
            {isListening && (
              <div className="mt-4 flex justify-center gap-1 h-4 items-center">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-1 bg-amazon-orange rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                 ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
