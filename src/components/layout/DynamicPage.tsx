'use client';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function DynamicPage({ slug, title }: { slug: string, title: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetch(`${API}/api/content/pages/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setContent(d.data.content);
          setLastUpdated(new Date(d.data.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-10 sm:p-16 text-center text-white">
            <FileText size={48} className="mx-auto mb-6 text-blue-200 opacity-80" />
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">{title}</h1>
            <p className="text-blue-100 font-medium tracking-wide">
              {loading ? 'Loading content...' : `Last Updated: ${lastUpdated}`}
            </p>
          </div>
          
          <div className="p-8 sm:p-16 bg-white">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 pt-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            ) : (
              <div 
                className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-li:marker:text-blue-500"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
