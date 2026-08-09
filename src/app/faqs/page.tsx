'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API}/api/faq`)
      .then(r => r.json())
      .then(d => { if (d.success) setFaqs(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  const categories = Object.keys(faqs);
  
  const matchesSearch = (item: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return item.question.toLowerCase().includes(s) || item.answer.toLowerCase().includes(s);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <HelpCircle size={14} /> Knowledge Base
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-8">
            Find answers to common questions about orders, shipping, returns, and your HinchMart account.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search FAQs..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-white h-20 rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-10">
            {categories.map(cat => {
              const categoryFaqs = faqs[cat].filter(matchesSearch);
              if (categoryFaqs.length === 0) return null;
              
              return (
                <div key={cat}>
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">{cat[0]}</div>
                    {cat}
                  </h2>
                  <div className="space-y-4">
                    {categoryFaqs.map(faq => (
                      <div key={faq.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIds.has(faq.id) ? 'border-blue-300 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>
                        <button onClick={() => toggle(faq.id)} className="w-full text-left px-6 py-5 flex items-center justify-between gap-4">
                          <span className={`font-bold text-lg ${openIds.has(faq.id) ? 'text-blue-700' : 'text-slate-900'}`}>{faq.question}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openIds.has(faq.id) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            {openIds.has(faq.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </button>
                        {openIds.has(faq.id) && (
                          <div className="px-6 pb-6 pt-2">
                            <div className="w-full h-px bg-slate-100 mb-4" />
                            <div className="prose prose-slate text-slate-600 font-medium whitespace-pre-wrap">{faq.answer}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <HelpCircle size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No FAQs found</h3>
            <p className="text-slate-500">We couldn't find any questions matching your search.</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 text-center text-white flex flex-col items-center">
          <MessageSquare size={32} className="text-blue-400 mb-4" />
          <h2 className="text-2xl font-black mb-2">Still need help?</h2>
          <p className="text-slate-400 font-medium mb-8 max-w-lg">Our customer support team is available 24/7 to assist you with any questions or concerns.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">Contact Support</Link>
            <Link href="/live-chat" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm border border-blue-500">Live Chat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
