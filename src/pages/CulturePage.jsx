import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, Sparkles, Music, History, Utensils, Heart, Info, ArrowLeft, Landmark, Zap, X, Play, Pause, Volume2 } from 'lucide-react';

const cultureSections = [
  {
    title: "Yakshagana",
    subtitle: "The Celestial Dance",
    description: "A traditional theater form that combines dance, music, dialogue, costume, make-up, and stage techniques with a unique style and form. It is the spiritual heartbeat of coastal Karnataka.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/01Yakshagana.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Performing Arts",
    color: "amazon-yellow"
  },
  {
    title: "Hulivesha",
    subtitle: "The Tiger Spirit",
    description: "A high-energy folk dance unique to Tulu Nadu. Performers are meticulously painted in tiger stripes, performing gravity-defying acrobatics to the thunderous rhythm of traditional drums.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Hulivesha_Barke_%285%29.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Aces.R_-_Temple_Dab.ogg",
    tag: "Folk Tradition",
    color: "amazon-orange"
  },
  {
    title: "Kambala",
    subtitle: "Traditional Buffalo Racing",
    description: "An ancient rural sport held in the muddy fields of the coast. It is a spectacular display of power and precision, deeply rooted in the agricultural heritage of the region.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Kambala%2C_Buffalo_race%2C_Annual_festival.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Aces.R_-_Temple_Dab.ogg",
    tag: "Sports & Heritage",
    color: "amazon-blue"
  },
  {
    title: "Coastal Cuisine",
    subtitle: "Taste of Mangalore",
    description: "From the world-famous Ghee Roast to the delicate Neer Dosa, the culinary identity of Mangalore is a vibrant symphony of coastal spices, fresh seafood, and coconut milk.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chettinad_Fish_Fry.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Culinary Art",
    color: "amazon-yellow"
  },
  {
    title: "Bhoota Kola",
    subtitle: "Bhotha Poje / Spirit Worship",
    description: "An ancient ritualistic spirit worship and folk dance form native to Tulu Nadu. Performers painted in bright hues wear complex palm leaf skirts to invoke localized deities (Daivas), acting as temporary mediums to deliver blessings, tribal justice, and resolve disputes.",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Intense_Panjurli.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Spiritual Ritual",
    color: "amazon-orange"
  },
  {
    title: "Talamaddale",
    subtitle: "Mythological Discourse & Debate",
    description: "A traditional oratorical debate form representing 'Yakshagana without dance or costume'. Performers engage in spontaneous, intellectual, and wit-filled dialogue on mythological epics, guided by the maddale drum and bhagavatha singer.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Drummer_plying_Madhalam_BNC.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Aces.R_-_Temple_Dab.ogg",
    tag: "Oratory Tradition",
    color: "amazon-blue"
  },
  {
    title: "Siri Jatre",
    subtitle: "Siri Aayana / Mass Trance Ritual",
    description: "An annual mass spirit possession and trance ritual centered around the matrilineal legend of Siri. Devotees gathered at sacred temple shrines (Adi Alades) chant the epic Siri Paddanas to seek spiritual healing, express collective grievances, and invoke divine blessings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4c/%E0%B2%B8%E0%B2%BF%E0%B2%B0%E0%B2%BF_%E0%B2%AC%E0%B2%BE%E0%B2%AF%E0%B2%BF_%E0%B2%AC%E0%B3%81%E0%B2%A1%E0%B3%8D%E0%B2%AA%E0%B2%BE%E0%B2%B5%E0%B3%81%E0%B2%A8%E0%B3%86.JPG",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Possession Ritual",
    color: "amazon-yellow"
  },
  {
    title: "Nagamandala",
    subtitle: "The Serpent Mandala Ritual",
    description: "A magnificent all-night serpent worship ritual held in Dakshina Kannada. It depicts the sacred union of male and female snake deities, featuring a massive, intricate pattern (mandala) drawn with natural colors on the floor, danced upon by an oracle (Patri) to ward off afflictions.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Naga_mandala_06.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Serpent Worship",
    color: "amazon-orange"
  },
  {
    title: "Kangilu",
    subtitle: "Arecanut-Leaf Folk Dance",
    description: "A spiritual and lively circular folk dance performed on full moon days to propitiate the Goddess Khadgeshwari and Koragajja. Dancers wear traditional outfits crafted from arecanut tree leaves and perform to rhythmic beats to ward off diseases and evil forces.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Kangeelu_Kunita.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Aces.R_-_Temple_Dab.ogg",
    tag: "Folk Dance",
    color: "amazon-blue"
  },
  {
    title: "Karaga Dance",
    subtitle: "Sacred Floral Pyramid Procession",
    description: "An ancient folk ritual celebrating the power of Draupadi. A designated carrier dressed in feminine attire enters a deep trance while balancing a decorated, heavy floral pyramid (the Karaga) on their head, parading through streets surrounded by sword-wielding Veerakumaras.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Huvina_Karaga.jpg",
    audio: "https://upload.wikimedia.org/wikipedia/commons/4/41/Thakil_%26_Nadaswaram_during_temple_Deeparadhana.ogg",
    tag: "Sacred Procession",
    color: "amazon-yellow"
  }
];

