'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookMarked, ArrowLeft, Share2, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';

export default function BuyingGuideDetailPage() {
  const { slug } = useParams();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/buying-guides/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGuide(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-500 font-bold text-lg">Loading guide...</div>
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-slate-900">Guide not found</h2>
      <Link href="/buying-guides" className="text-teal-600 font-bold hover:underline flex items-center gap-1"><ArrowLeft size={16} /> Back to Guides</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {guide.imageUrl && (
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          {guide.category && (
            <div className="absolute top-4 left-4 bg-teal-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              {guide.category}
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/buying-guides" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Buying Guides
        </Link>

        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">
              <BookMarked size={14} /> Buying Guide
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">{guide.title}</h1>

            {guide.summary && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8">
                <p className="text-base text-teal-900 font-medium leading-relaxed flex items-start gap-3">
                  <CheckCircle size={20} className="text-teal-500 mt-0.5 shrink-0" />
                  {guide.summary}
                </p>
              </div>
            )}

            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {guide.content}
            </div>
          </div>

          <div className="px-8 sm:px-12 py-6 bg-teal-50 border-t border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 mb-1">Ready to shop?</p>
              <p className="text-sm text-slate-500">Find the best products based on this guide.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm text-sm hover:border-slate-300">
                <Share2 size={16} /> Share
              </button>
              <Link href="/search" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm text-sm">
                Browse Products
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
