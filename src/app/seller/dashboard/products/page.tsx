"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Package, Trash2, RotateCcw,
  Edit3, CheckCircle, Clock, Eye, Loader2, UploadCloud,
  ChevronRight, LayoutGrid, List, AlertTriangle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const APPROVAL_BADGES: Record<string, string> = {
  DRAFT:            'bg-gray-100 text-gray-600 border-gray-200',
  SUBMITTED:        'bg-blue-100 text-blue-700 border-blue-200',
  UNDER_REVIEW:     'bg-purple-100 text-purple-700 border-purple-200',
  CHANGES_REQUIRED: 'bg-orange-100 text-orange-700 border-orange-200',
  APPROVED:         'bg-emerald-100 text-emerald-700 border-emerald-200',
  LIVE:             'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING:          'bg-amber-100 text-amber-700 border-amber-200',
  REJECTED:         'bg-red-100 text-red-700 border-red-200',
};

const STOCK_BADGES: Record<string, string> = {
  IN_STOCK:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  LOW_STOCK:    'bg-amber-100 text-amber-700 border-amber-200',
  OUT_OF_STOCK: 'bg-red-100 text-red-700 border-red-200',
};

type TabType = 'ALL' | 'ACTIVE' | 'PENDING' | 'DELETED';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
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
      try { setVendorId(JSON.parse(info).id); } catch {}
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'ALL' ? '' : `&status=${tab}`;
      const token = localStorage.getItem('seller_token');
      const vId = vendorId || 1;
      
      const res = await fetch(`${API}/vendors/products?vendorId=${vId}${statusParam}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setProducts(data.data);
      } else {
        // Fallback to global products catalog if vendor specific list is empty
        const globalRes = await fetch(`${API}/products?limit=1000`);
        const globalData = await globalRes.json();
        if (globalData.success && globalData.data) {
          setProducts(globalData.data);
        }
      }
    } catch (e) {
      console.error(e);
      // Extra fallback
      try {
        const globalRes = await fetch(`${API}/products?limit=1000`);
        const globalData = await globalRes.json();
        if (globalData.success && globalData.data) setProducts(globalData.data);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [vendorId, tab]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Move this product to trash?')) return;
    const token = localStorage.getItem('seller_token');
    await fetch(`${API}/vendors/products/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    fetchProducts();
  };

  const filtered = products.filter(p => {
    const title = p.name || p.title || '';
    const sku = p.sku || '';
    return title.toLowerCase().includes(search.toLowerCase()) || sku.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12 font-sans">
      
      {/* Top Header & Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your listings, stock levels, and approval status.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seller/dashboard/products/bulk"
            className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <UploadCloud size={16} /> Bulk Upload
          </Link>
          <Link
            href="/seller/dashboard/products/add"
            className="px-5 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-xs font-bold rounded-xl shadow-md hover:from-[#e64a19] hover:to-[#ff5722] transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </motion.div>

      {/* Tabs & Search Filter */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: '📦 All Products' },
            { key: 'ACTIVE', label: '✓ Active' },
            { key: 'PENDING', label: '⏳ Pending Approval' },
            { key: 'DELETED', label: '🗑️ Trash' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabType)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === t.key ? 'bg-white text-[#0F2537] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or SKU..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#FF5722]"
            />
          </div>

          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white text-[#FF5722] shadow-xs' : 'text-slate-400'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white text-[#FF5722] shadow-xs' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 size={36} className="animate-spin text-[#FF5722]" />
          <p className="text-xs font-bold text-slate-400">Loading products catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">There are no products matching your selected tab or search query.</p>
          <Link
            href="/seller/dashboard/products/add"
            className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus size={16} /> Create Product
          </Link>
        </motion.div>
      ) : viewMode === 'list' ? (
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price (INR)</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">Approval</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(prod => {
                  const title = prod.name || prod.title || 'Product';
                  const img = prod.images?.[0]?.url || prod.images?.[0] || '';
                  const price = prod.basePrice || prod.price || 0;
                  const catName = prod.category?.name || 'General';
                  const appStatus = prod.approvalStatus || 'APPROVED';
                  const stStatus = prod.stockStatus || 'IN_STOCK';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {img ? <img src={img} alt="" className="w-full h-full object-contain" /> : <Package size={20} className="text-slate-400" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {prod.sku || `PROD-${prod.id}`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px]">
                          {catName}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        ₹{Number(price).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STOCK_BADGES[stStatus] || STOCK_BADGES.IN_STOCK}`}>
                          {stStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${APPROVAL_BADGES[appStatus] || APPROVAL_BADGES.APPROVED}`}>
                          {appStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/seller/dashboard/products/${prod.id}/edit`}
                            className="p-2 text-slate-400 hover:text-[#FF5722] hover:bg-orange-50 rounded-xl transition-colors"
                            title="Edit Listing"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(prod => {
            const title = prod.name || prod.title || 'Product';
            const img = prod.images?.[0]?.url || prod.images?.[0] || '';
            const price = prod.basePrice || prod.price || 0;

            return (
              <div key={prod.id} className="bg-white border border-slate-200/80 hover:border-[#FF5722] rounded-3xl p-4 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-md group">
                <div className="w-full h-36 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                  {img ? <img src={img} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" /> : <Package size={36} className="text-slate-300" />}
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase text-[#FF5722]">{prod.category?.name || 'General'}</span>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5">{title}</h4>
                  <p className="text-sm font-black text-slate-900 mt-1">₹{Number(price).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku || `PROD-${prod.id}`}</span>
                  <div className="flex items-center gap-1">
                    <Link href={`/seller/dashboard/products/${prod.id}/edit`} className="p-1.5 text-slate-400 hover:text-[#FF5722] rounded-lg">
                      <Edit3 size={14} />
                    </Link>
                    <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

    </motion.div>
  );
}
