"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Package, Trash2, RotateCcw,
  Edit3, CheckCircle, Clock, Eye, Loader2, UploadCloud
} from 'lucide-react';

const APPROVAL_BADGES: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const STOCK_BADGES: Record<string, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-700',
  LOW_STOCK: 'bg-amber-50 text-amber-700',
  OUT_OF_STOCK: 'bg-red-50 text-red-700',
};

type TabType = 'ALL' | 'ACTIVE' | 'PENDING' | 'DELETED';

export default function ProductsHub() {
  const [tab, setTab] = useState<TabType>('ALL');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Management</h1>
          <p className="text-slate-500 mt-1">Manage your entire product catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller/dashboard/products/bulk"
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 bg-white shadow-sm transition-colors">
            <UploadCloud size={16} /> Bulk Tools
          </Link>
          <Link href="/seller/dashboard/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${isActive ? 'border-red-600 text-red-700 bg-red-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            <Filter size={15} /> Filter
          </button>
          <span className="ml-auto text-sm text-slate-500 font-medium">{filtered.length} products</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 size={28} className="animate-spin mx-auto text-red-500 mb-2" />
                    <p className="text-slate-500 text-sm">Loading products...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Package size={44} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {tab === 'DELETED' ? 'Trash is empty' : 'Click "+ Add Product" to get started'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const variant = p.variants?.[0];
                const primaryImg = p.images?.find((i: any) => i.isPrimary) || p.images?.[0];
                const approvalStatus = p.approvalStatus || 'APPROVED';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {primaryImg ? (
                          <img src={primaryImg.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]" title={p.name}>{p.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.brand || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{variant?.sku || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{p.category?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-slate-900">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400 line-through">₹{Number(p.mrp).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STOCK_BADGES[p.stockStatus] || ''}`}>
                        {p.stockStatus?.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{variant?.stockQty ?? 0} units</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${APPROVAL_BADGES[approvalStatus] || ''}`}>
                        {approvalStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {tab === 'DELETED' ? (
                          <button onClick={() => handleRestore(p.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition-colors">
                            <RotateCcw size={12} /> Restore
                          </button>
                        ) : (
                          <>
                            <Link href={`/seller/dashboard/products/${p.id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                              <Edit3 size={14} />
                            </Link>
                            <Link href={`/products/${p.slug}`} target="_blank"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
                              <Eye size={14} />
                            </Link>
                            <button onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors">
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
      </div>
    </div>
  );
}
