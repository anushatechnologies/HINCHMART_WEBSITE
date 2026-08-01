'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package2, Calendar, ChevronRight } from 'lucide-react';

const API = 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RETURNED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DashboardRentalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/api/rentals/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setRequests(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch_data();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Rentals</h1>
          <p className="text-slate-500 mt-1">Track your active and past equipment rental requests.</p>
        </div>
        <Link href="/rentals" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2">
          <Package2 size={16} /> Browse Equipment
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading rentals...</div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {requests.map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                    {req.product?.images?.[0] ? (
                      <img src={req.product.images[0].url.startsWith('http') ? req.product.images[0].url : `${API}${req.product.images[0].url}`} className="w-full h-full object-cover rounded-xl" alt={req.product.name} />
                    ) : <Package2 size={24} className="text-blue-400" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 mb-1">{req.product?.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(req.startDate).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{req.durationDays} day{req.durationDays !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{req.city}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cost</p>
                    <p className="font-black text-slate-900 text-lg">₹{Number(req.totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-700'}`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <Package2 size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Rental Requests</h3>
            <p className="text-slate-500 mb-6">You haven't rented any equipment yet.</p>
            <Link href="/rentals" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm uppercase tracking-widest text-sm">
              Browse Rentals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
