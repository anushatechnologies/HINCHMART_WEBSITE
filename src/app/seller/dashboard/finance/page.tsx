"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, FileText, CreditCard, PieChart, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Loader2, CheckCircle, Clock, ShieldCheck,
  IndianRupee, HandCoins
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const TABS = [
  { key: 'overview',      label: 'Wallet & Profit',      icon: PieChart },
  { key: 'ledger',        label: 'Ledger',               icon: Wallet },
  { key: 'escrow',        label: 'Escrow Holds',         icon: Clock },
  { key: 'invoices',      label: 'Invoices',             icon: FileText },
  { key: 'credit-notes',  label: 'Credit Notes',         icon: CreditCard },
  { key: 'taxes',         label: 'Tax & GST',            icon: ShieldCheck },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };
const thCls = "px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-left";

export default function FinanceHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<any>({});
  const [ledger, setLedger] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'overview') { const r = await fetch(`${API}/vendors/finance/overview?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setOverview(d.data); }
      if (tab === 'ledger') { const r = await fetch(`${API}/vendors/finance/wallet?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setLedger(d.data); }
      if (tab === 'invoices') { const r = await fetch(`${API}/vendors/finance/invoices?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setInvoices(d.data); }
      if (tab === 'taxes') { const r = await fetch(`${API}/vendors/finance/taxes?vendorId=${vendorId}`); const d = await r.json(); if (d.success) setTaxes(d.data); }
      if (tab === 'escrow') { const r = await fetch(`${API}/settlements/escrow?vendorId=${vendorId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('sellerToken')}` } }); const d = await r.json(); if (d.success) setEscrows(d.data); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const statCards = [
    { label: 'Gross Revenue',   value: overview.totalRevenue || 0,  icon: ArrowUpRight,   bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', text: 'text-emerald-700' },
    { label: 'Platform Fees',   value: overview.platformFees || 0,  icon: ArrowDownRight, bg: 'bg-red-50',     border: 'border-red-200',     iconBg: 'bg-red-100',     iconText: 'text-red-600',     text: 'text-red-700' },
    { label: 'Pending',         value: overview.totalPending || 0,  icon: Clock,          bg: 'bg-amber-50',   border: 'border-amber-200',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   text: 'text-amber-700' },
    { label: 'Net Profit',      value: overview.netProfit || 0,     icon: PieChart,       bg: 'bg-violet-50',  border: 'border-violet-200',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  text: 'text-violet-700' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Finance & Accounting</h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5"><HandCoins size={13} className="text-[#E53935]" /> Track wallet, settlements, invoices, and tax reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 hover:from-[#c62828] hover:to-[#e91e63] transition-all active:scale-95">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Ledger
          </button>
        </div>
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
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-all
                  ${isActive ? 'text-[#E53935]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={13} />{t.label}
                {isActive && <motion.div layoutId="fin-tab-light" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E53935] to-[#F06292] rounded-t-full" />}
              </button>
            );
          })}
        </div>

        {loading && !overview.totalRevenue ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-[#E53935] mb-3" />
            <p className="text-gray-400 text-sm">Syncing financial records...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* Overview */}
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
                {/* Wallet Hero */}
                <div className="bg-gradient-to-br from-[#1C1033] to-[#2d1b69] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#E53935]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  <div className="relative z-10">
                    <p className="text-white/60 font-semibold text-sm flex items-center gap-2 mb-2"><Wallet size={15}/> Available Wallet Balance</p>
                    <p className="text-5xl font-black tracking-tight">₹{(overview.walletBalance || 0).toLocaleString()}</p>
                    <p className="text-white/40 text-xs mt-3 flex items-center gap-1"><Clock size={11}/> Next settlement on Monday, 8AM</p>
                    <div className="mt-5 flex gap-3">
                      <button className="bg-white text-[#1C1033] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all shadow-lg">Withdraw to Bank</button>
                      <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">Bank Details</button>
                    </div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
                        <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}><Icon size={16} className={s.iconText} /></div>
                        <p className="text-gray-500 text-xs font-bold mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.text}`}>₹{s.value.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2"><PieChart size={15} className="text-[#E53935]" /> Revenue vs Profit Trend</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.chartData || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E53935" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#E53935" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `₹${v/1000}k`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: '#fff', color: '#111' }} formatter={(v: any, n: any) => [`₹${v?.toLocaleString() || 0}`, n === 'profit' ? 'Net Profit' : 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#9ca3af" strokeWidth={2} fillOpacity={0} />
                        <Area type="monotone" dataKey="profit"  stroke="#E53935" strokeWidth={2.5} fillOpacity={1} fill="url(#rProfit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ledger */}
            {tab === 'ledger' && (
              <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Date', 'Reference', 'Amount', 'Balance After'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledger.length === 0 ? <tr><td colSpan={4} className="text-center py-16 text-gray-400 text-sm"><Wallet size={36} className="mx-auto text-gray-200 mb-3"/>Ledger is empty.</td></tr>
                    : ledger.map((l: any, idx) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-600">{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${l.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {l.type === 'CREDIT' ? <ArrowDownRight size={13}/> : <ArrowUpRight size={13}/>}
                            </div>
                            <div><p className="text-sm font-bold text-gray-700 font-mono">{l.reference}</p><p className="text-xs text-gray-400">{l.description}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`text-sm font-black px-2.5 py-1 rounded-lg ${l.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{l.type === 'CREDIT' ? '+' : '-'}₹{l.amount}</span></td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-600">₹{l.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Escrow */}
            {tab === 'escrow' && (
              <motion.div key="escrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Release Date', 'Order', 'Gross', 'Taxes', 'Net Payout', 'Status'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {escrows.length === 0 ? <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm"><Clock size={36} className="mx-auto text-gray-200 mb-3"/>No funds in escrow.</td></tr>
                    : escrows.map((e: any, idx) => (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-600">{new Date(e.holdUntilDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4"><p className="font-bold text-gray-700 text-sm font-mono">{e.order?.orderNumber}</p></td>
                        <td className="px-5 py-4 font-bold text-gray-700 text-sm">₹{e.grossAmount}</td>
                        <td className="px-5 py-4 text-xs text-red-600 font-medium">TDS: ₹{e.tdsAmount}<br/>TCS: ₹{e.tcsAmount}</td>
                        <td className="px-5 py-4"><span className="font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm">₹{e.netPayoutAmount}</span></td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${e.escrowStatus === 'RELEASED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {e.escrowStatus === 'RELEASED' ? <CheckCircle size={10}/> : <Clock size={10}/>}{e.escrowStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Invoices */}
            {tab === 'invoices' && (
              <motion.div key="invoices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">{['Invoice', 'Order', 'Amount', 'Status', 'Download'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.length === 0 ? <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm"><FileText size={36} className="mx-auto text-gray-200 mb-3"/>No invoices yet.</td></tr>
                    : invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4"><span className="font-bold text-gray-700 font-mono text-sm">{inv.invoiceNumber}</span><span className="block text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</span></td>
                        <td className="px-5 py-4"><span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">{inv.order?.orderNumber}</span></td>
                        <td className="px-5 py-4"><p className="font-black text-gray-900 text-sm">₹{inv.amount}</p><p className="text-xs text-gray-400">Tax: ₹{inv.taxAmount}</p></td>
                        <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={10}/> {inv.status}</span></td>
                        <td className="px-5 py-4"><button className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E53935]/10 text-[#E53935] text-xs font-bold rounded-lg transition-all hover:bg-[#E53935]/20"><Download size={12}/> PDF</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Credit Notes */}
            {tab === 'credit-notes' && (
              <motion.div key="credit-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><CreditCard size={28} className="text-gray-300" /></div>
                <p className="text-gray-600 font-bold">No Credit Notes</p>
                <p className="text-gray-400 text-sm mt-1">Any credit notes for refunds or adjustments will appear here.</p>
              </motion.div>
            )}

            {/* Taxes */}
            {tab === 'taxes' && (
              <motion.div key="taxes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50 border border-emerald-200 p-5 rounded-2xl mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1"><ShieldCheck size={16} className="text-emerald-600"/> GST Monthly Filing Reports</h3>
                    <p className="text-xs text-gray-500">Download data formatted for GSTR-1 and GSTR-3B portal filings.</p>
                  </div>
                  <button className="mt-3 sm:mt-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-400/25 transition-all active:scale-95"><Download size={14}/> Export All</button>
                </div>
                {taxes.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl"><p className="text-gray-400 text-sm">No tax reports generated yet.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {taxes.map((t: any, i: number) => (
                      <div key={i} className="bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md rounded-2xl p-5 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-black text-gray-900 text-lg">{t.month}</h4>
                          <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-xl transition-colors"><Download size={15}/></button>
                        </div>
                        <div className="space-y-2 text-sm">
                          {[['Total Sales', t.totalSales], ['CGST', t.cgst], ['SGST', t.sgst], ['IGST', t.igst]].map(([l, v]) => (
                            <div key={l as string} className="flex justify-between"><span className="text-gray-400 font-medium">{l as string}</span><span className="font-bold text-gray-700">₹{(v as number).toLocaleString()}</span></div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-600">Total Tax</span>
                          <span className="font-black text-emerald-700 text-lg">₹{(t.cgst + t.sgst + t.igst).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}
