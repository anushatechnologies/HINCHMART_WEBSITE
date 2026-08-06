"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Package, Trash2,
  Edit3, CheckCircle, Clock, Eye, Loader2,
  ChevronLeft, ChevronRight, LayoutGrid, List, AlertTriangle, X, RefreshCw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const APPROVAL_BADGES: Record<string, string> = {
  DRAFT:            'bg-slate-100 text-slate-600 border-slate-200',
  SUBMITTED:        'bg-blue-100 text-blue-700 border-blue-200',
  UNDER_REVIEW:     'bg-purple-100 text-purple-700 border-purple-200',
  CHANGES_REQUIRED: 'bg-amber-100 text-amber-700 border-amber-200',
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

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProductsHub() {
  const [tab, setTab] = useState<TabType>('ALL');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try { setVendorId(JSON.parse(info).id); } catch {}
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('seller_token');
      const vId = vendorId || 1;
      let statusParam = '';
      if (tab === 'ACTIVE') statusParam = '&status=APPROVED';
      if (tab === 'PENDING') statusParam = '&status=PENDING';
      if (tab === 'DELETED') statusParam = '&status=DELETED';

      const res = await fetch(`${API}/vendors/products?vendorId=${vId}${statusParam}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setProducts(data.data);
      } else {
        // Fallback to global catalog
        const globalRes = await fetch(`${API}/products?limit=1000`);
        const globalData = await globalRes.json();
        if (globalData.success && globalData.data) {
          setProducts(globalData.data);
        }
      }
    } catch (e) {
      console.error(e);
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
    if (!confirm('Are you sure you want to remove this product listing?')) return;
    try {
      const token = localStorage.getItem('seller_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/vendors/products/${id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        await fetch(`${API}/products/${id}`, { method: 'DELETE', headers });
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter(p => {
    const title = (p.name || p.title || '').toLowerCase();
    const sku = (p.sku || p.modelNumber || '').toLowerCase();
    const brandName = (typeof p.brand === 'object' ? p.brand?.name : p.brand || '').toLowerCase();
    return title.includes(search.toLowerCase()) || sku.includes(search.toLowerCase()) || brandName.includes(search.toLowerCase());
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12 font-sans">
      
      {/* Top Header & Actions Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#0F2537] via-[#1a3852] to-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-500/15 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider">Seller Inventory Control</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">Vendor Product Catalog</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-lg">Manage your commercial product listings, rental equipment flags, and B2B pricing specifications.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={fetchProducts}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Refresh Products"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/seller/dashboard/products/add"
            className="px-5 py-3 bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> Add New Product
          </Link>
        </div>
      </motion.div>

      {/* Tabs & Search Filter Bar */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'ACTIVE', 'PENDING', 'DELETED'] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tab === t
                    ? 'bg-[#0F2537] text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search & Layout Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog SKU, title, brand..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF5722] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#FF5722] shadow-xs font-bold' : 'text-slate-500'}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#FF5722] shadow-xs font-bold' : 'text-slate-500'}`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 size={36} className="animate-spin text-[#FF5722]" />
          <p className="text-xs font-bold text-slate-400">Fetching live catalog products...</p>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-xs">
          <Package size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">There are no products matching your selected tab or search query.</p>
          <Link
            href="/seller/dashboard/products/add"
            className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold rounded-2xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add Product Listing
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
                {paginatedProducts.map(prod => {
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
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {prod.modelNumber || prod.sku || `PROD-${prod.id}`}</p>
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
                            title="Delete Listing"
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
        /* GRID VIEW */
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedProducts.map(prod => {
            const title = prod.name || prod.title || 'Product';
            const img = prod.images?.[0]?.url || prod.images?.[0] || '';
            const price = prod.basePrice || prod.price || 0;

            return (
              <div key={prod.id} className="bg-white border border-slate-200/80 hover:border-[#FF5722] rounded-3xl p-4 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg group">
                <div className="w-full h-40 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden p-2 relative">
                  {img ? <img src={img} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform" /> : <Package size={36} className="text-slate-300" />}
                  {prod.isSameDayDelivery && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Express</span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase text-[#FF5722]">{prod.category?.name || 'General'}</span>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mt-0.5">{title}</h4>
                  <p className="text-sm font-black text-slate-900 mt-1">₹{Number(price).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.modelNumber || prod.sku || `PROD-${prod.id}`}</span>
                  <div className="flex items-center gap-1">
                    <Link href={`/seller/dashboard/products/${prod.id}/edit`} className="p-1.5 text-slate-400 hover:text-[#FF5722] hover:bg-orange-50 rounded-lg">
                      <Edit3 size={14} />
                    </Link>
                    <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-500">
            Page <strong className="text-slate-800 font-bold">{currentPage}</strong> of <strong className="text-slate-800 font-bold">{totalPages}</strong> ({totalItems} catalog products)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              let pageNum = currentPage;
              if (currentPage <= 3) pageNum = idx + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
              else pageNum = currentPage - 2 + idx;

              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    currentPage === pageNum ? 'bg-[#0F2537] text-white shadow-xs' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
