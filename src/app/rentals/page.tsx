'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package2, Calendar, Clock, ArrowRight, Wrench } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function RentalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${API}/api/rentals`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <Wrench size={14} /> Equipment Rentals
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Rent Premium Equipment</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">
            Access world-class construction tools, heavy machinery, and professional equipment on flexible daily or weekly rental terms — without the capital outlay.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Calendar, title: 'Flexible Duration', desc: 'From 1 day to 6 months' },
            { icon: Clock, title: 'Quick Delivery', desc: 'On-site within 24-48 hours' },
            { icon: Package2, title: 'Maintained Equipment', desc: 'Fully serviced & insured' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <f.icon size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Available for Rent</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => {
              const img = product.images?.[0];
              const imgUrl = img ? (img.url.startsWith('http') ? img.url : `${API}${img.url}`) : null;
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                    {imgUrl ? (
                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package2 className="text-slate-300" size={48} />
                    )}
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      For Rent
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-extrabold text-slate-900 mb-1 line-clamp-2 text-sm leading-tight">{product.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">{product.brand || product.category?.name}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-400 font-bold">Per Day</p>
                        <p className="text-lg font-black text-blue-600">₹{Number(product.rentPricePerDay || 0).toLocaleString('en-IN')}</p>
                      </div>
                      {product.minRentalDays && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold">Min Days</p>
                          <p className="font-bold text-slate-700">{product.minRentalDays}</p>
                        </div>
                      )}
                    </div>
                    <Link href={`/rentals/${product.id}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs text-center uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm">
                      Rent Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <Package2 size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Equipment Available</h3>
            <p className="text-slate-500">Rental equipment will be listed here. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
