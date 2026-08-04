"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, Box, CheckCircle, Clock, Truck, Home,
  XCircle, AlertCircle, RefreshCcw, HandCoins, Loader2, Play, Calendar, Printer, MoreVertical, ChevronDown
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const PIPELINE_STATES = [
  { id: 'PENDING',       label: 'Pending',        icon: Clock },
  { id: 'CONFIRMED',     label: 'Confirmed',      icon: CheckCircle },
  { id: 'PACKED',        label: 'Packed',         icon: Box },
  { id: 'READY_TO_SHIP', label: 'Ready to Ship',  icon: Box },
  { id: 'SHIPPED',       label: 'Shipped',        icon: Truck },
  { id: 'DELIVERED',     label: 'Delivered',      icon: Home },
  { id: 'CANCELLED',     label: 'Cancelled',      icon: XCircle },
];

const STATE_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PACKED: 'bg-purple-100 text-purple-700 border-purple-200',
  READY_TO_SHIP: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  SHIPPED: 'bg-teal-100 text-teal-700 border-teal-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const NEXT_STATE_MAP: Record<string, { label: string, next: string, color: string }> = {
  PENDING: { label: 'Confirm Order', next: 'CONFIRMED', color: 'bg-blue-600 hover:bg-blue-700' },
  CONFIRMED: { label: 'Mark as Packed', next: 'PACKED', color: 'bg-purple-600 hover:bg-purple-700' },
  PACKED: { label: 'Ready for Pickup', next: 'READY_TO_SHIP', color: 'bg-fuchsia-600 hover:bg-fuchsia-700' },
  READY_TO_SHIP: { label: 'Ship Order', next: 'SHIPPED', color: 'bg-teal-600 hover:bg-teal-700' },
  SHIPPED: { label: 'Mark Delivered', next: 'DELIVERED', color: 'bg-emerald-600 hover:bg-emerald-700' },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function OrderPipelineHub() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
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
        const mapped = data.data.map((item: any) => ({
          itemId: item.id,
          orderId: item.order.orderNumber,
          customer: item.order.companyName || item.order.user?.name || 'Customer',
          customerEmail: item.order.user?.email || 'N/A',
          product: item.variant.product.name,
          sku: item.variant.sku,
          quantity: item.quantity,
          amount: `₹${(Number(item.priceAtPurchase) * item.quantity).toLocaleString('en-IN')}`,
          status: item.status,
          date: new Date(item.order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
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

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrderStatus = async (itemId: number, newStatus: string, extraData: any = {}) => {
    try {
      const res = await fetch(`${API}/vendors/orders/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extraData })
      });
      if (res.ok) fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handleNextAction = (item: any) => {
    const nextAction = NEXT_STATE_MAP[item.status];
    if (!nextAction) return;
    if (nextAction.next === 'SHIPPED') {
      setShipItemId(item.itemId);
      setShowShipModal(true);
    } else {
      updateOrderStatus(item.itemId, nextAction.next);
    }
  };

  const submitShipping = () => {
    if (!shipItemId || !trackingNum || !courierName) return alert('Please fill in tracking details');
    updateOrderStatus(shipItemId, 'SHIPPED', { trackingNumber: trackingNum, courierName });
    setShowShipModal(false); setShipItemId(null); setTrackingNum(''); setCourierName('');
  };

  const filteredOrders = orders
    .filter(o => o.status === activeTab)
    .filter(o => 
      o.orderId.toLowerCase().includes(search.toLowerCase()) || 
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    );

  const stats = PIPELINE_STATES.reduce((acc, state) => {
    acc[state.id] = orders.filter(o => o.status === state.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Pipeline Hub</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            Manage your orders systematically from confirmation to delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders, SKU, customer..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <button onClick={() => fetchOrders()} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* Pipeline Tabs */}
      <motion.div variants={itemVariants} className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max p-1 bg-slate-100/50 rounded-2xl border border-slate-200">
          {PIPELINE_STATES.map(state => {
            const Icon = state.icon;
            const count = stats[state.id] || 0;
            const isActive = activeTab === state.id;
            return (
              <button
                key={state.id}
                onClick={() => setActiveTab(state.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative
                  ${isActive ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-blue-500' : ''} />
                {state.label}
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
                {isActive && (
                  <motion.div layoutId="activeTabIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Order List area */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Table Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Order Details</div>
          <div className="col-span-3">Customer & Date</div>
          <div className="col-span-3">Product Info</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="h-full flex items-center justify-center p-12">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-16 text-slate-500 text-center">
              <Box size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Orders Found</h3>
              <p className="text-sm">There are no orders in the {PIPELINE_STATES.find(s => s.id === activeTab)?.label} state matching your criteria.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order, idx) => {
                const nextAction = NEXT_STATE_MAP[order.status];
                const isExpanded = expandedId === order.itemId;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={order.itemId}
                    className={`bg-white rounded-xl border ${isExpanded ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'} transition-all overflow-hidden`}
                  >
                    <div 
                      className="px-6 py-5 grid grid-cols-12 gap-4 items-center cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : order.itemId)}
                    >
                      {/* Order Details */}
                      <div className="col-span-3">
                        <p className="text-sm font-black text-slate-900">{order.orderId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${STATE_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="col-span-3">
                        <p className="text-sm font-bold text-slate-800 truncate">{order.customer}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {order.date.split(',')[0]}
                        </p>
                      </div>

                      {/* Product Info */}
                      <div className="col-span-3">
                        <p className="text-sm font-semibold text-slate-700 truncate">{order.product}</p>
                        <p className="text-xs font-mono text-slate-500 mt-1">Qty: {order.quantity} | {order.amount}</p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                        {nextAction && (
                          <button
                            onClick={() => handleNextAction(order)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 ${nextAction.color}`}
                          >
                            <Play size={12} className="fill-current" /> {nextAction.label}
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                          <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content Area */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                        >
                          <div className="p-6 grid grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</h4>
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <p className="text-sm font-semibold text-slate-900">{order.product}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1">SKU: {order.sku}</p>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
                                  <span className="text-xs text-slate-500">Unit Price</span>
                                  <span className="text-xs font-bold text-slate-900">{order.amount}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shipping Info</h4>
                              <div className="bg-white p-3 rounded-lg border border-slate-200 min-h-[90px]">
                                {order.tracking ? (
                                  <>
                                    <p className="text-sm font-semibold text-slate-900">{order.courier}</p>
                                    <p className="text-xs text-blue-600 font-mono mt-1 tracking-wide">{order.tracking}</p>
                                  </>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                                    <Truck size={20} className="mb-1 opacity-50" />
                                    No tracking info yet
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h4>
                              <div className="flex flex-col gap-2">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                  <Printer size={16} className="text-slate-400" /> Print Packing Slip
                                </button>
                                {order.status === 'PENDING' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order.itemId, 'CANCELLED')}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <XCircle size={16} /> Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Shipping Modal */}
      <AnimatePresence>
        {showShipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowShipModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ship Order</h3>
                  <p className="text-sm text-slate-500">Provide tracking details for the customer.</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Courier Service</label>
                  <input type="text" value={courierName} onChange={e => setCourierName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g., BlueDart, Delhivery" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tracking Number (AWB)</label>
                  <input type="text" value={trackingNum} onChange={e => setTrackingNum(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm" placeholder="e.g., 1234567890" />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowShipModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={submitShipping} className="px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors">Confirm Shipment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
