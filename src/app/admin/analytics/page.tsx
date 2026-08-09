'use client';
import { useState, useEffect } from 'react';
import { LineChart, Users, ShoppingBag, Store, TrendingUp, DollarSign } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-slate-500 font-bold animate-pulse text-xl">Loading Analytics Dashboard...</div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500 font-bold">Failed to load analytics.</div>;

  const { stats, recentOrders, chartData } = data;

  // Simple CSS bar chart logic
  const maxSales = Math.max(...chartData.map((d: any) => d.sales), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <LineChart className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics & Reports</h1>
            <p className="text-slate-500 font-medium">Overview of platform performance.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <DollarSign size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Sales</p>
            <h3 className="text-3xl font-black text-slate-900">₹{Number(stats.totalSales).toLocaleString()}</h3>
            <p className="text-emerald-500 text-sm font-bold mt-2 flex items-center gap-1"><TrendingUp size={14} /> +12% this week</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <ShoppingBag size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOrders}</h3>
            <p className="text-emerald-500 text-sm font-bold mt-2 flex items-center gap-1"><TrendingUp size={14} /> +5% this week</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <Users size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customers</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalUsers}</h3>
            <p className="text-blue-500 text-sm font-bold mt-2 flex items-center gap-1">Active users</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <Store size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vendors</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalVendors}</h3>
            <p className="text-blue-500 text-sm font-bold mt-2 flex items-center gap-1">Registered sellers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Sales Overview (Last 7 Days)</h2>
            <div className="h-64 flex items-end gap-2 sm:gap-4 pb-6 border-b border-slate-100">
              {chartData.map((d: any) => {
                const height = `${(d.sales / maxSales) * 100}%`;
                return (
                  <div key={d.date} className="flex-1 flex flex-col justify-end items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      ₹{d.sales.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg group-hover:from-blue-500 group-hover:to-blue-300 transition-all"
                      style={{ height }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 mt-2 rotate-45 sm:rotate-0 origin-left truncate w-full text-center">
                      {d.date.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900">Recent Orders</h2>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                      <span className="font-black text-emerald-600 text-sm">₹{Number(order.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">{order.user.name}</span>
                      <span className={`font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
