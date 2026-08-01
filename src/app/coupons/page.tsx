'use client';
import { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Percent, IndianRupee, Clock } from 'lucide-react';

const API = 'http://localhost:5000';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/api/coupons`)
      .then(r => r.json())
      .then(d => { if (d.success) setCoupons(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <Ticket size={14} /> Discount Coupons
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">Save More with Coupons</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto font-medium">
            Apply these exclusive coupon codes at checkout to unlock additional savings on your order.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* How to use */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10">
          <h2 className="font-extrabold text-slate-900 mb-4">How to Use Coupons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', text: 'Copy the coupon code below' },
              { step: '2', text: 'Add items to your cart' },
              { step: '3', text: 'Paste the code at checkout' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg shrink-0">{s.step}</div>
                <p className="text-sm font-medium text-slate-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-44 animate-pulse" />)}
          </div>
        ) : coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map(coupon => {
              const expired = isExpired(coupon.expiresAt);
              return (
                <div key={coupon.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden relative ${expired ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-blue-300 hover:shadow-md transition-all'}`}>
                  {expired && <div className="absolute top-3 right-3 bg-slate-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Expired</div>}
                  
                  {/* Left colored strip */}
                  <div className="flex">
                    <div className={`w-3 shrink-0 ${coupon.type === 'PERCENTAGE' ? 'bg-orange-400' : 'bg-blue-500'}`} />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${coupon.type === 'PERCENTAGE' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-600'}`}>
                            {coupon.type === 'PERCENTAGE' ? <Percent size={20} /> : <IndianRupee size={20} />}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xl">
                              {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{coupon.type.toLowerCase()} discount</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium mb-4">
                        {coupon.minOrderValue && <p>Minimum order: <span className="font-bold text-slate-700">₹{coupon.minOrderValue}</span></p>}
                        {coupon.maxUses && <p>Uses remaining: <span className="font-bold text-slate-700">{coupon.maxUses - (coupon.usedCount || 0)}</span></p>}
                        {coupon.expiresAt && (
                          <p className="flex items-center gap-1">
                            <Clock size={11} /> Expires: <span className="font-bold text-slate-700">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                          </p>
                        )}
                      </div>

                      {/* Coupon Code Box */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-4 py-2.5 font-black text-slate-800 tracking-widest text-sm uppercase">
                          {coupon.code}
                        </div>
                        <button onClick={() => copyCode(coupon.id, coupon.code)} disabled={expired}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${copiedId === coupon.id ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:opacity-50`}>
                          {copiedId === coupon.id ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <Ticket size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Coupons</h3>
            <p className="text-slate-500">No coupons available at the moment. Check back for exciting deals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
