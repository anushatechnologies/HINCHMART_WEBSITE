"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee, TrendingUp, TrendingDown, ShoppingBag,
  ArrowUpRight, Target, Percent
} from 'lucide-react';

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
        fetch(`http://localhost:5000/api/vendors/${parsed.id}/dashboard/sales`)
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

  const MAX_REVENUE = Math.max(...(data.monthlyData.length ? data.monthlyData : [1]));
  const MAX_DAILY = Math.max(...(data.weeklyStats.length ? data.weeklyStats.map(d => d.revenue) : [1]));
  const CHANNEL_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your revenue performance and sales trends.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {['weekly', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${period === p ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Gross Revenue', value: data.kpis.grossRevenue, change: '+18.2%', up: true, icon: IndianRupee },
          { label: 'Net Revenue', value: data.kpis.netRevenue, change: '+15.1%', up: true, icon: Target },
          { label: 'Avg. Order Value', value: data.kpis.aov, change: '+8.4%', up: true, icon: ShoppingBag },
          { label: 'Conversion Rate', value: data.kpis.conversionRate, change: '-0.2%', up: false, icon: Percent },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon size={20} className="text-slate-600" />
                </div>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {kpi.change}
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{kpi.label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900">Monthly Revenue</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Last 7 Months</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-44">
            {data.monthlyData.map((val, i) => {
              const height = (val / MAX_REVENUE) * 100;
              const isLast = i === data.monthlyData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(val / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full rounded-t-md transition-all" style={{
                    height: `${height}%`,
                    background: isLast ? 'linear-gradient(to top, #dc2626, #ef4444)' : '#e2e8f0',
                    minHeight: 8,
                  }} />
                  <span className="text-[10px] text-slate-500 font-medium">{data.monthlyLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-6">Revenue by Channel</h2>
          <div className="space-y-5">
            {data.channels.map((ch, i) => (
              <div key={ch.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{ch.label}</span>
                  <span className="font-bold text-slate-900">{ch.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${CHANNEL_COLORS[i % 3]} transition-all`} style={{ width: `${ch.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">This Week</h3>
            {data.weeklyStats.map(d => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-7">{d.day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-400" style={{ width: `${(d.revenue / MAX_DAILY) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-600 font-medium w-16 text-right">₹{(d.revenue / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Sales</h2>
          <Link href="/seller/dashboard/orders" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
            View Orders <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Order ID', 'Customer', 'Products', 'Amount', 'Commission', 'Net Earned', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500 text-sm">No recent sales found.</td>
                </tr>
              ) : data.recentSales.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono font-semibold text-red-700">{row.id}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-900">{row.customer}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{row.products} items</td>
                  <td className="px-6 py-3 text-sm font-bold text-slate-900">{row.amount}</td>
                  <td className="px-6 py-3 text-sm text-red-600">{row.commission}</td>
                  <td className="px-6 py-3 text-sm font-bold text-emerald-700">{row.net}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
