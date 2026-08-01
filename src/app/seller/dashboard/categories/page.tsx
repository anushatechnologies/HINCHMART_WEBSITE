"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, FolderPlus, Map, Sliders, Hash, Plus, CheckCircle,
  Clock, XCircle, Loader2, ArrowRight, UploadCloud, Tag
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const STATUS_BADGES: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const TABS = [
  { key: 'assigned', label: 'My Categories', icon: FolderOpen },
  { key: 'requests', label: 'Requests', icon: FolderPlus },
  { key: 'mapping', label: 'Category Mapping', icon: Map },
  { key: 'attributes', label: 'Attributes', icon: Sliders },
  { key: 'brands', label: 'Brands', icon: Hash },
];

export default function CategoriesHub() {
  const [tab, setTab] = useState('assigned');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Data
  const [categoryRequests, setCategoryRequests] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [globalCategories, setGlobalCategories] = useState<any[]>([]);

  // Forms
  const [requestCat, setRequestCat] = useState('');
  const [requestComment, setRequestComment] = useState('');
  const [brandName, setBrandName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);

    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(d => { if (d.data) setGlobalCategories(d.data); });
  }, []);

  const fetchData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const [reqRes, attrRes, brandRes] = await Promise.all([
        fetch(`${API}/vendors/${vendorId}/categories/requests`).then(r => r.json()),
        fetch(`${API}/vendors/${vendorId}/categories/attributes`).then(r => r.json()),
        fetch(`${API}/vendors/${vendorId}/brands`).then(r => r.json())
      ]);
      if (reqRes.success) setCategoryRequests(reqRes.data);
      if (attrRes.success) setAttributes(attrRes.data);
      if (brandRes.success) setBrands(brandRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequestCategory = async () => {
    if (!vendorId || !requestCat) return;
    setSubmitting(true);
    const res = await fetch(`${API}/vendors/${vendorId}/categories/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: requestCat, comments: requestComment })
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      setRequestCat(''); setRequestComment('');
      fetchData();
    } else {
      alert(data.message);
    }
  };

  const handleRequestBrand = async () => {
    if (!vendorId || !brandName) return;
    setSubmitting(true);
    const res = await fetch(`${API}/vendors/${vendorId}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: brandName })
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      setBrandName('');
      fetchData();
    } else {
      alert(data.message);
    }
  };

  const assigned = categoryRequests.filter(r => r.status === 'APPROVED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories & Brands</h1>
          <p className="text-slate-500 mt-1">Manage approved categories, request new ones, and map attributes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-red-600 text-red-700 bg-red-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Assigned Categories */}
              {tab === 'assigned' && (
                <div className="space-y-4 max-w-3xl">
                  <h2 className="text-lg font-bold text-slate-900">My Approved Categories</h2>
                  <p className="text-sm text-slate-500 mb-6">You are authorized to list products in the following categories.</p>
                  {assigned.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <FolderOpen size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No categories assigned</p>
                      <button onClick={() => setTab('requests')} className="mt-3 text-red-600 text-sm font-semibold hover:underline">Request a category</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {assigned.map(r => (
                        <div key={r.id} className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{r.category.name}</p>
                            <p className="text-xs text-slate-500">Approved on {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Requests */}
              {tab === 'requests' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Category Requests History</h2>
                    {categoryRequests.length === 0 ? (
                      <p className="text-sm text-slate-500">No requests made yet.</p>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                              <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {categoryRequests.map(r => (
                              <tr key={r.id}>
                                <td className="px-4 py-3 font-medium text-slate-900">{r.category.name}</td>
                                <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGES[r.status]}`}>{r.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Request New Category</h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Category</label>
                      <select value={requestCat} onChange={e => setRequestCat(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select...</option>
                        {globalCategories.map(c => (
                          <option key={c.id} value={c.id} disabled={categoryRequests.some(r => r.categoryId === c.id)}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Justification</label>
                      <textarea value={requestComment} onChange={e => setRequestComment(e.target.value)}
                        placeholder="Why do you want to sell in this category?" rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <button onClick={handleRequestCategory} disabled={!requestCat || submitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Request Approval
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Category Mapping */}
              {tab === 'mapping' && (
                <div className="max-w-3xl space-y-5">
                  <h2 className="text-lg font-bold text-slate-900">Global Category Mapping</h2>
                  <p className="text-sm text-slate-500 mb-4">
                    Map your internal categories (from your ERP/CSV) to Hinchmart's global categories to ensure smooth bulk uploads.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                    <UploadCloud size={20} className="shrink-0" />
                    <p>During CSV bulk import, if your <b>"Category Name"</b> exactly matches one of our global categories below, we will map it automatically.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {globalCategories.map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Tag size={14} className="text-slate-400" /> {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Attributes */}
              {tab === 'attributes' && (
                <div className="max-w-4xl space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Product Attributes Guide</h2>
                    <p className="text-sm text-slate-500">Based on your approved categories, these are the recommended attributes you should include in your Technical Specs (JSON) during product creation.</p>
                  </div>
                  {attributes.length === 0 ? (
                    <p className="text-sm text-slate-400">No specific attributes required for your approved categories.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attributes.map(a => (
                        <div key={a.id} className="p-4 border border-slate-200 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900">{a.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{a.type}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">Category: {a.category?.name}</p>
                          {a.values?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {a.values.map((v: any) => (
                                <span key={v.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{v.value}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Brands */}
              {tab === 'brands' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">My Brand Portfolio</h2>
                    {brands.length === 0 ? (
                      <p className="text-sm text-slate-500">No brands added yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {brands.map(b => (
                          <div key={b.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <p className="font-bold text-slate-900">{b.name}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[b.status]}`}>{b.status}</span>
                            </div>
                            {b.logoUrl && <img src={b.logoUrl} alt={b.name} className="h-8 object-contain" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Add New Brand</h3>
                    <p className="text-xs text-slate-500">If you are the manufacturer or an authorized distributor, register the brand here.</p>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand Name</label>
                      <input value={brandName} onChange={e => setBrandName(e.target.value)}
                        placeholder="e.g. Bosch"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <button onClick={handleRequestBrand} disabled={!brandName || submitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Submit Brand
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
