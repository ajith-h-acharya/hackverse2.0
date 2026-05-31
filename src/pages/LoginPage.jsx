import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Compass, Zap, CheckCircle, Mail, Phone, Users, Calendar } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    squadSize: '',
    expeditionDays: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!isLogin && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, general: null });
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === "Invalid email format") {
           setErrors(prev => ({ ...prev, email: data.error }));
        } else if (data.error === "Mobile number must be 10 digits") {
           setErrors(prev => ({ ...prev, phone: data.error }));
        } else {
           setErrors(prev => ({ ...prev, general: data.error }));
        }
        setLoading(false);
        return;
      }
      
      if (isLogin) {
        const nameFromEmail = formData.email.split('@')[0];
        const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        localStorage.setItem('mangalore_user_name', capitalizedName);
      } else {
        localStorage.setItem('mangalore_user_name', formData.fullName);
      }

      setSuccessLoading(true);
      setTimeout(() => {
        navigate('/home');
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, general: "Server connection failed" }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amazon-navy flex items-center justify-center p-6 font-sans selection:bg-amazon-yellow selection:text-amazon-navy relative overflow-hidden">
      {successLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-amazon-navy/95 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-amazon-yellow rounded-3xl flex items-center justify-center text-amazon-navy shadow-[0_0_50px_rgba(255,185,0,0.4)] animate-bounce mb-8">
            <Compass className="w-12 h-12 animate-spin-slow" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4 animate-pulse">
            {isLogin ? 'Granting Access...' : 'Initializing Protocol...'}
          </h2>
          <p className="text-amazon-yellow font-bold tracking-widest text-sm">
            SECURING CONNECTION TO SECTOR 74
          </p>
        </div>
      )}
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amazon-yellow/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amazon-orange/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none animate-bg-slide" style={{ opacity: 0.35 }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden border-8 border-white/10 animate-in zoom-in duration-500">
        
        {/* Left Side: Brand & Social Proof */}
        <div className="w-full md:w-5/12 bg-amazon-navy p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 opacity-20">
              <img src="https://images.unsplash.com/photo-1590059393160-5627f1234988?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="bg" />
              <div className="absolute inset-0 bg-gradient-to-br from-amazon-navy via-amazon-navy/80 to-transparent" />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-4 text-white font-black text-3xl mb-12">
                 <div className="w-12 h-12 bg-amazon-yellow rounded-2xl flex items-center justify-center text-amazon-navy shadow-xl rotate-3">
                    <Compass className="w-7 h-7" />
                 </div>
                 <span className="tracking-tighter">MANGALORE.<span className="text-amazon-yellow">NAV</span></span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter mb-8 uppercase">
                 {isLogin ? 'Navigate Your Mission.' : 'Begin Your Expedition.'}
              </h1>
              <p className="text-white/60 text-lg font-bold leading-relaxed max-w-sm">
                 {isLogin 
                   ? 'Access the high-performance GIS interface for sector 74. Cultural data and strategic routes await.'
                   : 'Register your squad for the ultimate coastal adventure. Real-time telemetry and hidden gems await.'}
              </p>
           </div>

           <div className="relative z-10 mt-12 space-y-6">
              {[
                { label: 'Secure Access', icon: Shield },
                { label: 'Real-time Telemetry', icon: Zap },
                { label: 'Verified Nodes', icon: CheckCircle }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-amazon-yellow/80">
                   <item.icon className="w-5 h-5" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-12 md:p-16 bg-white flex flex-col justify-center overflow-y-auto max-h-[90vh]">
           <div className="max-w-md mx-auto w-full">
              <div className="mb-10 text-center md:text-left">
                 <h2 className="text-4xl font-black text-black tracking-tight mb-3">
                   {isLogin ? 'Welcome Back' : 'Mission Briefing'}
                 </h2>
                 <p className="text-gray-400 font-bold text-sm">
                   {isLogin ? 'Please identify yourself to continue.' : 'Create your explorer profile to launch.'}
                 </p>
              </div>

              <form onSubmit={handleAction} className="space-y-5">
                 {errors.general && (
                   <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-200">
                     {errors.general}
                   </div>
                 )}
                 {!isLogin && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
                        <div className="relative">
                           <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                           <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Explorer Name" required className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-amazon-navy transition-all outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Phone</label>
                        <div className="relative">
                           <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                           <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" required className={`w-full pl-12 pr-6 py-3 bg-gray-50 border-2 rounded-2xl text-sm font-black transition-all outline-none ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-100 focus:border-amazon-navy'}`} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs font-bold mt-1 pl-2">{errors.phone}</p>}
                      </div>
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Comm-Link Email</label>
                    <div className="relative">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="explorer@mission.com"
                        required
                        className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl text-sm font-black focus:bg-white transition-all outline-none ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-100 focus:border-amazon-navy'}`}
                       />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1 pl-2">{errors.email}</p>}
                 </div>

                 {!isLogin && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Squad Size</label>
                        <div className="relative">
                           <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                           <input type="number" name="squadSize" value={formData.squadSize} onChange={handleChange} min="1" placeholder="People" required className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-amazon-navy transition-all outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Expedition Days</label>
                        <div className="relative">
                           <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                           <input type="number" name="expeditionDays" value={formData.expeditionDays} onChange={handleChange} min="1" placeholder="Duration" required className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-amazon-navy transition-all outline-none" />
                        </div>
                      </div>
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Security Key</label>
                    <div className="relative">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-black focus:border-amazon-navy focus:bg-white transition-all outline-none"
                       />
                    </div>
                 </div>

                 <div className="flex items-center justify-between text-xs font-black px-2">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                       <input type="checkbox" className="w-4 h-4 rounded border-2 border-gray-200 accent-amazon-navy" />
                       Keep Session
                    </label>
                    {isLogin && <a href="#" className="text-amazon-orange hover:underline">Forgot Key?</a>}
                 </div>

                 <button 
                  disabled={loading}
                  className="w-full py-5 bg-amazon-navy text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl hover:shadow-amazon-navy/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-amazon-yellow border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Grant Access' : 'Initiate Protocol'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                 </button>
              </form>

              <div className="mt-10 flex flex-col items-center gap-6">
                 <div className="w-full h-px bg-gray-100 relative">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">or</span>
                 </div>
                 
                 <button 
                   onClick={() => setIsLogin(!isLogin)}
                   className="w-full py-4 border-2 border-gray-100 text-amazon-navy rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amazon-navy hover:bg-gray-50 transition-all active:scale-95"
                 >
                   {isLogin ? "Switch to Registration Mode" : "Switch to Security Login"}
                 </button>

                 <p className="text-xs font-bold text-gray-400">
                    {isLogin ? "No clearance? Request your mission protocol above." : "Already registered? Access the terminal."} 
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
