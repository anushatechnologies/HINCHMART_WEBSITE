"use client";

import { useState, useEffect } from 'react';
import AccountSidebar from '../AccountSidebar';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ArrowLeft, RotateCcw, FileText } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  PACKED: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const TRACKING_STEPS = [
  { status: 'placed', label: 'Order Placed', icon: Clock },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'PACKED', label: 'Packed', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusOrder: Record<string, number> = {
  placed: 0, PENDING: 0, PROCESSING: 1, PACKED: 2, SHIPPED: 3, DELIVERED: 4
};

export default function MyOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    Promise.all([
      fetch('http://localhost:5000/api/account/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([userRes, ordRes]) => {
      if (userRes.success) setUser(userRes.data);
      if (ordRes.success) setOrders(ordRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: 'Placed' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/account" className="text-slate-500 hover:text-red-600 transition-colors"><ArrowLeft size={18}/></Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">My Orders</h1>
            <p className="text-sm text-slate-500">{orders.length} orders total</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <AccountSidebar user={user} />

        <div className="flex-1 min-w-0">
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 mb-4 flex overflow-x-auto">
            {filterTabs.map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={`px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  filter === tab.id ? 'text-red-600 border-red-600' : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
              <Package size={48} className="text-slate-200 mx-auto mb-4"/>
              <p className="text-slate-500 font-medium">No {filter === 'all' ? '' : filter} orders found</p>
              <Link href="/products" className="mt-4 inline-block bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 text-sm">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((order: any) => {
                const stepIdx = statusOrder[order.status] ?? 0;
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-6 text-xs text-slate-600">
                        <div><p className="font-bold text-slate-900 text-sm">#{order.orderNumber}</p><p className="text-slate-500">Order No.</p></div>
                        <div><p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="text-slate-500">Placed On</p></div>
                        <div><p className="font-bold text-slate-900">₹{Number(order.total).toLocaleString('en-IN')}</p><p className="text-slate-500">Total</p></div>
                        <div><p className="font-bold text-slate-900">{order.items?.length} item(s)</p><p className="text-slate-500">Items</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700'}`}>
                          {order.status}
                        </span>
                        <button onClick={() => window.open(`http://localhost:5000/api/orders/${order.id}/invoice?token=${localStorage.getItem('token')}`, '_blank')} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                          <FileText size={14}/> Invoice
                        </button>
                        <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:underline">
                          Details <ChevronRight size={14}/>
                        </Link>
                      </div>
                    </div>

                    {/* Tracking Bar */}
                    {order.status !== 'CANCELLED' && (
                      <div className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center">
                          {TRACKING_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const done = i <= stepIdx;
                            const active = i === stepIdx;
                            return (
                              <div key={i} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex flex-col items-center gap-1 ${active ? 'scale-110' : ''} transition-transform`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'} transition-colors`}>
                                    <Icon size={14}/>
                                  </div>
                                  <span className={`text-[9px] font-bold text-center leading-tight whitespace-nowrap ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{step.label}</span>
                                </div>
                                {i < TRACKING_STEPS.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIdx ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="px-6 py-4 space-y-3">
                      {order.items?.map((item: any, idx: number) => {
                        const product = item.variant?.product;
                        const img = product?.images?.[0]?.url;
                        return (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xl">
                              {img ? <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt="" className="w-full h-full object-cover"/> : '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{product?.name || 'Product'}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}</p>
                            </div>
                            <p className="font-bold text-slate-900 text-sm shrink-0">₹{(item.quantity * Number(item.priceAtPurchase)).toLocaleString('en-IN')}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Actions */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
                      <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                        <FileText size={14}/> Download Invoice
                      </button>
                      {order.status === 'DELIVERED' && (
                        <button className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:underline">
                          <RotateCcw size={14}/> Return / Refund
                        </button>
                      )}
                      {['placed', 'PENDING'].includes(order.status) && (
                        <button className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline">
                          <XCircle size={14}/> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
