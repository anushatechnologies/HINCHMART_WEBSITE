"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, UserCircle, ArrowLeft, Loader2, CheckCircle2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

export default function BrandRequestForm() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState(''); // EXISTING (A), OWNER (B), DISTRIBUTOR (C)

  const [globalBrands, setGlobalBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', // For Option B
    description: '',
    trademarkNumber: '',
    website: '',
    gstin: ''
  });

  const [logoUrl, setLogoUrl] = useState('');
  const [brandDocuments, setBrandDocuments] = useState<string[]>([]);
  const [authorizationLetterUrl, setAuthorizationLetterUrl] = useState('');
  const [distributorAgreementUrl, setDistributorAgreementUrl] = useState('');
  
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      setVendorId(JSON.parse(info).id);
    }
    
    // Fetch global active brands for Option A & C
    fetch(`${API}/brands`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setGlobalBrands(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (file: File, setter: (url: string) => void) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setter(data.url);
      } else {
        alert("Upload failed");
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!vendorId) return;
    setLoading(true);

    try {
      if (authType === 'OWNER') {
        // Option B - Request completely new brand
        const payload = {
          brandName: formData.name,
          brandLogoUrl: logoUrl,
          description: formData.description,
          trademarkNumber: formData.trademarkNumber,
          website: formData.website,
          brandDocuments,
          gstin: formData.gstin
        };
        const res = await fetch(`${API}/vendors/${vendorId}/brands/request-new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert("Brand registration requested successfully! Pending Admin approval.");
          router.push('/seller/dashboard/brands');
        } else {
          alert(data.message || "Failed to submit request");
        }
      } else {
        // Option A or C - Request access to existing brand
        if (!selectedBrandId) {
          alert("Please select a brand");
          setLoading(false);
          return;
        }

        const payload = {
          brandId: selectedBrandId,
          accessType: authType === 'EXISTING' ? 'RESELLER' : 'DISTRIBUTOR',
          authorizationDocumentUrl: authorizationLetterUrl,
          distributorAgreementUrl
        };
        const res = await fetch(`${API}/vendors/${vendorId}/brands/request-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert("Brand access requested successfully! Pending Admin approval.");
          router.push('/seller/dashboard/brands');
        } else {
          alert(data.message || "Failed to submit request");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Submission error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Request Brand Authorization</h1>
        <p className="text-slate-500 mt-2">Select how you intend to sell products under this brand.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select Authorization Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Option A */}
                <button onClick={() => { setAuthType('EXISTING'); setStep(2); }} className="p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Search size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Option A: Existing Brand</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Select a brand already listed in our marketplace and request authorization to sell.</p>
                </button>

                {/* Option B */}
                <button onClick={() => { setAuthType('OWNER'); setStep(2); }} className="p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCircle size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Option B: Brand Owner</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Register a completely new brand in the system with your trademark details.</p>
                </button>

                {/* Option C */}
                <button onClick={() => { setAuthType('DISTRIBUTOR'); setStep(2); }} className="p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">Option C: Distributor</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Select an existing brand and upload your authorization letter or dealer agreement.</p>
                </button>

              </div>
            </motion.div>
          )}

          {step === 2 && (authType === 'EXISTING' || authType === 'DISTRIBUTOR') && (
            <motion.div key="step2-ac" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Request Brand Access</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Existing Brand *</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedBrandId || ''}
                  onChange={(e) => setSelectedBrandId(Number(e.target.value))}
                >
                  <option value="" disabled>-- Select a Brand --</option>
                  {globalBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {globalBrands.length === 0 && <p className="text-xs text-amber-500 mt-1">No brands found. If your brand is not here, go back and select Option B.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Authorization Letter {authType === 'DISTRIBUTOR' ? '*' : '(Optional)'}</label>
                <input type="file" accept="application/pdf,image/*" onChange={(e) => { if(e.target.files?.[0]) handleFileUpload(e.target.files[0], setAuthorizationLetterUrl) }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {authorizationLetterUrl && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Uploaded successfully</p>}
              </div>

              {authType === 'DISTRIBUTOR' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Distributor Agreement (Optional)</label>
                  <input type="file" accept="application/pdf,image/*" onChange={(e) => { if(e.target.files?.[0]) handleFileUpload(e.target.files[0], setDistributorAgreementUrl) }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {distributorAgreementUrl && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Uploaded successfully</p>}
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                <button onClick={submitRequest} disabled={!selectedBrandId || (authType === 'DISTRIBUTOR' && !authorizationLetterUrl) || loading} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : 'Submit Access Request'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && authType === 'OWNER' && (
            <motion.div key="step2-b" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Register a New Brand</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Brand Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Brand Website</label>
                  <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Trademark Number (Optional)</label>
                  <input type="text" value={formData.trademarkNumber} onChange={e => setFormData({...formData, trademarkNumber: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Brand Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) handleFileUpload(e.target.files[0], setLogoUrl) }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  {logoUrl && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> Logo uploaded</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Brand Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Brand Documents (Trademark Certificate, Incorporation, etc.)</label>
                <input type="file" accept="application/pdf,image/*" onChange={(e) => { 
                  if(e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0], (url) => setBrandDocuments(prev => [...prev, url])) 
                  }
                }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                {brandDocuments.length > 0 && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> {brandDocuments.length} document(s) uploaded</p>}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                <button onClick={submitRequest} disabled={!formData.name || loading} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : 'Submit Brand Registration'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
