"use client";

import { useEffect, useState } from 'react';
import { useWizard } from '../WizardContext';
import { Tag, PlusCircle, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Step3BasicInfo() {
  const { formData, updateFormData } = useWizard();
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
    fetch(`${API}/api/brands`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBrands(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch DB brands from API:', err))
      .finally(() => setLoadingBrands(false));
  }, []);

  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
        <p className="text-slate-500 text-sm mt-0.5">Provide essential product details fetched directly from database API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Product Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name / Title <span className="text-red-500">*</span></label>
          <input
            value={formData.name || ''}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. UltraTech Super OPC 53 Grade Cement Bag (50kg)"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        {/* Brand Dropdown (PostgreSQL API Powered) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-700">Brand Name <span className="text-red-500">*</span></label>
            <Link href="/seller/dashboard/brands" target="_blank" className="text-[11px] font-bold text-[#FF5722] hover:underline flex items-center gap-0.5">
              + Register Brand <ExternalLink size={10} />
            </Link>
          </div>
          <select
            value={formData.brand || ''}
            onChange={e => set('brand', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5722] bg-white"
          >
            <option value="">Select an Approved Brand from DB ({brands.length})</option>
            <option value="Generic">Generic / Unbranded</option>
            {brands.map(b => (
              <option key={b.id || b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
          {loadingBrands && <p className="text-[10px] text-slate-400 font-bold mt-1">Loading brands from database...</p>}
        </div>

        {/* Seller SKU */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Seller SKU ID</label>
          <input
            value={formData.sku || ''}
            onChange={e => set('sku', e.target.value)}
            placeholder="e.g. ULT-OPC53-50KG"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        {/* HSN Code */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">HSN Code</label>
          <input
            value={formData.hsnCode || ''}
            onChange={e => set('hsnCode', e.target.value)}
            placeholder="e.g. 25232910"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        {/* GST Percentage */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">GST Tax Slab %</label>
          <select
            value={formData.gstPercent || '18'}
            onChange={e => set('gstPercent', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5722] bg-white"
          >
            <option value="0">0% (Exempted)</option>
            <option value="5">5% (Raw Materials)</option>
            <option value="12">12% (Standard B2B)</option>
            <option value="18">18% (Industrial & Tools)</option>
            <option value="28">28% (Luxury & Heavy)</option>
          </select>
        </div>

        {/* Country of Origin */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country of Origin</label>
          <input
            value={formData.countryOfOrigin || 'India'}
            onChange={e => set('countryOfOrigin', e.target.value)}
            placeholder="e.g. India"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manufacturer / Parent Company</label>
          <input
            value={formData.manufacturer || ''}
            onChange={e => set('manufacturer', e.target.value)}
            placeholder="e.g. Aditya Birla Group"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
          />
        </div>

        {/* Short Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Description</label>
          <textarea
            value={formData.shortDescription || ''}
            onChange={e => set('shortDescription', e.target.value)}
            rows={2}
            placeholder="Brief overview (150-300 characters)"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
          />
        </div>

        {/* Long Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Description & Key Specs</label>
          <textarea
            value={formData.description || ''}
            onChange={e => set('description', e.target.value)}
            rows={5}
            placeholder="Detailed product specifications, application guidelines, package contents..."
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
          />
        </div>

      </div>
    </div>
  );
}
