"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Search, Plus, Loader2, RefreshCw, CheckCircle2, ShieldCheck, Box, X,
  Building2, Award, Clock, XCircle, AlertTriangle
} from 'lucide-react';

const DEFAULT_BRANDS = [
  { id: 'global-1', name: 'UltraTech Cement', manufacturer: 'Aditya Birla Group', regNo: 'TM-9042-10', status: 'APPROVED', products: 42, source: 'ADMIN' },
  { id: 'global-2', name: 'Tata Tiscon', manufacturer: 'Tata Steel Ltd', regNo: 'TM-TATA-04', status: 'APPROVED', products: 68, source: 'ADMIN' },
  { id: 'global-3', name: 'Havells India', manufacturer: 'Havells India Ltd', regNo: 'TM-HAV-88', status: 'APPROVED', products: 95, source: 'ADMIN' },
  { id: 'global-4', name: 'Asian Paints', manufacturer: 'Asian Paints Ltd', regNo: 'TM-AP-12', status: 'APPROVED', products: 80, source: 'ADMIN' },
  { id: 'global-5', name: 'Bosch Power Tools', manufacturer: 'Robert Bosch GmbH', regNo: 'TM-BOSCH-99', status: 'APPROVED', products: 140, source: 'ADMIN' },
  { id: 'global-6', name: 'Supreme Pipes', manufacturer: 'Supreme Industries', regNo: 'TM-SUP-01', status: 'APPROVED', products: 110, source: 'ADMIN' },
  { id: 'global-7', name: 'Schneider Electric', manufacturer: 'Schneider Electric SE', regNo: 'TM-SE-44', status: 'APPROVED', products: 76, source: 'ADMIN' },
  { id: 'global-8', name: 'JCB Heavy Equipment', manufacturer: 'JCB India Ltd', regNo: 'TM-JCB-77', status: 'APPROVED', products: 28, source: 'ADMIN' },
  { id: 'global-9', name: 'Finolex Cables', manufacturer: 'Finolex Industries', regNo: 'TM-FIN-02', status: 'APPROVED', products: 64, source: 'ADMIN' },
  { id: 'global-10', name: 'Astral Pipes', manufacturer: 'Astral Limited', regNo: 'TM-AST-55', status: 'APPROVED', products: 92, source: 'ADMIN' },
  { id: 'global-11', name: 'Kirloskar Motors', manufacturer: 'Kirloskar Brothers', regNo: 'TM-KIR-90', status: 'APPROVED', products: 38, source: 'ADMIN' },
  { id: 'global-12', name: 'Godrej Locks & Hardware', manufacturer: 'Godrej & Boyce', regNo: 'TM-GOD-11', status: 'APPROVED', products: 85, source: 'ADMIN' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
        <ShieldCheck size={10} className="text-emerald-600" /> Approved
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
        <XCircle size={10} className="text-red-500" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
      <Clock size={10} className="text-amber-500" /> Pending Approval
    </span>
  );
}

