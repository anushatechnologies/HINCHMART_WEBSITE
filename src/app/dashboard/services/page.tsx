'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Calendar, Clock, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DashboardServicesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/api/services/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setBookings(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch_data();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Service Bookings</h1>
          <p className="text-slate-500 mt-1">Track your scheduled professional services and appointments.</p>
        </div>
        <Link href="/services" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2">
          <Wrench size={16} /> Book a Service
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading bookings...</div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {bookings.map(booking => (
              <div key={booking.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                    <Wrench size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 mb-1">{booking.serviceOffering?.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {booking.scheduledTime}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">{booking.serviceAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                    <p className="font-black text-slate-900 text-lg">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <Wrench size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Service Bookings</h3>
            <p className="text-slate-500 mb-6">You haven't booked any services yet.</p>
            <Link href="/services" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm uppercase tracking-widest text-sm">
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