export default function CulturePage() {
  const [activeModal, setActiveModal] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef(null);

  // Toggle playing state
  const togglePlay = () => setIsPlaying(!isPlaying);

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (activeModal) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(err => {
          console.log("Audio play blocked by browser policy:", err);
        });
      }
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [activeModal]);

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio play blocked by browser policy:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden">
      <audio 
        ref={audioRef} 
        src={activeModal?.audio}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Premium Header */}
      <nav className="sticky top-0 z-[100] bg-amazon-navy border-b border-white/10 px-8 py-5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 group-hover:bg-amazon-yellow transition-all group-hover:border-amazon-yellow group-hover:text-amazon-navy text-white">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-white tracking-tighter leading-none">MANGALORE</span>
              <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest mt-1">Heritage Portal</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-white/60">
            <span onClick={() => scrollToId('yakshagana')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Art Forms</span>
            <span onClick={() => scrollToId('bhoota-kola')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Traditions</span>
            <span onClick={() => scrollToId('coastal-cuisine')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Cuisine</span>
            <Link to="/map" className="px-6 py-2 bg-amazon-yellow text-amazon-navy rounded-xl hover:scale-105 transition-transform">Launch Map</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-40 px-8 bg-white overflow-hidden border-b border-gray-100">
        {/* Subtle Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-gray-50 select-none pointer-events-none tracking-tighter leading-none">
           HERITAGE
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amazon-yellow/10 border-2 border-amazon-yellow/20 text-amazon-navy text-[11px] font-black uppercase tracking-[0.4em] mb-12 animate-pulse">
            <Landmark className="w-5 h-5 text-amazon-orange" /> Cultural Archive Active
          </div>
          <h1 className="text-7xl md:text-[10rem] font-black text-black mb-12 tracking-tighter uppercase leading-[0.85]">
            HERITAGE <br />
            <span className="text-amazon-orange drop-shadow-xl">ARCHIVE</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 text-xl md:text-2xl font-bold leading-relaxed">
            Deep-dive into the ancient artistic and spiritual foundations of Mangalore. 
            A curated journey through the soul of Tulu Nadu.
          </p>
        </div>
      </header>

      {/* Culture Timeline */}
      <section className="max-w-7xl mx-auto px-8 py-40 space-y-48">
        {cultureSections.map((section, idx) => (
          <div 
            key={section.title} 
            id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-20 md:gap-32 items-center scroll-mt-24`}
          >
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-8 bg-amazon-yellow/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div 
                onClick={() => setActiveModal(section)}
                className="relative aspect-square rounded-[3.5rem] overflow-hidden border-8 border-white shadow-[0_30px_60px_rgba(0,0,0,0.1)] group-hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <img 
                  src={section.image} 
                  alt={section.title} 
                  className="w-full h-full object-cover grayscale-0 group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy/40 via-transparent to-transparent" />
              </div>
              <div className={`absolute -bottom-10 ${idx % 2 === 0 ? '-right-10' : '-left-10'} p-10 bg-white rounded-[2.5rem] shadow-2xl border-2 border-gray-50 animate-bounce-slow hidden md:block`}>
                <div className="text-[12px] font-black text-amazon-navy uppercase tracking-[0.3em]">{section.tag}</div>
              </div>
            </div>
            
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-amazon-navy text-amazon-yellow shadow-xl">
                {idx === 0 && <Music className="w-8 h-8" />}
                {idx === 1 && <Zap className="w-8 h-8" />}
                {idx === 2 && <History className="w-8 h-8" />}
                {idx === 3 && <Utensils className="w-8 h-8" />}
                {idx === 4 && <Sparkles className="w-8 h-8" />}
                {idx === 5 && <Compass className="w-8 h-8" />}
                {idx === 6 && <Heart className="w-8 h-8" />}
                {idx === 7 && <Landmark className="w-8 h-8" />}
                {idx === 8 && <Zap className="w-8 h-8" />}
                {idx === 9 && <Compass className="w-8 h-8" />}
                <span className="text-xs font-black uppercase tracking-widest text-white">Legacy Module</span>
              </div>
              
              <h2 
                onClick={() => setActiveModal(section)}
                className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.9] cursor-pointer hover:text-amazon-orange transition-colors"
              >
                {section.title} <br />
                <span className="text-amazon-orange text-3xl tracking-widest">{section.subtitle}</span>
              </h2>
              
              <div className="w-24 h-3 bg-amazon-yellow rounded-full shadow-inner" />
              
              <p className="text-gray-500 text-xl leading-relaxed font-bold">
                {section.description}
              </p>
              

            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-amazon-yellow bg-black py-32 px-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none animate-bg-slide" style={{ opacity: 0.75 }} />
        
        <h3 className="font-black bg-gradient-to-r from-amazon-yellow/30 via-amazon-orange/60 to-amazon-yellow/30 bg-clip-text text-transparent text-7xl md:text-9xl uppercase tracking-[0.5em] mb-16 relative z-10 drop-shadow-[0_0_35px_rgba(240,193,75,0.4)] select-none transition-all duration-700 hover:drop-shadow-[0_0_50px_rgba(240,193,75,0.7)] hover:scale-105 cursor-default">TULUNADU</h3>
        
        <div className="flex flex-col md:flex-row justify-center gap-12 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] relative z-10">
          <span onClick={() => scrollToId('bhoota-kola')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Spiritual Rituals</span>
          <span onClick={() => scrollToId('yakshagana')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Folk Performance</span>
          <span onClick={() => scrollToId('kambala')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Traditional Sports</span>
          <span onClick={() => scrollToId('coastal-cuisine')} className="hover:text-amazon-yellow cursor-pointer transition-colors">Coastal Gastronomy</span>
          <Link to="/map" className="hover:text-amazon-yellow cursor-pointer transition-colors">Interactive Circuits</Link>
        </div>
      </footer>
      {/* Archive Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setActiveModal(null); setIsPlaying(false); }} />
          
          <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl flex flex-col md:flex-row">
             <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img src={activeModal.image} alt={activeModal.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-amazon-navy/80 to-transparent" />
                <button onClick={() => { setActiveModal(null); setIsPlaying(false); }} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors md:hidden">
                  <X className="w-5 h-5 text-white" />
                </button>
             </div>
             <div className="p-8 md:w-1/2 bg-white flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] font-black text-amazon-orange uppercase tracking-[0.3em] mb-2">{activeModal.tag}</div>
                        <h3 className="text-3xl font-black text-black leading-none uppercase tracking-tighter">{activeModal.title}</h3>
                      </div>
                      <button onClick={() => { setActiveModal(null); setIsPlaying(false); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors hidden md:block">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                   </div>
                   
                   <p className="text-sm font-bold text-gray-500 leading-relaxed">
                     Accessing the historical acoustic archives for {activeModal.title}. This frequency contains recorded oral traditions and ambient soundscapes.
                   </p>
                </div>

                <div className="mt-8 space-y-6">
                   <div className="bg-amazon-navy rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-amazon-yellow" />
                      
                      <div className="flex items-center justify-between mb-6 relative z-10">
                         <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-amazon-yellow" />
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Audio Archive</span>
                         </div>
                         <span className="text-xs font-black text-amazon-yellow tracking-widest">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>

                      {/* Visualizer */}
                      <div className="flex items-center gap-1 h-8 mb-6">
                         {[...Array(20)].map((_, i) => (
                           <div 
                             key={i} 
                             className={`flex-1 rounded-full bg-white/20 transition-all duration-300 ${isPlaying ? 'animate-voice-bar' : 'h-1'}`}
                             style={{ animationDelay: `${i * 0.05}s` }}
                           />
                         ))}
                      </div>

                      <div className="flex justify-center">
                         <button 
                           onClick={togglePlay}
                           className="w-14 h-14 rounded-full bg-amazon-yellow text-amazon-navy flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                         >
                           {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
