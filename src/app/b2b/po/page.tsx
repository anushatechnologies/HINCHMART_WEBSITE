"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, UploadCloud, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

export default function PurchaseOrderUpload() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    poNumber: '',
    amount: '',
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserId(u.id);
        setCompanyId(u.companyId || null); // Assuming B2B user has companyId
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      router.push('/login?redirect=/b2b/po');
      return;
    }
    if (!file) {
      alert("Please upload a Purchase Order document.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('poNumber', formData.poNumber);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('document', file);

      const res = await fetch(`${API}/b2b/po`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formDataToSend
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Upload Purchase Order</h1>
              <p className="text-xs text-blue-200">Submit your approved corporate PO to generate an order on credit.</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">PO Submitted Successfully!</h2>
            <p className="text-slate-600 max-w-md mx-auto">Your Purchase Order has been sent for review. Once approved, an order will be automatically generated.</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PO Number *</label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={e => setFormData({ ...formData, poNumber: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-white"
                  placeholder="PO-2024-001"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-white"
                  placeholder="50000"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload PO Document (PDF/Image) *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">{file ? file.name : "PDF, PNG, JPG up to 10MB"}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Submit Purchase Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
