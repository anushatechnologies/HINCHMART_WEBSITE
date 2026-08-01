"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, ShoppingCart, IndianRupee, Clock,
  TrendingUp, TrendingDown, ArrowUpRight, Store,
  BarChart3, Users, Boxes, AlertCircle, CheckCircle2,
  ChevronRight, Star
} from 'lucide-react';

const STATUS_BADGES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function DashboardHome() {
  const [sellerName, setSellerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { totalRevenue: '₹0', totalOrders: 0, activeProducts: 0, pendingOrders: 0 },
    recentOrders: [] as any[],
    topProducts: [] as any[],
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        setSellerName(parsed.companyName || parsed.ownerName || 'Seller');
        
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
    { label: 'Total Revenue', value: data.kpis.totalRevenue, icon: IndianRupee, trend: '+18.2%', color: 'from-emerald-500 to-emerald-600', isPositive: true },
    { label: 'Total Orders', value: data.kpis.totalOrders.toString(), icon: ShoppingCart, trend: '+9.1%', color: 'from-blue-500 to-blue-600', isPositive: true },
    { label: 'Active Products', value: data.kpis.activeProducts.toString(), icon: Package, trend: '+3', color: 'from-indigo-500 to-indigo-600', isPositive: true },
    { label: 'Pending Orders', value: data.kpis.pendingOrders.toString(), icon: Clock, trend: '-4', color: 'from-amber-500 to-amber-600', isPositive: false },
  ];

  const quickLinks = [
    { label: 'Sales Dashboard', href: '/seller/dashboard/sales', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Orders Dashboard', href: '/seller/dashboard/orders', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Inventory Dashboard', href: '/seller/dashboard/inventory', icon: Boxes, color: 'bg-amber-50 text-amber-600' },
    { label: 'Analytics Dashboard', href: '/seller/dashboard/analytics', icon: BarChart3, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {sellerName || 'Seller'} 👋</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Store Active
          </span>
          <Link href="/seller/dashboard/products/add" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
            + Add Product
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  <Icon size={22} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-4">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(q => {
          const Icon = q.icon;
          return (
            <Link key={q.label} href={q.href}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 hover:border-slate-300 hover:shadow transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${q.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{q.label}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link href="/seller/dashboard/orders" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No recent orders found.</div>
            ) : data.recentOrders.map((order: any) => (
              <div key={order.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.customer} · {order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-800">{order.amount}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGES[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Top Products</h2>
            <Star size={16} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {data.topProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No sales data yet.</div>
            ) : data.topProducts.map((p: any, i: number) => (
              <div key={p.name} className="px-6 py-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.sales} sold · {p.revenue}</p>
                  <div className={`mt-1 text-[10px] font-bold inline-flex items-center gap-1 ${p.stock <= 10 ? 'text-red-600' : 'text-slate-400'}`}>
                    {p.stock <= 10 && <AlertCircle size={10} />}
                    {p.stock} in stock
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
