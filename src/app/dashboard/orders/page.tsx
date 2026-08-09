'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Search, FileText, ArrowRightLeft, Clock, CheckCircle2, Truck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchTerm) || (o.orderNumber && o.orderNumber.includes(searchTerm)) || o.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch(activeTab) {
      case 'ACTIVE': return ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status);
      case 'COMPLETED': return o.status === 'DELIVERED';
      case 'CANCELLED': return o.status === 'CANCELLED';
      default: return true;
    }
  });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'DELIVERED': return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 size={16}/>, label: 'Delivered' };
      case 'PROCESSING': return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Package size={16}/>, label: 'Processing' };
      case 'SHIPPED': return { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: <Truck size={16}/>, label: 'Shipped' };
      case 'OUT_FOR_DELIVERY': return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: <Truck size={16}/>, label: 'Out for Delivery' };
      case 'CANCELLED': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <CheckCircle2 size={16}/>, label: 'Cancelled' };
      default: return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock size={16}/>, label: status };
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Order History</h1>
          <p className="text-slate-500 font-medium">Track your shipments, view invoices, and manage returns.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar & Tabs */}
        <div className="border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-6 bg-slate-50/50">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar w-full md:w-auto">
              {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 bg-white relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => {
                  const statusInfo = getStatusConfig(order.status);
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                      key={order.id} 
                      className="group p-6 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* Order Identity & Timeline */}
                        <div className="flex items-start sm:items-center gap-5 flex-1">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-blue-500/10 transition-all">
                            <Package size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1.5">
                              <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-blue-600 transition-colors">
                                <Link href={`/dashboard/orders/${order.id}`}>
                                  Order #{order.orderNumber || order.id}
                                </Link>
                              </h3>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span>{order.orderItems?.length || 1} {order.orderItems?.length === 1 ? 'Item' : 'Items'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Pricing */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-6 lg:gap-10 w-full lg:w-auto border-t border-slate-100 lg:border-0 pt-6 lg:pt-0">
                          
                          <div className="flex gap-3">
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition-colors">
                              <FileText size={14} /> Invoice
                            </button>
                            {order.status === 'DELIVERED' && (
                              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition-colors">
                                <ArrowRightLeft size={14} /> Return
                              </button>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                            <p className="font-black text-slate-900 text-xl tracking-tight">₹{Number(order.totalAmount || order.total).toLocaleString('en-IN')}</p>
                          </div>
                          
                          <Link href={`/dashboard/orders/${order.id}`} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400 shrink-0 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <ChevronRight size={20} />
                          </Link>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-6">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Orders Found</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-md">
                {searchTerm || activeTab !== 'ALL' 
                  ? "We couldn't find any orders matching your current filters." 
                  : "You haven't placed any orders yet. Explore our catalog to find amazing products!"}
              </p>
              
              {searchTerm || activeTab !== 'ALL' ? (
                <button 
                  onClick={() => { setSearchTerm(''); setActiveTab('ALL'); }}
                  className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  Clear Filters
                </button>
              ) : (
                <Link href="/" className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20">
                  Start Shopping
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
