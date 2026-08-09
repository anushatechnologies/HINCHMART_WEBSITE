'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Calendar, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    fetch(`${API}/api/blogs${query}`)
      .then(r => r.json())
      .then(d => { if (d.success) setBlogs(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/20">
            <BookOpen size={14} /> HinchMart Blog
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">Construction Insights & News</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto font-medium mb-8">
            Expert advice, industry trends, product reviews, and how-to guides from India's leading construction marketplace.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 font-medium focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse" />)}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, idx) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                  {blog.imageUrl ? (
                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-slate-300" />
                    </div>
                  )}
                  {idx === 0 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      Latest
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Calendar size={12} />
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="font-extrabold text-slate-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{blog.title}</h2>
                  <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">{blog.summary}</p>
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                    Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <BookOpen size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-slate-500">{searchTerm ? 'Try a different search term.' : 'Blog articles will appear here soon.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
