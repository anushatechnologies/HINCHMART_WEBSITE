"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, Save, Loader2, RefreshCw
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'sms', label: 'SMS', icon: MessageSquare },
  { key: 'push', label: 'Push App', icon: Bell },
  { key: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
];

export default function NotificationsHub() {
  const [tab, setTab] = useState('email');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<any>(null);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/notifications/settings?vendorId=${vendorId}`);
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/vendors/notifications/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if ((await res.json()).success) {
        // Show success toast or animation here
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleEvent = (channel: string, event: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [`${channel}Events`]: {
        ...prev[`${channel}Events`],
        [event]: !prev[`${channel}Events`][event]
      }
    }));
  };

  const EVENT_LISTS: Record<string, { key: string, label: string, desc: string }[]> = {
    email: [
      { key: 'newOrder', label: 'New Orders', desc: 'Receive an email when a customer places a new order.' },
      { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when a product inventory drops below 10 units.' },
      { key: 'customerMessage', label: 'Customer Messages', desc: 'Alerts for direct messages from customers.' },
      { key: 'returnRequest', label: 'Return Requests', desc: 'When a customer requests an order refund or return.' }
    ],
    sms: [
      { key: 'newOrder', label: 'High Value Orders', desc: 'Text message for orders exceeding ₹5000.' },
      { key: 'urgentTicket', label: 'Urgent Support Tickets', desc: 'Immediate SMS alert for URGENT priority tickets.' }
    ],
    push: [
      { key: 'newOrder', label: 'New Orders', desc: 'In-app notification for all new orders.' },
      { key: 'customerMessage', label: 'Customer Chat', desc: 'Real-time alert for live chat messages.' }
    ],
    whatsapp: [
      { key: 'newOrder', label: 'Order Summaries', desc: 'Daily WhatsApp summary of new orders.' },
      { key: 'shippingUpdate', label: 'Shipping Exceptions', desc: 'Alerts if a courier marks a shipment as failed.' }
    ]
  };

  if (loading && !settings) {
    return <div className="flex justify-center items-center h-[500px]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification Preferences</h1>
          <p className="text-slate-500 mt-1">Control how and when you receive alerts for your store.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[500px]">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-row md:flex-col p-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const isEnabled = settings[`${t.key}Enabled`];
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${tab === t.key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                <div className="flex items-center gap-3"><Icon size={16} /> {t.label}</div>
                <div className={`w-2 h-2 rounded-full ${isEnabled ? (tab === t.key ? 'bg-indigo-300' : 'bg-emerald-500') : (tab === t.key ? 'bg-indigo-400' : 'bg-slate-300')}`}></div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSave} className="max-w-2xl">
            {/* Header / Global Toggle */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 capitalize">{tab} Alerts</h2>
                <p className="text-sm text-slate-500 mt-1">Configure your {tab} notification settings.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings[`${tab}Enabled`]} 
                  onChange={(e) => setSettings({ ...settings, [`${tab}Enabled`]: e.target.checked })} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Contact Input (if applicable) */}
            {tab !== 'push' && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2 capitalize">Primary {tab} Contact</label>
                <input 
                  type={tab === 'email' ? 'email' : 'text'}
                  value={settings[`${tab === 'email' ? 'emailAddress' : tab === 'sms' ? 'phoneNumber' : 'whatsappNumber'}`] || ''}
                  onChange={(e) => setSettings({ ...settings, [`${tab === 'email' ? 'emailAddress' : tab === 'sms' ? 'phoneNumber' : 'whatsappNumber'}`]: e.target.value })}
                  placeholder={tab === 'email' ? 'store@example.com' : '+91 9876543210'}
                  className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:bg-slate-50"
                  disabled={!settings[`${tab}Enabled`]}
                />
                <p className="text-xs text-slate-500 mt-2">Alerts will be sent to this destination.</p>
              </div>
            )}

            {/* Event Toggles */}
            <div className={`space-y-6 ${!settings[`${tab}Enabled`] ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alert Triggers</h3>
              
              <div className="space-y-4">
                {EVENT_LISTS[tab].map(event => (
                  <div key={event.key} className="flex items-start justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors">
                    <div className="pr-4">
                      <h4 className="font-bold text-slate-800 text-sm">{event.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{event.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={!!settings[`${tab}Events`][event.key]} 
                        onChange={() => toggleEvent(tab, event.key)} 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70 min-w-[140px] justify-center"
              >
                {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