export default function BrandsHub() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [newBrand, setNewBrand] = useState({
    name: '',
    manufacturer: '',
    regNo: '',
    logoUrl: ''
  });

  const loadBrands = useCallback(() => {
    setLoading(true);

    // Load seller-submitted brand requests from localStorage
    let sellerBrands: any[] = [];
    const local = localStorage.getItem('seller_brand_requests');
    if (local) {
      try { sellerBrands = JSON.parse(local); } catch {}
    }

    // Merge with default global brands (admin-approved catalog)
    const globalBrands = DEFAULT_BRANDS.map(b => ({ ...b }));
    const allBrands = [...sellerBrands, ...globalBrands];

    setBrands(allBrands);
    setLoading(false);
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const handleRegisterBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name.trim()) return;
    setSaving(true);

    const sellerInfo = localStorage.getItem('seller_info');
    let sellerName = 'Seller';
    try {
      const parsed = JSON.parse(sellerInfo || '{}');
      sellerName = parsed.companyName || parsed.ownerName || 'Seller';
    } catch {}

    const createdItem = {
      id: `req-${Date.now()}`,
      name: newBrand.name,
      manufacturer: newBrand.manufacturer || newBrand.name + ' Enterprise',
      regNo: newBrand.regNo || `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      logoUrl: newBrand.logoUrl || '',
      status: 'PENDING',
      source: 'SELLER',
      vendorName: sellerName,
      submittedAt: new Date().toISOString(),
      products: 0,
    };

    // Save to seller's brand requests
    let existing: any[] = [];
    const local = localStorage.getItem('seller_brand_requests');
    if (local) {
      try { existing = JSON.parse(local); } catch {}
    }
    const updated = [createdItem, ...existing];
    localStorage.setItem('seller_brand_requests', JSON.stringify(updated));

    // Also save to shared admin review queue
    let adminQueue: any[] = [];
    const aq = localStorage.getItem('admin_brand_requests');
    if (aq) {
      try { adminQueue = JSON.parse(aq); } catch {}
    }
    localStorage.setItem('admin_brand_requests', JSON.stringify([createdItem, ...adminQueue]));

    setBrands(prev => [createdItem, ...prev]);

    setSaving(false);
    setIsModalOpen(false);
    setNewBrand({ name: '', manufacturer: '', regNo: '' });
    setToastMessage(`Brand "${createdItem.name}" submitted for admin approval! Status: PENDING`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Sync approval statuses from admin decisions
  useEffect(() => {
    const syncStatuses = () => {
      const approvedData = localStorage.getItem('admin_brand_decisions');
      if (!approvedData) return;
      try {
        const decisions: Record<string, string> = JSON.parse(approvedData);
        setBrands(prev => prev.map(b => {
          if (decisions[b.id]) {
            return { ...b, status: decisions[b.id] };
          }
          return b;
        }));
        // Also update seller_brand_requests
        const local = localStorage.getItem('seller_brand_requests');
        if (local) {
          const reqs = JSON.parse(local);
          const updatedReqs = reqs.map((r: any) => decisions[r.id] ? { ...r, status: decisions[r.id] } : r);
          localStorage.setItem('seller_brand_requests', JSON.stringify(updatedReqs));
        }
      } catch {}
    };
    syncStatuses();
    window.addEventListener('storage', syncStatuses);
    window.addEventListener('focus', syncStatuses);
    return () => {
      window.removeEventListener('storage', syncStatuses);
      window.removeEventListener('focus', syncStatuses);
    };
  }, []);

  const filtered = brands
    .filter(b => (b.name || '').toLowerCase().includes(search.toLowerCase()))
    .filter(b => filterStatus === 'ALL' || b.status === filterStatus);

  const pendingCount = brands.filter(b => b.status === 'PENDING').length;
  const approvedCount = brands.filter(b => b.status === 'APPROVED').length;
  const rejectedCount = brands.filter(b => b.status === 'REJECTED').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">

      {/* Header Banner */}
      <motion.div variants={itemVariants} className="bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-500/10 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider">
              Brand Authorization Portal
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {approvedCount} Approved
            </span>
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Approved B2B Brand Registry</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">Register new brands for admin approval. Approved brands from the global catalog are listed below.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={loadBrands}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15 cursor-pointer"
            title="Refresh Brands"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Register Brand
          </button>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <Clock size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'ALL', label: 'All Brands', count: brands.length },
              { key: 'APPROVED', label: '✓ Approved', count: approvedCount },
              { key: 'PENDING', label: '⏳ Pending', count: pendingCount },
              { key: 'REJECTED', label: '✗ Rejected', count: rejectedCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-[#0F2537] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand name..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20"
            />
          </div>
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 size={36} className="animate-spin text-[#FF5722]" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Loading Brand Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <Tag size={48} className="text-slate-300" />
            <p className="font-black text-slate-700 text-base">No brands match your filter</p>
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
              + Register First Brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(brand => (
              <div
                key={brand.id}
                className={`border rounded-2xl p-4 transition-all flex flex-col gap-3 shadow-xs hover:shadow-md group cursor-pointer ${
                  brand.status === 'REJECTED'
                    ? 'bg-red-50/50 border-red-200/80 opacity-70'
                    : brand.status === 'PENDING'
                    ? 'bg-amber-50/50 border-amber-200/80'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-[#FF5722]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs ${
                    brand.status === 'APPROVED'
                      ? 'bg-[#0F2537] text-[#FF5722]'
                      : brand.status === 'PENDING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-400 text-white'
                  }`}>
                    {brand.name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[#0F2537] text-xs sm:text-sm truncate group-hover:text-[#FF5722] transition-colors">{brand.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{brand.manufacturer || 'OEM'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={brand.status} />
                  {brand.source === 'ADMIN' && (
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">GLOBAL</span>
                  )}
                  {brand.source === 'SELLER' && (
                    <span className="text-[8px] font-bold text-[#FF5722] bg-orange-50 px-1.5 py-0.5 rounded">YOUR REQUEST</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Workflow Info Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-[#0F2537] text-sm">How Brand Approval Works</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            When you register a new brand, it's submitted to HinchMart admin for review. The admin will verify your brand authorization
            and approve or reject the request. Once approved, you can list products under that brand. Brands from the
            <strong> Global Catalog</strong> (created by admin) are pre-approved for all sellers.
          </p>
        </div>
      </motion.div>

      {/* ─── REGISTER BRAND MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden font-sans">

              <div className="bg-[#0F2537] text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Register New Brand</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Your request will be sent to admin for approval.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Pending Notice */}
              <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700 font-semibold">
                  After submission, this brand will appear as <strong>PENDING</strong> until the HinchMart admin team reviews and approves it.
                </p>
              </div>

              <form onSubmit={handleRegisterBrand} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                    placeholder="e.g. UltraTech Cement / Bosch"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Parent Manufacturer / OEM Company</label>
                  <input
                    type="text"
                    value={newBrand.manufacturer}
                    onChange={e => setNewBrand({ ...newBrand, manufacturer: e.target.value })}
                    placeholder="e.g. Aditya Birla Group"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Trademark / Registration Number</label>
                  <input
                    type="text"
                    value={newBrand.regNo}
                    onChange={e => setNewBrand({ ...newBrand, regNo: e.target.value })}
                    placeholder="e.g. TM-9042-2026"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Brand Logo Image URL</label>
                  <input
                    type="text"
                    value={newBrand.logoUrl}
                    onChange={e => setNewBrand({ ...newBrand, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono text-[#0F2537] outline-none focus:border-[#FF5722]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Provide a direct image URL for the brand logo.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Submit for Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
