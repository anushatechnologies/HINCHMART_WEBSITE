"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Box, Activity, AlertTriangle, ArrowRightLeft,
  Printer, QrCode, FileClock, Search, Download, Loader2, Save,
  Plus, UploadCloud, FileText, Settings, ShieldCheck, Zap
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Stock Overview', icon: Package },
  { key: 'warehouses', label: 'Warehouses', icon: Box },
  { key: 'batches', label: 'Batches & Expiry', icon: Activity },
  { key: 'history', label: 'History Ledger', icon: FileClock },
  { key: 'labels', label: 'Print Labels', icon: Printer },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function InventoryHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Data
  const [overview, setOverview] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [overviewFilter, setOverviewFilter] = useState('ALL');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadOverview = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/inventory?vendorId=${vendorId}&filter=${overviewFilter}`);
      const data = await res.json();
      if (data.success) setOverview(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, overviewFilter]);

  const loadHistory = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/inventory/history?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    if (tab === 'overview') loadOverview();
    if (tab === 'history') loadHistory();
  }, [tab, loadOverview, loadHistory]);

  const handleStockUpdate = async (variantId: number, currentQty: number) => {
    const newQtyStr = prompt('Enter new absolute stock quantity:', currentQty.toString());
    if (newQtyStr === null) return;
    const newQty = parseInt(newQtyStr, 10);
    if (isNaN(newQty) || newQty < 0) return alert('Invalid quantity. Please enter a valid number (>= 0).');
    
    const changeQty = newQty - currentQty;
    if (changeQty === 0) return; // No change

    try {
      const res = await fetch(`${API}/vendors/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, variantId, changeQty, reason: 'ADJUSTMENT', reference: 'Manual Edit via Dashboard'
        })
      });
      const data = await res.json();
      if (data.success) loadOverview();
      else alert(data.message);
    } catch (e) { console.error(e); }
  };

  const filteredOverview = overview.filter(item => 
    !search || 
    item.product.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Inventory</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> Manage stock levels, warehouses, and track movements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
            <Plus size={16} /> Update Stock
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
                  ${isActive ? 'border-amber-500 text-amber-600 bg-white shadow-[0_-1px_0_0_#f8fafc]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-amber-500' : ''} /> 
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 bg-slate-50/30">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-amber-500 mb-4" />
              <p className="text-slate-500 font-medium">Syncing inventory data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* 1. Stock Overview */}
              {tab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                  {/* Toolbar */}
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      {['ALL', 'LOW_STOCK', 'OUT_OF_STOCK'].map(f => (
                        <button key={f} onClick={() => setOverviewFilter(f)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${overviewFilter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                          {f.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search SKU or product..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="flex-1 overflow-x-auto bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">SKU</th>
                          <th className="px-6 py-4">In Stock</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOverview.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-16">
                              <Package size={48} className="mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
                              <p className="text-slate-500 text-sm">No inventory items match your current filters.</p>
                            </td>
                          </tr>
                        ) : filteredOverview.map((item, idx) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900 max-w-[250px] truncate">{item.product.name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{item.sku || '—'}</td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-black text-slate-900">{item.stockQty}</span>
                            </td>
                            <td className="px-6 py-4">
                              {item.stockQty === 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                                  <AlertTriangle size={12} /> OUT OF STOCK
                                </span>
                              ) : item.stockQty <= 10 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                  <AlertTriangle size={12} /> LOW STOCK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <ShieldCheck size={12} /> IN STOCK
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleStockUpdate(item.id, item.stockQty)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                Adjust
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 4. History Ledger */}
              {tab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">Product / SKU</th>
                          <th className="px-6 py-4">Transaction Type</th>
                          <th className="px-6 py-4">Quantity Change</th>
                          <th className="px-6 py-4">Reference Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-16">
                              <FileClock size={48} className="mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold text-slate-900 mb-1">No history yet</h3>
                              <p className="text-slate-500 text-sm">Stock movements will appear here automatically.</p>
                            </td>
                          </tr>
                        ) : history.map((item, idx) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900 max-w-[200px] truncate">{item.variant.product.name}</p>
                              <p className="text-xs font-mono text-slate-500 mt-0.5">{item.variant.sku}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                {item.reason.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-black px-3 py-1 rounded-lg ${item.changeQty > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {item.changeQty > 0 ? '+' : ''}{item.changeQty}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600">{item.reference || '—'}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Placeholder Tabs */}
              {(tab === 'warehouses' || tab === 'batches' || tab === 'labels') && (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
                    <Settings size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    The {TABS.find(t=>t.key===tab)?.label} interface is currently under construction and will be available in the next major update.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
