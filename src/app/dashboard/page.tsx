'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Heart, ArrowRight, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardSummaryPage() {
  const [stats, setStats] = useState({ ordersCount: 0, wishlistCount: 0, addressCount: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // In real scenario, we would have an address API here too
      const [ordersRes, wishlistRes] = await Promise.all([
        fetch(`${API}/api/orders`, { headers }).catch(() => null),
        fetch(`${API}/api/wishlist`, { headers }).catch(() => null)
      ]);

      const ordersData = ordersRes ? await ordersRes.json() : { success: false, data: [] };
      const wishlistData = wishlistRes ? await wishlistRes.json() : { success: false, data: [] };

      let ordersList = [];
      if (ordersData.success) {
        ordersList = ordersData.data || [];
        setRecentOrders(ordersList.slice(0, 3));
      }

      setStats({
        ordersCount: ordersList.length,
        wishlistCount: wishlistData.success && wishlistData.data ? wishlistData.data.length : 0,
        addressCount: 2 // Mocked for UI demonstration
      });

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading Dashboard</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Account Overview</h1>
        <p className="text-slate-500 text-sm sm:text-base font-medium">Manage your orders, track shipments, and update your profile.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.ordersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
              <Heart size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Saved Items</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.wishlistCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Addresses</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.addressCount}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            </div>
            <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border-4 border-white flex items-center justify-center text-3xl font-black text-blue-600 -mt-10 mb-4 mx-auto z-10 overflow-hidden">
                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
              </div>
              <div className="text-center mb-6">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{user.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Premium Member</p>
              </div>
              
              <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100/50 mb-6 flex-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                  <span className="font-bold text-slate-800 text-sm">{user.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</span>
                  <span className="font-bold text-slate-800 text-sm">{user.phone || '+91 - Not Added'}</span>
                </div>
              </div>
              
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm mt-auto">
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Package className="text-blue-500" size={20} /> Recent Orders
              </h3>
              <Link href="/dashboard/orders" className="text-blue-600 font-bold text-sm hover:text-blue-700 flex items-center gap-1 group">
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col">
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {recentOrders.map((order, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (idx * 0.1) }}
                      key={order.id} 
                      className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:bg-blue-50/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Package className="text-slate-400" size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base mb-1 tracking-tight">Order #{order.orderNumber || order.id}</p>
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                          <p className="font-black text-slate-900 text-lg">₹{Number(order.totalAmount || order.total).toLocaleString('en-IN')}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <ShoppingBag size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-900 font-bold text-lg mb-1 tracking-tight">No Orders Yet</p>
                  <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">Looks like you haven't made your first purchase. Explore our catalog and find something you love!</p>
                  <Link href="/" className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
