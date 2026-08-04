'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, CheckCircle2, Navigation, PackageSearch, ShieldCheck } from 'lucide-react';

export default function DeliveryApp() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setDeliveries([
        { id: 'ORD-8711', address: 'Plot 45, Industrial Estate, Hyderabad', customer: 'L&T Constructions', phone: '+91 98765 43210', status: 'OUT_FOR_DELIVERY', items: 12, amount: 450000, cod: false },
        { id: 'ORD-8809', address: 'Block C, Gachibowli, Hyderabad', customer: 'GMR Group', phone: '+91 91234 56789', status: 'OUT_FOR_DELIVERY', items: 1, amount: 56000, cod: true },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleVerifyOTP = () => {
    if (otp === '1234') {
      alert('Order Delivered Successfully!');
      setDeliveries(deliveries.filter((d: any) => d.id !== selectedOrder.id));
      setSelectedOrder(null);
      setOtp('');
    } else {
      alert('Invalid OTP. Ask customer for 4-digit code.');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-20 sm:pb-0">
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" />
          <h1 className="font-black text-lg">Delivery Portal</h1>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
          Agent: DA-771
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <PackageSearch size={18} /> Today's Deliveries ({deliveries.length})
        </h2>

        {loading ? (
          <div className="text-center p-8 text-slate-400 font-bold animate-pulse">Loading Route...</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center p-8 text-emerald-600 font-bold bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="mx-auto mb-2" size={32} />
            All Deliveries Completed!
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-slate-900">{order.id}</h3>
                    <p className="text-xs text-slate-500 font-medium">{order.items} Items • ₹{order.amount.toLocaleString('en-IN')}</p>
                  </div>
                  {order.cod ? (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black tracking-wider">Collect Cash</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black tracking-wider">Prepaid</span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-700 leading-tight">{order.customer}<br/><span className="text-xs text-slate-500 font-normal">{order.address}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <a href={`tel:${order.phone}`} className="text-sm font-bold text-blue-600 hover:underline">{order.phone}</a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                    <Navigation size={16} /> Navigate
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors shadow-md"
                  >
                    <CheckCircle2 size={16} /> Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 pb-8">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <ShieldCheck size={32} className="text-blue-600" />
              </div>
              <h3 className="font-black text-xl text-slate-900">Verify Delivery</h3>
              <p className="text-sm text-slate-500 mt-1">Ask customer for the 4-digit PIN.</p>
              <div className="mt-2 font-bold text-slate-900 bg-slate-100 py-1 px-3 rounded-lg inline-block text-sm">
                Order: {selectedOrder.id}
              </div>
            </div>

            {selectedOrder.cod && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center mb-6">
                <p className="text-amber-800 text-sm font-bold mb-1">COLLECT CASH</p>
                <h4 className="text-3xl font-black text-amber-600">₹{selectedOrder.amount.toLocaleString('en-IN')}</h4>
              </div>
            )}

            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter 4-Digit OTP"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setSelectedOrder(null); setOtp(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerifyOTP}
                disabled={otp.length !== 4}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
