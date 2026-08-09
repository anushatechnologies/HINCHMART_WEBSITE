'use client';
import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Clock, ToggleLeft, ToggleRight, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', dealPrice: '', startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => { fetchDeals(); fetchProducts(); }, []);

  const fetchDeals = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/deals/admin`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setDeals(data.data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API}/api/products?limit=100`);
    const data = await res.json();
    if (data.success) setProducts(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/deals/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Deal created!', type: 'success' });
        setShowForm(false);
        setForm({ productId: '', dealPrice: '', startTime: '', endTime: '' });
        fetchDeals();
      } else {
        setMsg({ text: data.message, type: 'error' });
      }
    } catch (e) { setMsg({ text: 'Error.', type: 'error' }); }
    setSaving(false);
  };

  const toggleDeal = async (id: number, isActive: boolean) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/deals/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !isActive })
    });
    fetchDeals();
  };

  const deleteDeal = async (id: number) => {
    if (!confirm('Delete this deal?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/deals/admin/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchDeals();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><Zap className="text-orange-500" size={28} /> Deals & Offers Manager</h1>
            <p className="text-slate-500 mt-1">Create and manage time-limited flash deals and offers.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={18} /> {showForm ? 'Cancel' : 'Create Deal'}
          </button>
        </div>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl font-bold text-sm border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{msg.text}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="font-extrabold text-slate-900 text-xl mb-6">New Flash Deal</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Product *</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-sm font-medium" />
                </div>
                <select required value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 bg-white">
                  <option value="">-- Choose a product --</option>
                  {filteredProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{Number(p.basePrice).toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deal Price (₹) *</label>
                  <input required type="number" value={form.dealPrice} onChange={e => setForm({ ...form, dealPrice: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time *</label>
                  <input required type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time *</label>
                  <input required type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium" />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60">
                  {saving ? 'Creating...' : 'Launch Deal'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-extrabold text-slate-900">All Deals ({deals.length})</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
          ) : deals.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {deals.map(deal => {
                const isExpired = new Date(deal.endTime) < new Date();
                const discount = deal.product ? Math.round(((Number(deal.product.basePrice) - Number(deal.dealPrice)) / Number(deal.product.basePrice)) * 100) : 0;
                return (
                  <div key={deal.id} className={`p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${!deal.isActive || isExpired ? 'opacity-60' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{deal.product?.name}</h4>
                        <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">-{discount}%</span>
                        {isExpired && <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">Expired</span>}
                        {!deal.isActive && !isExpired && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <span className="text-lg font-black text-orange-500">₹{Number(deal.dealPrice).toLocaleString('en-IN')}</span>
                        <span className="line-through text-slate-400">₹{Number(deal.product?.basePrice).toLocaleString('en-IN')}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(deal.endTime).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleDeal(deal.id, deal.isActive)} className={`p-2 rounded-lg transition-colors ${deal.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                        {deal.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button onClick={() => deleteDeal(deal.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-bold">No deals yet. Create your first flash deal!</div>
          )}
        </div>
      </div>
    </div>
  );
}
