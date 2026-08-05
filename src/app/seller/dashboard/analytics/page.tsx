"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Package,
  RefreshCw, Loader2, BarChart2, Star, Target, Calendar, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function AnalyticsHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/analytics/overview?vendorId=${vendorId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-3">
        <Loader2 className="animate-spin text-[#E53935]" size={40} />
        <p className="text-gray-400 text-sm font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { label: 'Total Gross Revenue', value: `₹${data.kpis.totalGrossRevenue.toLocaleString()}`, sub: '+12% vs last month', icon: IndianRupee, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-500' },
    { label: 'Net Profit (Est)', value: `₹${data.kpis.netProfit.toLocaleString()}`, sub: 'After platform fees', icon: TrendingUp, bg: 'bg-[#E53935]/5', border: 'border-red-200', text: 'text-[#E53935]', iconBg: 'bg-[#E53935]' },
    { label: 'Total Orders', value: data.kpis.totalOrders.toString(), sub: '+5% vs last month', icon: ShoppingBag, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-500' },
    { label: 'Avg. Order Value', value: `₹${Math.round(data.kpis.aov).toLocaleString()}`, sub: 'Per completed order', icon: Target, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-500' },
  ];

  const retentionRate = data?.customers?.totalCustomers
    ? Math.round(((data?.customers?.repeatCustomers || 0) / data.customers.totalCustomers) * 100)
    : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Performance</h1>
          <p className="text-gray-500 text-sm mt-0.5">A comprehensive overview of your sales, inventory, and customer metrics.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-white border ${kpi.border} rounded-2xl p-5 shadow-sm relative overflow-hidden group`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{kpi.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} text-white flex items-center justify-center shadow-md`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
              </div>
              <p className={`text-xs font-bold ${kpi.text}`}>{kpi.sub}</p>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Products & Inventory */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          
          {/* Top Performing Products */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <BarChart2 size={16} className="text-[#E53935]" /> Top Performing Products
            </h3>
            <div className="space-y-3">
              {(data?.products?.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-500 text-sm shrink-0">#{i+1}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#E53935] transition-colors">{p.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{p.sales} Units Sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">₹{p.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">Revenue</p>
                  </div>
                </div>
              ))}
              {(!data?.products?.topProducts || data.products.topProducts.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">No sales data yet.</p>
              )}
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Package size={22}/>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">Total Inventory Value</p>
                <h3 className="text-2xl font-black text-gray-900">₹{data.inventory.totalInventoryValue.toLocaleString()}</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Across {data.inventory.totalProducts} active products</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-[#E53935] shrink-0">
                <AlertCircle size={22}/>
              </div>
              <div>
                <p className="text-xs font-bold text-red-600 mb-1">Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-gray-900">{data.inventory.lowStockCount} Products</h3>
                <p className="text-xs text-red-600 font-medium mt-1">Items with &lt; 10 units remaining</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Customer & Specialty */}
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
                  <div className="h-full bg-blue-500 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-500">Repeat Customers</p>
                  <span className="text-xl font-black text-gray-900">{data?.customers?.repeatCustomers || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: data?.customers?.totalCustomers ? `${((data?.customers?.repeatCustomers || 0) / data.customers.totalCustomers) * 100}%` : '0%' }} />
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
              <div className="p-3.5 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Active Rentals</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{data?.specialty?.activeRentals ?? data?.services?.activeRentals ?? 0} currently out</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-sm">₹{(data?.specialty?.rentalRevenue ?? data?.services?.rentalRevenue ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">Revenue</p>
                </div>
              </div>
              <div className="p-3.5 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Service Bookings</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{data?.specialty?.totalServiceBookings ?? data?.services?.totalServiceBookings ?? 0} total appointments</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-sm">₹{(data?.specialty?.serviceRevenue ?? data?.services?.serviceRevenue ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
