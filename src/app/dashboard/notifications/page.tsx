'use client';
import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, ShoppingBag, Tag, Settings, Info } from 'lucide-react';

const API = 'http://localhost:5000';

const TYPE_ICONS: Record<string, any> = {
  ORDER: ShoppingBag,
  PROMO: Tag,
  SYSTEM: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

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
      if (data.success) setNotifications(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/notifications/settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (e) { console.error(e); }
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
      if (data.success) setSettingsMsg('Preferences saved successfully!');
    } catch (e) { setSettingsMsg('Failed to save.'); }
    setSavingSettings(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Manage your activity alerts and notification preferences.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline self-start sm:self-auto">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-8">
        {[{ key: 'all', label: 'All Notifications', icon: Bell }, { key: 'settings', label: 'Preferences', icon: Settings }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map(n => {
                const Icon = TYPE_ICONS[n.type] || Info;
                return (
                  <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
                    className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'ORDER' ? 'bg-blue-50 text-blue-600' : n.type === 'PROMO' ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className={`font-bold text-slate-900 text-sm ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-1">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <Bell size={64} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Notifications</h3>
              <p className="text-slate-500">You're all caught up! Notifications about your orders and promotions will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl">
          <h3 className="font-extrabold text-slate-900 text-xl mb-6">Notification Preferences</h3>
          {settingsMsg && <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-200">{settingsMsg}</div>}
          <div className="space-y-6">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email' },
              { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Get order status via SMS' },
              { key: 'pushAlerts', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'promoEmails', label: 'Promotional Emails', desc: 'Deals, offers, and new arrivals' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${settings[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleSaveSettings} disabled={savingSettings} className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-60">
            {savingSettings ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
