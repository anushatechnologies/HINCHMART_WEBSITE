"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes, Search, Filter, RefreshCw, Loader2, Save,
  AlertTriangle, CheckCircle, Package, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function InventoryHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('seller_token');
      const res = await fetch(`${API}/vendors/products?vendorId=${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Flatten variants
        const list: any[] = [];
        (data.data || []).forEach((p: any) => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v: any) => {
              list.push({
                productId: p.id,
                variantId: v.id,
                name: p.name,
                sku: v.sku,
                attribute: `${v.attributeName || ''} ${v.attributeValue || ''}`.trim() || 'Default',
                quantity: v.quantity ?? 0,
                price: v.price ?? p.basePrice ?? 0,
                image: p.images?.[0]
              });
            });
          } else {
            list.push({
              productId: p.id,
              variantId: null,
              name: p.name,
              sku: p.sku || 'N/A',
              attribute: 'Standard',
              quantity: p.stock ?? 0,
              price: p.basePrice ?? 0,
              image: p.images?.[0]
            });
          }
        });
        setItems(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveQty = async (item: any) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('seller_token');
      await fetch(`${API}/vendors/inventory/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          quantity: editQty
        })
      });
      setEditingId(null);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'LOW') return item.quantity > 0 && item.quantity < 10;
    if (filter === 'OUT') return item.quantity === 0;
    return true;
  });

  const totalUnits = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = items.filter(i => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = items.filter(i => i.quantity === 0).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Stock & Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time stock monitoring and fast quantity updates.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] hover:from-[#c62828] hover:to-[#e91e63] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 transition-all active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync Inventory
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Units</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalUnits.toLocaleString()}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Boxes size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{outOfStockCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <Package size={20} />
          </div>
        </div>
      </motion.div>

      {/* Main Table Container */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[450px] flex flex-col">
        
        {/* Search & Filter Header */}
        <div className="border-b border-gray-100 p-4 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product or SKU..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-[#E53935] font-medium text-gray-800 placeholder:text-gray-400 transition-all"
            />
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
            {[
              { key: 'ALL', label: 'All Items' },
              { key: 'LOW', label: 'Low Stock (<10)' },
              { key: 'OUT', label: 'Out of Stock' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-[#E53935] mb-2" size={36} />
              <p className="text-gray-400 text-sm font-medium">Fetching stock levels...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Boxes size={36} className="text-gray-300 mb-2" />
              <p className="text-gray-500 font-bold text-sm">No inventory items matching criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Product Info</th>
                    <th className="px-5 py-3.5">SKU</th>
                    <th className="px-5 py-3.5">Variant</th>
                    <th className="px-5 py-3.5">Unit Price</th>
                    <th className="px-5 py-3.5">Current Stock</th>
                    <th className="px-5 py-3.5 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item, idx) => {
                    const isEditing = editingId === (item.variantId || item.productId);
                    const stockState = item.quantity === 0 ? 'OUT' : item.quantity < 10 ? 'LOW' : 'GOOD';

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package size={16} className="text-gray-400" />
                              )}
                            </div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-500 font-bold">{item.sku}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-600">{item.attribute}</td>
                        <td className="px-5 py-4 font-black text-gray-900 text-sm">₹{item.price.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            stockState === 'OUT' ? 'bg-red-100 text-red-700' :
                            stockState === 'LOW' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              stockState === 'OUT' ? 'bg-red-500' :
                              stockState === 'LOW' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`} />
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                value={editQty}
                                onChange={e => setEditQty(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 bg-white"
                              />
                              <button
                                onClick={() => handleSaveQty(item)}
                                disabled={saving}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(item.variantId || item.productId);
                                setEditQty(item.quantity);
                              }}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors"
                            >
                              Edit Stock
                            </button>
                          )}
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
    </motion.div>
  );
}
