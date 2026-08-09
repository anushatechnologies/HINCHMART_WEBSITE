"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit3, Image as ImageIcon, Video, FileText,
  Settings, Layers, DollarSign, Search, Save, Loader2, Plus,
  Trash2, Star, ExternalLink, CheckCircle
} from 'lucide-react';

const TABS = [
  { key: 'edit',   label: 'General',     icon: Edit3 },
  { key: 'images', label: 'Images',      icon: ImageIcon },
  { key: 'videos', label: 'Videos',      icon: Video },
  { key: 'docs',   label: 'Documents',   icon: FileText },
  { key: 'specs',  label: 'Specs',       icon: Settings },
  { key: 'variants',label: 'Variants',   icon: Layers },
  { key: 'pricing', label: 'Pricing',    icon: DollarSign },
  { key: 'seo',    label: 'SEO',         icon: Search },
];

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/vendors`;

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState('edit');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Tab-specific data
  const [images, setImages] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [docs, setDocs]     = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);


  // Use centralised authFetch which auto-refreshes tokens on 401 TOKEN_EXPIRED
  const apiFetch = async (url: string, options: any = {}) => {
    const { authFetch } = await import('@/lib/auth');
    return authFetch(url, options);
  };


  const fetchProduct = useCallback(async () => {
    const res = await apiFetch(`${API}/products/${id}`);
    const data = await res.json();
    if (data.success) {
      setProduct(data.data);
      setImages(data.data.images || []);
      setVideos(data.data.videos || []);
      setDocs(data.data.documents || []);
      setVariants(data.data.variants || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const submitProduct = async () => {
    if (!confirm('Are you sure you want to submit this product for review?')) return;
    setSaving(true);
    await apiFetch(`${API}/products/${id}/submit`, { method: 'POST' });
    await fetchProduct();
    setSaving(false);
  };

  const saveGeneral = async () => {
    setSaving(true);
    await apiFetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name, description: product.description,
        brand: product.brand, barcode: product.barcode,
        modelNumber: product.modelNumber, hsnCode: product.hsnCode,
        countryOfOrigin: product.countryOfOrigin, warranty: product.warranty,
        stockStatus: product.stockStatus,
      })
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePricing = async () => {
    setSaving(true);
    await apiFetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basePrice: product.basePrice, mrp: product.mrp, gstPercent: product.gstPercent, moq: product.moq })
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSpecs = async () => {
    setSaving(true);
    try {
      const specs = typeof product.technicalSpecs === 'string' 
        ? JSON.parse(product.technicalSpecs) 
        : product.technicalSpecs;
      await apiFetch(`${API}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicalSpecs: specs, features: product.features })
      });
    } catch (e) { console.error('Invalid JSON'); }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveSEO = async () => {
    setSaving(true);
    await apiFetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metaTitle: product.metaTitle, metaDescription: product.metaDescription, metaKeywords: product.metaKeywords })
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addImage = async (url: string, isPrimary: boolean) => {
    const res = await apiFetch(`${API}/products/${id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, isPrimary })
    });
    const data = await res.json();
    if (data.success) setImages(prev => isPrimary ? prev.map(i => ({ ...i, isPrimary: false })).concat(data.data) : [...prev, data.data]);
  };

  const removeImage = async (imageId: number) => {
    await apiFetch(`${API}/products/${id}/images/${imageId}`, { method: 'DELETE' });
    setImages(prev => prev.filter(i => i.id !== imageId));
  };

  const setPrimary = async (imageId: number) => {
    await apiFetch(`${API}/products/${id}/images/${imageId}/primary`, { method: 'PATCH' });
    setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === imageId })));
  };

  const addVideo = async (url: string, title: string, type: string) => {
    const res = await apiFetch(`${API}/products/${id}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title, type })
    });
    const data = await res.json();
    if (data.success) setVideos(prev => [...prev, data.data]);
  };

  const addDoc = async (url: string, title: string, type: string) => {
    const res = await apiFetch(`${API}/products/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title, type })
    });
    const data = await res.json();
    if (data.success) setDocs(prev => [...prev, data.data]);
  };

  const addVariant = async (sku: string, price: string, stock: string) => {
    const res = await apiFetch(`${API}/products/${id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, price: parseFloat(price), stockQty: parseInt(stock) })
    });
    const data = await res.json();
    if (data.success) setVariants(prev => [...prev, data.data]);
  };

  const removeVariant = async (variantId: number) => {
    const res = await apiFetch(`${API}/products/${id}/variants/${variantId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setVariants(prev => prev.filter(v => v.id !== variantId));
    else alert(data.message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-red-500" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-24 text-slate-500">Product not found.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/seller/dashboard/products')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {product.name}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {product.approvalStatus}
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">ID: {id} · {product.category?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {['DRAFT', 'CHANGES_REQUIRED', 'REJECTED'].includes(product.approvalStatus) && (
            <button 
              onClick={submitProduct}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Submit for Approval
            </button>
          )}
          <a href={`/products/${product.slug}`} target="_blank"
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            <ExternalLink size={14} /> Preview
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-red-600 text-red-700 bg-red-50/20' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* ─── General Tab ──── */}
          {tab === 'edit' && (
            <div className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-style">Product Name</label>
                  <input value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })}
                    className="input-style w-full" />
                </div>
                <div>
                  <label className="label-style">Brand</label>
                  <input value={product.brand || ''} onChange={e => setProduct({ ...product, brand: e.target.value })}
                    className="input-style w-full" />
                </div>
                <div>
                  <label className="label-style">Stock Status</label>
                  <select value={product.stockStatus} onChange={e => setProduct({ ...product, stockStatus: e.target.value })}
                    className="input-style w-full bg-white">
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
                {[
                  { label: 'Barcode / EAN', field: 'barcode' },
                  { label: 'Model Number', field: 'modelNumber' },
                  { label: 'HSN Code', field: 'hsnCode' },
                  { label: 'Country of Origin', field: 'countryOfOrigin' },
                  { label: 'Warranty', field: 'warranty' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="label-style">{f.label}</label>
                    <input value={product[f.field] || ''} onChange={e => setProduct({ ...product, [f.field]: e.target.value })}
                      className="input-style w-full" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="label-style">Description</label>
                  <textarea value={product.description || ''} onChange={e => setProduct({ ...product, description: e.target.value })}
                    rows={5} className="input-style w-full resize-none" />
                </div>
              </div>
              <SaveButton saving={saving} saved={saved} onClick={saveGeneral} />
            </div>
          )}

          {/* ─── Images Tab ──── */}
          {tab === 'images' && (
            <div className="space-y-5">
              <ImageUploader onAdd={addImage} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.length === 0 && <p className="col-span-4 text-slate-400 text-sm text-center py-8">No images uploaded yet.</p>}
                {images.map(img => (
                  <div key={img.id} className={`relative rounded-xl overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-red-500 shadow-md' : 'border-slate-200'}`}>
                    <img src={img.url} alt="Product" className="w-full aspect-square object-cover" />
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={9} /> Primary
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {!img.isPrimary && (
                        <button onClick={() => setPrimary(img.id)} title="Set as primary"
                          className="p-1.5 bg-white rounded-lg shadow text-amber-600 hover:bg-amber-50 transition-colors">
                          <Star size={12} />
                        </button>
                      )}
                      <button onClick={() => removeImage(img.id)} title="Delete"
                        className="p-1.5 bg-white rounded-lg shadow text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Videos Tab ──── */}
          {tab === 'videos' && (
            <div className="space-y-5">
              <VideoForm onAdd={addVideo} />
              <div className="space-y-3">
                {videos.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No videos added yet.</p>}
                {videos.map(v => (
                  <div key={v.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <Video size={18} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{v.title || 'Untitled Video'}</p>
                      <a href={v.url} target="_blank" className="text-xs text-blue-600 hover:underline truncate block">{v.url}</a>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{v.type}</span>
                    <button onClick={async () => {
                      await fetch(`${API}/products/${id}/videos/${v.id}`, { method: 'DELETE' });
                      setVideos(prev => prev.filter(x => x.id !== v.id));
                    }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Documents Tab ──── */}
          {tab === 'docs' && (
            <div className="space-y-5">
              <DocForm onAdd={addDoc} />
              <div className="space-y-3">
                {docs.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No documents added yet.</p>}
                {docs.map(d => (
                  <div key={d.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                      <a href={d.url} target="_blank" className="text-xs text-blue-600 hover:underline truncate block">{d.url}</a>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{d.type}</span>
                    <button onClick={async () => {
                      await fetch(`${API}/products/${id}/documents/${d.id}`, { method: 'DELETE' });
                      setDocs(prev => prev.filter(x => x.id !== d.id));
                    }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Specs Tab ──── */}
          {tab === 'specs' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="label-style">Technical Specifications (JSON)</label>
                <p className="text-xs text-slate-400 mb-2">Enter as a JSON object: {'{"key": "value"}'}</p>
                <textarea
                  value={typeof product.technicalSpecs === 'object' && product.technicalSpecs !== null
                    ? JSON.stringify(product.technicalSpecs, null, 2)
                    : product.technicalSpecs || ''}
                  onChange={e => setProduct({ ...product, technicalSpecs: e.target.value })}
                  rows={10} className="input-style w-full font-mono text-xs resize-none"
                  placeholder={'{\n  "Voltage": "220V",\n  "Power": "2000W"\n}'}
                />
              </div>
              <div>
                <label className="label-style">Features (JSON Array)</label>
                <p className="text-xs text-slate-400 mb-2">Enter as a JSON array: {'["Feature 1", "Feature 2"]'}</p>
                <textarea
                  value={typeof product.features === 'object' && product.features !== null
                    ? JSON.stringify(product.features, null, 2)
                    : product.features || ''}
                  onChange={e => setProduct({ ...product, features: e.target.value })}
                  rows={6} className="input-style w-full font-mono text-xs resize-none"
                  placeholder={'[\n  "Lightweight design",\n  "Dust-resistant"\n]'}
                />
              </div>
              <SaveButton saving={saving} saved={saved} onClick={saveSpecs} />
            </div>
          )}

          {/* ─── Variants Tab ──── */}
          {tab === 'variants' && (
            <div className="space-y-5">
              <VariantForm onAdd={addVariant} />
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['SKU', 'Price', 'Stock Qty', 'Weight', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-800">{v.sku}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">₹{Number(v.price).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{v.stockQty}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{v.weight || '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => removeVariant(v.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Pricing Tab ──── */}
          {tab === 'pricing' && (
            <div className="space-y-5 max-w-md">
              {[
                { label: 'Base Price (₹)', field: 'basePrice' },
                { label: 'MRP (₹)', field: 'mrp' },
                { label: 'Bulk Price (₹)', field: 'bulkPrice' },
                { label: 'Dealer Price (₹)', field: 'dealerPrice' },
                { label: 'GST %', field: 'gstPercent' },
                { label: 'Min Order Qty', field: 'moq' },
              ].map(f => (
                <div key={f.field}>
                  <label className="label-style">{f.label}</label>
                  <input type="number" value={product[f.field] || ''} onChange={e => setProduct({ ...product, [f.field]: e.target.value })}
                    className="input-style w-full" />
                </div>
              ))}
              <SaveButton saving={saving} saved={saved} onClick={savePricing} />
            </div>
          )}

          {/* ─── SEO Tab ──── */}
          {tab === 'seo' && (
            <div className="space-y-5 max-w-2xl">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>SEO Tips:</strong> A good meta title is under 60 characters. Meta description should be 140–160 characters. Use relevant keywords that buyers would search for.
              </div>
              <div>
                <label className="label-style">Meta Title</label>
                <input value={product.metaTitle || ''} onChange={e => setProduct({ ...product, metaTitle: e.target.value })}
                  placeholder="SEO-optimized title for search engines"
                  className="input-style w-full" maxLength={70} />
                <p className="text-xs text-slate-400 mt-1">{(product.metaTitle || '').length}/60 characters</p>
              </div>
              <div>
                <label className="label-style">Meta Description</label>
                <textarea value={product.metaDescription || ''} onChange={e => setProduct({ ...product, metaDescription: e.target.value })}
                  rows={4} placeholder="A compelling description for search result snippets"
                  className="input-style w-full resize-none" maxLength={200} />
                <p className="text-xs text-slate-400 mt-1">{(product.metaDescription || '').length}/160 characters</p>
              </div>
              <div>
                <label className="label-style">Meta Keywords</label>
                <input value={product.metaKeywords || ''} onChange={e => setProduct({ ...product, metaKeywords: e.target.value })}
                  placeholder="angle grinder, power tools, bosch"
                  className="input-style w-full" />
                <p className="text-xs text-slate-400 mt-1">Comma-separated keywords</p>
              </div>
              <SaveButton saving={saving} saved={saved} onClick={saveSEO} />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .input-style { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.625rem 1rem; font-size: 0.875rem; }
        .input-style:focus { outline: none; ring: 2px; ring-color: #ef4444; border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} disabled:opacity-60`}>
      {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
    </button>
  );
}

function ImageUploader({ onAdd }: { onAdd: (url: string, primary: boolean) => void }) {
  const [url, setUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  return (
    <div className="flex items-end gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <div className="flex-1">
        <label className="label-style">Image URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input-style w-full" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer mb-1">
        <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="accent-red-600" />
        Primary
      </label>
      <button onClick={() => { if (url) { onAdd(url, isPrimary); setUrl(''); setIsPrimary(false); } }}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
        <Plus size={15} /> Add
      </button>
    </div>
  );
}

function VideoForm({ onAdd }: { onAdd: (url: string, title: string, type: string) => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('YOUTUBE');
  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <div className="col-span-3 sm:col-span-1">
        <label className="label-style">Video URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/..." className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Product demo" className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="input-style w-full bg-white">
          <option>YOUTUBE</option><option>VIMEO</option><option>360_VIEW</option>
        </select>
      </div>
      <button onClick={() => { if (url) { onAdd(url, title, type); setUrl(''); setTitle(''); } }}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors mt-5 self-end">
        <Plus size={15} /> Add Video
      </button>
    </div>
  );
}

function DocForm({ onAdd }: { onAdd: (url: string, title: string, type: string) => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('BROCHURE');
  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <div className="col-span-3 sm:col-span-1">
        <label className="label-style">Document URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="User Manual" className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="input-style w-full bg-white">
          <option>BROCHURE</option><option>MANUAL</option><option>DATASHEET</option><option>CERTIFICATE</option>
        </select>
      </div>
      <button onClick={() => { if (url && title) { onAdd(url, title, type); setUrl(''); setTitle(''); } }}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors mt-5 self-end">
        <Plus size={15} /> Add Doc
      </button>
    </div>
  );
}

function VariantForm({ onAdd }: { onAdd: (sku: string, price: string, stock: string) => void }) {
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <div>
        <label className="label-style">SKU</label>
        <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU-001" className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Price (₹)</label>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-style w-full" />
      </div>
      <div>
        <label className="label-style">Stock Qty</label>
        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="input-style w-full" />
      </div>
      <div className="flex items-end">
        <button onClick={() => { if (sku && price) { onAdd(sku, price, stock); setSku(''); setPrice(''); setStock('0'); } }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors w-full justify-center">
          <Plus size={15} /> Add
        </button>
      </div>
    </div>
  );
}
