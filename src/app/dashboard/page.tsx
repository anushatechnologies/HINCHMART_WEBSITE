'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Heart, ArrowRight, Package } from 'lucide-react';

const API = 'http://localhost:5000';

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

      const [ordersRes, wishlistRes] = await Promise.all([
        fetch(`${API}/api/orders`, { headers }),
        fetch(`${API}/api/wishlist`, { headers })
      ]);

      const ordersData = await ordersRes.json();
      const wishlistData = await wishlistRes.json();

      let ordersList = [];
      if (ordersData.success) {
        ordersList = ordersData.data;
        setRecentOrders(ordersList.slice(0, 3));
      }

      setStats({
        ordersCount: ordersList.length,
        wishlistCount: wishlistData.success ? wishlistData.data.length : 0,
        addressCount: 0 // Will connect to address API once built
      });

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Account Overview</h1>
      <p className="text-slate-500 mb-8">Manage your orders, track shipments, and update your profile.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-3xl font-black text-slate-900">{stats.ordersCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Wishlist Items</p>
            <p className="text-3xl font-black text-slate-900">{stats.wishlistCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Saved Addresses</p>
            <p className="text-3xl font-black text-slate-900">{stats.addressCount}</p>
          </div>
        </div>
      </div>

      {/* Profile & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-slate-900 text-lg mb-6">Profile Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-slate-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-slate-900">{user.phone}</p>
              </div>
            </div>
            <button className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg">Recent Orders</h3>
              <Link href="/dashboard/orders" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentOrders.map(order => (
                  <div key={order.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="text-slate-400" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-1">Order #{order.id}</p>
                        <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500 mb-1">Total</p>
                        <p className="font-black text-slate-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <ShoppingBag size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium mb-4">You haven't placed any orders yet.</p>
                <Link href="/search" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
