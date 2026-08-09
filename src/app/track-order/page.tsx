'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Truck, Search, MapPin, CheckCircle, Package, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      // Assuming a public endpoint or we just simulate tracking for now based on a valid ID
      // For this demo, let's hit a protected endpoint if user has token, or mock if not
      const token = localStorage.getItem('token');
      if (!token) {
        // Mock tracking if not logged in
        setTimeout(() => {
          setOrder({
            orderNumber: orderId,
            status: 'SHIPPED',
            estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
            courier: 'Delhivery',
            trackingId: 'DLV987654321',
            steps: [
              { status: 'Order Placed', time: new Date(Date.now() - 86400000 * 2).toLocaleString(), done: true },
              { status: 'Processing', time: new Date(Date.now() - 86400000 * 1.5).toLocaleString(), done: true },
              { status: 'Shipped', time: new Date(Date.now() - 86400000 * 1).toLocaleString(), done: true },
              { status: 'Out for Delivery', time: '', done: false },
              { status: 'Delivered', time: '', done: false },
            ]
          });
          setLoading(false);
        }, 1000);
        return;
      }
      
      const res = await fetch(`${API}/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        // Mock tracking steps based on order status
        const steps = [
          { status: 'Order Placed', time: new Date(data.data.createdAt).toLocaleString(), done: true },
          { status: 'Processing', time: data.data.status !== 'PENDING' ? new Date(new Date(data.data.createdAt).getTime() + 3600000).toLocaleString() : '', done: data.data.status !== 'PENDING' },
          { status: 'Shipped', time: data.data.status === 'SHIPPED' || data.data.status === 'DELIVERED' ? 'Yes' : '', done: data.data.status === 'SHIPPED' || data.data.status === 'DELIVERED' },
          { status: 'Delivered', time: data.data.status === 'DELIVERED' ? 'Yes' : '', done: data.data.status === 'DELIVERED' }
        ];
        setOrder({ ...data.data, steps });
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Truck size={14} /> Track Order
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Where is my order?</h1>
          <p className="text-slate-500 font-medium text-lg">
            Enter your Order ID below to get real-time tracking updates.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
          <div className="p-8 sm:p-12">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-123456" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-900 uppercase tracking-wider"
                />
              </div>
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                <Search size={20} /> {loading ? 'Tracking...' : 'Track'}
              </button>
            </form>
            {error && <p className="text-red-500 font-bold text-center mt-6">{error}</p>}
          </div>

          {order && (
            <div className="border-t border-slate-100 bg-slate-50 p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Order Number</p>
                  <h2 className="text-2xl font-black text-slate-900">{order.orderNumber || orderId}</h2>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 font-black px-3 py-1 rounded-full text-sm uppercase tracking-wide">
                    <CheckCircle size={14} /> {order.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 sm:left-0 sm:right-0 sm:top-5 sm:bottom-auto sm:h-0.5 sm:w-full" />
                <div className="flex flex-col sm:flex-row justify-between gap-8 relative z-10">
                  {order.steps?.map((step: any, i: number) => (
                    <div key={i} className="flex sm:flex-col items-center gap-4 sm:gap-3 text-center w-full sm:w-auto">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-slate-50 transition-colors ${step.done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {step.done ? <CheckCircle size={18} /> : <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <div className="text-left sm:text-center">
                        <p className={`font-bold text-sm ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.status}</p>
                        {step.time && <p className="text-xs text-slate-500 font-medium mt-0.5">{step.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.trackingId && (
                <div className="mt-12 bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500">Shipped via <span className="text-slate-900">{order.courier}</span></p>
                    <p className="font-mono font-bold text-slate-900">Tracking: {order.trackingId}</p>
                  </div>
                  <a href="#" className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">Track on Courier Website <ArrowRight size={16} /></a>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm font-bold text-slate-500">
          Need help? <Link href="/contact" className="text-indigo-600 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
