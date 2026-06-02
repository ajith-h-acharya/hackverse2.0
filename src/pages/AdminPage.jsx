import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, History, Lock, Compass, Trash2, Edit3, LogOut, 
  RefreshCw, Search, Database, Activity, Check, X, ShieldAlert, AlertTriangle
} from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: {}, friendRequests: [], loginHistory: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState(null); // The user object currently being edited
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', squadSize: '', expeditionDays: '', password: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const adminEmail = localStorage.getItem('mangalore_user_email') || '';
  const adminToken = localStorage.getItem('mangalore_session_token') || '';

  // Redirect if not the designated admin
  useEffect(() => {
    if (adminEmail !== 'admin_ajith@gmail.com' || !adminToken) {
      alert("Unauthorized! Administrative clearance required.");
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [adminEmail, adminToken]);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorNotice('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/admin/data?email=${encodeURIComponent(adminEmail)}&token=${encodeURIComponent(adminToken)}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Access denied.");
      }

      const dbData = await res.json();
      setData(dbData);
    } catch (err) {
      console.error(err);
      setErrorNotice(err.message || "Failed to contact telemetry server.");
      alert("Clearance check failed: " + err.message);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      squadSize: user.squadSize || '4',
      expeditionDays: user.expeditionDays || '5',
      password: ''
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    setIsUpdating(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/admin/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          token: adminToken,
          targetEmail: editUser.email,
          ...editFormData
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "User updated successfully.");
        setEditUser(null);
        fetchAdminData();
      } else {
        alert("Update failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.warn(err);
      alert("Connection failure: Could not update user telemetry.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (targetEmail) => {
    if (targetEmail === adminEmail) {
      alert("Security Breach Avoided: You cannot delete your own administrative console account.");
      return;
    }

    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently DELETE user "${targetEmail}"? This wipes all saved circuits, favorite lists, and collab rights.`)) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          token: adminToken,
          targetEmail: targetEmail
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "User record wiped successfully.");
        fetchAdminData();
      } else {
        alert("Deletion failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.warn(err);
      alert("Connection failure: Could not delete user record.");
    }
  };

  const handleLogout = () => {
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

  // Filter users based on query
  const usersList = Object.values(data.users || {});
  const filteredUsers = usersList.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Compute metrics
  const totalUsers = usersList.length;
  const totalCollabs = (data.friendRequests || []).filter(r => r.status === 'accepted').length;
  
  const totalCircuitsCount = usersList.reduce((acc, curr) => {
    try {
      const hist = curr.circuitHistory ? JSON.parse(curr.circuitHistory) : [];
      const saved = curr.savedCircuits ? JSON.parse(curr.savedCircuits) : [];
      return acc + hist.length + saved.length;
    } catch {
      return acc;
    }
  }, 0);

  if (loading && !data.users) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-amazon-yellow border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-black uppercase tracking-widest text-amazon-yellow">Accessing Telemetry Command Deck...</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-2">Checking clearance for sector 74</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090e1a] text-white font-sans selection:bg-amazon-yellow selection:text-amazon-navy relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-amazon-yellow/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Admin Navbar */}
      <nav className="sticky top-0 z-[100] bg-[#090e1a]/85 backdrop-blur-xl border-b border-white/5 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amazon-yellow rounded-2xl text-amazon-navy shadow-lg rotate-3">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="font-black text-xl tracking-tighter leading-none flex items-center gap-2">
                KUDLA.<span className="text-amazon-yellow">CONTROL</span>
                <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black font-mono">
                  Admin
                </span>
              </h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                Advanced Developer Control Deck
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAdminData}
              className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl transition-all active:scale-95"
              title="Refresh Data Feed"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Panel
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10 relative z-10">
        
        {/* Metric Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'System Explorers', value: totalUsers, desc: 'Registered user nodes in DB', icon: Users, color: 'text-amazon-yellow', bg: 'from-amazon-yellow/10 to-transparent' },
            { label: 'Collab Connects', value: totalCollabs, desc: 'Active accepted sharing pairs', icon: Compass, color: 'text-amazon-orange', bg: 'from-amazon-orange/10 to-transparent' },
            { label: 'Logged Journeys', value: totalCircuitsCount, desc: 'Saved circuits & history count', icon: Activity, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent' },
            { label: 'Security Firewall', value: 'SECURE', desc: 'Password hashes & UUID active', icon: Lock, color: 'text-green-400', bg: 'from-green-500/10 to-transparent' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-left shadow-2xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.bg} rounded-full blur-xl group-hover:scale-125 transition-transform duration-500`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <h3 className="text-4xl font-black relative z-10 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-white/30 mt-1 relative z-10 uppercase tracking-wider">{stat.desc}</p>
            </div>
          ))}
        </section>

        {/* Database Directory and Form Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Users list table (8 cols) */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amazon-yellow rounded-full" />
                  Explorer Directory
                </h2>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-0.5">Manage and inspect registered profiles</p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-11 pr-5 py-2.5 bg-white/[0.03] border border-white/5 focus:border-amazon-yellow/30 rounded-xl text-xs font-bold text-white outline-none transition-colors"
                />
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.01]">
              <table className="w-full border-collapse text-left text-xs text-white">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] font-black text-[9px] uppercase tracking-widest text-white/40">
                    <th className="p-4 pl-6">Explorer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Squad / Days</th>
                    <th className="p-4">Active Token</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-white/40 uppercase tracking-widest font-black">
                        No user nodes match your query
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAdminAccount = u.role === 'admin';
                      return (
                        <tr key={u.email} className="hover:bg-white/[0.02] transition-colors group">
                          {/* User block */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-amazon-yellow font-mono">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'E'}
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-black text-sm text-white flex items-center gap-1.5">
                                  {u.name || 'Anonymous Node'}
                                  {isAdminAccount && (
                                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[7px] px-1 py-0.2 rounded font-black font-mono uppercase">
                                      Sys
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-white/40 font-mono font-medium">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-4 text-white/70 font-mono">
                            {u.phone || '9876543210'}
                          </td>

                          {/* Squad / Days */}
                          <td className="p-4">
                            <span className="text-white font-black">{u.squadSize || '4'} Persons</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">{u.expeditionDays || '5'} Days Loop</span>
                          </td>

                          {/* Session Token */}
                          <td className="p-4 font-mono text-[10px] text-white/50">
                            {u.sessionToken ? (
                              <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold font-sans">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="text-white/20">-</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 pr-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleEditClick(u)}
                                className="p-2 hover:bg-amazon-yellow/10 border border-white/5 hover:border-amazon-yellow/20 text-white/50 hover:text-amazon-yellow rounded-xl transition-all"
                                title="Edit Telemetry"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.email)}
                                disabled={isAdminAccount}
                                className={`p-2 border rounded-xl transition-all ${
                                  isAdminAccount 
                                    ? 'opacity-20 cursor-not-allowed border-white/5 text-white/20' 
                                    : 'hover:bg-red-500/10 border-white/5 hover:border-red-500/20 text-white/50 hover:text-red-400'
                                }`}
                                title={isAdminAccount ? "Cannot wipe system account" : "Wipe Explorer Record"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Security Access Audit Timeline (4 cols) */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse" />
                  Security Access Audit
                </h2>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-0.5">Chronological system telemetry logs</p>
              </div>

              {/* Timeline Container */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {data.loginHistory.length === 0 ? (
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest text-center py-10">No login telemetry recorded</p>
                ) : (
                  [...data.loginHistory].reverse().map((log, idx) => {
                    const isFailure = log.status === 'failure';
                    const formattedTime = new Date(log.timestamp).toLocaleTimeString(undefined, {
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });
                    return (
                      <div key={idx} className="flex gap-3 text-left">
                        {/* Status node dot */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 ${isFailure ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                          <div className="w-0.5 h-full bg-white/5 mt-1" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[9px] font-mono text-white/30">{formattedTime}</span>
                            <span className={`text-[7px] font-black px-1.5 py-0.2 rounded uppercase ${isFailure ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-xs font-black text-white leading-snug truncate mt-0.5">{log.action}</p>
                          <span className="text-[9px] font-mono text-white/40 block leading-none truncate">{log.email}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Total log indicator footer */}
            <div className="border-t border-white/5 pt-4 text-left">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">System Diagnostics</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5 mt-1">
                <ShieldAlert className="w-4 h-4 text-amazon-yellow shrink-0" />
                {data.loginHistory.length} Telemetry Events Logged
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Raw Database Ledger Auditer */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                Raw Database Ledger Viewer
              </h2>
              <p className="text-[10px] font-bold text-white/30 uppercase mt-0.5">Real-time developer raw audit tool (Passwords Omitted)</p>
            </div>
            
            <button 
              onClick={() => {
                const el = document.getElementById('raw-ledger-text');
                if (el) {
                  navigator.clipboard.writeText(el.innerText);
                  alert("Raw Ledger JSON copied to clipboard.");
                }
              }}
              className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Copy Ledger JSON
            </button>
          </div>

          <div className="relative rounded-2xl border border-white/5 bg-black/40 overflow-hidden text-left">
            <pre 
              id="raw-ledger-text"
              className="p-6 text-xs text-blue-300 font-mono overflow-auto max-h-[300px] leading-relaxed custom-scrollbar selection:bg-white/10 selection:text-white"
            >
              {JSON.stringify({
                users: data.users,
                friendRequests: data.friendRequests,
                loginHistory: data.loginHistory
              }, null, 2)}
            </pre>
          </div>
        </section>

      </main>

      {/* Edit User Telemetry Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0e1626] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl text-left animate-in zoom-in duration-300">
            {/* Close Modal button */}
            <button 
              onClick={() => setEditUser(null)}
              className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amazon-yellow/20 text-amazon-yellow flex items-center justify-center shrink-0">
                <Edit3 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Explorer Telemetry</h3>
                <span className="text-[10px] font-mono text-white/40 block truncate">{editUser.email}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditChange} 
                  required
                  className="w-full px-5 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/30 rounded-2xl text-sm font-bold outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Mobile Contact</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={editFormData.phone} 
                  onChange={handleEditChange} 
                  required
                  className="w-full px-5 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/30 rounded-2xl text-sm font-bold outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Squad Size</label>
                  <input 
                    type="number" 
                    name="squadSize" 
                    value={editFormData.squadSize} 
                    onChange={handleEditChange} 
                    min="1"
                    required
                    className="w-full px-5 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/30 rounded-2xl text-sm font-bold outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Expedition Days</label>
                  <input 
                    type="number" 
                    name="expeditionDays" 
                    value={editFormData.expeditionDays} 
                    onChange={handleEditChange} 
                    min="1"
                    required
                    className="w-full px-5 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/30 rounded-2xl text-sm font-bold outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">New Security Key (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  name="password" 
                  value={editFormData.password || ''} 
                  onChange={handleEditChange} 
                  placeholder="Enter new password"
                  className="w-full px-5 py-3.5 bg-white/[0.03] border-2 border-white/5 focus:border-amazon-yellow/30 rounded-2xl text-sm font-bold outline-none transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-4.5 bg-amazon-yellow text-amazon-navy rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-amazon-yellow/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-3 border-amazon-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Telemetry Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
