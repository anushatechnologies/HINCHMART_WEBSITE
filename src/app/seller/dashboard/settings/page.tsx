"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings, Store, Truck, CreditCard, Key, Webhook, Shield, Bell, Save, Plus, Trash2, Copy, Loader2, RefreshCw
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'general', label: 'General Info', icon: Store },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'apikeys', label: 'API Keys', icon: Key },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'security', label: 'Security', icon: Shield },
];

export default function SettingsHub() {
  const router = useRouter();
  const [tab, setTab] = useState('general');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<any>(null);
  
  // API/Webhook Forms
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvent, setNewWebhookEvent] = useState('order.created');
  const [revealedKey, setRevealedKey] = useState<{name: string, key: string} | null>(null);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/settings?vendorId=${vendorId}`);
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/vendors/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, ...settings })
      });
      if ((await res.json()).success) loadData();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !newApiKeyName) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/settings/apikeys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, name: newApiKeyName })
      });
      const json = await res.json();
      if (json.success) {
        setRevealedKey({ name: newApiKeyName, key: json.data.secretKey });
        setNewApiKeyName('');
        loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteApiKey = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`${API}/vendors/settings/apikeys/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !newWebhookUrl) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/settings/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, url: newWebhookUrl, events: [newWebhookEvent] })
      });
      if ((await res.json()).success) {
        setNewWebhookUrl('');
        loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteWebhook = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`${API}/vendors/settings/webhooks/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading && !settings) {
    return <div className="flex justify-center items-center h-[500px]"><Loader2 className="animate-spin text-slate-800" size={40} /></div>;
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Settings</h1>
          <p className="text-slate-500 mt-1">Configure your store, shipping, API access, and security.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[600px]">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 flex flex-row md:flex-col p-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap text-left ${tab === t.key ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
          
          <hr className="my-2 border-slate-200 hidden md:block" />
          
          <button onClick={() => router.push('/seller/dashboard/notifications')}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all whitespace-nowrap text-left text-slate-600 hover:bg-slate-200/50`}>
            <Bell size={16} /> Notifications ↗
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* General Tab */}
          {tab === 'general' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6">General Store Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Store / Business Name</label>
                  <input value={settings.businessName || ''} onChange={e => setSettings({...settings, businessName: e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Support Email</label>
                    <input type="email" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Support Phone</label>
                    <input value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Store Address</label>
                  <textarea value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* Shipping Tab */}
          {tab === 'shipping' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center gap-2"><Truck/> Shipping & Logistics</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Default Flat Shipping Fee (₹)</label>
                  <input type="number" step="0.01" value={settings.shippingFee || ''} onChange={e => setSettings({...settings, shippingFee: e.target.value})} className="w-full max-w-sm px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Applied to orders unless overridden by product rules.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Free Shipping Threshold (₹)</label>
                  <input type="number" step="0.01" value={settings.freeShippingThreshold || ''} onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})} className="w-full max-w-sm px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Orders above this amount receive free shipping. Leave blank to disable.</p>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Save size={16}/> Save Shipping Rules
                </button>
              </div>
            </form>
          )}

          {/* Payments Tab */}
          {tab === 'payments' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center gap-2"><CreditCard/> Payments & Billing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">GST/Tax Identification Number</label>
                  <input value={settings.gstNumber || ''} onChange={e => setSettings({...settings, gstNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                  <label className="block text-sm font-bold text-blue-900 mb-1.5">Razorpay Connected Account ID</label>
                  <input value={settings.razorpayAccountId || ''} onChange={e => setSettings({...settings, razorpayAccountId: e.target.value})} className="w-full px-4 py-2 border border-blue-300 rounded-lg text-sm font-mono" placeholder="acc_..." />
                  <p className="text-xs text-blue-700 mt-2">Required for receiving automated payouts from the marketplace.</p>
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Save size={16}/> Save Billing Info
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center gap-2"><Shield/> Security Settings</h2>
              
              <div className="p-5 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-slate-500 mt-1">Require an extra security code when logging in.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.twoFactorEnabled || false} onChange={e => setSettings({...settings, twoFactorEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={saving} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <Save size={16}/> Update Security Policy
                </button>
              </div>
            </form>
          )}

          {/* API Keys */}
          {tab === 'apikeys' && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center gap-2"><Key/> Developer API Keys</h2>
              
              {revealedKey && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
                  <h3 className="text-emerald-800 font-bold mb-2">New Key Generated: {revealedKey.name}</h3>
                  <p className="text-sm text-emerald-700 mb-4">Please copy this secret key now. You will not be able to see it again.</p>
                  <div className="flex gap-2">
                    <input readOnly value={revealedKey.key} className="flex-1 px-4 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-mono text-emerald-900" />
                    <button onClick={() => navigator.clipboard.writeText(revealedKey.key)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm flex items-center gap-2"><Copy size={16}/> Copy</button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateApiKey} className="flex gap-3 items-end p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">New API Key Name</label>
                  <input value={newApiKeyName} onChange={e => setNewApiKeyName(e.target.value)} required placeholder="e.g. ERP Integration" className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px] flex items-center justify-center gap-2">
                  <Plus size={16}/> Generate Key
                </button>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Prefix</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {settings.apiKeys?.map((k: any) => (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{k.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 bg-slate-100 rounded px-2">{k.keyPrefix}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteApiKey(k.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                    {(!settings.apiKeys || settings.apiKeys.length === 0) && <tr><td colSpan={4} className="text-center py-6 text-slate-500">No API keys found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Webhooks */}
          {tab === 'webhooks' && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-200 mb-6 flex items-center gap-2"><Webhook/> Webhooks</h2>
              
              <form onSubmit={handleCreateWebhook} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Type</label>
                  <select value={newWebhookEvent} onChange={e => setNewWebhookEvent(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option value="order.created">order.created</option>
                    <option value="order.updated">order.updated</option>
                    <option value="product.stock_low">product.stock_low</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Endpoint URL</label>
                    <input type="url" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} required placeholder="https://api.yoursite.com/webhook" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px] mt-auto flex items-center justify-center">
                    Add
                  </button>
                </div>
              </form>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Event</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Endpoint URL</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {settings.webhooks?.map((w: any) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-700 bg-indigo-50 rounded px-2">{w.events[0]}</td>
                        <td className="px-4 py-3 text-slate-600 truncate max-wxs">{w.url}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteWebhook(w.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                    {(!settings.webhooks || settings.webhooks.length === 0) && <tr><td colSpan={3} className="text-center py-6 text-slate-500">No webhooks registered.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
