"use client";

import { useState, useEffect } from 'react';
import AccountSidebar from '../AccountSidebar';
import { ArrowLeft, Plus, MapPin, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

export default function AddressesPage() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    Promise.all([
      fetch('http://localhost:5000/api/account/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/addresses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([userRes, addrRes]) => {
      if (userRes.success) setUser(userRes.data);
      if (addrRes.success) setAddresses(addrRes.data || []);
    });
  }, []);

  const addAddress = async () => {
    setSaving(true);
    const res = await fetch('http://localhost:5000/api/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(r => r.json());
    setSaving(false);
    if (res.success) { setAddresses(p => [...p, res.data]); setShowForm(false); setForm({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '' }); }
  };

  const deleteAddress = async (id: number) => {
    await fetch(`http://localhost:5000/api/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setAddresses(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/account" className="text-slate-500 hover:text-red-600"><ArrowLeft size={18}/></Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Saved Addresses</h1>
            <p className="text-sm text-slate-500">{addresses.length} addresses saved</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <AccountSidebar user={user} />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-slate-900">Delivery Addresses</h2>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus size={16}/> Add New Address
            </button>
          </div>

          {/* Add Form */}
          {showForm && (
            <div className="bg-white rounded-xl border-2 border-red-300 p-6 mb-4 shadow-sm">
              <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2"><MapPin size={18} className="text-red-600"/> New Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Label</label>
                  <select value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500">
                    <option>HOME</option><option>WORK</option><option>SITE</option><option>OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Address Line 1*</label>
                  <input value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))} placeholder="Flat, House No., Street"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Address Line 2</label>
                  <input value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))} placeholder="Area, Colony (optional)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City*</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State*</label>
                  <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode*</label>
                  <input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} placeholder="400001"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500"/>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={addAddress} disabled={saving || !form.line1 || !form.city || !form.pincode}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          )}

          {/* Address Cards */}
          {addresses.length === 0 && !showForm ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <MapPin size={48} className="text-slate-200 mx-auto mb-4"/>
              <p className="text-slate-500 font-medium">No saved addresses</p>
              <button onClick={() => setShowForm(true)} className="mt-4 bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 text-sm">
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr: any) => (
                <div key={addr.id} className={`bg-white rounded-xl border-2 p-5 relative ${addr.isDefault ? 'border-red-300' : 'border-slate-200'}`}>
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      <Star size={10} className="fill-red-500 text-red-500"/> DEFAULT
                    </span>
                  )}
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mb-3 inline-block ${
                    addr.label === 'HOME' ? 'bg-blue-100 text-blue-700' : addr.label === 'WORK' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                  }`}>{addr.label}</span>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed mt-2">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                  </p>
                  <p className="text-sm text-slate-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                    {!addr.isDefault && <button className="text-xs font-bold text-slate-600 hover:underline">Set as Default</button>}
                    <button onClick={() => deleteAddress(addr.id)} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 ml-auto">
                      <Trash2 size={11}/> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
