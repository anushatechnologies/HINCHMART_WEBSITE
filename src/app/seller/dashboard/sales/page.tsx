"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  IndianRupee, TrendingUp, TrendingDown, ShoppingBag,
  ArrowUpRight, Target, Percent, Calendar, Download, ChevronRight, Activity, PieChart as PieChartIcon, ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const PIE_COLORS = ['#FF5722', '#0F2537', '#2563eb', '#10b981'];

export default function SalesDashboard() {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { grossRevenue: '₹0', netRevenue: '₹0', aov: '₹0', conversionRate: '0%' },
    monthlyLabels: [] as string[],
    monthlyData: [] as number[],
    channels: [] as any[],
    weeklyStats: [] as any[],
    recentSales: [] as any[]
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/vendors/${parsed.id}/dashboard/sales`)
          .then(async res => {
            const ct = res.headers.get('content-type');
            if (res.ok && ct && ct.includes('application/json')) {
              return res.json();
            }
            return null;
          })
          .then(resData => {
            if (resData?.success) {
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

  const areaChartData = data.monthlyLabels.map((label, idx) => ({
    name: label,
    revenue: data.monthlyData[idx] || 0,
    orders: 0
  }));

  const pieChartData = data.channels.length > 0 
    ? data.channels.map(c => ({ name: c.label, value: c.percentage }))
    : [];

  const weeklyChartData = data.weeklyStats.length > 0
    ? data.weeklyStats.map(d => ({ name: d.day, revenue: d.revenue }))
    : [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F2537] tracking-tight">Sales Analytics</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Activity size={16} className="text-[#FF5722]" /> Track your revenue performance and sales trends.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100/50 border border-slate-200 rounded-xl p-1 shadow-inner">
            {['weekly', 'monthly', 'yearly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${period === p ? 'bg-white text-[#0F2537] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0F2537] hover:bg-[#1E3A8A] text-white text-sm font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
            <Download size={16} /> Export
          </button>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Gross Revenue', value: data.kpis.grossRevenue, change: '+18.2%', up: true, icon: IndianRupee, color: 'from-[#FF5722] to-[#FF7043]' },
          { label: 'Net Revenue', value: data.kpis.netRevenue, change: '+15.1%', up: true, icon: Target, color: 'from-[#0F2537] to-[#1E3A8A]' },
          { label: 'Avg. Order Value', value: data.kpis.aov, change: '+8.4%', up: true, icon: ShoppingBag, color: 'from-blue-600 to-cyan-500' },
          { label: 'Conversion Rate', value: data.kpis.conversionRate, change: '-0.2%', up: false, icon: Percent, color: 'from-emerald-500 to-teal-400' },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg flex items-center justify-center text-white`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <span className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-md ${kpi.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {kpi.change}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-sm text-slate-500 font-semibold mb-1">{kpi.label}</p>
                <p className="text-3xl font-black text-[#0F2537] tracking-tight">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-[#0F2537] flex items-center gap-2">
                <TrendingUp size={20} className="text-[#FF5722]" /> Revenue vs Orders
              </h2>
              <p className="text-sm text-slate-500 mt-1">Comparing total revenue with order volume over time.</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF5722]"></div> Revenue</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0F2537]"></div> Orders</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5722" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5722" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2537" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F2537" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [name === 'revenue' ? `₹${value?.toLocaleString() || 0}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF5722" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#0F2537" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Breakdown Charts */}
        <div className="space-y-8">
          {/* Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#0F2537] mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-[#FF5722]" /> Sales by Channel
            </h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                  <div className="text-sm">
                    <p className="font-semibold text-[#0F2537]">{entry.value}%</p>
                    <p className="text-xs text-slate-500">{entry.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#0F2537] mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> This Week's Revenue
            </h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#FF5722" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#0F2537] flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#FF5722]" /> Recent Sales Details
          </h2>
          <Link href="/seller/dashboard/orders" prefetch={true} className="text-sm font-semibold text-[#FF5722] hover:text-[#e64a19] flex items-center gap-1 group">
            View All Orders <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                {['Order ID', 'Customer', 'Products', 'Gross Amount', 'Platform Fee', 'Net Earned', 'Date'].map(h => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart size={40} className="text-slate-300 mb-3" />
                      <p className="font-medium">No recent sales found.</p>
                    </div>
                  </td>
                </tr>
              ) : data.recentSales.map((row, idx) => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-bold text-[#0F2537]">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.customer}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    <span className="bg-slate-100 rounded-lg px-2.5 py-1">{row.products} items</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-[#0F2537]">{row.amount}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-500">
                    <span className="bg-red-50 rounded-lg px-2.5 py-1">{row.commission}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600">{row.net}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{row.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
