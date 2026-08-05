"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Search, Loader2, RefreshCw, Phone, User, CheckCircle2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function WarehousesHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadWarehouses = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('seller_token');
      const res = await fetch(`${API}/vendors/warehouses?vendorId=${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWarehouses(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);

  const filtered = warehouses.filter(w => (w.name || '').toLowerCase().includes(search.toLowerCase()) || (w.city || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fulfillment Warehouses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage pickup points and fulfillment hub locations.</p>
        </div>
        <button
          onClick={loadWarehouses}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] hover:from-[#c62828] hover:to-[#e91e63] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 transition-all active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync Warehouses
        </button>
      </motion.div>

      {/* Main Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6 min-h-[450px]">
        {/* Search */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search warehouse or city..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-[#E53935] font-medium text-gray-800 placeholder:text-gray-400 transition-all"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">{filtered.length} locations</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#E53935] mb-2" size={36} />
            <p className="text-gray-400 text-sm font-medium">Loading warehouses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin size={36} className="text-gray-300 mb-2" />
            <p className="text-gray-500 font-bold text-sm">No warehouses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <div
                key={w.id}
                className="bg-white border border-gray-200 hover:border-red-200 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E53935] shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{w.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">{w.city}, {w.state || 'India'}</p>
                    </div>
                  </div>
                  {w.isDefault && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase">
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
                  <p className="line-clamp-2">{w.addressLine1} {w.addressLine2}</p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <User size={12} /><span className="font-semibold text-gray-700">{w.contactPerson || 'Manager'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={12} /><span className="font-semibold text-gray-700">{w.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
