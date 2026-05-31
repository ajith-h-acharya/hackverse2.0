import React, { useEffect, useState } from 'react';
import { 
  X, MapPin, Heart, ChevronLeft, ChevronRight, 
  Maximize2, Car, Clock, CheckCircle, Navigation, 
  Star, Share2, Info, Compass, Shield, Zap, Calendar, Users, CreditCard,
  Route
} from 'lucide-react';
import { calculateDistance } from '../utils/haversine';

const seedReviewsCache = {};

const SEED_AUTHORS = [
  "Rahul Sharma", "Priya Kamath", "Ananya Rao", "Aditya Shetty", 
  "Vikram D'Souza", "Neha Amin", "Suresh Shenoy", "Kavitha Nayak", 
  "Rohan Fernandes", "Deepika Prabhu"
];

const SEED_REVIEW_TEXTS = {
  Coastal: [
    "Absolutely gorgeous sunset! Highly recommended for families.",
    "Very clean beach, perfect for an evening walk.",
    "The waves are great, but it can get a bit crowded on weekends.",
    "Loved the local food stalls nearby. A must-visit coastal spot.",
    "Great place to relax. The sea breeze is incredibly refreshing.",
    "Well maintained and safe. Lifeguards are active.",
    "Perfect spot for photography. Caught some amazing shots here.",
    "Wonderful atmosphere. Parking was a bit tricky but worth it.",
    "Peaceful in the early mornings. Perfect for jogging and yoga.",
    "An iconic location. Visited multiple times and never gets old!"
  ],
  Heritage: [
    "Amazing historical architecture. The history here is fascinating.",
    "A bit crowded but the tour guide explained everything beautifully.",
    "Well preserved monument. Very educational for kids.",
    "Stunning views of the surrounding area from the top.",
    "Feels like stepping back in time. Truly beautiful structure.",
    "Great cultural experience. Don't miss the details on the walls.",
    "Very peaceful and serene. Worth spending an hour or two.",
    "Excellent maintenance of this historical landmark.",
    "Highly recommend visiting during the golden hour for photos.",
    "A legendary spot. The craftsmanship is absolutely outstanding."
  ],
  Religious: [
    "Incredibly peaceful and spiritual atmosphere. Loved it.",
    "Highly spiritual place. The energy here is amazing.",
    "Beautiful architecture and very clean surroundings.",
    "Perfect place for quiet meditation and reflection.",
    "Rich in tradition and culture. A must-visit in Mangalore.",
    "Very well organized queues and crowd management.",
    "Beautiful rituals and serene vibes.",
    "Felt extremely peaceful after visiting. Highly recommend.",
    "Stunning craftsmanship on the pillars and roof.",
    "Deeply cultural experience that leaves a lasting impression."
  ],
  Nature: [
    "Lush green environment. A breath of fresh air in the city.",
    "Great place for bird watching and nature walks.",
    "Very relaxing atmosphere. Loved walking among the tall trees.",
    "Excellent conservation efforts. Very clean and green.",
    "Perfect weekend getaway for families and nature lovers.",
    "The boat ride was very serene and scenic.",
    "A peaceful haven. Lots of shade and sitting areas.",
    "Stunning flora and fauna. Kids had a wonderful time.",
    "Great photography spot. The lake looks beautiful at sunset.",
    "So quiet and tranquil. Highly recommend visiting early."
  ],
  Culinary: [
    "Absolutely delicious! The flavors are authentic and rich.",
    "Must try their signature dishes. Worth every rupee.",
    "Very fast service despite the heavy crowd. Impressive!",
    "Great ambiance and mouth-watering food options.",
    "The taste is consistently amazing. My favorite spot in town.",
    "Friendly staff and hygienic preparation. 5 stars!",
    "Unique local desserts that you won't find anywhere else.",
    "Excellent value for money and generous portions.",
    "Always crowded, but the wait is absolutely worth it.",
    "A culinary masterpiece. Highly recommend the special items."
  ],
  Stays: [
    "Incredible hospitality and extremely clean rooms. 10/10.",
    "Beautiful views and premium amenities. Had a luxury experience.",
    "Very polite staff. They helped us with all our local travel plans.",
    "Delicious breakfast buffet with a lot of variety.",
    "Peaceful stay away from the noise. Perfect for relaxation.",
    "The room service was prompt and the property is well maintained.",
    "Great value for luxury. The pool area was fantastic.",
    "Comfortable beds and modern bathroom fittings.",
    "Highly recommend for both business and leisure trips.",
    "An unforgettable stay. Will definitely book again next time."
  ],
  Default: [
    "Wonderful experience exploring this local spot.",
    "Very easy to access and helpful signage around.",
    "Pleasantly surprised by how well-maintained it is.",
    "Great spot for a quick visit. Highly recommended.",
    "Friendly locals and peaceful vibes.",
    "Offers a unique look into the local lifestyle.",
    "Very photogenic location. Spent a few hours here.",
    "A pleasant and memorable visit. Glad we stopped by.",
    "Definitely worth adding to your Mangalore itinerary.",
    "Nice and clean. Make sure to visit with friends!"
  ]
};

