"use client";

import { useState, useEffect } from 'react';
import { MapPin, Plus, Star, MoreVertical, XCircle } from 'lucide-react';

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
        fetchWarehouses();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error adding warehouse');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouses & Logistics</h1>
          <p className="text-slate-500 mt-1">Manage pickup locations and fulfillment centers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading locations...</div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
          <MapPin size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No warehouses configured</h3>
          <p className="text-slate-500 mt-1 mb-6">Add your first pickup location to enable shipping calculation.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} /> Add Warehouse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouses.map(wh => (
            <div key={wh.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative group">
              <div className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 cursor-pointer">
                <MoreVertical size={20} />
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{wh.name}</h3>
                    {wh.isPrimary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                        <Star size={10} fill="currentColor" /> Primary
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 text-sm text-slate-600 space-y-1">
                    <p>{wh.address}</p>
                    <p>{wh.city}, {wh.state} - <span className="font-medium text-slate-900">{wh.pincode}</span></p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Contact: <span className="text-slate-900">{wh.contactNum}</span>
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900">Add New Warehouse</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Name</label>
                <input 
                  type="text" required placeholder="e.g., Main Warehouse - Mumbai"
                  value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input 
                  type="text" required
                  value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input 
                    type="text" required
                    value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input 
                    type="text" required
                    value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                  <input 
                    type="text" required
                    value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input 
                    type="text" required
                    value={form.contactNum} onChange={(e) => setForm({...form, contactNum: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isPrimary"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({...form, isPrimary: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPrimary" className="text-sm text-slate-700">Set as Primary Pickup Location</label>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button type="submit" className="w-full py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
