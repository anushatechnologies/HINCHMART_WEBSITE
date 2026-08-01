'use client';
import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';
const PAGES = [
  { slug: 'about', label: 'About Us' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-of-service', label: 'Terms of Service' },
  { slug: 'shipping-policy', label: 'Shipping & Delivery Policy' }
];

export default function AdminContentPage() {
  const [activeSlug, setActiveSlug] = useState('about');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchPageContent(activeSlug);
  }, [activeSlug]);

  const fetchPageContent = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/content/pages/${slug}`);
      const data = await res.json();
      if (data.success) {
        setTitle(data.data.title);
        setContent(data.data.content);
        setIsActive(data.data.isActive);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', msg: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/content/pages/${activeSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, isActive })
      });
      if (res.ok) {
        setStatus({ type: 'success', msg: 'Page saved successfully!' });
        setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
      } else {
        setStatus({ type: 'error', msg: 'Failed to save page.' });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'An error occurred.' });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><FileText className="text-blue-600" size={28} /> Content Manager</h1>
            <p className="text-slate-500 mt-1">Edit legal and corporate website pages.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Pages</h3>
              </div>
              <div className="flex flex-col p-2">
                {PAGES.map(page => (
                  <button
                    key={page.slug}
                    onClick={() => setActiveSlug(page.slug)}
                    className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSlug === page.slug ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {loading ? (
              <div className="text-center p-12 text-slate-400 font-bold animate-pulse">Loading content...</div>
            ) : (
              <div className="space-y-6">
                
                {status.msg && (
                  <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {status.type === 'success' && <CheckCircle size={18} />}
                    {status.msg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Page Title</label>
                  <input 
                    type="text" value={title} onChange={e => setTitle(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-extrabold text-slate-900 text-lg" 
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Content</label>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Supports HTML tags</span>
                  </div>
                  <textarea 
                    value={content} onChange={e => setContent(e.target.value)} 
                    rows={15} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-800 resize-y" 
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">Page is Active (Visible to public)</label>
                  </div>
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
