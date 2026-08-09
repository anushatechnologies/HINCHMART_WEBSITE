'use client';
import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const emptyForm = { question: '', answer: '', category: 'GENERAL', order: '0', isActive: true };

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchFaqs(); }, []);

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/faq/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFaqs(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API}/api/faq/admin/${editingId}` : `${API}/api/faq/admin`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchFaqs();
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/faq/admin/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchFaqs();
  };

  const handleEdit = (faq: any) => {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order.toString(), isActive: faq.isActive });
    setEditingId(faq.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><HelpCircle className="text-blue-600" size={28} /> FAQ Manager</h1>
            <p className="text-slate-500 mt-1">Manage frequently asked questions and knowledge base articles.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add FAQ'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="font-extrabold text-slate-900 text-xl mb-6">{editingId ? 'Edit FAQ' : 'Create New FAQ'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Question *</label>
                <input required type="text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answer *</label>
                <textarea required value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-y" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                  <input required type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold uppercase text-slate-900" placeholder="e.g. RETURNS" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <label htmlFor="isActive" className="font-bold text-slate-700">Active (visible to customers)</label>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Saving...' : (editingId ? 'Update FAQ' : 'Save FAQ')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-extrabold text-slate-900">All FAQs ({faqs.length})</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
          ) : faqs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {faqs.map(faq => (
                <div key={faq.id} className={`p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${!faq.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">{faq.category}</span>
                      <span className="text-xs font-bold text-slate-400">Order: {faq.order}</span>
                      {!faq.isActive && <span className="bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{faq.question}</h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleEdit(faq)} className="text-slate-400 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(faq.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold">No FAQs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