function getSeedReviews(location) {
  if (!location) return [];
  const locationId = location.id;
  if (seedReviewsCache[locationId]) {
    return seedReviewsCache[locationId];
  }

  let cat = 'Default';
  const type = location.type || '';
  const category = location.category || '';
  
  if (category === 'Coastal') cat = 'Coastal';
  else if (category === 'Heritage') cat = 'Heritage';
  else if (category === 'Religious') cat = 'Religious';
  else if (category === 'Nature') cat = 'Nature';
  else if (category === 'Culinary') cat = 'Culinary';
  else if (['Luxury', 'Premium', 'Boutique', 'Resort', 'Eco-Resort'].includes(type) || category === 'Stays') cat = 'Stays';

  const texts = SEED_REVIEW_TEXTS[cat] || SEED_REVIEW_TEXTS.Default;
  
  const reviews = [];
  const idStr = String(locationId);
  let seed = 0;
  for (let i = 0; i < idStr.length; i++) {
    seed += idStr.charCodeAt(i);
  }

  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 0; i < 10; i++) {
    const authorIndex = Math.floor(random() * SEED_AUTHORS.length);
    const textIndex = (i + Math.floor(random() * texts.length)) % texts.length;
    const rVal = random();
    const rating = rVal > 0.85 ? 3 : rVal > 0.35 ? 4 : 5;
    
    reviews.push({
      id: `seed-${locationId}-${i}`,
      locationId: locationId,
      author: SEED_AUTHORS[authorIndex],
      rating: rating,
      text: texts[textIndex],
      timestamp: new Date(Date.now() - (i * 24 + Math.floor(random() * 24)) * 60 * 60 * 1000).toISOString()
    });
  }

  seedReviewsCache[locationId] = reviews;
  return reviews;
}

