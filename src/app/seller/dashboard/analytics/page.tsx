"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Package,
  RefreshCw, Loader2, BarChart2, Star, Target, AlertCircle, BarChart3
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

/** Default empty analytics so the page always renders even with no orders */
const EMPTY_DATA = {
  kpis: { totalGrossRevenue: 0, netProfit: 0, totalOrders: 0, aov: 0 },
  inventory: { totalProducts: 0, totalInventoryValue: 0, lowStockCount: 0 },
  customers: { totalCustomers: 0, repeatCustomers: 0 },
  services: { activeRentals: 0, rentalRevenue: 0, totalServiceBookings: 0, serviceRevenue: 0 },
  products: { topProducts: [] }
};

export default function AnalyticsHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(EMPTY_DATA);
  const [error, setError] = useState('');

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try { setVendorId(JSON.parse(info).id); } catch { setLoading(false); }
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    setError('');
    try {
      const { authFetch } = await import('@/lib/auth');
      const res = await authFetch(`${API}/vendors/analytics/overview?vendorId=${vendorId}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setError('Server returned an unexpected response. Please try again.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        // API returned success:false, keep empty defaults (new seller with no orders)
        setData(EMPTY_DATA);
      }
    } catch (e: any) {
      setError('Failed to load analytics. Check your connection.');
      console.error(e);
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { loadData(); }, [loadData]);

  const kpis = [
    { label: 'Gross Revenue', value: `₹${(data.kpis?.totalGrossRevenue || 0).toLocaleString()}`, sub: 'Total sales revenue', icon: IndianRupee, bg: 'from-emerald-500 to-teal-500' },
    { label: 'Net Profit (Est)', value: `₹${(data.kpis?.netProfit || 0).toLocaleString()}`, sub: 'After 15% platform fees', icon: TrendingUp, bg: 'from-[#E53935] to-rose-400' },
    { label: 'Total Orders', value: (data.kpis?.totalOrders || 0).toString(), sub: 'All time orders', icon: ShoppingBag, bg: 'from-blue-500 to-indigo-500' },
    { label: 'Avg. Order Value', value: `₹${Math.round(data.kpis?.aov || 0).toLocaleString()}`, sub: 'Per completed order', icon: Target, bg: 'from-amber-500 to-orange-400' },
  ];

  const retentionRate = data?.customers?.totalCustomers
    ? Math.round(((data?.customers?.repeatCustomers || 0) / data.customers.totalCustomers) * 100)
    : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto pb-10">

      {/* ─── Header ─── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Performance</h1>
          <p className="text-gray-500 text-sm mt-0.5">A comprehensive overview of your sales, inventory, and customer metrics.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </motion.div>

      {/* ─── Loading overlay ─── */}
      {loading && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <Loader2 className="animate-spin text-blue-500 shrink-0" size={20} />
          <p className="text-blue-700 text-sm font-medium">Loading your analytics data...</p>
        </motion.div>
      )}

      {/* ─── Error state ─── */}
      {error && !loading && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle className="text-[#E53935] shrink-0" size={20} />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* ─── New seller banner (no orders yet) ─── */}
      {!loading && !error && data.kpis?.totalOrders === 0 && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 text-sm">Your analytics will appear here once you get orders!</h3>
            <p className="text-indigo-600 text-xs mt-1">Revenue, customer insights, and performance metrics are tracked automatically as buyers purchase from your store.</p>
          </div>
        </motion.div>
      )}

      {/* ─── KPI Cards ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.bg} opacity-10 rounded-full -translate-y-4 translate-x-4 group-hover:opacity-20 transition-opacity`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.bg} text-white flex items-center justify-center shadow mb-3`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{kpi.value}</h3>
              <p className="text-gray-400 text-xs mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Products & Inventory (2/3 width) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">

          {/* Top Performing Products */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <BarChart2 size={16} className="text-[#E53935]" /> Top Performing Products
            </h3>
            <div className="space-y-3">
              {(data?.products?.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-gray-500 text-sm shrink-0">#{i + 1}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#E53935] transition-colors">{p.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{p.sales} Units Sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">₹{p.revenue?.toLocaleString() || 0}</p>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">Revenue</p>
                  </div>
                </div>
              ))}
              {(!data?.products?.topProducts || data.products.topProducts.length === 0) && (
                <div className="text-center py-8">
                  <BarChart3 size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No sales data yet</p>
                  <p className="text-xs text-gray-300 mt-1">Top products will appear once orders come in</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Package size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">Total Inventory Value</p>
                <h3 className="text-2xl font-black text-gray-900">₹{(data.inventory?.totalInventoryValue || 0).toLocaleString()}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Across {data.inventory?.totalProducts || 0} active products</p>
              </div>
            </div>
            <div className={`${(data.inventory?.lowStockCount || 0) > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border rounded-2xl p-5 shadow-sm flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-2xl ${(data.inventory?.lowStockCount || 0) > 0 ? 'bg-red-100 text-[#E53935]' : 'bg-gray-100 text-gray-400'} flex items-center justify-center shrink-0`}>
                <AlertCircle size={22} />
              </div>
              <div>
                <p className={`text-xs font-bold mb-1 ${(data.inventory?.lowStockCount || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-gray-900">{data.inventory?.lowStockCount || 0} Products</h3>
                <p className={`text-xs font-medium mt-1 ${(data.inventory?.lowStockCount || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>Items with &lt; 10 units remaining</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Customer & Specialty (1/3 width) */}
        <motion.div variants={itemVariants} className="space-y-5">

          {/* Customer Insights */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Users size={16} className="text-blue-600" /> Customer Insights
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-500">Total Unique Customers</p>
                  <span className="text-xl font-black text-gray-900">{data?.customers?.totalCustomers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: data?.customers?.totalCustomers > 0 ? '100%' : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-500">Repeat Customers</p>
                  <span className="text-xl font-black text-gray-900">{data?.customers?.repeatCustomers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: data?.customers?.totalCustomers ? `${((data?.customers?.repeatCustomers || 0) / data.customers.totalCustomers) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-2 text-right font-bold">{retentionRate}% Retention Rate</p>
              </div>
            </div>
          </div>

          {/* Specialty Services */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Specialty Services
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Active Rentals', count: `${data?.services?.activeRentals ?? 0} currently out`, revenue: data?.services?.rentalRevenue ?? 0 },
                { label: 'Service Bookings', count: `${data?.services?.totalServiceBookings ?? 0} total appointments`, revenue: data?.services?.serviceRevenue ?? 0 }
              ].map(item => (
                <div key={item.label} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.label}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
