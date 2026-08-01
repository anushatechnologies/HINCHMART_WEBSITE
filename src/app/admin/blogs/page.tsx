'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000';

const emptyForm = { title: '', slug: '', summary: '', content: '', imageUrl: '', published: true };

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/blogs/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBlogs(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 80);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API}/api/blogs/admin/${editingId}` : `${API}/api/blogs/admin`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: editingId ? 'Blog updated!' : 'Blog created!', type: 'success' });
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchBlogs();
      } else {
        setMsg({ text: data.message, type: 'error' });
      }
    } catch (e) { setMsg({ text: 'Error saving blog.', type: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/blogs/admin/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchBlogs();
  };

  const handleEdit = (blog: any) => {
    setForm({ title: blog.title, slug: blog.slug, summary: blog.summary, content: blog.content, imageUrl: blog.imageUrl || '', published: blog.published });
    setEditingId(blog.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><BookOpen className="text-blue-600" size={28} /> Blog Manager</h1>
            <p className="text-slate-500 mt-1">Create and manage blog articles and news posts.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={18} /> {showForm ? 'Cancel' : 'New Blog'}
          </button>
        </div>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl font-bold text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="font-extrabold text-slate-900 text-xl mb-6">{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title *</label>
                  <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: handleSlug(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slug *</label>
                  <input required type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
                <input type="text" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</label>
                <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content *</label>
                <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={12} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 resize-y" placeholder="Write your blog content here..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <label htmlFor="published" className="font-bold text-slate-700">Publish immediately</label>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Saving...' : (editingId ? 'Update Blog' : 'Publish Blog')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">All Blog Posts ({blogs.length})</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
          ) : blogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {blogs.map(blog => (
                <div key={blog.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900">{blog.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${blog.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{blog.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/blogs/${blog.slug}`} target="_blank" className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"><Eye size={18} /></Link>
                    <button onClick={() => handleEdit(blog)} className="text-slate-400 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(blog.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold">No blog posts yet. Create your first one!</div>
          )}
        </div>
      </div>
    </div>
  );
}
