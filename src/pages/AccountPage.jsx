import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Users, Calendar, Lock, 
  Eye, EyeOff, Bookmark, History, Heart, Edit3, Save, LogOut, Check, X, ShieldAlert,
  Share2, UserPlus, Link2, UserCheck, RefreshCw
} from 'lucide-react';

export default function AccountPage() {
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    squadSize: '',
    expeditionDays: '',
    sessionToken: ''
  });
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    savedCircuitsCount: 0,
    historyCount: 0,
    favoritesCount: 0
  });

  // Logout modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Collaborative session states
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePhone, setSharePhone] = useState('');
  const [shareNotice, setShareNotice] = useState({ type: '', message: '' });
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [hasBackupSession, setHasBackupSession] = useState(false);
  const [backupEmail, setBackupEmail] = useState('');

  useEffect(() => {
    // Load profile
    const name = localStorage.getItem('mangalore_user_name') || 'Explorer';
    const email = localStorage.getItem('mangalore_user_email') || 'explorer@mission.com';
    const phone = localStorage.getItem('mangalore_user_phone') || '9876543210';
    const squadSize = localStorage.getItem('mangalore_user_squad_size') || '4';
    const expeditionDays = localStorage.getItem('mangalore_user_expedition_days') || '5';
    const sessionToken = localStorage.getItem('mangalore_session_token') || '';

    const loadedProfile = { name, email, phone, squadSize, expeditionDays, sessionToken };
    setProfile(loadedProfile);
    setTempProfile(loadedProfile);

    // Check backup session
    const backup = localStorage.getItem('mangalore_original_user');
    if (backup) {
      setHasBackupSession(true);
      try {
        const parsed = JSON.parse(backup);
        setBackupEmail(parsed.email);
      } catch (err) {
        console.error(err);
      }
    }

    // Load friend requests
    if (email) {
      loadRequests(email);
    }

    // Load metrics
    try {
      const saved = localStorage.getItem('mangalore_saved_circuits');
      const savedCount = saved ? JSON.parse(saved).length : 0;
      
      const historyLog = localStorage.getItem('mangalore_circuit_history');
      const historyCount = historyLog ? JSON.parse(historyLog).length : 0;
      
      const favs = localStorage.getItem('mangalore_favorites');
      const favoritesCount = favs ? JSON.parse(favs).length : 0;

      setStats({
        savedCircuitsCount: savedCount,
        historyCount: historyCount,
        favoritesCount: favoritesCount
      });
    } catch (err) {
      console.error("Failed to load statistics for dashboard", err);
    }
  }, []);

  const handleInputChange = (e) => {
    setTempProfile({
      ...tempProfile,
      [e.target.name]: e.target.value
    });
  };

  const handleStartEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Temporarily halt background sync so we can batch these updates in a single request
    if (window.__setSyncLoading) window.__setSyncLoading(true);
    
    localStorage.setItem('mangalore_user_name', tempProfile.name);
    localStorage.setItem('mangalore_user_phone', tempProfile.phone);
    localStorage.setItem('mangalore_user_squad_size', tempProfile.squadSize);
    
    // Re-enable background sync for the final write to trigger a single backend sync
    if (window.__setSyncLoading) window.__setSyncLoading(false);
    localStorage.setItem('mangalore_user_expedition_days', tempProfile.expeditionDays);
    
    setProfile({ ...tempProfile });
    setIsEditing(false);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleLogout = () => {
    // Clear credentials and all cached telemetry data
    localStorage.removeItem('mangalore_user_name');
    localStorage.removeItem('mangalore_user_email');
    localStorage.removeItem('mangalore_user_phone');
    localStorage.removeItem('mangalore_session_token');
    localStorage.removeItem('mangalore_user_squad_size');
    localStorage.removeItem('mangalore_user_expedition_days');
    localStorage.removeItem('mangalore_saved_circuits');
    localStorage.removeItem('mangalore_circuit_history');
    localStorage.removeItem('mangalore_favorites');
    localStorage.removeItem('mangalore_original_user');
    
    navigate('/login');
  };

  const loadRequests = async (email) => {
    setIsRequestsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('mangalore_session_token') || '';
      const res = await fetch(`${API_URL}/api/friend-requests?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setReceivedRequests(data.received || []);
        setSentRequests(data.sent || []);
      }
    } catch (err) {
      console.warn("Failed to fetch friend requests", err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  const handleSendShareRequest = async (e) => {
    e.preventDefault();
    if (!shareEmail || !sharePhone) {
      setShareNotice({ type: 'error', message: 'Email and phone number are required' });
      return;
    }

    setIsShareLoading(true);
    setShareNotice({ type: '', message: '' });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: profile.email,
          recipientEmail: shareEmail,
          recipientPhone: sharePhone,
          token: localStorage.getItem('mangalore_session_token') || ''
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setShareNotice({ type: 'success', message: 'Invitation sent successfully to ' + shareEmail });
        setShareEmail('');
        setSharePhone('');
        loadRequests(profile.email);
      } else {
        setShareNotice({ type: 'error', message: data.error || 'Failed to send sharing invitation' });
      }
    } catch (err) {
      console.warn(err);
      setShareNotice({ type: 'error', message: 'Offline: Failed to reach sector share server' });
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/friend-request/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId,
          email: profile.email,
          token: localStorage.getItem('mangalore_session_token') || ''
        })
      });
      if (response.ok) {
        loadRequests(profile.email);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel request");
      }
    } catch (err) {
      console.warn(err);
      alert("Failed to communicate with server");
    }
  };

  const handleAcceptRequest = async (requestId, senderEmail) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/friend-request/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId,
          recipientEmail: profile.email,
          token: localStorage.getItem('mangalore_session_token') || ''
        })
      });
      
      if (response.ok) {
        // Automatically switch session to the sender
        await handleSwitchSession(senderEmail);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to accept invite");
      }
    } catch (err) {
      console.warn(err);
      alert("Failed to communicate with share server");
    }
  };

  const handleSwitchSession = async (targetEmail) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('mangalore_session_token') || '';
      const res = await fetch(`${API_URL}/api/user-data?email=${encodeURIComponent(targetEmail.toLowerCase())}&requestorEmail=${encodeURIComponent(profile.email.toLowerCase())}&token=${encodeURIComponent(token)}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.email) {
          // Backup current session details if we aren't already in a shared session
          if (!localStorage.getItem('mangalore_original_user')) {
            const originalUser = {
              name: localStorage.getItem('mangalore_user_name') || '',
              email: localStorage.getItem('mangalore_user_email') || '',
              phone: localStorage.getItem('mangalore_user_phone') || '',
              squadSize: localStorage.getItem('mangalore_user_squad_size') || '',
              expeditionDays: localStorage.getItem('mangalore_user_expedition_days') || '',
              sessionToken: localStorage.getItem('mangalore_session_token') || ''
            };
            localStorage.setItem('mangalore_original_user', JSON.stringify(originalUser));
          }

          // Restore session
          if (window.__setSyncLoading) window.__setSyncLoading(true);
          
          localStorage.setItem('mangalore_user_name', data.name || '');
          localStorage.setItem('mangalore_user_email', data.email);
          localStorage.setItem('mangalore_user_phone', data.phone || '');
          localStorage.setItem('mangalore_user_squad_size', data.squadSize || '4');
          localStorage.setItem('mangalore_user_expedition_days', data.expeditionDays || '5');
          localStorage.setItem('mangalore_saved_circuits', data.savedCircuits || '[]');
          localStorage.setItem('mangalore_circuit_history', data.circuitHistory || '[]');
          localStorage.setItem('mangalore_favorites', data.favorites || '[]');
          
          if (window.__setSyncLoading) window.__setSyncLoading(false);
          
          // Reload to refresh the entire workspace
          window.location.reload();
        } else {
          alert("Target user data was empty");
        }
      } else {
        alert("Failed to load target user details");
      }
    } catch (err) {
      console.warn("Failed to switch session:", err);
      alert("Error switching session");
    }
  };

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
      // Fallback
      localStorage.removeItem('mangalore_original_user');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-amazon-navy text-white font-sans selection:bg-amazon-yellow selection:text-amazon-navy overflow-x-hidden relative">
      {/* Glow effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amazon-yellow/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amazon-orange/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-[100] bg-amazon-navy/80 backdrop-blur-xl border-b border-white/10 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 group-hover:bg-amazon-yellow transition-all group-hover:border-amazon-yellow group-hover:text-amazon-navy">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter leading-none text-left">KUDLA</span>
              <span className="text-[10px] font-black text-amazon-yellow uppercase tracking-widest mt-1">Explorer Hub</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Active Shared Session Header Banner */}
      {hasBackupSession && (
        <div className="w-full bg-gradient-to-r from-amazon-orange/80 via-amazon-yellow/90 to-amazon-orange/80 backdrop-blur-md py-3.5 px-8 flex justify-between items-center z-50 text-amazon-navy border-b border-amazon-orange/30 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-amazon-navy text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse shrink-0">
              Shared Session
            </span>
            <p className="text-xs font-black tracking-wide leading-none">
              ⚡ COLLABORATIVE CONSOLE ACTIVE: Accessing and editing {profile.email}'s map circuits and plans.
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

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* Save success banner */}
        {saveSuccess && (
          <div className="max-w-3xl mx-auto mb-8 animate-in slide-in-from-top duration-300">
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs font-black uppercase tracking-wider">Explorer Credentials Updated Successfully</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Profile stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amazon-yellow/5 rounded-bl-full" />
              
              <div className="w-32 h-32 rounded-full border-4 border-amazon-yellow/30 bg-amazon-navy/40 flex items-center justify-center mx-auto mb-6 relative group overflow-hidden">
                <User className="w-16 h-16 text-amazon-yellow" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amazon-yellow">MN-74</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white truncate tracking-tight">{profile.name}</h2>
              <p className="text-[10px] font-black text-amazon-yellow uppercase tracking-[0.2em] mt-1.5">Registered Explorer</p>
              
              <div className="mt-8 pt-8 border-t border-white/10 space-y-4 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-bold">COMM-LINK STATUS</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-bold">EXPEDITION CLEARANCE</span>
                  <span className="text-white font-black">Level 1</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/40 font-bold">MEMBER SINCE</span>
                  <span className="text-white font-black">June 2026</span>
                </div>
              </div>
            </div>

            {/* Dashboard metrics widgets */}
            <div className="grid grid-cols-3 gap-4">
              <Link to="/saved-circuits" className="bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-[2rem] text-center transition-all group no-underline">
                <Bookmark className="w-6 h-6 text-amazon-yellow mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white">{stats.savedCircuitsCount}</h4>
                <span className="text-[9px] font-black text-white/30 uppercase block mt-1 tracking-wider">Saved</span>
              </Link>

              <Link to="/history" className="bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-[2rem] text-center transition-all group no-underline">
                <History className="w-6 h-6 text-amazon-orange mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white">{stats.historyCount}</h4>
                <span className="text-[9px] font-black text-white/30 uppercase block mt-1 tracking-wider">History</span>
              </Link>

              <Link to="/map?tab=favorites" className="bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-[2rem] text-center transition-all group no-underline">
                <Heart className="w-6 h-6 text-rose-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-black text-white">{stats.favoritesCount}</h4>
                <span className="text-[9px] font-black text-white/30 uppercase block mt-1 tracking-wider">Favorites</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Credentials & Form details */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 text-left relative">
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Explorer Profile</h3>
                  <p className="text-white/40 text-xs font-bold mt-1">Manage credentials and telemetry settings for coastal operations.</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={handleStartEdit}
                    className="px-5 py-2.5 bg-amazon-yellow text-amazon-navy hover:bg-[#F7CA00] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Editable Personal Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Explorer Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Explorer Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="text" 
                        name="name" 
                        value={isEditing ? tempProfile.name : profile.name} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        required
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white disabled:text-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Comm-Link Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Comm-Link Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="email" 
                        name="email" 
                        value={isEditing ? tempProfile.email : profile.email} 
                        onChange={handleInputChange} 
                        disabled={true} 
                        required
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white disabled:text-white opacity-60 cursor-not-allowed transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Mobile Reference</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="tel" 
                        name="phone" 
                        value={isEditing ? tempProfile.phone : profile.phone} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        required
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white disabled:text-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Session Token */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Session Token</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="sessionToken" 
                        value={profile.sessionToken || ''} 
                        disabled={true} 
                        className="w-full pl-12 pr-12 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent rounded-2xl text-sm font-black text-white disabled:text-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Squad Size */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Squad Size</label>
                    <div className="relative">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="number" 
                        name="squadSize" 
                        value={isEditing ? tempProfile.squadSize : profile.squadSize} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        min="1"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white disabled:text-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Expedition Duration */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Expedition Duration (Days)</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="number" 
                        name="expeditionDays" 
                        value={isEditing ? tempProfile.expeditionDays : profile.expeditionDays} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                        min="1"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.03] disabled:bg-transparent border-2 border-white/5 disabled:border-transparent focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white disabled:text-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-6 flex justify-end gap-3 border-t border-white/10">
                    <button 
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Cancel Changes
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-4 bg-amazon-yellow hover:bg-[#F7CA00] text-amazon-navy rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" /> Save Telemetry Details
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Collaborative Sharing Hub */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Share Account access card */}
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-left">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amazon-yellow" />
              Collaborative Share (Add Friend)
            </h3>
            <p className="text-white/40 text-xs font-bold mt-1.5 mb-6 leading-relaxed">
              Enter your friend's login email and phone number. This grants them permission to accept your request and collaboratively access/edit your circuits and plans.
            </p>

            <form onSubmit={handleSendShareRequest} className="space-y-4">
              {shareNotice.message && (
                <div className={`p-3 text-xs font-bold rounded-xl border ${
                  shareNotice.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {shareNotice.message}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Friend's Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="email" 
                    placeholder="friend@email.com"
                    value={shareEmail}
                    onChange={e => setShareEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-6 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Friend's Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="tel" 
                    placeholder="10-digit number"
                    value={sharePhone}
                    onChange={e => setSharePhone(e.target.value)}
                    required
                    className="w-full pl-12 pr-6 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/40 rounded-2xl text-sm font-black text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isShareLoading}
                className="w-full py-4 bg-amazon-yellow text-amazon-navy hover:bg-[#F7CA00] rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isShareLoading ? (
                  <div className="w-5 h-5 border-2 border-amazon-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Connection Request
                  </>
                )}
              </button>
            </form>

            {/* Sent share invites list */}
            {sentRequests.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-widest pl-2">Sent Share Invites</h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {sentRequests.map(req => (
                    <div key={req.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-black text-amazon-yellow uppercase tracking-widest block mb-0.5">
                          {req.status === 'pending' ? 'Pending Acceptance' : 'Connection Active'}
                        </span>
                        <h4 className="text-sm font-black text-white truncate max-w-[160px]">{req.recipientEmail}</h4>
                        <span className="text-[9px] text-white/40 block mt-0.5">{req.recipientPhone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Session Requests & Connections card */}
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amazon-orange" />
                Friend Requests & Shared Sessions
              </h3>
              <p className="text-white/40 text-xs font-bold mt-1.5 mb-6 leading-relaxed">
                Accept requests from friends to log directly into their planning sessions, or reconnect to previously accepted shared accounts.
              </p>

              {isRequestsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-6 h-6 text-amazon-yellow animate-spin" />
                </div>
              ) : receivedRequests.length === 0 ? (
                <div className="py-8 border-2 border-dashed border-white/10 rounded-3xl text-center text-white/30 text-xs font-bold">
                  No sharing requests received yet for this account.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {receivedRequests.map((req) => (
                    <div key={req.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-black text-amazon-yellow uppercase tracking-widest block mb-0.5">
                          {req.status === 'pending' ? 'Pending Share Request' : 'Connected Shared Planner'}
                        </span>
                        <h4 className="text-sm font-black text-white truncate max-w-[200px]">{req.senderEmail}</h4>
                      </div>

                      {req.status === 'pending' ? (
                        <button
                          onClick={() => handleAcceptRequest(req.id, req.senderEmail)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Accept & Connect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSwitchSession(req.senderEmail)}
                          className="px-4 py-2 bg-amazon-orange hover:bg-[#FA8900] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Switch Session
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasBackupSession && (
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amazon-orange/15 border border-amazon-orange/30 flex items-center justify-center text-amazon-orange shrink-0">
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-amazon-orange uppercase tracking-wider block">CONNECTED VIA SHARE</span>
                    <span className="text-[10px] font-bold text-white/70">Original: {backupEmail}</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectSharedSession}
                  className="px-4 py-2 bg-white/10 hover:bg-red-500 hover:text-white border border-white/10 hover:border-red-500/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Disconnect Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-amazon-navy/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-amazon-navy border-2 border-red-500/30 text-white p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(239,68,68,0.15)] max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Confirm Expedition Logoff</h3>
              <p className="text-white/50 text-xs font-bold leading-relaxed">
                Are you sure you want to end your current session? You will be returned to the login terminal to authenticate with your key.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all"
              >
                Logoff Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
