"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Tag, Zap, Mail, PlusCircle, RefreshCw, Loader2, Calendar, Target, IndianRupee
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'coupons', label: 'Coupons & Combos', icon: Tag },
  { key: 'flash', label: 'Flash Sales', icon: Zap },
  { key: 'ads', label: 'Advertising', icon: Megaphone },
  { key: 'emails', label: 'Email Campaigns', icon: Mail },
];

export default function MarketingHub() {
  const [tab, setTab] = useState('coupons');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Hub</h1>
          <p className="text-slate-500 mt-1">Create coupons, run flash sales, manage ads, and email campaigns.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-pink-600 text-pink-700 bg-pink-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && coupons.length === 0 && flashSales.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Coupons */}
              {tab === 'coupons' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddCoupon} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Coupon Code</label>
                      <input value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} required placeholder="e.g. SUMMER10" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase" />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Type</label>
                      <select value={cType} onChange={e => setCType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option value="PERCENTAGE">% Off</option>
                        <option value="FIXED">Flat ₹ Off</option>
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Value</label>
                      <input type="number" value={cValue} onChange={e => setCValue(e.target.value)} required placeholder="10" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px] flex items-center gap-2">
                      <PlusCircle size={16}/> Create Coupon
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coupons.map(c => (
                      <div key={c.id} className="border border-pink-200 bg-pink-50/30 p-5 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-20 h-20 bg-pink-100 rounded-full opacity-50"></div>
                        <h4 className="font-black text-pink-700 text-xl tracking-wider">{c.code}</h4>
                        <p className="text-slate-600 font-medium mt-1">
                          {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Target size={12}/> {c.usedCount} Uses</span>
                          <span className={`font-bold ${c.isActive ? 'text-emerald-600' : 'text-red-500'}`}>{c.isActive ? 'ACTIVE' : 'EXPIRED'}</span>
                        </div>
                      </div>
                    ))}
                    {coupons.length === 0 && <div className="text-slate-500 text-sm py-4 w-full">No active coupons found.</div>}
                  </div>
                </div>
              )}

              {/* 2. Flash Sales */}
              {tab === 'flash' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddFlashSale} className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product ID</label>
                      <input type="number" value={fProd} onChange={e => setFProd(e.target.value)} required placeholder="e.g. 1024" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount %</label>
                      <input type="number" value={fDisc} onChange={e => setFDisc(e.target.value)} required placeholder="50" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date & Time</label>
                      <input type="datetime-local" value={fStart} onChange={e => setFStart(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date & Time</label>
                      <input type="datetime-local" value={fEnd} onChange={e => setFEnd(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                      <button type="submit" disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
                        <Zap size={16}/> Schedule Flash Sale
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flashSales.map(f => (
                      <div key={f.id} className="border border-orange-200 bg-orange-50/20 p-5 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{f.product?.name || `Product #${f.productId}`}</h4>
                          <p className="text-orange-600 font-black text-lg mt-1">{f.discountPercent}% OFF</p>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-2">
                            <Calendar size={12}/> {new Date(f.startTime).toLocaleString()} - {new Date(f.endTime).toLocaleString()}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${f.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Advertising */}
              {tab === 'ads' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddAd} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campaign Type</label>
                      <select value={aType} onChange={e => setAType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option value="SPONSORED_PRODUCT">Sponsored Product Placement</option>
                        <option value="BANNER_AD">Homepage Banner Ad</option>
                      </select>
                    </div>
                    <div className="w-48">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Daily Budget (₹)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><IndianRupee size={14} className="text-slate-400"/></div>
                        <input type="number" value={aBudget} onChange={e => setABudget(e.target.value)} required placeholder="500" className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors h-[38px] flex items-center gap-2">
                      <Megaphone size={16}/> Start Campaign
                    </button>
                  </form>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Campaign</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Daily Budget</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ads.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{a.type.replace('_', ' ')}</td>
                            <td className="px-4 py-3 font-bold text-slate-700">₹{a.dailyBudget}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Email Campaigns */}
              {tab === 'emails' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <form onSubmit={handleSendEmail} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Mail size={18}/> New Broadcast</h3>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
                          <select value={eAudience} onChange={e => setEAudience(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                            <option value="ALL_CUSTOMERS">All Past Customers</option>
                            <option value="REPEAT_CUSTOMERS">Repeat Customers (&gt;1 order)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject Line</label>
                          <input value={eSubj} onChange={e => setESubj(e.target.value)} required placeholder="Exclusive Offer Inside!" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Body</label>
                          <textarea value={eBody} onChange={e => setEBody(e.target.value)} required placeholder="Type your message here..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={4}></textarea>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                          Send Campaign
                        </button>
                      </form>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      {emails.map(e => (
                        <div key={e.id} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900">{e.subject}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">{e.status}</span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{e.content}</p>
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Audience: <strong className="text-slate-700">{e.targetAudience.replace('_', ' ')}</strong></span>
                            <span>Sent to <strong className="text-slate-900">{e.sentCount}</strong> customers on {new Date(e.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {emails.length === 0 && <div className="text-slate-500 text-sm py-4 border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">No email campaigns sent yet. Create your first broadcast to engage your customers!</div>}
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
