"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, Search, Loader2, Plus, Layers, RefreshCw, X, CheckCircle2,
  Clock, XCircle, ShieldCheck, AlertTriangle
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Cement & Concrete', slug: 'cement-concrete', count: 48, icon: '🏗️', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-2', name: 'Steel & TMT Rebars', slug: 'steel-tmt-rebars', count: 64, icon: '⚙️', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-3', name: 'Plumbing & PVC Pipes', slug: 'plumbing-pvc-pipes', count: 120, icon: '🚰', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-4', name: 'Electrical & Wires', slug: 'electrical-wires', count: 95, icon: '⚡', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-5', name: 'Paints & Wall Coatings', slug: 'paints-coatings', count: 72, icon: '🎨', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-6', name: 'Heavy Machinery Rental', slug: 'heavy-machinery', count: 34, icon: '🚜', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-7', name: 'Power Tools & Hardware', slug: 'power-tools-hardware', count: 210, icon: '🛠️', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-8', name: 'Tiles, Marble & Granite', slug: 'tiles-marble-granite', count: 85, icon: '🧱', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-9', name: 'Safety Gear & Industrial PPE', slug: 'safety-gear-ppe', count: 140, icon: '🪖', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-10', name: 'Solar Panels & Generators', slug: 'solar-power', count: 52, icon: '☀️', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-11', name: 'Plywood & Timber Wood', slug: 'plywood-timber', count: 68, icon: '🪵', status: 'APPROVED', source: 'ADMIN' },
  { id: 'cat-12', name: 'Glass & Aluminium Fittings', slug: 'glass-aluminium', count: 44, icon: '🪟', status: 'APPROVED', source: 'ADMIN' },
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

