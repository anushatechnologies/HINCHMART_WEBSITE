'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, ShoppingBag, Tag, Settings, Info, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const TYPE_ICONS: Record<string, any> = {
  ORDER: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  PROMO: { icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  SYSTEM: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
  REWARD: { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data) setNotifications(data.data);
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/notifications/settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data) setSettings(data.data);
    } catch (e) { 
      console.error(e); 
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/notifications/mark-all-read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const markRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/notifications/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg({ text: 'Preferences saved successfully!', type: 'success' });
        setTimeout(() => setSettingsMsg({ text: '', type: '' }), 3000);
      }
    } catch (e) { 
      setSettingsMsg({ text: 'Failed to save preferences.', type: 'error' }); 
    }
    setSavingSettings(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
            Notifications
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="bg-blue-600 text-white text-sm font-black px-3 py-1 rounded-full shadow-md shadow-blue-600/20"
                >
                  {unreadCount} New
                </motion.span>
              )}
            </AnimatePresence>
          </h1>
          <p className="text-slate-500 font-medium">Manage your activity alerts and notification preferences.</p>
        </div>
        
        {unreadCount > 0 && activeTab === 'all' && (
          <button 
            onClick={markAllRead} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <CheckCheck size={16} className="text-blue-500" /> Mark all as read
          </button>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Modern Tabs */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-2 w-full max-w-md mx-auto sm:mx-0 p-1 bg-slate-100/50 rounded-2xl">
            {[{ key: 'all', label: 'Inbox', icon: Bell }, { key: 'settings', label: 'Preferences', icon: Settings }].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all relative ${
                  activeTab === tab.key 
                  ? 'text-blue-600 shadow-sm bg-white' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Inbox...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* Inbox Tab */}
              {activeTab === 'all' && (
                <motion.div 
                  key="inbox"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                >
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      <AnimatePresence>
                        {notifications.map((n, idx) => {
                          const conf = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM;
                          const Icon = conf.icon;
                          
                          return (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                              key={n.id} 
                              onClick={() => !n.isRead && markRead(n.id)}
                              className={`p-6 flex items-start gap-5 cursor-pointer transition-colors group relative overflow-hidden ${
                                n.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-blue-50/30 hover:bg-blue-50/60'
                              }`}
                            >
                              {!n.isRead && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                              )}
                              
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm group-hover:scale-105 transition-transform ${conf.bg} ${conf.color} ${conf.border}`}>
                                <Icon size={20} />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                                  <p className={`font-bold text-base tracking-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {n.title}
                                  </p>
                                  <div className="flex items-center gap-2 shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                    {!n.isRead && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-sm ml-1">New</span>}
                                  </div>
                                </div>
                                <p className={`text-sm ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                  {n.message}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 relative border border-slate-100 shadow-sm">
                        <Bell size={40} className="text-slate-300 relative z-10" />
                        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">You're All Caught Up</h3>
                      <p className="text-slate-500 font-medium mb-8 max-w-sm">There are no new notifications. Check back later for updates on your orders and exclusive promotions.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && settings && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                  className="p-6 sm:p-10 max-w-3xl mx-auto"
                >
                  <div className="mb-10 text-center">
                    <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight mb-2">Notification Preferences</h3>
                    <p className="text-slate-500 font-medium">Control what alerts you receive and how you receive them.</p>
                  </div>
                  
                  <AnimatePresence>
                    {settingsMsg.text && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mb-8 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm ${settingsMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {settingsMsg.type === 'success' ? <Check size={18} /> : <Info size={18} />}
                        {settingsMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bg-slate-50 rounded-3xl border border-slate-100 p-2 shadow-sm mb-8">
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive order confirmations and tracking updates via email.' },
                      { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Get real-time delivery status texts on your registered mobile number.' },
                      { key: 'pushAlerts', label: 'Push Notifications', desc: 'Receive instant alerts on your browser while you shop.' },
                      { key: 'promoEmails', label: 'Promotional Offers', desc: 'Exclusive deals, discounts, and new arrivals tailored for you.' },
                    ].map((item, index) => (
                      <div key={item.key} className={`flex items-center justify-between p-6 sm:px-8 bg-white ${index === 0 ? 'rounded-t-2xl' : ''} ${index === 3 ? 'rounded-b-2xl' : ''} border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors`}>
                        <div className="pr-8">
                          <p className="font-black text-slate-900 mb-1">{item.label}</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shadow-inner shrink-0 outline-none focus:ring-4 focus:ring-blue-500/20 ${settings[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingSettings ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCheck size={20} />}
                    {savingSettings ? 'Saving Securely...' : 'Save Preferences'}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
