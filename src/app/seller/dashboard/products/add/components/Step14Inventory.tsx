"use client";
import { useEffect, useState } from 'react';
import { useWizard } from '../WizardContext';
import { MapPin } from 'lucide-react';

export default function Step14Inventory() {
  const { formData, updateFormData } = useWizard();
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      const vendorId = JSON.parse(info).id;
      fetch(`http://localhost:5000/api/vendors/warehouses?vendorId=${vendorId}`)
        .then(r => r.json())
        .then(d => { if (d.success) setWarehouses(d.data); });
    }
  }, []);

  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Inventory & Warehousing</h2>
      <p className="text-slate-500 text-sm">Manage stock levels across your registered warehouses.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Warehouse <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-4">
            {warehouses.map(wh => (
              <label 
                key={wh.id}
                className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${
                  formData.warehouseId === wh.id ? 'border-red-600 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="warehouse" 
                  checked={formData.warehouseId === wh.id}
                  onChange={() => set('warehouseId', wh.id)}
                  className="mt-1 text-red-600 focus:ring-red-500"
                />
                <div>
                  <h3 className="font-bold text-slate-900">{wh.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {wh.city}, {wh.state}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Available Quantity <span className="text-red-500">*</span></label>
            <input 
              type="number"
              value={formData.availableQty || ''}
              onChange={e => set('availableQty', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Safety Stock</label>
            <input 
              type="number"
              value={formData.safetyStock || ''}
              onChange={e => set('safetyStock', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Low Stock Alert Threshold</label>
            <input 
              type="number"
              value={formData.lowStockAlert || ''}
              onChange={e => set('lowStockAlert', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maximum Order Quantity</label>
            <input 
              type="number"
              value={formData.maxOrderQty || ''}
              onChange={e => set('maxOrderQty', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
