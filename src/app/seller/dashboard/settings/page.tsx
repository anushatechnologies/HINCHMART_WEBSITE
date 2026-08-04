"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Store, Truck, CreditCard, Key, Webhook, Shield, Bell, Save, Plus, Trash2, Copy, Loader2, RefreshCw, CheckCircle2,
  ChevronRight, Lock, Eye, EyeOff, Globe
} from 'lucide-react';
import KycStatus from './KycStatus';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'general', label: 'Store Identity', icon: Store, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'shipping', label: 'Shipping & Delivery', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'payments', label: 'Payments & Billing', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'apikeys', label: 'API Keys', icon: Key, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'security', label: 'Security', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
  { key: 'kyc', label: 'KYC & Verification', icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-50' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const contentVariants = { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

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
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-slate-50/50 rounded-3xl">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <Settings size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <p className="mt-4 text-slate-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  if (!settings) return null;

  const activeTabConfig = TABS.find(t => t.key === tab) || TABS[0];
  const ActiveIcon = activeTabConfig.icon;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <motion.div variants={{hidden: {opacity: 0, y: -20}, show: {opacity: 1, y: 0}}} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Store Identity & Settings</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Settings size={16} className="text-slate-400" /> Configure your storefront, shipping rules, and developer access.
          </p>
        </div>
        <button onClick={loadData} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Platform
        </button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <motion.div variants={{hidden: {opacity: 0, x: -20}, show: {opacity: 1, x: 0}}} className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-3 sticky top-6">
            <div className="space-y-1">
              {TABS.map(t => {
                const Icon = t.icon;
                const isActive = tab === t.key;
                return (
                  <button 
                    key={t.key} 
                    onClick={() => setTab(t.key)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group
                      ${isActive ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/10' : t.bg} transition-colors`}>
                        <Icon size={18} className={isActive ? 'text-white' : t.color} />
                      </div>
                      <span className="font-bold text-sm">{t.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-white/50" />}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <button onClick={() => router.push('/seller/dashboard/notifications')}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-1.5 rounded-lg bg-slate-100"><Bell size={18} className="text-slate-500" /></div>
                Notifications Center
              </button>
              <a href="https://seller.hinchmart.com/help" target="_blank" rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-1.5 rounded-lg bg-slate-100"><Globe size={18} className="text-slate-500" /></div>
                Help & Support
              </a>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={contentVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[600px] flex flex-col"
            >
              
              {/* Tab Header */}
              <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 rounded-t-2xl">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTabConfig.bg}`}>
                  <ActiveIcon size={24} className={activeTabConfig.color} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{activeTabConfig.label}</h2>
                  <p className="text-sm text-slate-500 font-medium">Manage preferences and configurations for this section.</p>
                </div>
              </div>

              <div className="p-8">
                {/* General Tab */}
                {tab === 'general' && (
                  <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-8">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Store / Business Name</label>
                        <input value={settings.businessName || ''} onChange={e => setSettings({...settings, businessName: e.target.value})} required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Support Email</label>
                          <input type="email" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Support Phone</label>
                          <input value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registered Address</label>
                        <textarea value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 resize-none" />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[200px]">
                        {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Store Profile
                      </button>
                    </div>
                  </form>
                )}

                {/* Shipping Tab */}
                {tab === 'shipping' && (
                  <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-8">
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 mb-8">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-amber-100 flex items-center justify-center shrink-0">
                          <Truck size={24} className="text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-amber-900 text-lg">Global Shipping Rules</h3>
                          <p className="text-sm text-amber-700/80 mt-1 leading-relaxed">These rules apply to all products unless overridden at the individual product level. Ensure your rates are competitive.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Default Flat Shipping Fee (₹)</label>
                        <div className="relative max-w-sm">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                          <input type="number" step="0.01" value={settings.shippingFee || ''} onChange={e => setSettings({...settings, shippingFee: e.target.value})} className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-slate-900" />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Free Shipping Threshold (₹)</label>
                        <div className="relative max-w-sm">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                          <input type="number" step="0.01" value={settings.freeShippingThreshold || ''} onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})} placeholder="e.g. 500" className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-slate-900" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm">Orders above this amount receive free shipping. Leave blank to disable this feature.</p>
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-100 flex justify-end">
                      <button type="submit" disabled={saving} className="bg-amber-500 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[200px]">
                        {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Update Logistics
                      </button>
                    </div>
                  </form>
                )}

                {/* Payments Tab */}
                {tab === 'payments' && (
                  <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">GST / Tax Identification Number</label>
                        <input value={settings.gstNumber || ''} onChange={e => setSettings({...settings, gstNumber: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-bold text-slate-900 uppercase" placeholder="22AAAAA0000A1Z5" />
                        <p className="text-xs font-semibold text-slate-500 mt-2">Required for generating B2B invoices and filing tax returns.</p>
                      </div>
                      
                      <div className="p-6 border-2 border-emerald-100 bg-emerald-50/30 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="relative z-10">
                          <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CreditCard size={14}/> Razorpay Connected Account ID
                          </label>
                          <input value={settings.razorpayAccountId || ''} onChange={e => setSettings({...settings, razorpayAccountId: e.target.value})} className="w-full px-4 py-3 border border-emerald-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-bold text-emerald-900" placeholder="acc_..." />
                          <div className="flex items-start gap-2 mt-3 p-3 bg-emerald-100/50 rounded-lg">
                            <Shield size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-emerald-800 leading-relaxed">This ID links your bank account to our marketplace. It is strictly required to receive automated, daily payouts from successful orders.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[200px]">
                        {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} Save Billing Info
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {tab === 'security' && (
                  <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-8">
                    
                    <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <Lock size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">Two-Factor Authentication (2FA)</h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.twoFactorEnabled || false} onChange={e => setSettings({...settings, twoFactorEnabled: e.target.checked})} />
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                          </label>
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">Protect your seller account with an extra layer of security. When enabled, you'll need to enter a time-sensitive code along with your password when logging in.</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button type="submit" disabled={saving} className="bg-red-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[200px]">
                        {saving ? <Loader2 size={18} className="animate-spin"/> : <Shield size={18}/>} Update Security Policy
                      </button>
                    </div>
                  </form>
                )}

                {/* API Keys */}
                {tab === 'apikeys' && (
                  <div className="max-w-4xl space-y-8">
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-purple-900 mb-8 flex gap-4 items-start">
                      <Key size={24} className="text-purple-600 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-1">Developer API Access</h3>
                        <p className="text-sm font-medium text-purple-800/80 leading-relaxed">Generate secret keys to securely authenticate external integrations, ERP systems, or custom inventory management software with your HinchMart seller account.</p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {revealedKey && (
                        <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-900 to-slate-900 border border-purple-800 rounded-2xl p-6 mb-8 text-white relative shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                              <CheckCircle2 className="text-emerald-400"/> New Key Generated: {revealedKey.name}
                            </h3>
                            <p className="text-sm text-purple-200 mt-2 mb-6 font-medium relative z-10 max-w-xl">This is your secret key. <strong className="text-white">Copy it now and store it securely.</strong> You will not be able to see it again after closing this tab.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                              <div className="flex-1 relative">
                                <input readOnly value={revealedKey.key} className="w-full px-4 py-3 bg-black/40 border border-purple-500/50 rounded-xl text-sm font-mono text-purple-300 focus:outline-none" />
                              </div>
                              <button onClick={() => { navigator.clipboard.writeText(revealedKey.key); alert('Copied to clipboard'); }} className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/50 shrink-0">
                                <Copy size={16}/> Copy to Clipboard
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-4 items-end p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New API Key Name</label>
                        <input value={newApiKeyName} onChange={e => setNewApiKeyName(e.target.value)} required placeholder="e.g. ERP Integration Prod" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-slate-900" />
                      </div>
                      <button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
                        <Plus size={18}/> Generate Key
                      </button>
                    </form>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden mt-8 shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Key Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Secret Prefix</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created Date</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {settings.apiKeys?.map((k: any) => (
                            <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900">{k.name}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs rounded-lg font-bold">
                                  {k.keyPrefix}••••••••
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                {new Date(k.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteApiKey(k.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors">
                                  <Trash2 size={16}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!settings.apiKeys || settings.apiKeys.length === 0) && (
                            <tr>
                              <td colSpan={4} className="text-center py-12">
                                <Key size={32} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No API keys found. Generate one to connect external apps.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Webhooks */}
                {tab === 'webhooks' && (
                  <div className="max-w-4xl space-y-8">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-900 mb-8 flex gap-4 items-start">
                      <Webhook size={24} className="text-indigo-600 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-1">Event Webhooks</h3>
                        <p className="text-sm font-medium text-indigo-800/80 leading-relaxed">Listen to real-time events on your store. When an event triggers, we will send an HTTP POST request with the JSON payload to the URL you specify.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleCreateWebhook} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Event Subscription</label>
                        <select value={newWebhookEvent} onChange={e => setNewWebhookEvent(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold text-slate-700 appearance-none">
                          <option value="order.created">order.created</option>
                          <option value="order.updated">order.updated</option>
                          <option value="product.stock_low">product.stock_low</option>
                        </select>
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Payload URL</label>
                        <input type="url" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} required placeholder="https://api.yoursite.com/webhook" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
                          <Plus size={18}/> Add
                        </button>
                      </div>
                    </form>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden mt-8 shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribed Event</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Endpoint URL</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {settings.webhooks?.map((w: any) => (
                            <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs rounded-lg font-bold">
                                  {w.events[0]}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm text-slate-600 truncate max-w-sm block">
                                  {w.url}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteWebhook(w.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors">
                                  <Trash2 size={16}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!settings.webhooks || settings.webhooks.length === 0) && (
                            <tr>
                              <td colSpan={3} className="text-center py-12">
                                <Webhook size={32} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No webhooks registered.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* KYC Tab */}
                {tab === 'kyc' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 text-teal-900 mb-8 flex gap-4 items-start">
                      <Shield size={24} className="text-teal-600 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-1">Identity & Business Verification</h3>
                        <p className="text-sm font-medium text-teal-800/80 leading-relaxed">Complete your KYC to unlock full marketplace features, including unlimited payouts and featured seller status.</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
                       <KycStatus />
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
