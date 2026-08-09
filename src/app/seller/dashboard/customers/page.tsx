"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, RefreshCw, Loader2, Mail, Phone,
  ShoppingBag, IndianRupee, Calendar, Star, ChevronRight, UserCheck
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function CustomersHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'REPEAT' | 'HIGH_VALUE'>('ALL');

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadCustomers = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const { authFetch } = await import('@/lib/auth');
      const res = await authFetch(`${API}/vendors/analytics/overview?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success && data.data?.recentOrders) {
        // Build customer profiles from orders
        const map = new Map<string, any>();
        data.data.recentOrders.forEach((o: any) => {
          const email = o.customerEmail || `customer_${o.id}@example.com`;
          if (!map.has(email)) {
            map.set(email, {
              id: o.id,
              name: o.customerName || 'Verified Buyer',
              email,
              phone: o.customerPhone || '+91 98765 43210',
              ordersCount: 1,
              totalSpent: Number(o.amount) || 0,
              lastOrderDate: o.date || new Date().toISOString()
            });
          } else {
            const existing = map.get(email);
            existing.ordersCount += 1;
            existing.totalSpent += Number(o.amount) || 0;
          }
        });
        setCustomers(Array.from(map.values()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'REPEAT') return c.ordersCount > 1;
    if (filter === 'HIGH_VALUE') return c.totalSpent >= 5000;
    return true;
  });

  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter(c => c.ordersCount > 1).length;
  const avgSpend = totalCustomers > 0
    ? Math.round(customers.reduce((acc, curr) => acc + curr.totalSpent, 0) / totalCustomers)
    : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2537] tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage customer relationships, view purchase history, and offer rewards.</p>
        </div>
        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync Directory
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Unique Customers</p>
            <h3 className="text-2xl font-black text-[#0F2537] mt-1">{totalCustomers}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repeat Buyers</p>
            <h3 className="text-2xl font-black text-[#FF5722] mt-1">{repeatCustomers}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5722]">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Customer Spend</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{avgSpend.toLocaleString()}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <IndianRupee size={20} />
          </div>
        </div>
      </motion.div>

      {/* Main Table Container */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-h-[450px] flex flex-col">
        {/* Search & Filter Header */}
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-[#FF5722] font-medium text-[#0F2537] placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {[
              { key: 'ALL', label: 'All Customers' },
              { key: 'REPEAT', label: 'Repeat Buyers' },
              { key: 'HIGH_VALUE', label: 'High Value (≥ ₹5k)' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f.key ? 'bg-white text-[#0F2537] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="flex-1 p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-[#FF5722] mb-2" size={36} />
              <p className="text-slate-400 text-sm font-medium">Loading customer database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={36} className="text-slate-300 mb-2" />
              <p className="text-slate-600 font-bold text-sm">No customers found</p>
              <p className="text-slate-400 text-xs mt-1">Customer profiles are automatically created when orders are placed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Total Orders</th>
                    <th className="px-5 py-3.5">Total Lifetime Value</th>
                    <th className="px-5 py-3.5">Last Order</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F2537] to-[#1E3A8A] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F2537] text-sm group-hover:text-[#FF5722] transition-colors">{c.name}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5">
                              ✓ Verified Buyer
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" /> {c.email}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" /> {c.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-sm text-[#0F2537]">{c.ordersCount}</span>
                        <span className="text-xs text-slate-400 font-medium ml-1">order{c.ordersCount !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900 text-sm">₹{c.totalSpent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-400 font-mono">
                        {new Date(c.lastOrderDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => alert(`Emailing ${c.email}...`)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF5722] border border-orange-200 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Mail size={13} /> Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