export default function LocationDetail({ 
  location, 
  userLocation,
  onClose, 
  isFavorite, 
  onToggleFavorite, 
  onPreviewRide, 
  onCancelRidePreview,
  reviews = [],
  onAddReview,
  customStops = [],
  setCustomStops
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [reviewText, setReviewText] = useState('');
  const [panelWidth, setPanelWidth] = useState(480);
  const [userRating, setUserRating] = useState(5);
  const isDragging = React.useRef(false);

  const lat = location.lat || (location.coordinates && location.coordinates[0]);
  const lng = location.lng || (location.coordinates && location.coordinates[1]);
  const distFromUser = userLocation && lat && lng ? calculateDistance(userLocation[0], userLocation[1], lat, lng) : null;

  useEffect(() => {
    setActiveIndex(0);
    setBookingStatus('idle');
  }, [location]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(320, Math.min(700, newWidth)));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  if (!location) return null;
  const isHotel = location.type === 'Luxury' || location.type === 'Premium' || location.type === 'Boutique' || location.type === 'Resort' || location.type === 'Eco-Resort';

  const locationReviews = reviews.filter(r => r.locationId === location.id);
  const avgRating = locationReviews.length 
    ? (locationReviews.reduce((acc, curr) => acc + curr.rating, 0) / locationReviews.length).toFixed(1)
    : '4.8';

  const gallery = location.gallery?.length ? location.gallery : [location.image];

  const handleBookRide = () => {
    setBookingStatus('confirming');
    try {
      const history = JSON.parse(localStorage.getItem('mangalore_circuit_history') || '[]');
      const newRide = {
        id: `ride-${Date.now()}`,
        type: 'Single Waypoint',
        timestamp: new Date().toISOString(),
        stops: [{
          id: location.id,
          name: location.name,
          image: location.image,
          category: location.category || location.type || 'Hospitality'
        }],
        totalDistance: distFromUser ? distFromUser.toFixed(2) : '0.00'
      };
      localStorage.setItem('mangalore_circuit_history', JSON.stringify([newRide, ...history]));
    } catch (err) {
      console.warn("Failed to save ride to history", err);
    }
    setTimeout(() => {
      setBookingStatus('success');
    }, 1500);
  };

  return (
    <div className="absolute top-0 right-0 h-full bg-white z-[3000] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-gray-100 font-sans overflow-hidden animate-in slide-in-from-right duration-500" style={{ width: `${panelWidth}px` }}>
      {/* Draggable Divider */}
      <div
        onMouseDown={startDrag}
        className="absolute top-0 left-0 w-2 h-full z-50 cursor-col-resize group flex items-center justify-center hover:bg-amazon-yellow/20 transition-colors"
      >
        <div className="absolute left-0 top-0 w-1 h-full bg-transparent group-hover:bg-amazon-yellow transition-colors" />
        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-4 h-12 bg-white border-2 border-gray-200 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-0.5">
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>
      {/* Premium Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-amazon-navy hover:text-white rounded-2xl transition-all shadow-sm">
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amazon-navy uppercase tracking-[0.2em]">
              {location.category || location.type || 'Hospitality'} Node
            </span>
            <span className="text-xs font-bold text-gray-400">Mangalore Navigator</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onToggleFavorite(location.id)}
            className={`p-3 rounded-2xl border-2 transition-all ${isFavorite ? 'bg-amazon-orange text-white border-amazon-orange shadow-lg' : 'bg-white border-gray-100 text-gray-300 hover:text-amazon-orange hover:border-amazon-orange'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {bookingStatus === 'success' ? (
          <SuccessView onClose={onClose} onBack={() => setBookingStatus('idle')} location={location} />
        ) : (
          <div className="p-8 space-y-10">
            {/* Immersive Gallery */}
            <div className="space-y-6">
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
                <img src={gallery[activeIndex]} alt={location.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-left">
                   <h1 className="text-white font-black text-3xl tracking-tight leading-tight">{location.name}</h1>
                   <div className="flex items-center gap-3 mt-3">
                      <div className="flex text-amazon-yellow">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(avgRating)) ? 'fill-current' : 'text-white/30'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-white/90 uppercase tracking-widest">{avgRating} Score</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar px-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-20 h-20 rounded-2xl border-4 shrink-0 transition-all shadow-md ${idx === activeIndex ? 'border-amazon-yellow scale-105' : 'border-white hover:border-gray-200'}`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            </div>

            {distFromUser !== null && (
              <div className="flex items-center gap-4 bg-gray-50 border-2 border-white px-6 py-4 rounded-[2.5rem] shadow-sm text-left animate-in slide-in-from-bottom duration-500">
                <div className="w-10 h-10 bg-amazon-orange/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-amazon-orange animate-bounce" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Distance from you</h4>
                  <p className="text-sm font-black text-black">{distFromUser} KM</p>
                </div>
              </div>
            )}

            {/* Custom Circuit Selection */}
            {customStops && setCustomStops && (
              <div className="flex items-center justify-between bg-gray-50 border-2 border-white px-6 py-4 rounded-[2.5rem] shadow-sm text-left animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${customStops.includes(location.id) ? 'bg-amazon-navy text-amazon-yellow' : 'bg-amazon-orange/10 text-amazon-orange'}`}>
                    <Route className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Custom Circuit</h4>
                    <p className="text-sm font-black text-black">
                      {customStops.includes(location.id) ? 'Selected Stop' : 'Not Selected'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCustomStops(prev => 
                      prev.includes(location.id) 
                        ? prev.filter(id => id !== location.id) 
                        : [...prev, location.id]
                    );
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    customStops.includes(location.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                      : 'bg-amazon-yellow hover:bg-amazon-yellow/90 text-amazon-navy shadow-md'
                  }`}
                >
                  {customStops.includes(location.id) ? 'Remove' : 'Select'}
                </button>
              </div>
            )}

            {/* Strategic Stats */}
            <div className="grid grid-cols-3 gap-4">
               {[
                 { label: 'Mobility', value: location.mobilityIndex || 'High', icon: Zap, color: 'text-blue-500' },
                 { label: 'Green Node', value: location.sustainable ? 'YES' : 'NO', icon: Compass, color: 'text-green-500' },
                 { label: location.price ? 'Price' : 'Popularity', value: location.price || 'Trending', icon: Star, color: 'text-amazon-orange' }
               ].map((stat, i) => (
                 <div key={i} className="bg-gray-50 p-4 rounded-3xl border-2 border-white shadow-sm text-center space-y-1">
                   <stat.icon className={`w-5 h-5 mx-auto ${stat.color}`} />
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</div>
                   <div className="text-sm font-black text-black">{stat.value}</div>
                 </div>
               ))}
            </div>

            {/* Content Section */}
            <div className="space-y-6 text-left">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-amazon-yellow rounded-full" /> 
                  Overview
                </h3>
                <p className="text-base text-black font-bold leading-relaxed opacity-80">{location.description}</p>
              </div>

              {/* Action Deck */}
              <div className="flex gap-4 pt-4">
                {isHotel ? (
                  <button
                    onClick={() => setBookingStatus('booking_hotel')}
                    className="flex-1 py-4 bg-amazon-navy text-amazon-yellow border-2 border-amazon-navy rounded-3xl text-sm font-black shadow-xl hover:bg-amazon-yellow hover:text-amazon-navy hover:border-amazon-yellow transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <Calendar className="w-5 h-5 group-hover:animate-bounce" /> Reserve Suite
                  </button>
                ) : (
                  <button
                    onClick={handleBookRide}
                    className="flex-1 py-4 bg-amazon-navy text-white rounded-3xl text-sm font-black shadow-xl hover:shadow-amazon-navy/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Car className="w-5 h-5 text-amazon-yellow" /> Schedule Ride
                  </button>
                )}
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank')}
                  className="p-4 bg-amazon-yellow text-amazon-navy rounded-3xl shadow-xl hover:shadow-amazon-yellow/20 transition-all active:scale-95"
                >
                  <Navigation className="w-6 h-6" />
                </button>
              </div>

              <hr className="border-gray-100" />

              {/* Review Module */}
              <div className="space-y-6 pb-10">
                 <h3 className="text-2xl font-black text-black tracking-tight">Visitor Insights</h3>
                 
                 {/* Write Experience with Star Picker */}
                 <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-white shadow-sm space-y-4">
                    <h4 className="text-sm font-black text-black">Log your experience</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</span>
                       <div className="flex gap-1">
                         {[1,2,3,4,5].map(s => (
                           <button key={s} onClick={() => setUserRating(s)} className="p-0.5 transition-transform hover:scale-125 active:scale-90">
                             <Star className={`w-6 h-6 transition-colors ${s <= userRating ? 'text-amazon-yellow fill-current' : 'text-gray-200 hover:text-amazon-yellow/50'}`} />
                           </button>
                         ))}
                       </div>
                       <span className="text-xs font-black text-amazon-navy ml-2">{userRating}/5</span>
                    </div>
                    <textarea 
                       value={reviewText}
                       onChange={(e) => setReviewText(e.target.value)}
                       placeholder="Share your thoughts on this destination..."
                       className="w-full p-4 text-sm font-bold bg-white border-2 border-gray-100 rounded-2xl focus:border-amazon-yellow focus:outline-none transition-all"
                       rows={3}
                    />
                    <button 
                      onClick={() => {
                        if(reviewText.trim()){
                          onAddReview({ locationId: location.id, rating: userRating, text: reviewText });
                          setReviewText('');
                          setUserRating(5);
                        }
                      }}
                      className="w-full bg-white border-2 border-gray-100 text-black py-3 rounded-2xl text-sm font-black hover:border-amazon-navy transition-all"
                    >
                      Publish Insight
                    </button>
                 </div>

                 {/* Rating Distribution Graph */}
                 {(() => {
                   const allReviews = [...getSeedReviews(location), ...locationReviews];
                   const counts = [0,0,0,0,0];
                   allReviews.forEach(r => { if(r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
                   const maxCount = Math.max(...counts, 1);
                   const totalReviews = allReviews.length;
                   const avgAll = totalReviews > 0 ? (allReviews.reduce((a,r) => a + r.rating, 0) / totalReviews).toFixed(1) : '0';
                   return (
                     <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-white shadow-sm space-y-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black text-black">Rating Overview</h4>
                         <div className="flex items-center gap-2">
                           <span className="text-3xl font-black text-amazon-navy">{avgAll}</span>
                           <div className="flex flex-col items-start">
                             <div className="flex text-amazon-yellow">
                               {[...Array(5)].map((_,i) => <Star key={i} className={`w-3 h-3 ${i < Math.round(parseFloat(avgAll)) ? 'fill-current' : 'text-gray-200'}`} />)}
                             </div>
                             <span className="text-[10px] font-bold text-gray-400">{totalReviews} reviews</span>
                           </div>
                         </div>
                       </div>
                       <div className="space-y-2">
                         {[5,4,3,2,1].map(star => (
                           <div key={star} className="flex items-center gap-3">
                             <span className="text-xs font-black text-gray-500 w-4 text-right">{star}</span>
                             <Star className="w-3 h-3 text-amazon-yellow fill-current" />
                             <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                               <div
                                 className="h-full rounded-full transition-all duration-700"
                                 style={{
                                   width: `${(counts[star - 1] / maxCount) * 100}%`,
                                   background: star >= 4 ? '#f0c14b' : star === 3 ? '#fbbf24' : '#f59e0b'
                                 }}
                               />
                             </div>
                             <span className="text-[10px] font-black text-gray-400 w-6 text-right">{counts[star - 1]}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 })()}

                 {/* Insight Feed */}
                 <div className="space-y-8 px-2">
                    {[...locationReviews].reverse().concat(getSeedReviews(location)).map(rev => (
                      <div key={rev.id} className="space-y-3 relative pl-6 border-l-2 border-gray-100">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-amazon-yellow border-4 border-white" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-black">{rev.author || 'Anonymous Explorer'}</span>
                          <div className="flex text-amazon-yellow">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-black font-bold leading-snug italic">"{rev.text}"</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}
        {bookingStatus === 'booking_hotel' && (
          <HotelBookingView 
            onClose={() => setBookingStatus('idle')} 
            location={location} 
            onConfirm={() => {
              try {
                const history = JSON.parse(localStorage.getItem('mangalore_circuit_history') || '[]');
                const newHotel = {
                  id: `hotel-${Date.now()}`,
                  type: 'Stay Booking',
                  timestamp: new Date().toISOString(),
                  stops: [{
                    id: location.id,
                    name: location.name,
                    image: location.image,
                    category: 'Stays'
                  }],
                  totalDistance: distFromUser ? distFromUser.toFixed(2) : '0.00'
                };
                localStorage.setItem('mangalore_circuit_history', JSON.stringify([newHotel, ...history]));
              } catch (err) {
                console.warn(err);
              }
              setBookingStatus('hotel_success');
            }} 
          />
        )}
        {bookingStatus === 'hotel_success' && (
          <HotelSuccessView onClose={onClose} onBack={() => setBookingStatus('idle')} location={location} />
        )}
      </div>
    </div>
  );
}

function SuccessView({ onClose, onBack, location }) {
  return (
    <div className="p-8 text-center animate-in zoom-in duration-500 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <div className="w-24 h-24 bg-amazon-yellow/10 rounded-[2.5rem] flex items-center justify-center shadow-inner">
        <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-black mb-3">Transport Ready!</h2>
        <p className="text-base text-gray-500 font-bold max-w-[280px] mx-auto">Your journey to {location.name} has been synchronized.</p>
      </div>
      <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-white shadow-xl w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
          <span className="text-sm font-black text-black">DIRECT PATH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ETA</span>
          <span className="text-sm font-black text-green-700">8 MINUTES</span>
        </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={onBack}
          className="w-full py-5 bg-amazon-yellow text-amazon-navy rounded-[2rem] text-sm font-black shadow-xl hover:shadow-amazon-yellow/20 transition-all active:scale-95 uppercase tracking-widest"
        >
          Back to Details
        </button>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-transparent border-2 border-gray-200 hover:border-black text-black rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Close Navigator
        </button>
      </div>
    </div>
  );
}

function HotelBookingView({ onClose, location, onConfirm }) {
  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
       <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-amazon-navy transition-colors mb-4">
         <ChevronLeft className="w-4 h-4" /> Back to details
       </button>
       
       <div>
         <h2 className="text-4xl font-black text-black leading-tight uppercase tracking-tighter">Secure <br/><span className="text-amazon-orange">Reservation</span></h2>
         <p className="text-sm font-bold text-gray-500 mt-2">Initialize booking protocol for {location.name}.</p>
       </div>

       <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-white shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
             <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner shrink-0">
               <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
             </div>
             <div>
               <h3 className="font-black text-black">{location.name}</h3>
               <p className="text-xs font-bold text-gray-400 mt-1">{location.region}</p>
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amazon-navy" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Check-In</span>
                </div>
                <span className="text-sm font-black text-black">Today</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-amazon-navy" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Guests</span>
                </div>
                <span className="text-sm font-black text-black">2 Adults</span>
             </div>
          </div>
       </div>

       <div className="bg-amazon-navy p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amazon-yellow/10 rounded-full blur-3xl group-hover:bg-amazon-yellow/20 transition-colors" />
          <div className="flex items-center justify-between mb-2 relative z-10">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Value</span>
             <CreditCard className="w-5 h-5 text-amazon-yellow" />
          </div>
          <div className="text-4xl font-black text-white relative z-10">{location.price}</div>
       </div>

       <button 
         onClick={onConfirm}
         className="w-full py-5 bg-amazon-yellow text-amazon-navy border-2 border-amazon-yellow rounded-[2rem] text-sm font-black shadow-xl hover:shadow-amazon-yellow/30 transition-all active:scale-95 uppercase tracking-widest"
       >
         Confirm Protocol
       </button>
    </div>
  );
}

function HotelSuccessView({ onClose, onBack, location }) {
  return (
    <div className="p-8 text-center animate-in zoom-in duration-500 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center shadow-inner border-2 border-green-100 relative">
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-green-400 animate-ping opacity-20" />
        <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-black mb-3">Suite Secured!</h2>
        <p className="text-base text-gray-500 font-bold max-w-[280px] mx-auto">Your reservation at {location.name} is confirmed.</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-white shadow-xl w-full max-w-sm">
         <div className="bg-white rounded-2xl p-4 border border-dashed border-gray-300">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Booking ID</p>
            <p className="text-xl font-black text-amazon-navy tracking-widest">MN-{Math.floor(Math.random() * 90000) + 10000}</p>
         </div>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <button 
          onClick={onBack}
          className="w-full py-5 bg-amazon-yellow text-amazon-navy rounded-[2rem] text-sm font-black shadow-xl hover:shadow-amazon-yellow/20 transition-all active:scale-95 uppercase tracking-widest"
        >
          Back to Details
        </button>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-transparent border-2 border-gray-200 hover:border-black text-black rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Close Navigator
        </button>
      </div>
    </div>
  );
}
