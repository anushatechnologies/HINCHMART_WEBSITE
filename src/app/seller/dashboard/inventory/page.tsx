"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, Search, RefreshCw, Loader2, Save, X, Plus, Minus,
  AlertTriangle, CheckCircle, Package, Edit3, Sparkles, ShieldCheck
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function InventoryHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW' | 'OUT'>('ALL');
  
  // Quick Edit Modal / Inline States
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editQty, setEditQty] = useState<number>(100);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
    else setVendorId(13); // Default Seller ID fallback
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('seller_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const targetVendor = vendorId || 13;
      const res = await fetch(`${API}/vendors/products?vendorId=${targetVendor}`, { headers });
      // Guard: only parse as JSON if response is actually JSON (not an HTML auth redirect page)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('Inventory: got non-JSON response, skipping parse');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        const list: any[] = [];
        data.data.forEach((p: any) => {
          const imgUrl = p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1585253801041-030db80a3770?w=300&h=300&fit=crop';
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v: any) => {
              list.push({
                productId: p.id,
                variantId: v.id,
                name: p.name,
                sku: v.sku || p.modelNumber || `SKU-${p.id}`,
                attribute: `${v.attributeName || ''} ${v.attributeValue || ''}`.trim() || 'Standard Variant',
                quantity: v.stockQty !== undefined && v.stockQty !== null ? v.stockQty : 100,
                stockStatus: p.stockStatus || 'IN_STOCK',
                price: parseFloat(v.price || p.basePrice || 0),
                image: imgUrl
              });
            });
          } else {
            list.push({
              productId: p.id,
              variantId: null,
              name: p.name,
              sku: p.modelNumber || p.sku || `SKU-${p.id}`,
              attribute: 'Standard Single Unit',
              quantity: p.stockQuantity !== undefined && p.stockQuantity !== null ? p.stockQuantity : (p.stockStatus === 'OUT_OF_STOCK' ? 0 : 100),
              stockStatus: p.stockStatus || 'IN_STOCK',
              price: parseFloat(p.basePrice || p.price || 0),
              image: imgUrl
            });
          }
        });
        setItems(list);
      }
    } catch (e) {
      console.error('Inventory load error:', e);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditQty(item.quantity);
  };

  const handleSaveQty = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('seller_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/vendors/inventory/update`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          productId: editingItem.productId,
          variantId: editingItem.variantId,
          quantity: editQty
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : { success: res.ok };
      if (data.success) {
        setItems(prev => prev.map(item => {
          const isMatch = editingItem.variantId 
            ? item.variantId === editingItem.variantId 
            : item.productId === editingItem.productId;
          if (isMatch) {
            const newStatus = editQty === 0 ? 'OUT_OF_STOCK' : editQty < 10 ? 'LOW_STOCK' : 'IN_STOCK';
            return { ...item, quantity: editQty, stockStatus: newStatus };
          }
          return item;
        }));
        setToastMessage(`Stock updated to ${editQty} units for ${editingItem.name.slice(0, 30)}...`);
        setEditingItem(null);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Save inventory error:', e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'IN_STOCK') return item.quantity >= 10;
    if (filter === 'LOW') return item.quantity > 0 && item.quantity < 10;
    if (filter === 'OUT') return item.quantity === 0 || item.stockStatus === 'OUT_OF_STOCK';
    return true;
  });

  const totalUnits = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const lowStockCount = items.filter(i => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = items.filter(i => i.quantity === 0 || i.stockStatus === 'OUT_OF_STOCK').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 text-xs font-bold">
            <CheckCircle className="text-emerald-400" size={18} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#0F2537] via-[#1a3852] to-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-500/15 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> B2B Real-Time Inventory Control
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full font-bold">{items.length} Active SKUs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Stock & Warehouse Inventory</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl">Instant stock level updates, low stock threshold alerts, and batch quantity adjustments.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Inventory
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between group hover:shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Warehouse Units</p>
            <h3 className="text-2xl font-black text-[#0F2537] mt-0.5">{totalUnits.toLocaleString()}</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ShieldCheck size={12} /> Live Stock Ready
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
            <Boxes size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between group hover:shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Low Stock Warning (&lt;10)</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{lowStockCount}</h3>
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
              <AlertTriangle size={12} /> Action Needed
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between group hover:shadow-lg transition-all">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Out of Stock SKUs</p>
            <h3 className="text-2xl font-black text-red-600 mt-0.5">{outOfStockCount}</h3>
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
              <Package size={12} /> Depleted Inventory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
            <Package size={22} />
          </div>
        </div>
      </motion.div>

      {/* Main Table Container */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden min-h-[480px] flex flex-col">
        
        {/* Search & Filter Header */}
        <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by product title or model SKU..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white focus:outline-none focus:border-[#FF5722] font-semibold text-slate-800 transition-all shadow-xs"
            />
          </div>

          <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1">
            {[
              { key: 'ALL', label: 'All Items' },
              { key: 'IN_STOCK', label: 'In Stock' },
              { key: 'LOW', label: 'Low Stock (<10)' },
              { key: 'OUT', label: 'Out of Stock' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filter === f.key ? 'bg-white text-[#0F2537] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 p-5 relative">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">Loading stock inventory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Boxes size={40} className="text-slate-300 mb-2" />
              <p className="text-slate-800 font-extrabold text-sm">No inventory items match search criteria</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Try resetting your filter tabs or search input.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Product Title</th>
                    <th className="px-5 py-3.5">SKU Model</th>
                    <th className="px-5 py-3.5">Variant Type</th>
                    <th className="px-5 py-3.5">Unit B2B Price</th>
                    <th className="px-5 py-3.5">Current Stock</th>
                    <th className="px-5 py-3.5 text-right">Quick Stock Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => {
                    const isOut = item.quantity === 0 || item.stockStatus === 'OUT_OF_STOCK';
                    const isLow = !isOut && item.quantity < 10;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 overflow-hidden flex items-center justify-center shrink-0">
                              <img src={item.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <p className="font-extrabold text-[#0F2537] text-xs max-w-sm line-clamp-1">{item.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500 font-bold">{item.sku}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-600">{item.attribute}</td>
                        <td className="px-5 py-4 font-black text-[#0F2537] text-xs">₹{item.price.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                            isOut ? 'bg-red-50 text-red-600 border border-red-200' :
                            isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              isOut ? 'bg-red-600 animate-pulse' :
                              isLow ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`} />
                            {item.quantity} Units
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3.5 py-1.5 bg-[#0F2537] hover:bg-[#FF5722] text-white text-xs font-extrabold rounded-xl transition-all duration-300 flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs hover:shadow-orange-500/25 hover:shadow-lg"
                          >
                            <Edit3 size={13} /> Edit Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── QUICK STOCK EDIT MODAL ─── */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0F2537] via-[#1a3852] to-[#0F2537] p-5 text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF5722] text-white flex items-center justify-center font-black shadow-md">
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Adjust Warehouse Stock</h3>
                    <p className="text-[11px] text-slate-300 font-medium">SKU: {editingItem.sku}</p>
                  </div>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <img src={editingItem.image} alt="" className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200" />
                  <div>
                    <h4 className="font-black text-[#0F2537] text-xs line-clamp-1">{editingItem.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">Variant: {editingItem.attribute}</span>
                  </div>
                </div>

                {/* Numerical Quantity Input */}
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-600 block mb-2">Available Stock Units</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditQty(q => Math.max(0, q - 5))}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>

                    <input
                      type="number"
                      value={editQty}
                      onChange={e => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-black text-[#0F2537] focus:outline-none focus:border-[#FF5722] focus:bg-white transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => setEditQty(q => q + 5)}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">Quick Add Presets</label>
                  <div className="flex items-center gap-2">
                    {[+10, +50, +100, +500].map(add => (
                      <button
                        key={add}
                        type="button"
                        onClick={() => setEditQty(q => q + add)}
                        className="flex-1 py-2 bg-orange-50 hover:bg-[#FF5722] hover:text-white border border-orange-200 text-[#FF5722] rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        +{add}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditQty(0)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 text-red-600 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      Set 0
                    </button>
                  </div>
                </div>

                {/* Status Indicator Preview */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Updated Status Preview</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                    editQty === 0 ? 'bg-red-100 text-red-700' :
                    editQty < 10 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {editQty === 0 ? 'OUT OF STOCK' : editQty < 10 ? 'LOW STOCK ALERT' : 'IN STOCK'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQty}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#FF5722] hover:bg-orange-600 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-1.5"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Stock Quantity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
