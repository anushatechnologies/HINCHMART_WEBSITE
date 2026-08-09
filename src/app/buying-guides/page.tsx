'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookMarked, Search, ArrowRight, Tag, Hammer, Zap, Droplets, Shield, Home } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Tools', value: 'TOOLS', icon: Hammer },
  { name: 'Electrical', value: 'ELECTRICAL', icon: Zap },
  { name: 'Plumbing', value: 'PLUMBING', icon: Droplets },
  { name: 'Safety', value: 'SAFETY', icon: Shield },
  { name: 'Home', value: 'HOME', icon: Home },
];

export default function BuyingGuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    const query = activeCategory ? `?category=${activeCategory}` : '';
    fetch(`${API}/api/buying-guides${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGuides(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <BookMarked size={14} /> Buying Guides
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">Make the Right Purchase</h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto font-medium">
            Expert-curated buying guides for construction materials, tools, and equipment — helping you make informed decisions every time.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex gap-3 flex-wrap mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeCategory === cat.value ? 'bg-teal-600 text-white shadow-teal-600/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />)}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map(guide => (
              <Link key={guide.id} href={`/buying-guides/${guide.slug}`} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-100">
                  {guide.imageUrl ? (
                    <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookMarked size={48} className="text-teal-200" />
                    </div>
                  )}
                  {guide.category && (
                    <div className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      {guide.category}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-extrabold text-slate-900 text-lg mb-2 leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors">{guide.title}</h2>
                  <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">{guide.summary}</p>
                  <div className="flex items-center gap-1 text-teal-600 font-bold text-sm">
                    Read Guide <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <BookMarked size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Guides Found</h3>
            <p className="text-slate-500">Expert buying guides will be published here. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
