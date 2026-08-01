"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, ChevronRight, Loader2, CheckCircle
} from 'lucide-react';

const STEPS = ['Basic Info', 'Pricing & Stock', 'Details'];

export default function AddProduct() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '', brand: '', categoryId: '', description: '',
    basePrice: '', mrp: '', gstPercent: '18', moq: '1',
    stockQty: '0', stockStatus: 'IN_STOCK',
    barcode: '', modelNumber: '', hsnCode: '', countryOfOrigin: '', warranty: '',
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
    fetch('http://localhost:5000/api/categories')
      .then(r => r.json())
      .then(d => { if (d.data) setCategories(d.data); });
  }, []);

  const set = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.categoryId;
    if (step === 1) return form.basePrice && form.mrp && Number(form.basePrice) <= Number(form.mrp);
    return true;
  };

  const handleSubmit = async () => {
    if (!vendorId) return;
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/vendors/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vendorId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push(`/seller/dashboard/products/${data.data.id}/edit`), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle size={36} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Created!</h2>
        <p className="text-slate-500 text-sm">Redirecting to editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the details to list your product</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === step ? 'bg-red-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        {step === 0 && (
          <>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Package size={18} className="text-red-500" /> Basic Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Bosch Angle Grinder 7 inch"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                  <input value={form.brand} onChange={e => set('brand', e.target.value)}
                    placeholder="e.g. Bosch"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="Describe your product..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-base font-bold text-slate-900">Pricing & Stock</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Selling Price (₹)', field: 'basePrice', required: true },
                { label: 'MRP (₹)', field: 'mrp', required: true },
                { label: 'GST %', field: 'gstPercent', required: false },
                { label: 'Min Order Qty', field: 'moq', required: false },
                { label: 'Initial Stock Qty', field: 'stockQty', required: false },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                  <input type="number" value={(form as any)[f.field]} onChange={e => set(f.field, e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Status</label>
                <select value={form.stockStatus} onChange={e => set('stockStatus', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
            {form.basePrice && form.mrp && Number(form.basePrice) > Number(form.mrp) && (
              <p className="text-xs text-red-600 font-medium">⚠ Selling price cannot be higher than MRP</p>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-base font-bold text-slate-900">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Barcode / EAN', field: 'barcode' },
                { label: 'Model Number', field: 'modelNumber' },
                { label: 'HSN Code', field: 'hsnCode' },
                { label: 'Country of Origin', field: 'countryOfOrigin' },
                { label: 'Warranty', field: 'warranty' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input value={(form as any)[f.field]} onChange={e => set(f.field, e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
          className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        )}
      </div>
    </div>
  );
}
