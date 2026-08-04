'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, Briefcase, Building, Check, X, Navigation, Edit3 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

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
      if (data.success && data.data) {
        // Sort defaults first
        const sorted = data.data.sort((a: any, b: any) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        setAddresses(sorted);
      }
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
        setMsg({ text: 'Address saved successfully!', type: 'success' });
        setTimeout(() => {
          setIsAdding(false);
          setFormData({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
          fetchAddresses();
        }, 1000);
      } else {
        setMsg({ text: data.message || 'Failed to save address.', type: 'error' });
      }
    } catch (error) {
      setMsg({ text: 'An unexpected error occurred.', type: 'error' });
    }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this address?')) return;
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Saved Addresses</h1>
          <p className="text-slate-500 font-medium">Manage your delivery locations for faster checkout.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 self-start sm:self-auto"
          >
            <Plus size={18} /> Add New Address
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            key="add-form"
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }} 
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-8 relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight flex items-center gap-3">
                <Navigation className="text-blue-500" size={24} /> New Address Details
              </h3>
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <AnimatePresence>
              {msg.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {msg.type === 'success' ? <Check size={18} /> : <X size={18} />}
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Type Selection */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Save As</label>
                  <div className="flex flex-wrap gap-4">
                    {['HOME', 'WORK', 'OTHER'].map(lbl => (
                      <label key={lbl} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 cursor-pointer font-bold transition-all ${formData.label === lbl ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="label" className="sr-only" checked={formData.label === lbl} onChange={() => setFormData({...formData, label: lbl})} />
                        {getLabelIcon(lbl)} {lbl}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Street Address</label>
                  <input required type="text" value={formData.line1} onChange={e => setFormData({...formData, line1: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition-all outline-none" placeholder="House/Flat No., Building Name, Street" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Locality / Landmark <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                  <input type="text" value={formData.line2} onChange={e => setFormData({...formData, line2: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition-all outline-none" placeholder="Near XYZ Landmark, Area, Sector" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City / District</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition-all outline-none" placeholder="E.g. Mumbai" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State / Province</label>
                  <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition-all outline-none" placeholder="E.g. Maharashtra" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Postal / Zip Code</label>
                  <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full md:w-1/2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900 transition-all outline-none tracking-widest" placeholder="123456" maxLength={10} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 pb-2">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-slate-50" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isDefault" className="font-bold text-slate-800 cursor-pointer">Set as default delivery address</label>
                    <p className="text-slate-500 font-medium text-xs mt-0.5">We will automatically select this address during checkout.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button type="submit" disabled={submitLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={18} />}
                  {submitLoading ? 'Saving securely...' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading addresses...</p>
          </div>
        ) : addresses.length > 0 ? (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={addr.id} 
                  className={`bg-white rounded-3xl border p-6 sm:p-8 relative group transition-all duration-300 hover:shadow-lg ${addr.isDefault ? 'border-blue-300 shadow-md shadow-blue-500/5' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
                >
                  {addr.isDefault && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl shadow-sm">
                      Default
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 ${addr.isDefault ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100'}`}>
                      {getLabelIcon(addr.label || 'HOME')}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-xl tracking-tight">{addr.label || 'Home'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Delivery Location</p>
                    </div>
                  </div>
                  
                  <div className="text-slate-700 space-y-1.5 mb-8 text-sm font-medium min-h-[90px]">
                    <p className="font-bold text-slate-900 text-base mb-2">{addr.name || addr.contactName || 'Saved Address'}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} <span className="font-bold text-slate-900 ml-1">{addr.pincode}</span></p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <button className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(addr.id)} 
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-sm transition-colors px-4 py-2 rounded-xl"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : !isAdding ? (
          <motion.div variants={itemVariants} className="p-16 text-center flex flex-col items-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <MapPin size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Saved Addresses</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">You haven't saved any delivery locations yet. Add an address to speed up your checkout process.</p>
            <button 
              onClick={() => setIsAdding(true)} 
              className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Plus size={20} /> Add Your First Address
            </button>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
