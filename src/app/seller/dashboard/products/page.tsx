"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Package, Trash2, RotateCcw,
  Edit3, CheckCircle, Clock, Eye, Loader2, UploadCloud,
  ChevronRight, MoreVertical, LayoutGrid, List, AlertTriangle
} from 'lucide-react';

const APPROVAL_BADGES: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const STOCK_BADGES: Record<string, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',
  OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
};

type TabType = 'ALL' | 'ACTIVE' | 'PENDING' | 'DELETED';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ProductsHub() {
  const [tab, setTab] = useState<TabType>('ALL');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      const parsed = JSON.parse(info);
      setVendorId(parsed.id);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const statusParam = tab === 'ALL' ? '' : `&status=${tab}`;
      const res = await fetch(`http://localhost:5000/api/vendors/products?vendorId=${vendorId}${statusParam}`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [vendorId, tab]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Move this product to trash?')) return;
    await fetch(`http://localhost:5000/api/vendors/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleRestore = async (id: number) => {
    await fetch(`http://localhost:5000/api/vendors/products/${id}/restore`, { method: 'PATCH' });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.variants?.[0]?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: TabType; label: string; icon: any }[] = [
    { key: 'ALL', label: 'All Products', icon: Package },
    { key: 'ACTIVE', label: 'Active', icon: CheckCircle },
    { key: 'PENDING', label: 'Pending Approval', icon: Clock },
    { key: 'DELETED', label: 'Trash', icon: Trash2 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            Manage your inventory, update pricing, and add new products.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller/dashboard/products/bulk"
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 bg-white shadow-sm transition-all hover:-translate-y-0.5">
            <UploadCloud size={16} /> Bulk Import
          </Link>
          <Link href="/seller/dashboard/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button 
                  key={t.key} 
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                    ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'}
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-blue-500' : ''} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products or SKU..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors shrink-0">
              <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-0 overflow-y-auto bg-slate-50/30">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
              <p className="text-slate-500 font-medium">Loading catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Package size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                {search ? `No results for "${search}" in ${tab.toLowerCase()} products.` : `Your ${tab.toLowerCase()} product list is empty.`}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  {['Product Details', 'SKU', 'Category', 'Price', 'Inventory', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence>
                  {filtered.map((p, idx) => {
                    const variant = p.variants?.[0];
                    const primaryImg = p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
                    const approvalStatus = p.approvalStatus || 'APPROVED';
                    return (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {primaryImg ? (
                              <img src={primaryImg.url} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                <Package size={20} className="text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={p.name}>{p.name}</p>
                              <p className="text-xs font-semibold text-slate-500 mt-0.5">{p.brand || 'No Brand'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{variant?.sku || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">{p.category?.name || 'Uncategorized'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
                          {Number(p.mrp) > Number(p.basePrice) && (
                            <p className="text-xs text-slate-400 font-semibold line-through">₹{Number(p.mrp).toLocaleString('en-IN')}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${STOCK_BADGES[p.stockStatus] || ''}`}>
                            {p.stockStatus?.replace('_', ' ')}
                          </span>
                          <p className="text-xs font-semibold text-slate-500 mt-1">{variant?.stockQty ?? 0} in stock</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${APPROVAL_BADGES[approvalStatus] || ''}`}>
                            {approvalStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {tab === 'DELETED' ? (
                              <button onClick={() => handleRestore(p.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition-colors">
                                <RotateCcw size={14} /> Restore
                              </button>
                            ) : (
                              <>
                                <Link href={`/seller/dashboard/products/${p.id}/edit`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all">
                                  <Edit3 size={16} />
                                </Link>
                                <Link href={`/products/${p.slug}`} target="_blank" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:shadow-sm transition-all">
                                  <Eye size={16} />
                                </Link>
                                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 hover:shadow-sm transition-all">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filtered.map((p, idx) => {
                  const variant = p.variants?.[0];
                  const primaryImg = p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
                  const approvalStatus = p.approvalStatus || 'APPROVED';
                  return (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {primaryImg ? (
                          <img src={primaryImg.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Package size={48} className="text-slate-300" />
                        )}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border backdrop-blur-md bg-white/90 shadow-sm ${APPROVAL_BADGES[approvalStatus]}`}>
                            {approvalStatus}
                          </span>
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border backdrop-blur-md bg-white/90 shadow-sm ${STOCK_BADGES[p.stockStatus]}`}>
                            {p.stockStatus?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 mb-1">{p.category?.name || 'Uncategorized'}</p>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2" title={p.name}>{p.name}</h3>
                          <div className="flex items-end gap-2 mb-4">
                            <span className="text-lg font-black text-slate-900">₹{Number(p.basePrice).toLocaleString('en-IN')}</span>
                            {Number(p.mrp) > Number(p.basePrice) && (
                              <span className="text-xs font-semibold text-slate-400 line-through mb-1">₹{Number(p.mrp).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <p className="text-xs font-mono font-medium text-slate-500">{variant?.sku || 'No SKU'}</p>
                          <div className="flex items-center gap-1">
                            {tab === 'DELETED' ? (
                              <button onClick={() => handleRestore(p.id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                                <RotateCcw size={14} />
                              </button>
                            ) : (
                              <>
                                <Link href={`/seller/dashboard/products/${p.id}/edit`} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                  <Edit3 size={14} />
                                </Link>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
