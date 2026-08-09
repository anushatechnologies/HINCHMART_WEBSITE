'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Clock, Tag, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

function Countdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  return <span className="font-mono font-black text-orange-500 tabular-nums">{timeLeft}</span>;
}

export default function OffersPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then(r => r.json())
      .then(d => { if (d.success) setDeals(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 text-white py-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <Zap size={14} className="fill-white" /> Limited Time Deals
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">Today's Best Offers</h1>
          <p className="text-orange-100 text-xl max-w-2xl mx-auto font-medium">
            Exclusive discounts on top construction materials, tools, and equipment. Deals expire soon — grab them now!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map(deal => {
              const product = deal.product;
              const img = product?.images?.[0];
              const imgUrl = img ? (img.url.startsWith('http') ? img.url : `${API}${img.url}`) : null;
              const discount = product ? Math.round(((Number(product.basePrice) - Number(deal.dealPrice)) / Number(product.basePrice)) * 100) : 0;
              return (
                <div key={deal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {imgUrl ? (
                      <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Tag size={48} />
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-2 line-clamp-2 leading-tight">{product?.name}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-2xl font-black text-orange-500">₹{Number(deal.dealPrice).toLocaleString('en-IN')}</p>
                      <p className="text-sm font-bold text-slate-400 line-through">₹{Number(product?.basePrice).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
                      <Clock size={12} className="text-orange-500 shrink-0" />
                      <span>Ends in: </span>
                      <Countdown endTime={deal.endTime} />
                    </div>
                    <Link href={`/products/${product?.slug}`} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs text-center uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm">
                      Grab Deal <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <Zap size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Deals Right Now</h3>
            <p className="text-slate-500 mb-6">Check back soon for exciting limited-time offers.</p>
            <Link href="/search" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
