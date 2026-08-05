"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Filter, Search, RefreshCw, Loader2, ChevronDown,
  Package, Truck, CheckCircle, XCircle, Clock, Eye, ArrowUpRight
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:    { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Processing' },
  SHIPPED:    { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  label: 'Shipped' },
  DELIVERED:  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Delivered' },
  CANCELLED:  { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Cancelled' },
  RETURNED:   { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500',  label: 'Returned' },
};

const TABS = [
  { key: 'ALL',        label: 'All Orders',  icon: ShoppingCart },
  { key: 'PENDING',    label: 'Pending',     icon: Clock },
  { key: 'PROCESSING', label: 'Processing',  icon: Package },
  { key: 'SHIPPED',    label: 'Shipped',     icon: Truck },
  { key: 'DELIVERED',  label: 'Delivered',   icon: CheckCircle },
  { key: 'CANCELLED',  label: 'Cancelled',   icon: XCircle },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const thCls = "px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-left";

export default function OrdersHub() {
  const [tab, setTab] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [vendorId, setVendorId] = useState<number | null>(null);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadOrders = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const status = tab === 'ALL' ? '' : `&status=${tab}`;
      const res = await fetch(`${API}/vendors/${vendorId}/orders?page=1&limit=50${status}`);
      const data = await res.json();
      if (data.success) setOrders(Array.isArray(data.data?.orders) ? data.data.orders : Array.isArray(data.data) ? data.data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`${API}/vendors/orders/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadOrders();
    } catch (e) { console.error(e); }
  };

  const filtered = orders.filter(o =>
    (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track, update, and manage all your customer orders.</p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E53935] to-[#F06292] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-400/25 hover:from-[#c62828] hover:to-[#e91e63] transition-all active:scale-95">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync Orders
        </button>
      </motion.div>

      {/* Main Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-all
                  ${isActive ? 'text-[#E53935]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                <Icon size={14} />
                {t.label}
                {isActive && <motion.div layoutId="orders-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E53935] to-[#F06292] rounded-t-full" />}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-[#E53935] transition-all placeholder:text-gray-400" />
          </div>
          <span className="text-sm text-gray-400 font-medium hidden sm:block">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-[#E53935] mb-3" />
            <p className="text-gray-400 text-sm">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingCart size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing the filter or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className={thCls}>Order #</th>
                  <th className={thCls}>Customer</th>
                  <th className={thCls}>Product</th>
                  <th className={thCls}>Amount</th>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order, idx) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4 font-mono font-bold text-gray-700 text-sm">{order.orderNumber}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{order.customerName || '—'}</p>
                        <p className="text-xs text-gray-400">{order.customerEmail || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm truncate max-w-[180px] font-medium">{order.productName || order.items?.[0]?.productName || '—'}</td>
                      <td className="px-5 py-4 font-black text-gray-900 text-sm">₹{order.totalAmount || order.amount}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs font-medium">{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {order.status === 'PENDING' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors">Process</button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors">Ship</button>
                          )}
                          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Eye size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
