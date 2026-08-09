"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Zap, Mail, PlusCircle, RefreshCw, Loader2, Calendar, Target, IndianRupee,
  Rocket, Copy, Check, TrendingUp, Megaphone
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const TABS = [
  { key: 'coupons', label: 'Coupons',     icon: Tag },
  { key: 'flash',   label: 'Flash Sales', icon: Zap },
  { key: 'ads',     label: 'Sponsored Ads', icon: Megaphone },
  { key: 'emails',  label: 'Email Campaigns', icon: Mail },
];

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-[#E53935] placeholder:text-gray-400 transition-all";
const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5";
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function MarketingHub() {
  const [tab, setTab] = useState('coupons');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);

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

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'coupons') { const r = await fetch(`${API}/vendors/marketing/coupons?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setCoupons(d.data); }
      if (tab === 'flash') { const r = await fetch(`${API}/vendors/marketing/flash-sales?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setFlashSales(d.data); }
      if (tab === 'ads') { const r = await fetch(`${API}/vendors/marketing/ads?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setAds(d.data); }
      if (tab === 'emails') { const r = await fetch(`${API}/vendors/marketing/emails?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setEmails(d.data); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault(); if (!vendorId) return; setLoading(true);
    try { const r = await fetch(`${API}/vendors/marketing/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, code: cCode, type: cType, value: cValue }) }); if ((await r.json()).success) { setCCode(''); setCValue(''); loadData(); } } catch (e) { console.error(e); } setLoading(false);
  };
  const handleAddFlashSale = async (e: React.FormEvent) => {
    e.preventDefault(); if (!vendorId) return; setLoading(true);
    try { const r = await fetch(`${API}/vendors/marketing/flash-sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, productId: fProd, discountPercent: fDisc, startTime: fStart, endTime: fEnd }) }); if ((await r.json()).success) { setFProd(''); setFDisc(''); setFStart(''); setFEnd(''); loadData(); } } catch (e) { console.error(e); } setLoading(false);
  };
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!vendorId) return; setLoading(true);
    try { const r = await fetch(`${API}/vendors/marketing/ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, type: aType, dailyBudget: aBudget, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7*86400000).toISOString() }) }); if ((await r.json()).success) { setABudget(''); loadData(); } } catch (e) { console.error(e); } setLoading(false);
  };
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault(); if (!vendorId) return; setLoading(true);
    try { const r = await fetch(`${API}/vendors/marketing/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendorId, subject: eSubj, content: eBody, targetAudience: eAudience }) }); if ((await r.json()).success) { setESubj(''); setEBody(''); loadData(); } } catch (e) { console.error(e); } setLoading(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Growth & Marketing</h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5"><Rocket size={13} className="text-[#E53935]" /> Drive sales with coupons, flash sales, and campaigns.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 hover:from-[#c62828] hover:to-[#e91e63] transition-all active:scale-95">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync Metrics
        </button>
      </motion.div>

      {/* Main Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-all
                  ${isActive ? 'text-[#E53935]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={14} />{t.label}
                {isActive && <motion.div layoutId="mkt-tab-light" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E53935] to-[#F06292] rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Coupons */}
          {tab === 'coupons' && (
            <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8">
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Tag size={15} className="text-[#E53935]" /> Create New Coupon</h3>
                <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-4"><label className={labelCls}>Coupon Code</label><input value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} required placeholder="SUMMER10" className={`${inputCls} font-mono font-black uppercase`} /></div>
                  <div className="md:col-span-3"><label className={labelCls}>Type</label><select value={cType} onChange={e => setCType(e.target.value)} className={inputCls}><option value="PERCENTAGE">% Percentage Off</option><option value="FIXED">Flat ₹ Amount</option></select></div>
                  <div className="md:col-span-2"><label className={labelCls}>Value</label><input type="number" value={cValue} onChange={e => setCValue(e.target.value)} required placeholder={cType === 'PERCENTAGE' ? '10' : '500'} className={inputCls} /></div>
                  <div className="md:col-span-3"><button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#E53935] to-[#F06292] hover:from-[#c62828] hover:to-[#e91e63] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-400/25 transition-all active:scale-95"><PlusCircle size={15}/> Generate</button></div>
                </form>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4">Active Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((c, idx) => (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                      key={c.id} className="bg-white border border-gray-200 hover:border-red-200 hover:shadow-md rounded-2xl p-5 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-gray-900 text-xl tracking-tight">{c.code}</h4>
                          <button onClick={() => copyToClipboard(c.code)} className="text-gray-300 hover:text-[#E53935] transition-colors p-1">
                            {copiedCode === c.code ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                          </button>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'ACTIVE' : 'EXPIRED'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#E53935] rounded-lg border border-red-100 mb-4">
                        <Tag size={12}/><span className="font-black text-sm">{c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`}</span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-gray-100 pt-3"><span className="text-gray-400 flex items-center gap-1"><Target size={12}/> Uses</span><span className="font-black text-gray-700">{c.usedCount}</span></div>
                    </motion.div>
                  ))}
                  {coupons.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-2xl">
                      <Tag size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-400 text-sm">No coupons yet. Create one to boost sales!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Flash Sales */}
          {tab === 'flash' && (
            <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={15} className="text-orange-500" /> Schedule Flash Sale</h3>
                <form onSubmit={handleAddFlashSale} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3"><label className={labelCls}>Product ID</label><input type="number" value={fProd} onChange={e => setFProd(e.target.value)} required placeholder="1024" className={inputCls} /></div>
                  <div className="md:col-span-2"><label className={labelCls}>Discount %</label><input type="number" value={fDisc} onChange={e => setFDisc(e.target.value)} required placeholder="50" className={inputCls} /></div>
                  <div className="md:col-span-3"><label className={labelCls}>Starts At</label><input type="datetime-local" value={fStart} onChange={e => setFStart(e.target.value)} required className={inputCls} /></div>
                  <div className="md:col-span-3"><label className={labelCls}>Ends At</label><input type="datetime-local" value={fEnd} onChange={e => setFEnd(e.target.value)} required className={inputCls} /></div>
                  <div className="md:col-span-1"><button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white h-[42px] rounded-xl font-bold flex items-center justify-center shadow-lg shadow-orange-400/25 transition-all active:scale-95"><PlusCircle size={17}/></button></div>
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashSales.map((f, idx) => (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.07 }}
                    key={f.id} className="bg-white border border-gray-200 hover:border-orange-200 hover:shadow-md rounded-2xl p-5 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-black text-orange-500">{f.discountPercent}%</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${f.status === 'ACTIVE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{f.status}</span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-1 truncate">{f.product?.name || `Product #${f.productId}`}</p>
                    <div className="space-y-1 text-xs text-gray-400 border-t border-gray-100 pt-3 mt-3">
                      <div className="flex justify-between"><span className="flex items-center gap-1"><Calendar size={11}/> Starts</span><span className="font-bold text-gray-600">{new Date(f.startTime).toLocaleDateString()}</span></div>
                      <div className="flex justify-between"><span className="flex items-center gap-1"><Calendar size={11}/> Ends</span><span className="font-bold text-gray-600">{new Date(f.endTime).toLocaleDateString()}</span></div>
                    </div>
                  </motion.div>
                ))}
                {flashSales.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-2xl">
                    <Zap size={32} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-400 text-sm">No flash sales scheduled.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Ads */}
          {tab === 'ads' && (
            <motion.div key="ads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-blue-500" /> Launch Ad Campaign</h3>
                <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5"><label className={labelCls}>Campaign Type</label><select value={aType} onChange={e => setAType(e.target.value)} className={inputCls}><option value="SPONSORED_PRODUCT">Sponsored Product</option><option value="BANNER_AD">Homepage Banner</option></select></div>
                  <div className="md:col-span-4"><label className={labelCls}>Daily Budget (₹)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"><IndianRupee size={14}/></span><input type="number" value={aBudget} onChange={e => setABudget(e.target.value)} required placeholder="500" className={`${inputCls} pl-9`} /></div></div>
                  <div className="md:col-span-3"><button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-400/25 transition-all active:scale-95"><Rocket size={15}/> Launch</button></div>
                </form>
              </div>
              <table className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden text-left">
                <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Type</th><th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Daily Budget</th><th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Duration</th><th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-100">{ads.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm"><Megaphone size={32} className="mx-auto text-gray-200 mb-3"/>No ad campaigns yet.</td></tr> : ads.map((a, i) => <tr key={a.id} className="hover:bg-gray-50 transition-colors"><td className="px-5 py-4 font-semibold text-gray-700 text-sm">{a.type.replace('_', ' ')}</td><td className="px-5 py-4 font-black text-gray-900 text-sm">₹{a.dailyBudget}/day</td><td className="px-5 py-4 text-gray-400 text-xs font-mono">{new Date(a.startDate).toLocaleDateString()} → {new Date(a.endDate).toLocaleDateString()}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>{a.status}</span></td></tr>)}</tbody>
              </table>
            </motion.div>
          )}

          {/* Emails */}
          {tab === 'emails' && (
            <motion.div key="emails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Mail size={15} className="text-violet-500"/> New Broadcast</h3>
                    <form onSubmit={handleSendEmail} className="space-y-4">
                      <div><label className={labelCls}>Target Audience</label><select value={eAudience} onChange={e => setEAudience(e.target.value)} className={inputCls}><option value="ALL_CUSTOMERS">All Past Customers</option><option value="REPEAT_CUSTOMERS">Repeat Customers</option></select></div>
                      <div><label className={labelCls}>Subject Line</label><input value={eSubj} onChange={e => setESubj(e.target.value)} required placeholder="Exclusive Offer Inside!" className={inputCls} /></div>
                      <div><label className={labelCls}>Email Body</label><textarea value={eBody} onChange={e => setEBody(e.target.value)} required placeholder="Type your message here..." className={`${inputCls} resize-none`} rows={5}></textarea></div>
                      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-400/25 transition-all active:scale-95"><Rocket size={15}/> Send Campaign</button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Broadcasts</h3>
                  <div className="space-y-3">
                    {emails.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl"><Mail size={32} className="mx-auto text-gray-300 mb-3"/><p className="text-gray-400 text-sm">No campaigns sent yet.</p></div>
                    ) : emails.map((e: any, idx: number) => (
                      <div key={e.id} className="bg-white border border-gray-200 hover:border-violet-200 p-4 rounded-xl transition-all">
                        <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-gray-800 text-sm">{e.subject}</h4><span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded-lg uppercase">{e.status}</span></div>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{e.content}</p>
                        <div className="flex justify-between text-xs text-gray-400"><span>To: {e.targetAudience.replace('_', ' ')}</span><span>{new Date(e.createdAt).toLocaleDateString()}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
