'use client';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Building } from 'lucide-react';

const API = 'http://localhost:5000';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAddresses(data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Address added successfully!', type: 'success' });
        setIsAdding(false);
        setFormData({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
        fetchAddresses();
      } else {
        setMsg({ text: data.message || 'Failed to add address.', type: 'error' });
      }
    } catch (error) {
      setMsg({ text: 'An error occurred.', type: 'error' });
    }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLabelIcon = (label: string) => {
    if (label === 'WORK' || label === 'OFFICE') return <Briefcase size={20} />;
    if (label === 'OTHER') return <Building size={20} />;
    return <Home size={20} />;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-slate-500 mt-1">Manage your shipping and billing locations.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm self-start sm:self-auto">
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 relative">
          <h3 className="font-extrabold text-slate-900 text-xl mb-6">Add New Address</h3>
          {msg.text && (
            <div className={`mb-6 p-4 rounded-xl font-bold text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Label</label>
                <div className="flex gap-4">
                  {['HOME', 'WORK', 'OTHER'].map(lbl => (
                    <label key={lbl} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${formData.label === lbl ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <input type="radio" name="label" className="sr-only" checked={formData.label === lbl} onChange={() => setFormData({...formData, label: lbl})} />
                      {getLabelIcon(lbl)} {lbl}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Line 1</label>
                <input required type="text" value={formData.line1} onChange={e => setFormData({...formData, line1: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" placeholder="Street address, P.O. box, company name" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Line 2 <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                <input type="text" value={formData.line2} onChange={e => setFormData({...formData, line2: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" placeholder="Apartment, suite, unit, building, floor, etc." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode / ZIP</label>
                <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="isDefault" className="font-bold text-slate-700">Set as default shipping address</label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button type="submit" disabled={submitLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm disabled:opacity-60">
                {submitLoading ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading addresses...</div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl border p-6 relative group transition-all shadow-sm ${addr.isDefault ? 'border-blue-600 shadow-blue-600/10' : 'border-slate-200 hover:border-slate-300'}`}>
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  Default
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {getLabelIcon(addr.label || 'HOME')}
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">{addr.label || 'Home'}</h3>
              </div>
              
              <div className="text-slate-600 space-y-1 mb-6 text-sm font-medium h-24">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button className="text-blue-600 font-bold text-sm hover:underline">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors flex items-center gap-1">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !isAdding ? (
        <div className="p-16 text-center flex flex-col items-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <MapPin size={64} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Addresses Found</h3>
          <p className="text-slate-500 mb-6">You haven't saved any addresses yet.</p>
          <button onClick={() => setIsAdding(true)} className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors uppercase tracking-widest text-sm shadow-sm flex items-center gap-2">
            <Plus size={18} /> Add Address
          </button>
        </div>
      ) : null}
    </div>
  );
}
