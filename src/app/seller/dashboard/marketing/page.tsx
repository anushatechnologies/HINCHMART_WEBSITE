"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Tag, Zap, Mail, PlusCircle, RefreshCw, Loader2, Calendar, Target, IndianRupee,
  Rocket, Search, Filter, Copy, Check, TrendingUp, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'coupons', label: 'Coupons & Discounts', icon: Tag },
  { key: 'flash', label: 'Flash Sales', icon: Zap },
  { key: 'ads', label: 'Sponsored Ads', icon: Megaphone },
  { key: 'emails', label: 'Email Campaigns', icon: Mail },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function MarketingHub() {
  const [tab, setTab] = useState('coupons');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Data States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);

  // Form States
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState('PERCENTAGE');
  const [cValue, setCValue] = useState('');

  const [fProd, setFProd] = useState('');
  const [fDisc, setFDisc] = useState('');
  const [fStart, setFStart] = useState('');
  const [fEnd, setFEnd] = useState('');

  const [aType, setAType] = useState('SPONSORED_PRODUCT');
  const [aBudget, setABudget] = useState('');

  const [eSubj, setESubj] = useState('');
  const [eBody, setEBody] = useState('');
  const [eAudience, setEAudience] = useState('ALL_CUSTOMERS');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'coupons') {
        const res = await fetch(`${API}/vendors/marketing/coupons?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setCoupons(data.data);
      }
      if (tab === 'flash') {
        const res = await fetch(`${API}/vendors/marketing/flash-sales?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setFlashSales(data.data);
      }
      if (tab === 'ads') {
        const res = await fetch(`${API}/vendors/marketing/ads?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setAds(data.data);
      }
      if (tab === 'emails') {
        const res = await fetch(`${API}/vendors/marketing/emails?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setEmails(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Actions
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/marketing/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, code: cCode, type: cType, value: cValue })
      });
      if ((await res.json()).success) {
        setCCode(''); setCValue(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/marketing/flash-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, productId: fProd, discountPercent: fDisc, startTime: fStart, endTime: fEnd })
      });
      if ((await res.json()).success) {
        setFProd(''); setFDisc(''); setFStart(''); setFEnd(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/marketing/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, type: aType, dailyBudget: aBudget, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 86400000).toISOString() })
      });
      if ((await res.json()).success) {
        setABudget(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/marketing/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, subject: eSubj, content: eBody, targetAudience: eAudience })
      });
      if ((await res.json()).success) {
        setESubj(''); setEBody(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Growth & Marketing</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Rocket size={16} className="text-pink-500" /> Drive sales with coupons, flash sales, and targeted campaigns.
          </p>
        </div>
        <button onClick={loadData} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Metrics
        </button>
      </motion.div>

      {/* Main Container */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all relative
                  ${isActive ? 'border-pink-600 text-pink-700 bg-white shadow-[0_-1px_0_0_#f8fafc]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-pink-500' : ''} /> 
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-0 bg-slate-50/30">
          {loading && coupons.length === 0 && flashSales.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-pink-500 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Syncing marketing data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* 1. Coupons */}
              {tab === 'coupons' && (
                <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 h-full">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Tag size={18} className="text-pink-500" /> Create New Coupon
                    </h3>
                    <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end relative z-10">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Coupon Code</label>
                        <input value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} required placeholder="e.g. SUMMER10" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-mono font-bold uppercase" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discount Type</label>
                        <select value={cType} onChange={e => setCType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-semibold text-slate-700">
                          <option value="PERCENTAGE">% Off Percentage</option>
                          <option value="FIXED">Flat ₹ Amount</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Value</label>
                        <input type="number" value={cValue} onChange={e => setCValue(e.target.value)} required placeholder={cType === 'PERCENTAGE' ? "10" : "500"} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-bold" />
                      </div>
                      <div className="md:col-span-3">
                        <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                          <PlusCircle size={18}/> Generate
                        </button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Active Campaigns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coupons.map((c, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                          key={c.id} 
                          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${c.isActive ? 'bg-pink-500' : 'bg-slate-300'}`} />
                          
                          <div className="flex justify-between items-start mb-6 pl-2">
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Promo Code</p>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900 text-2xl tracking-tight">{c.code}</h4>
                                <button 
                                  onClick={() => copyToClipboard(c.code)}
                                  className="text-slate-400 hover:text-pink-600 transition-colors p-1"
                                >
                                  {copiedCode === c.code ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                                </button>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {c.isActive ? 'ACTIVE' : 'EXPIRED'}
                            </span>
                          </div>
                          
                          <div className="pl-2 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg border border-pink-100">
                              <Tag size={14} className="shrink-0" />
                              <span className="font-bold text-sm">{c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}</span>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Target size={14} className="text-slate-400"/> Total Uses
                              </span>
                              <span className="font-black text-slate-900">{c.usedCount}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {coupons.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <Tag size={40} className="mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">No coupons generated yet. Create one to boost sales!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Flash Sales */}
              {tab === 'flash' && (
                <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 h-full">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap size={20} className="text-yellow-300" /> Schedule Flash Sale
                    </h3>
                    <form onSubmit={handleAddFlashSale} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end relative z-10">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Product ID</label>
                        <input type="number" value={fProd} onChange={e => setFProd(e.target.value)} required placeholder="e.g. 1024" className="w-full px-4 py-2.5 border-0 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-mono" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Discount %</label>
                        <input type="number" value={fDisc} onChange={e => setFDisc(e.target.value)} required placeholder="50" className="w-full px-4 py-2.5 border-0 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-bold" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Starts At</label>
                        <input type="datetime-local" value={fStart} onChange={e => setFStart(e.target.value)} required className="w-full px-4 py-2.5 border-0 rounded-xl bg-white/10 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all [color-scheme:dark]" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Ends At</label>
                        <input type="datetime-local" value={fEnd} onChange={e => setFEnd(e.target.value)} required className="w-full px-4 py-2.5 border-0 rounded-xl bg-white/10 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all [color-scheme:dark]" />
                      </div>
                      <div className="md:col-span-1">
                        <button type="submit" disabled={loading} className="w-full bg-white text-orange-600 h-[44px] rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-lg shadow-black/10 flex items-center justify-center">
                          <PlusCircle size={20}/>
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashSales.map((f, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                        key={f.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                              <Zap size={24} className={f.status === 'ACTIVE' ? 'animate-pulse' : ''} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Product #{f.productId}</p>
                              <h4 className="font-bold text-slate-900 line-clamp-1">{f.product?.name || 'Unknown Product'}</h4>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-end gap-2 mb-6">
                          <span className="text-4xl font-black text-orange-500 tracking-tighter">{f.discountPercent}%</span>
                          <span className="text-slate-500 font-bold mb-1">OFF</span>
                        </div>
                        
                        <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar size={12}/> Starts</span>
                            <span className="font-bold text-slate-900">{new Date(f.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar size={12}/> Ends</span>
                            <span className="font-bold text-slate-900">{new Date(f.endTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                          </div>
                        </div>
                        
                        <div className="absolute top-4 right-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${f.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {f.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {flashSales.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <Zap size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No flash sales scheduled.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3. Advertising */}
              {tab === 'ads' && (
                <motion.div key="ads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 h-full">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" /> Launch Ad Campaign
                    </h3>
                    <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                      <div className="md:col-span-5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Campaign Type</label>
                        <select value={aType} onChange={e => setAType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold text-slate-700">
                          <option value="SPONSORED_PRODUCT">Sponsored Product Placement</option>
                          <option value="BANNER_AD">Homepage Banner Ad</option>
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Daily Budget (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><IndianRupee size={16} className="text-slate-400"/></div>
                          <input type="number" value={aBudget} onChange={e => setABudget(e.target.value)} required placeholder="500" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold" />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                          <Rocket size={18}/> Launch
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Campaign Details</th>
                          <th className="px-6 py-4">Daily Budget</th>
                          <th className="px-6 py-4">Duration (7 Days)</th>
                          <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ads.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12">
                              <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
                              <p className="text-slate-500 font-medium">No active ad campaigns.</p>
                            </td>
                          </tr>
                        ) : ads.map((a, idx) => (
                          <motion.tr 
                            key={a.id} 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                  {a.type === 'BANNER_AD' ? <Target size={18}/> : <Megaphone size={18}/>}
                                </div>
                                <span className="font-bold text-slate-900">{a.type.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-black text-slate-900">₹{a.dailyBudget}</span>
                              <span className="text-xs text-slate-500 font-semibold ml-1">/ day</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                              {new Date(a.startDate).toLocaleDateString()} <span className="text-slate-400 mx-1">→</span> {new Date(a.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border bg-blue-50 text-blue-700 border-blue-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                {a.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 4. Email Campaigns */}
              {tab === 'emails' && (
                <motion.div key="emails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Compose Email */}
                    <div className="lg:col-span-5">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                          <Mail size={20} className="text-purple-400" /> New Broadcast
                        </h3>
                        
                        <form onSubmit={handleSendEmail} className="space-y-5 relative z-10">
                          <div>
                            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Target Audience</label>
                            <div className="relative">
                              <select value={eAudience} onChange={e => setEAudience(e.target.value)} className="w-full px-4 py-3 border-0 rounded-xl bg-white/10 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-semibold appearance-none">
                                <option value="ALL_CUSTOMERS" className="text-slate-900">All Past Customers</option>
                                <option value="REPEAT_CUSTOMERS" className="text-slate-900">Repeat Customers (&gt;1 order)</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Subject Line</label>
                            <input value={eSubj} onChange={e => setESubj(e.target.value)} required placeholder="Exclusive Offer Inside!" className="w-full px-4 py-3 border-0 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Email Body</label>
                            <textarea value={eBody} onChange={e => setEBody(e.target.value)} required placeholder="Type your message here..." className="w-full px-4 py-3 border-0 rounded-xl bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium resize-none" rows={6}></textarea>
                          </div>
                          <button type="submit" disabled={loading} className="w-full bg-purple-500 text-white px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-purple-600 transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 mt-2">
                            <Rocket size={18}/> Send Campaign Now
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    {/* History */}
                    <div className="lg:col-span-7">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Broadcasts</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {emails.length === 0 ? (
                          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <Mail size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">No email campaigns sent yet.</p>
                          </div>
                        ) : emails.map((e, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                            key={e.id} 
                            className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all group cursor-default"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-slate-900 text-lg group-hover:text-purple-700 transition-colors">{e.subject}</h4>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-2.5 py-1 rounded-lg border border-slate-200">{e.status}</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">{e.content}</p>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                  <Target size={14} className="text-purple-500"/> 
                                  <strong className="text-slate-900">{e.targetAudience.replace('_', ' ')}</strong>
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                  <Mail size={14} className="text-blue-500"/> 
                                  Delivered: <strong className="text-slate-900">{e.sentCount}</strong>
                                </span>
                              </div>
                              <span className="text-slate-400 font-medium">{new Date(e.createdAt).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
