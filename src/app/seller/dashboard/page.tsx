"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, IndianRupee, Clock, TrendingUp, ArrowUpRight, BarChart3,
  Boxes, AlertCircle, CheckCircle2, ChevronRight, Zap, Activity, ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  PROCESSING: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  SHIPPED:    { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  dot: 'bg-indigo-400' },
  DELIVERED:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  CANCELLED:  { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function DashboardHome() {
  const [sellerName, setSellerName] = useState('');
  const [sellerStatus, setSellerStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { totalRevenue: '₹0', totalOrders: 0, activeProducts: 0, pendingOrders: 0 },
    trends: {
      revenue: [{ value: 0 }], orders: [{ value: 0 }], products: [{ value: 0 }], pending: [{ value: 0 }]
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
          .then(resData => { if (resData.success) setData(resData.data); })
          .catch(console.error)
          .finally(() => setLoading(false));
      } catch { setLoading(false); }
    } else { setLoading(false); }
  }, []);

  const isApproved = sellerStatus === 'ACTIVE' || sellerStatus === 'APPROVED';

  const stats = [
    {
      label: 'Total Revenue', value: data.kpis.totalRevenue, icon: IndianRupee,
      trend: '+18.2%', trendUp: true, chart: data.trends.revenue,
      gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20'
    },
    {
      label: 'Total Orders', value: data.kpis.totalOrders.toString(), icon: ShoppingCart,
      trend: '+9.1%', trendUp: true, chart: data.trends.orders,
      gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20'
    },
    {
      label: 'Active Products', value: data.kpis.activeProducts.toString(), icon: Package,
      trend: 'Stable', trendUp: true, chart: data.trends.products,
      gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20'
    },
    {
      label: 'Pending Orders', value: data.kpis.pendingOrders.toString(), icon: Clock,
      trend: 'Attention', trendUp: false, chart: data.trends.pending,
      gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20'
    },
  ];

  const firstName = sellerName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {greeting}, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">{firstName}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" />
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isApproved ? (
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <CheckCircle2 size={14} /> Store Active
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
              <AlertCircle size={14} /> Pending Approval
            </span>
          )}
          <Link href="/seller/dashboard/products/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95">
            <Zap size={15} /> Add Product
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const chartColor = stat.trendUp ? '#10b981' : '#f59e0b';
          return (
            <motion.div key={stat.label} variants={itemVariants}
              className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/12 transition-all group relative overflow-hidden">
              {/* Subtle glow */}
              <div className={`absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black text-white tracking-tight mt-1">{loading ? '—' : stat.value}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.glow} flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
                    ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}
                  `}>
                    {stat.trendUp && <TrendingUp size={11} />}
                    {stat.trend}
                  </span>
                  <div className="h-8 w-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stat.chart}>
                        <defs>
                          <linearGradient id={`g${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={1.5} fillOpacity={1} fill={`url(#g${idx})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-400" /> Recent Orders
            </h2>
            <Link href="/seller/dashboard/orders" className="text-white/40 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors group">
              View All <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {data.recentOrders.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-white/20" />
                </div>
                <p className="text-white/30 font-semibold text-sm">No orders yet</p>
                <p className="text-white/15 text-xs mt-1">Orders will appear here once customers start purchasing</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/25 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentOrders.map((order, idx) => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white/80 text-sm">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-white/60 text-sm font-medium truncate max-w-[160px]">{order.productName}</td>
                        <td className="px-6 py-4 text-white font-bold text-sm">₹{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/30 text-xs font-medium">{new Date(order.date).toLocaleDateString()}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Setup Checklist + Quick Links */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Checklist */}
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} className="text-emerald-400" /> Setup Checklist
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Create seller account', done: true },
                { label: 'Complete KYC Verification', done: isApproved },
                { label: 'Add your first 5 products', done: false },
                { label: 'Set up Return Policies', done: false },
                { label: 'Link Bank Account for payouts', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/15 bg-white/5'}`}>
                    {task.done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className={`text-xs font-semibold ${task.done ? 'text-white/25 line-through' : 'text-white/60'}`}>{task.label}</span>
                </div>
              ))}
            </div>
            {!isApproved && (
              <Link href="/seller/onboarding/wizard"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold transition-all border border-violet-500/20">
                <ShieldCheck size={14} /> Complete KYC <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* Quick Links Grid */}
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sales Report', href: '/seller/dashboard/sales', icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Inventory', href: '/seller/dashboard/inventory', icon: Boxes, color: 'text-amber-400' },
                { label: 'Analytics', href: '/seller/dashboard/analytics', icon: BarChart3, color: 'text-violet-400' },
                { label: 'Finance', href: '/seller/dashboard/finance', icon: IndianRupee, color: 'text-emerald-400' },
              ].map(q => {
                const Icon = q.icon;
                return (
                  <Link key={q.label} href={q.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group">
                    <Icon size={18} className={q.color} />
                    <span className="text-[11px] font-semibold text-white/50 group-hover:text-white/80 transition-colors">{q.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
