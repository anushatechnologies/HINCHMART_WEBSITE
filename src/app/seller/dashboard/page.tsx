"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Star, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw,
  CheckCircle2, Plus, Sparkles, ShieldCheck, ChevronRight, Eye, Layers,
  Boxes, Calendar, ExternalLink, Filter, Wallet, Zap, FileText, IndianRupee
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const STATUS_CONFIG: Record<string, { bg: string; text?: string; dot: string; label: string }> = {
  PENDING:    { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400',   label: 'Action Required' },
  PROCESSING: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-400',    label: 'Packing & Ready' },
  SHIPPED:    { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400', label: 'In Transit' },
  DELIVERED:  { bg: 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30', text: 'text-[#00E676]', dot: 'bg-[#00E676]', label: 'Completed' },
  CANCELLED:  { bg: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'text-red-300', dot: 'bg-red-400',     label: 'Cancelled' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [sellerName, setSellerName] = useState('Anusha Bazaar');
  const [sellerStatus, setSellerStatus] = useState('APPROVED');

  const [dashboardData, setDashboardData] = useState({
    kpis: {
      todaySales: '₹14,250',
      netPayout: '₹1,30,350',
      activeOrders: 8,
      activeSkus: 24,
      sellerRating: '5.0',
      refundRate: '0.0%'
    },
    chartData: [
      { day: 'Mon', revenue: 12000, payout: 10500 },
      { day: 'Tue', revenue: 18500, payout: 16000 },
      { day: 'Wed', revenue: 14200, payout: 12000 },
      { day: 'Thu', revenue: 22000, payout: 19500 },
      { day: 'Fri', revenue: 28400, payout: 24000 },
      { day: 'Sat', revenue: 31000, payout: 27500 },
      { day: 'Sun', revenue: 24500, payout: 21000 }
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

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── 1. ENTERPRISE HEADER BAR ─── */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0F2537] via-[#162C3D] to-[#0A111E] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-[#FF5722] bg-[#FF5722]/15 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider">
                Seller Command Portal
              </span>
              <span className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Calendar size={14} className="text-[#FF7043]" /> {today}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              Welcome back, <span className="text-[#FF7043]">{sellerName}</span>
              <span className="text-xs bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 px-3 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                ✓ Verified Gold Merchant
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-semibold max-w-2xl">
              Store SLA: <span className="font-bold text-[#00E676]">100% SLA Active</span> • 28,000+ delivery pincodes active • Bank Account: <span className="font-bold text-white">Verified</span>
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/seller/dashboard/products/add"
              className="px-5 py-3 bg-gradient-to-r from-[#FF5722] via-[#FF7043] to-[#FF8A65] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20"
            >
              <Plus size={16} /> Add Product
            </Link>

            <Link
              href="/seller/dashboard/finance"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all border border-white/15 backdrop-blur-md flex items-center gap-2"
            >
              <Wallet size={15} className="text-[#FF5722]" /> Request Payout
            </Link>

          </div>
        </div>
      </motion.div>

      {/* ─── 2. REAL EXECUTIVE METRICS GRID ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Module 1: Today's Revenue */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-[#FF5722]/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center font-bold border border-[#FF5722]/30">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.todaySales}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Live order earnings</p>
        </div>

        {/* Module 2: Net Payout Balance */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-[#00E676]/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Net Payout Balance</span>
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center font-bold border border-[#00E676]/30">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.netPayout}</p>
          <p className="text-[10px] text-[#00E676] font-semibold mt-1">7-day bank payout cycle</p>
        </div>

        {/* Module 3: Active Orders Queue */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-blue-500/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Orders Queue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              <ShoppingCart size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.activeOrders}</p>
          <p className="text-[10px] text-blue-400 font-bold mt-1">Pending Fulfillment</p>
        </div>

        {/* Module 4: Active SKUs */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-purple-500/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.activeSkus}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Listed products</p>
        </div>

        {/* Module 5: Seller Rating */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-amber-500/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Store Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
              <Star size={16} fill="currentColor" />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.sellerRating}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Buyer feedback score</p>
        </div>

        {/* Module 6: Return Rate */}
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl hover:-translate-y-1 hover:border-[#00E676]/50 transition-all text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Return Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center font-bold border border-[#00E676]/30">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{dashboardData.kpis.refundRate}</p>
          <p className="text-[10px] text-[#00E676] font-bold mt-1">Order Returns</p>
        </div>

      </motion.div>

      {/* ─── 3. DUAL ANALYTICS SUITE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Revenue Volume Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-[#0B1426]/90 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-black text-[#FF7043] uppercase tracking-wider bg-[#FF5722]/15 px-3 py-1 rounded-lg border border-[#FF5722]/30">Financial Performance</span>
              <h3 className="text-xl font-black text-white mt-1.5">Revenue & Bank Payout Volume</h3>
            </div>

            <div className="flex items-center bg-white/5 p-1 rounded-xl gap-1 border border-white/10">
              {(['7D', '30D', '90D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartTimeframe === tf ? 'bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white shadow-md' : 'text-slate-400 hover:text-white'
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
                    <stop offset="5%" stopColor="#FF5722" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF5722" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A111E', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(val: any, name: any) => [`₹${val.toLocaleString()}`, name === 'revenue' ? 'Gross Revenue' : 'Net Payout']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" name="revenue" />
                <Area type="monotone" dataKey="payout" stroke="#00E676" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#payoutGrad)" name="payout" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Smart Growth & Price Insights Radar */}
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-gradient-to-br from-[#0F2537] via-[#162C3D] to-[#0A111E] text-white p-6 rounded-3xl shadow-2xl border border-white/15 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-black uppercase text-[#FF5722] bg-[#FF5722]/15 px-3 py-1 rounded-full border border-[#FF5722]/30">
                AI Growth Copilot
              </span>
              <Sparkles size={20} className="text-[#FF5722]" />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-black text-white">Smart Store Accelerator</h3>
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                Add your first 5 products to get listed on HinchMart marketplace search and unlock buyer orders across India.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Catalog Readiness</span>
                <span className="text-[#00E676]">80%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF5722] to-[#00E676] rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>

          <Link
            href="/seller/dashboard/products/add"
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5722] via-[#FF7043] to-[#FF8A65] text-white text-xs font-black text-center block shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20"
          >
            Add Products Now →
          </Link>
        </motion.div>

      </div>

      {/* ─── 4. RECENT ORDERS QUEUE ─── */}
      <motion.div variants={itemVariants} className="bg-[#0B1426]/90 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Live Customer Orders</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time incoming orders from verified B2B buyers</p>
          </div>

          <Link href="/seller/dashboard/orders" className="text-[#FF7043] hover:underline text-xs font-bold flex items-center gap-1">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">B2B Customer</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-semibold">
              {dashboardData.recentOrders.map(ord => {
                const conf = STATUS_CONFIG[ord.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{ord.orderNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{ord.customer}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{ord.items}</td>
                    <td className="py-3.5 px-4 font-black text-white">{ord.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${conf.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/seller/dashboard/orders/${ord.id}`} className="text-[#FF7043] font-bold hover:underline">
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
