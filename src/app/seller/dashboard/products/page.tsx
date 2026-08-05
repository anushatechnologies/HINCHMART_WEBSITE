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
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const statusParam = tab === 'ALL' ? '' : `&status=${tab}`;
      const token = localStorage.getItem('seller_token');
      const res = await fetch(`${API}/vendors/products?vendorId=${vendorId}${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const token = localStorage.getItem('seller_token');
    await fetch(`${API}/vendors/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  };

  const handleRestore = async (id: number) => {
    const token = localStorage.getItem('seller_token');
    await fetch(`${API}/vendors/products/${id}/restore`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.variants?.[0]?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: TabType; label: string; icon: any }[] = [
    { key: 'ALL',     label: 'All Products',    icon: Package },
    { key: 'ACTIVE',  label: 'Active',           icon: CheckCircle },
    { key: 'PENDING', label: 'Pending Approval', icon: Clock },
    { key: 'DELETED', label: 'Trash',            icon: Trash2 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your listings, stock levels, and approval status.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seller/dashboard/products/bulk"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <UploadCloud size={16} /> Bulk Upload
          </Link>

          <Link
            href="/seller/dashboard/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] hover:from-[#c62828] hover:to-[#e91e63] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </motion.div>

      {/* Main Container */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Tabs & Controls Header */}
        <div className="border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50/50">
          
          {/* Tabs */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#E53935]' : 'text-gray-400'} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Search & Layout toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or SKU..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-[#E53935] font-medium text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1 border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-[#E53935] mb-2" size={36} />
              <p className="text-gray-400 text-sm font-medium">Fetching catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Package size={28} className="text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No products found</h3>
              <p className="text-gray-400 text-xs mt-1 max-w-sm">There are no products matching your selected tab or search query.</p>
              <Link
                href="/seller/dashboard/products/add"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E53935] to-[#F06292] text-white text-xs font-bold rounded-xl shadow-md"
              >
                <Plus size={14} /> Create Product
              </Link>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">SKU / Code</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Stock</th>
                    <th className="px-5 py-3.5">Approval</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => {
                    const firstVar = p.variants?.[0] || {};
                    const stock = firstVar.quantity ?? p.stock ?? 0;
                    const stockStatus = stock === 0 ? 'OUT_OF_STOCK' : stock < 10 ? 'LOW_STOCK' : 'IN_STOCK';
                    const approval = p.approvalStatus || 'PENDING';

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package size={18} className="text-gray-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#E53935] transition-colors">{p.name}</p>
                              <p className="text-xs text-gray-400 font-medium">Brand: {p.brand?.name || 'Generic'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-500 font-bold">{firstVar.sku || 'N/A'}</td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-600">{p.category?.name || 'Uncategorized'}</td>
                        <td className="px-5 py-4 font-black text-gray-900 text-sm">₹{(p.basePrice || firstVar.price || 0).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${STOCK_BADGES[stockStatus]}`}>
                            {stock} units ({stockStatus.replace('_', ' ')})
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${APPROVAL_BADGES[approval] || APPROVAL_BADGES.PENDING}`}>
                            {approval}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tab === 'DELETED' ? (
                              <button
                                onClick={() => handleRestore(p.id)}
                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                                title="Restore"
                              >
                                <RotateCcw size={14} />
                              </button>
                            ) : (
                              <>
                                <Link
                                  href={`/seller/dashboard/products/edit/${p.id}`}
                                  className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                                  title="Edit"
                                >
                                  <Edit3 size={14} />
                                </Link>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                  title="Trash"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => {
                const firstVar = p.variants?.[0] || {};
                const stock = firstVar.quantity ?? p.stock ?? 0;
                const approval = p.approvalStatus || 'PENDING';

                return (
                  <div key={p.id} className="bg-white border border-gray-200 hover:border-red-200 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md">
                    <div>
                      <div className="w-full h-36 rounded-lg bg-gray-100 border border-gray-100 mb-3 overflow-hidden flex items-center justify-center relative">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Package size={32} className="text-gray-300" />
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black border uppercase ${APPROVAL_BADGES[approval]}`}>
                          {approval}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#E53935] transition-colors">{p.name}</h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">SKU: {firstVar.sku || 'N/A'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-black text-gray-900 text-sm">₹{(p.basePrice || firstVar.price || 0).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tab === 'DELETED' ? (
                          <button onClick={() => handleRestore(p.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><RotateCcw size={14} /></button>
                        ) : (
                          <>
                            <Link href={`/seller/dashboard/products/edit/${p.id}`} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Edit3 size={14} /></Link>
                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