export default function CategoriesHub() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [newCat, setNewCat] = useState({
    name: '',
    slug: '',
    icon: '📦',
    description: ''
  });

  const loadCategories = useCallback(() => {
    setLoading(true);

    // Load seller-submitted category requests from localStorage
    let sellerCats: any[] = [];
    const local = localStorage.getItem('seller_category_requests');
    if (local) {
      try { sellerCats = JSON.parse(local); } catch {}
    }

    // Merge with default global categories (admin-approved master catalog)
    const globalCats = DEFAULT_CATEGORIES.map(c => ({ ...c }));
    const allCats = [...sellerCats, ...globalCats];

    setCategories(allCats);
    setLoading(false);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setSaving(true);

    const sellerInfo = localStorage.getItem('seller_info');
    let sellerName = 'Seller';
    try {
      const parsed = JSON.parse(sellerInfo || '{}');
      sellerName = parsed.companyName || parsed.ownerName || 'Seller';
    } catch {}

    const slug = newCat.slug || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const createdItem = {
      id: `catreq-${Date.now()}`,
      name: newCat.name,
      slug: slug,
      icon: newCat.icon || '📦',
      description: newCat.description,
      count: 0,
      status: 'PENDING',
      source: 'SELLER',
      vendorName: sellerName,
      submittedAt: new Date().toISOString(),
    };

    // Save to seller's category requests
    let existing: any[] = [];
    const local = localStorage.getItem('seller_category_requests');
    if (local) {
      try { existing = JSON.parse(local); } catch {}
    }
    const updated = [createdItem, ...existing];
    localStorage.setItem('seller_category_requests', JSON.stringify(updated));

    // Also save to shared admin review queue
    let adminQueue: any[] = [];
    const aq = localStorage.getItem('admin_category_requests');
    if (aq) {
      try { adminQueue = JSON.parse(aq); } catch {}
    }
    localStorage.setItem('admin_category_requests', JSON.stringify([createdItem, ...adminQueue]));

    setCategories(prev => [createdItem, ...prev]);

    setSaving(false);
    setIsModalOpen(false);
    setNewCat({ name: '', slug: '', icon: '📦', description: '' });
    setToastMessage(`Category "${createdItem.name}" submitted for admin approval! Status: PENDING`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Sync approval statuses from admin decisions
  useEffect(() => {
    const syncStatuses = () => {
      const decisionData = localStorage.getItem('admin_category_decisions');
      if (!decisionData) return;
      try {
        const decisions: Record<string, string> = JSON.parse(decisionData);
        setCategories(prev => prev.map(c => {
          if (decisions[c.id]) {
            return { ...c, status: decisions[c.id] };
          }
          return c;
        }));
        // Also update seller_category_requests
        const local = localStorage.getItem('seller_category_requests');
        if (local) {
          const reqs = JSON.parse(local);
          const updatedReqs = reqs.map((r: any) => decisions[r.id] ? { ...r, status: decisions[r.id] } : r);
          localStorage.setItem('seller_category_requests', JSON.stringify(updatedReqs));
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

  const filtered = categories
    .filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterStatus === 'ALL' || c.status === filterStatus);

  const pendingCount = categories.filter(c => c.status === 'PENDING').length;
  const approvedCount = categories.filter(c => c.status === 'APPROVED').length;
  const rejectedCount = categories.filter(c => c.status === 'REJECTED').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">

      {/* Header Banner */}
      <motion.div variants={itemVariants} className="bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-500/10 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider">
              Catalog Structure
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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Marketplace Product Categories</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">Request new categories for admin approval. Approved categories from the master catalog are listed below.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={loadCategories}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15 cursor-pointer"
            title="Refresh Categories"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Request Category
          </button>
        </div>
      </motion.div>

      {/* Toast */}
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
              { key: 'ALL', label: 'All Categories', count: categories.length },
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
              placeholder="Search category name..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 size={36} className="animate-spin text-[#FF5722]" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Loading Category Taxonomy...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <Layers size={48} className="text-slate-300" />
            <p className="font-black text-slate-700 text-base">No categories match your filter</p>
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-[#FF5722] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
              + Request First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(cat => (
              <div
                key={cat.id}
                className={`border rounded-2xl p-4 transition-all flex flex-col gap-3 shadow-xs hover:shadow-md group cursor-pointer ${
                  cat.status === 'REJECTED'
                    ? 'bg-red-50/50 border-red-200/80 opacity-70'
                    : cat.status === 'PENDING'
                    ? 'bg-amber-50/50 border-amber-200/80'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-[#FF5722]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform ${
                    cat.status === 'APPROVED'
                      ? 'bg-orange-50 border border-orange-100'
                      : cat.status === 'PENDING'
                      ? 'bg-amber-100 border border-amber-200'
                      : 'bg-red-100 border border-red-200'
                  }`}>
                    {cat.icon || '📦'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[#0F2537] text-xs sm:text-sm truncate group-hover:text-[#FF5722] transition-colors">{cat.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={cat.status} />
                  {cat.source === 'ADMIN' && (
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">MASTER</span>
                  )}
                  {cat.source === 'SELLER' && (
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
          <p className="font-bold text-[#0F2537] text-sm">How Category Approval Works</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            When you request a new category, it's submitted to HinchMart admin for review. The admin will verify the category
            structure and approve or reject the request. Once approved, you can list products under that category. Categories from the
            <strong> Master Catalog</strong> (created by admin) are pre-approved for all sellers.
          </p>
        </div>
      </motion.div>

      {/* ─── REQUEST CATEGORY MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden font-sans">

              <div className="bg-[#0F2537] text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Request New Category</h3>
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
                  After submission, this category will appear as <strong>PENDING</strong> until the HinchMart admin team reviews and approves it.
                </p>
              </div>

              <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    value={newCat.name}
                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder="e.g. Structural Steel & Rebars"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Icon Emoji</label>
                    <input
                      type="text"
                      value={newCat.icon}
                      onChange={e => setNewCat({ ...newCat, icon: e.target.value })}
                      placeholder="e.g. 🏗️"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">URL Slug (Auto)</label>
                    <input
                      type="text"
                      value={newCat.slug}
                      onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                      placeholder="structural-steel"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={newCat.description}
                    onChange={e => setNewCat({ ...newCat, description: e.target.value })}
                    placeholder="Short summary of items under this category..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-[#0F2537] outline-none focus:border-[#FF5722] resize-none"
                  />
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
