"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Package,
  RefreshCw, Loader2, BarChart2, Star, Target, Calendar, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function AnalyticsHub() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Load Vendor ID
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return <div className="flex justify-center items-center h-[500px]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Performance</h1>
          <p className="text-slate-500 mt-1">A comprehensive overview of your sales, inventory, and customer metrics.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* 1. Top-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><IndianRupee size={80} /></div>
          <p className="text-sm font-semibold text-slate-500 mb-2">Total Gross Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">₹{data.kpis.totalGrossRevenue.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> +12% vs last month</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500 rounded-full opacity-20 blur-2xl"></div>
          <p className="text-sm font-semibold text-slate-400 mb-2">Net Profit (Est)</p>
          <h3 className="text-3xl font-black text-white">₹{data.kpis.netProfit.toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 font-bold mt-2">After platform fees</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShoppingBag size={80} /></div>
          <p className="text-sm font-semibold text-slate-500 mb-2">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-900">{data.kpis.totalOrders}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> +5% vs last month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={80} /></div>
          <p className="text-sm font-semibold text-slate-500 mb-2">Avg. Order Value</p>
          <h3 className="text-3xl font-black text-slate-900">₹{Math.round(data.kpis.aov).toLocaleString()}</h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Per completed order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Product & Inventory Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><BarChart2 className="text-indigo-600"/> Top Performing Products</h3>
            <div className="space-y-4">
              {(data?.products?.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">#{i+1}</div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-500">{p.sales} Units Sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{p.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Revenue</p>
                  </div>
                </div>
              ))}
              {(!data?.products?.topProducts || data.products.topProducts.length === 0) && <p className="text-sm text-slate-500 text-center py-4">No sales data yet.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><Package size={24}/></div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Inventory Value</p>
                <h3 className="text-2xl font-black text-slate-900">₹{data.inventory.totalInventoryValue.toLocaleString()}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Across {data.inventory.totalProducts} active products</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0"><AlertCircle size={24}/></div>
              <div>
                <p className="text-sm font-semibold text-red-800">Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-red-900">{data.inventory.lowStockCount} Products</h3>
                <p className="text-xs text-red-700 font-medium mt-1">Items with &lt; 10 units remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Customer & Specialty Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Users className="text-blue-600"/> Customer Insights</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-semibold text-slate-600">Total Unique Customers</p>
                  <span className="text-2xl font-black text-slate-900">{data.customers.totalCustomers}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-semibold text-slate-600">Repeat Customers</p>
                  <span className="text-2xl font-black text-slate-900">{data.customers.repeatCustomers}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: data.customers.totalCustomers ? `${(data.customers.repeatCustomers / data.customers.totalCustomers) * 100}%` : '0%' }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {data.customers.totalCustomers ? Math.round((data.customers.repeatCustomers / data.customers.totalCustomers) * 100) : 0}% Retention Rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Star className="text-amber-500"/> Specialty Services</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Active Rentals</h4>
                  <p className="text-xs text-slate-500">{data.specialty.activeRentals} currently out</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{data.specialty.rentalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Revenue</p>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Service Bookings</h4>
                  <p className="text-xs text-slate-500">{data.specialty.totalServiceBookings} total appointments</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{data.specialty.serviceRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
