"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Star, MoreVertical, XCircle, Truck, PackageCheck, AlertCircle, Edit3, Trash2 } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactNum: '',
    isPrimary: false
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const info = localStorage.getItem('seller_info');
      if (!info) return;
      const vendorId = JSON.parse(info).id;

      const res = await fetch(`http://localhost:5000/api/vendors/warehouses?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const info = localStorage.getItem('seller_info');
      if (!info) return;
      const vendorId = JSON.parse(info).id;

      const res = await fetch(`http://localhost:5000/api/vendors/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vendorId })
      });
      
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setForm({ name: '', address: '', city: '', state: '', pincode: '', contactNum: '', isPrimary: false });
        fetchWarehouses();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error adding warehouse');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Warehouses & Logistics</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Truck size={16} className="text-blue-500" /> Manage pickup locations and fulfillment centers.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Location
        </button>
      </motion.div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
           <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
           <p className="text-slate-500 font-medium">Loading locations...</p>
        </div>
      ) : warehouses.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center flex flex-col items-center min-h-[400px] justify-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 relative z-10 border border-blue-100">
            <MapPin size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 relative z-10">No warehouses configured</h3>
          <p className="text-slate-500 mt-2 mb-8 max-w-md relative z-10">Add your first pickup location to enable shipping calculation and order fulfillment.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 relative z-10"
          >
            <Plus size={18} /> Add Your First Warehouse
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {warehouses.map(wh => (
              <motion.div 
                key={wh.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white rounded-2xl border ${wh.isPrimary ? 'border-amber-300 shadow-amber-500/10' : 'border-slate-200'} shadow-sm p-6 relative group hover:shadow-md transition-all overflow-hidden flex flex-col`}
              >
                {wh.isPrimary && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                )}
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${wh.isPrimary ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{wh.name}</h3>
                      {wh.isPrimary && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                          <Star size={10} fill="currentColor" /> Primary Pickup
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                    {/* Placeholder for dropdown */}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 relative z-10">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Address Details</p>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">{wh.address}</p>
                    <p className="text-sm text-slate-600 mt-1">{wh.city}, {wh.state}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Pincode:</span>
                      <span className="text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{wh.pincode}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 border border-slate-100 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <PackageCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Contact Info</p>
                      <p className="text-sm font-bold text-slate-900">{wh.contactNum}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 relative z-10">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
                    <Edit3 size={16} /> Edit
                  </button>
                  {!wh.isPrimary && (
                    <button className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Add New Warehouse</h3>
                    <p className="text-xs text-slate-500">Enter facility details below</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-5 overflow-y-auto bg-white">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location Name</label>
                  <input 
                    type="text" required placeholder="e.g., Main Warehouse - Mumbai"
                    value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Street Address</label>
                  <input 
                    type="text" required placeholder="Full building/street address"
                    value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City</label>
                    <input 
                      type="text" required placeholder="City name"
                      value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">State</label>
                    <input 
                      type="text" required placeholder="State name"
                      value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pincode</label>
                    <input 
                      type="text" required placeholder="6-digit pin"
                      value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Phone</label>
                    <input 
                      type="text" required placeholder="10-digit number"
                      value={form.contactNum} onChange={(e) => setForm({...form, contactNum: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={form.isPrimary}
                        onChange={(e) => setForm({...form, isPrimary: e.target.checked})}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                          <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Set as Primary Location</p>
                      <p className="text-xs text-slate-500 mt-0.5">Default origin for calculating shipping rates.</p>
                    </div>
                  </label>
                </div>
                
                {warehouses.length === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 mt-2">
                    <AlertCircle size={18} className="text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      This will be your first warehouse. It will automatically be set as your primary location.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                    Save Warehouse
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
