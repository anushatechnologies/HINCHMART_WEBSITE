'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Search } from 'lucide-react';

const API = 'http://localhost:5000';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => o.id.toString().includes(searchTerm) || o.status.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Order History</h1>
      <p className="text-slate-500 mb-8">View and track all your past and current orders.</p>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>
          <div className="text-sm font-bold text-slate-500">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'} Found
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map(order => (
              <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block hover:bg-slate-50 transition-colors p-4 sm:p-6 group">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-lg">Order #{order.id}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="font-black text-slate-900 text-lg">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400 shrink-0 shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <Package size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 mb-6">You don't have any orders matching your criteria.</p>
            <Link href="/search" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors uppercase tracking-widest text-sm shadow-sm">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
