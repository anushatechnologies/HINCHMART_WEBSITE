"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, RefreshCw, Box, CheckCircle, Clock, Truck, Home,
  XCircle, AlertCircle, RefreshCcw, HandCoins, Loader2, Play
} from 'lucide-react';

const API = 'http://localhost:5000/api';

// All 10 requested states mapped to a linear pipeline flow
const PIPELINE_STATES = [
  { id: 'NEW',           label: 'New',            icon: AlertCircle },
  { id: 'PENDING',       label: 'Pending',        icon: Clock },
  { id: 'CONFIRMED',     label: 'Confirmed',      icon: CheckCircle },
  { id: 'PACKED',        label: 'Packed',         icon: Box },
  { id: 'READY_TO_SHIP', label: 'Ready to Ship',  icon: Box },
  { id: 'SHIPPED',       label: 'Shipped',        icon: Truck },
  { id: 'DELIVERED',     label: 'Delivered',      icon: Home },
  { id: 'CANCELLED',     label: 'Cancelled',      icon: XCircle },
  { id: 'RETURNED',      label: 'Returned',       icon: RefreshCcw },
  { id: 'REFUNDED',      label: 'Refunded',       icon: HandCoins },
];

const STATE_COLORS: Record<string, string> = {
  NEW: 'bg-indigo-100 text-indigo-700',
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PACKED: 'bg-purple-100 text-purple-700',
  READY_TO_SHIP: 'bg-fuchsia-100 text-fuchsia-700',
  SHIPPED: 'bg-teal-100 text-teal-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

// Logical next steps for the quick-action button
const NEXT_STATE_MAP: Record<string, { label: string, next: string }> = {
  NEW: { label: 'Acknowledge', next: 'PENDING' },
  PENDING: { label: 'Confirm Order', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Mark as Packed', next: 'PACKED' },
  PACKED: { label: 'Ready for Pickup', next: 'READY_TO_SHIP' },
  READY_TO_SHIP: { label: 'Ship Order', next: 'SHIPPED' }, // Will require tracking info
  SHIPPED: { label: 'Mark Delivered', next: 'DELIVERED' },
};

export default function OrderPipelineHub() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Shipping Modal State
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipItemId, setShipItemId] = useState<number | null>(null);
  const [courierName, setCourierName] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/orders?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) {
        // Map backend order items to frontend structure
        const mapped = data.data.map((item: any) => ({
          itemId: item.id,
          orderId: item.order.orderNumber,
          customer: item.order.companyName || item.order.user?.name || 'Customer',
          product: item.variant.product.name,
          sku: item.variant.sku,
          quantity: item.quantity,
          amount: `₹${(Number(item.priceAtPurchase) * item.quantity).toLocaleString('en-IN')}`,
          status: item.status, // Current state
          date: new Date(item.order.createdAt).toLocaleString('en-IN'),
          tracking: item.trackingNumber,
          courier: item.courierName
        }));
        setOrders(mapped);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (itemId: number, newStatus: string, extraData: any = {}) => {
    try {
      const res = await fetch(`${API}/vendors/orders/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update UI
        setOrders(prev => prev.map(o => o.itemId === itemId ? { ...o, status: newStatus, ...extraData } : o));
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleActionClick = (order: any) => {
    const action = NEXT_STATE_MAP[order.status];
    if (!action) return;

    if (action.next === 'SHIPPED') {
      setShipItemId(order.itemId);
      setShowShipModal(true);
    } else {
      updateOrderStatus(order.itemId, action.next);
    }
  };

  const submitShippingDetails = () => {
    if (!shipItemId || !courierName || !trackingNum) return alert('Fill all fields');
    updateOrderStatus(shipItemId, 'SHIPPED', { courierName, trackingNumber: trackingNum });
    setShowShipModal(false);
    setCourierName(''); setTrackingNum('');
  };

  const filteredOrders = orders.filter(o => 
    o.status === activeTab && 
    (search === '' || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const getCount = (status: string) => orders.filter(o => o.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Pipeline</h1>
          <p className="text-slate-500 mt-1">Manage fulfillment across 10 lifecycle stages.</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Sync
        </button>
      </div>

      {/* Kanban / Tabbed Navigation */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto p-2 bg-slate-50 border-b border-slate-200 no-scrollbar gap-2">
          {PIPELINE_STATES.map(state => {
            const count = getCount(state.id);
            const isActive = activeTab === state.id;
            const Icon = state.icon;
            return (
              <button
                key={state.id}
                onClick={() => setActiveTab(state.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap text-sm font-semibold transition-all ${
                  isActive ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-red-500' : 'text-slate-400'} />
                {state.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? STATE_COLORS[state.id] : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by Order ID or Customer..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Table View for Active Tab */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {['Order ID', 'Date', 'Customer', 'Product / SKU', 'Qty', 'Amount', 'Fulfillment', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-500">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3 text-red-500" />
                    <p className="text-sm font-medium">Syncing orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400">
                    <Box size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No orders in "{PIPELINE_STATES.find(s=>s.id===activeTab)?.label}" state.</p>
                  </td>
                </tr>
              ) : filteredOrders.map(order => {
                const action = NEXT_STATE_MAP[order.status];
                return (
                  <tr key={order.itemId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono font-bold text-red-600">{order.orderId}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{order.customer}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900 max-w-[200px] truncate" title={order.product}>{order.product}</p>
                      <p className="text-xs font-mono text-slate-500">{order.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">{order.quantity}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{order.amount}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {order.tracking ? (
                        <div>
                          <p className="font-semibold text-slate-900">{order.courier}</p>
                          <p className="font-mono">{order.tracking}</p>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4">
                      {action ? (
                        <button onClick={() => handleActionClick(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors">
                          <Play size={12} /> {action.label}
                        </button>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATE_COLORS[order.status]}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ship Order</h2>
            <p className="text-sm text-slate-500 mb-6">Enter dispatch details to move this order to SHIPPED.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Courier / Partner Name</label>
                <input value={courierName} onChange={e => setCourierName(e.target.value)}
                  placeholder="e.g. Delhivery, Bluedart"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tracking Number</label>
                <input value={trackingNum} onChange={e => setTrackingNum(e.target.value)}
                  placeholder="AWB or Tracking ID"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm" />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowShipModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={submitShippingDetails}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Confirm Dispatch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
