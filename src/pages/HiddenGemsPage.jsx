import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, MapPin, Compass, Shield, Zap, Navigation, Info, Heart, Star, X, CheckCircle } from 'lucide-react';
import { hiddenGems } from '../data/hiddenGems';

export default function HiddenGemsPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState('idle'); // idle, submitting, success
  const [formData, setFormData] = React.useState({ name: '', location: '', description: '' });
  const [favorites, setFavorites] = React.useState(() => {
    try {
      const saved = localStorage.getItem('mangalore_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('mangalore_favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setTimeout(() => {
      setSubmitStatus('success');
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus('idle');
        setFormData({ name: '', location: '', description: '' });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-amazon-navy text-white font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden">
      
      {/* Premium Header */}
      <nav className="sticky top-0 z-[100] bg-amazon-navy/80 backdrop-blur-xl border-b border-white/10 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 group-hover:bg-amazon-yellow transition-all group-hover:border-amazon-yellow group-hover:text-amazon-navy">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none">KUDLA</span>
              <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest mt-1">Hidden Nodes</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <div className="px-4 py-2 bg-amazon-orange/10 border border-amazon-orange/30 rounded-xl flex items-center gap-2">
               <Shield className="w-4 h-4 text-amazon-orange" />
               <span className="text-[10px] font-black uppercase tracking-widest text-amazon-orange">Unmapped Territory</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-40 px-8 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none">
           UNDERRATED
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amazon-yellow/10 border-2 border-amazon-yellow/20 text-amazon-yellow text-[11px] font-black uppercase tracking-[0.4em] mb-12 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" /> Secret Frequencies Detected
          </div>
          <h1 className="text-7xl md:text-[8rem] font-black text-white mb-12 tracking-tighter uppercase leading-[0.85]">
            HIDDEN GEMS OF<br />
            <span className="text-amazon-yellow drop-shadow-2xl">KUDLA</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/50 text-xl md:text-2xl font-bold leading-relaxed">
            Beyond the major landmarks lie the secret pulses of the city. 
            Discover the underrated, the unmapped, and the unforgettable.
          </p>
        </div>
      </header>

      {/* Gems Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-40 space-y-32">
        {hiddenGems.map((gem, idx) => (
          <div key={gem.id} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 md:gap-32 items-center`}>
            
            {/* Immersive Image */}
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-8 bg-amazon-orange/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden border-8 border-white/5 shadow-2xl group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-500">
                <img 
                  src={gem.image} 
                  alt={gem.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amazon-yellow rounded-2xl flex items-center justify-center text-amazon-navy shadow-lg">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Location</span>
                         <span className="text-sm font-black text-white truncate max-w-[200px]">{gem.location}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Content Details */}
            <div className="flex-1 space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-1 bg-amazon-yellow rounded-full" />
                <div className="flex items-center gap-2">
                   <Star className="w-4 h-4 text-amazon-yellow fill-current" />
                   <span className="text-sm font-black text-amazon-yellow">{gem.rating} Node Priority</span>
                </div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                {gem.name}
              </h2>
              
              <p className="text-white/60 text-xl leading-relaxed font-bold">
                {gem.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                 {gem.highlights.map(h => (
                   <span key={h} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amazon-yellow">
                     {h}
                   </span>
                 ))}
              </div>

              <div className="pt-8 flex gap-4">
                 <Link to={`/map?navigate=${gem.id}&lat=${gem.lat}&lng=${gem.lng}&name=${encodeURIComponent(gem.name)}`} className="flex-1 py-5 bg-amazon-yellow text-amazon-navy rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-3">
                   <Navigation className="w-5 h-5" /> Launch Navigator
                 </Link>
                 <button 
                   onClick={() => toggleFavorite(gem.id)} 
                   className={`p-5 border-2 rounded-[2rem] transition-all ${
                     favorites.includes(gem.id)
                       ? 'bg-amazon-orange border-amazon-orange text-white shadow-lg'
                       : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                   }`}
                 >
                    <Heart className={`w-6 h-6 ${favorites.includes(gem.id) ? 'fill-current' : ''}`} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="py-40 bg-amazon-navy relative border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center relative z-10 px-8">
           <h2 className="text-5xl md:text-7xl font-black text-white mb-12 tracking-tighter leading-tight uppercase">
             Found a Secret<br/><span className="text-amazon-orange">Frequency?</span>
           </h2>
           <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-bold leading-relaxed mb-16">
             The Kudla sector is vast and ever-changing. If you've discovered an unmapped gem, share the coordinates with the Navigator community.
           </p>
           <button 
             onClick={() => setShowModal(true)}
             className="px-16 py-6 bg-white/5 border-2 border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-amazon-yellow hover:text-amazon-navy hover:border-amazon-yellow transition-all shadow-2xl"
           >
              Submit New Node
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 text-center relative border-t border-amazon-yellow/20">
        <p className="font-black text-[10px] text-white/20 uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} KUDLA HIDDEN GEMS. SECTOR 74 OPERATIONAL.</p>
      </footer>

      {/* Submit Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-amazon-navy border-2 border-white/10 rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-navy" />
            
            {submitStatus === 'success' ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500 animate-bounce" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Frequency Received</h3>
                   <p className="text-white/50 text-sm mt-2 font-bold">Your hidden gem is being reviewed by the Navigator Council.</p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Report Anomaly</h3>
                    <p className="text-amazon-yellow text-[10px] font-black uppercase tracking-widest mt-1">Submit Unmapped Node</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-white/50" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Node Designation (Name)" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/30 focus:border-amazon-yellow focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Approximate Coordinates (Location)" 
                      required
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/30 focus:border-amazon-yellow focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Describe the anomaly..." 
                      rows={4}
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-white/30 focus:border-amazon-yellow focus:outline-none transition-colors custom-scrollbar"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={submitStatus === 'submitting'}
                    className="w-full py-5 bg-amazon-yellow text-amazon-navy rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitStatus === 'submitting' ? (
                       <span className="flex gap-1 items-center">
                         <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce" />
                         <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce delay-75" />
                         <span className="w-1.5 h-1.5 bg-amazon-navy rounded-full animate-bounce delay-150" />
                       </span>
                    ) : (
                      <>Transmit Data <Sparkles className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
