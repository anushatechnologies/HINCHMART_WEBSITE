"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Star, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw,
  CheckCircle2, Plus, Sparkles, ShieldCheck, ChevronRight, Eye, Layers,
  Boxes, Calendar, ExternalLink, Filter, Wallet, Zap, FileText, IndianRupee,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  PENDING:    { bg: 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]', label: '● Pending Review' },
  PROCESSING: { bg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]', label: '● Processing' },
  SHIPPED:    { bg: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]', label: '● In Transit' },
  DELIVERED:  { bg: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]', label: '● Live / Completed' },
  CANCELLED:  { bg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]', label: '● Rejected' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } }
};

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [sellerName, setSellerName] = useState('Anusha Bazaar');
  const [sellerStatus, setSellerStatus] = useState('APPROVED');

  const [dashboardData, setDashboardData] = useState({
    profileProgress: 75,
    kpis: {
      totalSales: '₹12.45L',
      salesGrowth: '+18.4%',
      totalOrders: '1,248',
      ordersGrowth: '+12.2%',
      totalProducts: '248',
      productsGrowth: '+24',
      pendingSettlement: '₹1.84L',
      settlementCycle: '7-day cycle'
    },
    chartData: [
      { day: 'Mon', revenue: 120000, payout: 105000 },
      { day: 'Tue', revenue: 185000, payout: 160000 },
      { day: 'Wed', revenue: 142000, payout: 120000 },
      { day: 'Thu', revenue: 220000, payout: 195000 },
      { day: 'Fri', revenue: 284000, payout: 240000 },
      { day: 'Sat', revenue: 310000, payout: 275000 },
      { day: 'Sun', revenue: 245000, payout: 210000 }
    ],
    recentOrders: [
      { id: 101, orderNo: 'ORD-98241', customer: 'Ramesh Steel Works', items: '2x TMT 500D Steel Bars (100 Tons)', amount: '₹84,500', status: 'PENDING', date: '10 mins ago' },
      { id: 102, orderNo: 'ORD-98240', customer: 'Venkata Constructions', items: '500 Bags UltraTech Cement', amount: '₹1,85,000', status: 'PROCESSING', date: '45 mins ago' },
      { id: 103, orderNo: 'ORD-98238', customer: 'Prakash Hardware', items: '10x Heavy Angle Grinders 850W', amount: '₹24,000', status: 'SHIPPED', date: '2 hours ago' },
      { id: 104, orderNo: 'ORD-98235', customer: 'Siri Sampada Builders', items: '200m Finolex Armoured Cable', amount: '₹36,200', status: 'DELIVERED', date: 'Yesterday' }
    ]
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        setSellerName(parsed.companyName || parsed.ownerName || 'Anusha Bazaar');
        setSellerStatus(parsed.status || 'APPROVED');
      } catch {}
    }
    setLoading(false);
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 font-sans">
      
      {/* ─── 1. ONBOARDING / SELLER PROFILE COMPLETION CARD ─── */}
      {dashboardData.profileProgress < 100 && (
        <motion.div variants={itemVariants} className="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <h2 className="text-lg font-bold text-[#172033]">Welcome to HinchMart</h2>
            </div>
            <p className="text-xs text-[#667085] font-medium max-w-xl">
              Complete your seller profile to start selling products and receiving bulk purchase orders from verified B2B buyers across India.
            </p>
            
            {/* Orange Progress Bar */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#172033]">Seller Profile</span>
                <span className="text-[#FF6B2C]">{dashboardData.profileProgress}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E4E7EC]">
                <div
                  className="h-full bg-[#FF6B2C] rounded-full transition-all duration-500"
                  style={{ width: `${dashboardData.profileProgress}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/seller/dashboard/profile"
            className="btn-primary px-6 py-2.5 text-xs shrink-0"
          >
            Complete Profile →
          </Link>
        </motion.div>
      )}

      {/* ─── 2. EXECUTIVE KPI CARDS (4 WHITE B2B CARDS) ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Sales */}
        <div className="card-b2b p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">Total Sales</span>
            <div className="w-9 h-9 rounded-lg bg-[#FFF1EA] text-[#FF6B2C] flex items-center justify-center font-bold">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033] tracking-tight">{dashboardData.kpis.totalSales}</p>
          <p className="text-xs text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} /> {dashboardData.kpis.salesGrowth} vs last month
          </p>
        </div>

        {/* KPI 2: Orders */}
        <div className="card-b2b p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">Orders</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <ShoppingCart size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033] tracking-tight">{dashboardData.kpis.totalOrders}</p>
          <p className="text-xs text-[#2563EB] font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} /> {dashboardData.kpis.ordersGrowth} active orders
          </p>
        </div>

        {/* KPI 3: Products */}
        <div className="card-b2b p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">Products</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033] tracking-tight">{dashboardData.kpis.totalProducts}</p>
          <p className="text-xs text-[#667085] font-medium mt-1">
            {dashboardData.kpis.productsGrowth} listed SKUs
          </p>
        </div>

        {/* KPI 4: Pending Settlement */}
        <div className="card-b2b p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#667085]">Pending Settlement</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033] tracking-tight">{dashboardData.kpis.pendingSettlement}</p>
          <p className="text-xs text-[#16A34A] font-semibold mt-1">
            {dashboardData.kpis.settlementCycle}
          </p>
        </div>

      </motion.div>

      {/* ─── 3. FINANCIAL VOLUME CHART & GROWTH COPILOT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Revenue Volume Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8 card-b2b p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold text-[#FF6B2C] uppercase tracking-wider bg-[#FFF1EA] px-2.5 py-1 rounded-md">Financial Analytics</span>
              <h3 className="text-lg font-bold text-[#172033] mt-1">Revenue & Payout Volume</h3>
            </div>

            <div className="flex items-center bg-[#F8FAFC] p-1 rounded-lg gap-1 border border-[#E4E7EC]">
              {(['7D', '30D', '90D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    chartTimeframe === tf ? 'bg-[#0B1F3A] text-white shadow-xs' : 'text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAECF0" />
                <XAxis dataKey="day" stroke="#667085" fontSize={11} tickLine={false} />
                <YAxis stroke="#667085" fontSize={11} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1F3A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Gross Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B2C" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Growth Acceleration Sidebar Card */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-[#0B1F3A] text-white p-6 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase text-[#FF6B2C] bg-[#FFF1EA]/10 px-2.5 py-1 rounded">
                B2B Seller Growth
              </span>
              <Sparkles size={18} className="text-[#FF6B2C]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Smart Store Accelerator</h3>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Add your first 5 products to appear in HinchMart marketplace search and receive purchase inquiries from corporate buyers across India.
              </p>
            </div>
          </div>

          <Link
            href="/seller/dashboard/products/add"
            className="w-full mt-6 py-3 rounded-lg bg-[#FF6B2C] hover:bg-[#E9551C] text-white text-xs font-semibold text-center block transition-all shadow-xs"
          >
            + Add Products Now
          </Link>
        </motion.div>

      </div>

      {/* ─── 4. RECENT CUSTOMER ORDERS QUEUE TABLE ─── */}
      <motion.div variants={itemVariants} className="card-b2b p-6">
        <div className="flex items-center justify-between mb-6 border-b border-[#E4E7EC] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#172033]">Live Customer Orders</h3>
            <p className="text-xs text-[#667085] font-medium mt-0.5">Real-time incoming orders from verified B2B buyers</p>
          </div>

          <Link href="/seller/dashboard/orders" className="text-[#FF6B2C] hover:underline text-xs font-semibold">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#EAECF0] text-[12px] font-semibold text-[#667085]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">B2B Customer</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0] text-xs font-normal">
              {dashboardData.recentOrders.map(ord => {
                const conf = STATUS_CONFIG[ord.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={ord.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#172033]">{ord.orderNo}</td>
                    <td className="py-4 px-4 font-semibold text-[#172033]">{ord.customer}</td>
                    <td className="py-4 px-4 text-[#667085] max-w-xs truncate">{ord.items}</td>
                    <td className="py-4 px-4 font-bold text-[#172033]">{ord.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${conf.bg}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/seller/dashboard/orders/${ord.id}`} className="text-[#2563EB] font-semibold hover:underline">
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}
