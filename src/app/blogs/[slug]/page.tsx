'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, ArrowLeft, Share2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/blogs/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setBlog(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-500 font-bold text-lg">Loading article...</div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-slate-900">Article not found</h2>
      <Link href="/blogs" className="text-blue-600 font-bold hover:underline flex items-center gap-1"><ArrowLeft size={16} /> Back to Blog</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      {blog.imageUrl && (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              <BookOpen size={14} className="text-blue-500" />
              <span>HinchMart Blog</span>
              <span className="text-slate-200">·</span>
              <Calendar size={12} />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">{blog.title}</h1>

            {blog.summary && (
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 pb-8 border-b border-slate-100">
                {blog.summary}
              </p>
            )}

            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>

          <div className="px-8 sm:px-12 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 mb-1">Was this article helpful?</p>
              <p className="text-sm text-slate-500">Share it with your team and colleagues.</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm">
              <Share2 size={16} /> Share Article
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
