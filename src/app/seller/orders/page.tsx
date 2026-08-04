'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Search, Filter, Box } from 'lucide-react';
import Link from 'next/link';

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        { id: 'ORD-8812', date: new Date().toISOString(), customer: 'L&T Constructions', amount: 145000, status: 'NEW', items: 3 },
        { id: 'ORD-8809', date: new Date(Date.now() - 86400000).toISOString(), customer: 'GMR Group', amount: 56000, status: 'PACKING', items: 1 },
        { id: 'ORD-8750', date: new Date(Date.now() - 86400000 * 2).toISOString(), customer: 'Raju Hardware', amount: 12500, status: 'SHIPPED', items: 5 },
        { id: 'ORD-8711', date: new Date(Date.now() - 86400000 * 5).toISOString(), customer: 'Mega Builders', amount: 450000, status: 'DELIVERED', items: 12 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">New Order</span>;
      case 'PACKING': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">Packing</span>;
      case 'SHIPPED': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">Shipped</span>;
      case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">Delivered</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track shipments and update order statuses.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800">
            Export to Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'New Orders', val: '12', icon: Box, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'To Pack', val: '4', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Shipped', val: '28', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Delivered (This Month)', val: '145', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={s.color} size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search by Order ID or Customer..." className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center font-bold text-slate-400">Loading Orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="p-4 font-bold">Order Details</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Total Value</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{new Date(order.date).toLocaleDateString()} • {order.items} items</div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{order.customer}</td>
                    <td className="p-4 font-black text-slate-900">₹{order.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      {order.status === 'NEW' && <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm mr-2">Accept Order</button>}
                      {order.status === 'PACKING' && <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm mr-2">Mark Shipped</button>}
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1.5 border border-blue-200 rounded">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
