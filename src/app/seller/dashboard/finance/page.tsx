"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, FileText, CreditCard, PieChart, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Loader2, CheckCircle, Clock, ShieldCheck,
  Building, IndianRupee, HandCoins, ExternalLink, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Wallet & Profit', icon: PieChart },
  { key: 'ledger', label: 'Ledger & Settlements', icon: Wallet },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'credit-notes', label: 'Credit Notes', icon: CreditCard },
  { key: 'taxes', label: 'Tax & GST Reports', icon: ShieldCheck },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };



export default function FinanceHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [overview, setOverview] = useState<any>({});
  const [ledger, setLedger] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await fetch(`${API}/vendors/finance/overview?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setOverview(data.data);
      }
      if (tab === 'ledger') {
        const res = await fetch(`${API}/vendors/finance/wallet?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setLedger(data.data);
      }
      if (tab === 'invoices') {
        const res = await fetch(`${API}/vendors/finance/invoices?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setInvoices(data.data);
      }
      if (tab === 'credit-notes') {
        const res = await fetch(`${API}/vendors/finance/credit-notes?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setCreditNotes(data.data);
      }
      if (tab === 'taxes') {
        const res = await fetch(`${API}/vendors/finance/taxes?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setTaxes(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finance & Accounting</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <HandCoins size={16} className="text-purple-500" /> Track wallet balances, download invoices, and manage tax reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} /> Export Data
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Ledger
          </button>
        </div>
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
                  ${isActive ? 'border-purple-600 text-purple-700 bg-white shadow-[0_-1px_0_0_#f8fafc]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-purple-500' : ''} /> 
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-0 bg-slate-50/30">
          {loading && !overview.totalRevenue ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Syncing financial records...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* 1. Dashboard Overview */}
              {tab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 h-full">
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Wallet Card */}
                    <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                      <div className="absolute bottom-0 right-0">
                        <Wallet size={120} className="text-white/5 -mb-6 -mr-6" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-300 font-semibold flex items-center gap-2">
                            <Wallet size={18} /> Available Wallet Balance
                          </p>
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle size={12} /> Active
                          </span>
                        </div>
                        <p className="text-5xl font-black tracking-tight my-4">₹{(overview.walletBalance || 0).toLocaleString()}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock size={14} /> Next settlement on Monday, 8AM
                        </p>
                      </div>
                      
                      <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
                        <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/50 hover:-translate-y-0.5">
                          Withdraw to Bank
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-bold py-3 rounded-xl transition-all">
                          View Bank Details
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="md:col-span-7 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                          <ArrowUpRight size={20} strokeWidth={2.5} />
                        </div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Gross Revenue</p>
                        <p className="text-2xl font-black text-slate-900">₹{(overview.totalRevenue || 0).toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
                          <ArrowDownRight size={20} strokeWidth={2.5} />
                        </div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Platform Fees Deducted</p>
                        <p className="text-2xl font-black text-slate-900">₹{(overview.platformFees || 0).toLocaleString()}</p>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group col-span-2 sm:col-span-1">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                          <Clock size={20} strokeWidth={2.5} />
                        </div>
                        <p className="text-slate-500 text-sm font-semibold mb-1">Pending Settlements</p>
                        <p className="text-2xl font-black text-slate-900">₹{(overview.totalPending || 0).toLocaleString()}</p>
                      </div>

                      <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-hidden group col-span-2 sm:col-span-1 flex flex-col justify-center">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <p className="text-purple-600 text-sm font-bold mb-1 flex items-center gap-2">
                          <PieChart size={16} /> Net Profit Realized
                        </p>
                        <p className="text-3xl font-black text-purple-900 mt-1">₹{(overview.netProfit || 0).toLocaleString()}</p>
                        <p className="text-xs text-purple-700/70 font-semibold mt-2">Revenue minus fees & taxes.</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <PieChart size={20} className="text-purple-500" /> Profit & Revenue Trend
                      </h3>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Net Profit</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Gross Revenue</div>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overview.chartData || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any) => [`₹${value?.toLocaleString() || 0}`, name === 'profit' ? 'Net Profit' : 'Gross Revenue']}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0} />
                          <Area type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* 2. Wallet Ledger */}
              {tab === 'ledger' && (
                <motion.div key="ledger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Transaction Date</th>
                          <th className="px-6 py-4">Reference & Details</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 text-right">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledger.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-16">
                              <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions yet</h3>
                              <p className="text-slate-500 text-sm">Your wallet ledger is currently empty.</p>
                            </td>
                          </tr>
                        ) : ledger.map((l: any, idx) => (
                          <motion.tr 
                            key={l.id} 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{new Date(l.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${l.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                  {l.type === 'CREDIT' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 font-mono">{l.reference}</p>
                                  <p className="text-xs font-medium text-slate-500 mt-0.5">{l.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-base font-black px-3 py-1 rounded-lg ${l.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {l.type === 'CREDIT' ? '+' : '-'}₹{l.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-slate-700">₹{l.balanceAfter}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 3. Invoices */}
              {tab === 'invoices' && (
                <motion.div key="invoices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Invoice Details</th>
                          <th className="px-6 py-4">Order Ref</th>
                          <th className="px-6 py-4">Amount & Tax</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-16">
                              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold text-slate-900 mb-1">No invoices found</h3>
                              <p className="text-slate-500 text-sm">Invoices will appear here once orders are fulfilled.</p>
                            </td>
                          </tr>
                        ) : invoices.map((inv: any, idx) => (
                          <motion.tr 
                            key={inv.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>
                                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={12}/> {new Date(inv.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                                {inv.order?.orderNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-black text-slate-900">₹{inv.amount}</p>
                              <p className="text-xs font-semibold text-slate-400">Incl. ₹{inv.taxAmount} Tax</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border bg-emerald-50 text-emerald-700 border-emerald-200">
                                <CheckCircle size={12}/> {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors border border-purple-200 opacity-0 group-hover:opacity-100">
                                <Download size={14}/> PDF
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 4. Credit Notes */}
              {tab === 'credit-notes' && (
                <motion.div key="credit-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
                    <CreditCard size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Credit Notes</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Any credit notes issued for refunds or adjustments will appear here.
                  </p>
                </motion.div>
              )}

              {/* 5. Tax & GST Reports */}
              {tab === 'taxes' && (
                <motion.div key="taxes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg mb-8 text-white">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck size={24} className="text-emerald-400" /> GST Monthly Filing Reports
                      </h3>
                      <p className="text-sm text-slate-400 mt-2 max-w-lg">
                        Download your aggregated sales data formatted specifically for GSTR-1 and GSTR-3B portal filings.
                      </p>
                    </div>
                    <button className="mt-4 md:mt-0 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                      <Download size={16}/> Export All Reports
                    </button>
                  </div>
                  
                  {taxes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-slate-500 font-medium">No tax reports generated yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {taxes.map((t: any, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="border border-slate-200 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                        >
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                          
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-slate-900 text-xl">{t.month}</h4>
                            <button className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-xl transition-colors border border-emerald-100">
                              <Download size={18}/>
                            </button>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                              <span className="text-slate-500 font-semibold">Total Sales</span> 
                              <span className="font-black text-slate-900">₹{t.totalSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2">
                              <span className="text-slate-500">CGST Collected</span> 
                              <span className="font-semibold text-slate-700">₹{t.cgst.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                              <span className="text-slate-500">SGST Collected</span> 
                              <span className="font-semibold text-slate-700">₹{t.sgst.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2">
                              <span className="text-slate-500">IGST Collected</span> 
                              <span className="font-semibold text-slate-700">₹{t.igst.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-900">Total Tax Payable</span>
                            <span className="font-black text-emerald-600 text-xl">₹{(t.cgst + t.sgst + t.igst).toLocaleString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
// Required dummy import for Target to resolve from lucide-react used in earlier versions (added to suppress potential errors if missing)
import { Target } from 'lucide-react';
