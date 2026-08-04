"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, IndianRupee, Clock,
  TrendingUp, ArrowUpRight, BarChart3, Boxes, AlertCircle, CheckCircle2, ChevronRight, Activity, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STATUS_BADGES: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
  PROCESSING: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
  SHIPPED: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/50',
  DELIVERED: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
  CANCELLED: 'bg-red-500/10 text-red-700 border-red-200/50',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
  const [sellerName, setSellerName] = useState('');
  const [sellerStatus, setSellerStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { totalRevenue: '₹0', totalOrders: 0, activeProducts: 0, pendingOrders: 0 },
    trends: {
      revenue: [{value: 0}], orders: [{value: 0}], products: [{value: 0}], pending: [{value: 0}]
    },
    recentOrders: [] as any[],
    topProducts: [] as any[],
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        setSellerName(parsed.companyName || parsed.ownerName || 'Seller');
        setSellerStatus(parsed.status || 'PENDING');
        
        fetch(`http://localhost:5000/api/vendors/${parsed.id}/dashboard/home`)
          .then(res => res.json())
          .then(resData => {
            if (resData.success) {
              setData(resData.data);
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const stats = [
    { label: 'Total Revenue', value: data.kpis.totalRevenue, icon: IndianRupee, trend: '+18.2%', chart: data.trends.revenue, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
    { label: 'Total Orders', value: data.kpis.totalOrders.toString(), icon: ShoppingCart, trend: '+9.1%', chart: data.trends.orders, color: 'from-blue-600 to-cyan-400', shadow: 'shadow-blue-500/20' },
    { label: 'Active Products', value: data.kpis.activeProducts.toString(), icon: Package, trend: 'stable', chart: data.trends.products, color: 'from-indigo-600 to-violet-400', shadow: 'shadow-indigo-500/20' },
    { label: 'Pending Orders', value: data.kpis.pendingOrders.toString(), icon: Clock, trend: 'attention', chart: data.trends.pending, color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/20' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {sellerName} 👋</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Activity size={16} className="text-red-500" /> Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {sellerStatus === 'ACTIVE' ? (
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <CheckCircle2 size={18} className="text-emerald-500" /> Store Active
            </span>
          ) : (
            <span className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
              <AlertCircle size={18} className="text-amber-500" /> Pending Approval
            </span>
          )}
          <Link href="/seller/dashboard/products/add" className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
            <Zap size={16} /> Add Product
          </Link>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Background gradient blur */}
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity`} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.trend} this week
                </span>
                
                {/* Mini Sparkline */}
                <div className="h-8 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.chart}>
                      <defs>
                        <linearGradient id={`colorUv${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={stat.trend.startsWith('+') ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={stat.trend.startsWith('+') ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={stat.trend.startsWith('+') ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill={`url(#colorUv${idx})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-500" /> Recent Orders
            </h2>
            <Link href="/seller/dashboard/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={40} className="text-slate-300 mb-3" />
                        <p className="font-medium">No recent orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order, idx) => (
                    <motion.tr 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{order.productName}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_BADGES[order.status] || STATUS_BADGES.PENDING}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Action Checklist */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
            <CheckCircle2 size={20} className="text-emerald-500" /> To-Do List
          </h2>
          
          <div className="space-y-4 relative z-10">
            {[
              { id: 1, label: 'Add your first 5 products', done: true },
              { id: 2, label: 'Complete KYC Verification', done: sellerStatus === 'ACTIVE' },
              { id: 3, label: 'Set up Return Policies', done: false },
              { id: 4, label: 'Link Razorpay Account', done: false },
            ].map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                  {task.done && <CheckCircle2 size={14} />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/seller/dashboard/sales" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-100">
                <TrendingUp size={20} className="text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Sales</span>
              </Link>
              <Link href="/seller/dashboard/inventory" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-100">
                <Boxes size={20} className="text-amber-500" />
                <span className="text-xs font-semibold text-slate-700">Inventory</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
