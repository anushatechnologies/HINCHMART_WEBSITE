'use client';
import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Percent, IndianRupee, Copy, Check } from 'lucide-react';

const API = 'http://localhost:5000';

const emptyForm = { code: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxUses: '', expiresAt: '', isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setCoupons(data.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, value: parseFloat(form.value), minOrderValue: form.minOrderValue || null, maxUses: form.maxUses || null, expiresAt: form.expiresAt || null })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Coupon created!', type: 'success' });
        setShowForm(false);
        setForm(emptyForm);
        fetchCoupons();
      } else {
        setMsg({ text: data.message, type: 'error' });
      }
    } catch (e) { setMsg({ text: 'Error.', type: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCoupons();
  };

  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'HINCH' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm({ ...form, code });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><Ticket className="text-blue-600" size={28} /> Coupon Manager</h1>
            <p className="text-slate-500 mt-1">Create and manage discount coupon codes for your customers.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={18} /> {showForm ? 'Cancel' : 'New Coupon'}
          </button>
        </div>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl font-bold text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="font-extrabold text-slate-900 text-xl mb-6">Create New Coupon</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input required type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase text-slate-900" placeholder="e.g. SAVE20" />
                    <button type="button" onClick={generateCode} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors whitespace-nowrap">Auto Generate</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Type *</label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form.type === 'PERCENTAGE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
                      <input type="radio" name="type" className="sr-only" checked={form.type === 'PERCENTAGE'} onChange={() => setForm({ ...form, type: 'PERCENTAGE' })} />
                      <Percent size={16} /> Percentage
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form.type === 'FIXED' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500'}`}>
                      <input type="radio" name="type" className="sr-only" checked={form.type === 'FIXED'} onChange={() => setForm({ ...form, type: 'FIXED' })} />
                      <IndianRupee size={16} /> Fixed
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Value * {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</label>
                  <input required type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min. Order Value (₹)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max. Uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Unlimited" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-extrabold text-slate-900">All Coupons ({coupons.length})</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
          ) : coupons.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {coupons.map(coupon => (
                <div key={coupon.id} className={`p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${!coupon.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${coupon.type === 'PERCENTAGE' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-600'}`}>
                      {coupon.type === 'PERCENTAGE' ? <Percent size={20} /> : <IndianRupee size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-black text-slate-900 tracking-widest uppercase text-lg">{coupon.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs font-medium text-slate-500">
                        <span className="font-bold text-orange-500">{coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}</span>
                        {coupon.minOrderValue && <span>Min: ₹{coupon.minOrderValue}</span>}
                        {coupon.expiresAt && <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => copyCode(coupon.id, coupon.code)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm transition-all ${copiedId === coupon.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                      {copiedId === coupon.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold">No coupons yet. Create your first coupon!</div>
          )}
        </div>
      </div>
    </div>
  );
}
