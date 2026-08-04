"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, ShieldCheck, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function ApplyCreditLine() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    requestedCreditLimit: '500000',
    paymentTermsDays: '30',
    gstin: '',
    panNumber: '',
    financialDocUrl: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserId(u.id);
        setFormData(prev => ({
          ...prev,
          gstin: u.gstin || '',
        }));
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      router.push('/login?redirect=/b2b/credit/apply');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/credit/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestedCreditLimit: formData.requestedCreditLimit,
          paymentTermsDays: Number(formData.paymentTermsDays),
          gstin: formData.gstin,
          panNumber: formData.panNumber,
          financialDocUrl: formData.financialDocUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <CreditCard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">HinchMart Corporate Trade Credit Line</h1>
              <p className="text-xs text-indigo-200">Apply for Net-30 / Net-60 day revolving business payment terms up to ₹5,000,000.</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
            <p className="text-slate-600 max-w-md mx-auto">Our credit risk team will review your business financials and GSTIN verification within 24 business hours.</p>
            <button onClick={() => router.push('/dashboard')} className="mt-4 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
              Return to Buyer Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Requested Credit Limit (₹) *</label>
                <select
                  value={formData.requestedCreditLimit}
                  onChange={e => setFormData({ ...formData, requestedCreditLimit: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="100000">₹1,00,000 (Starter)</option>
                  <option value="500000">₹5,00,000 (Growth)</option>
                  <option value="1500000">₹15,00,000 (Enterprise)</option>
                  <option value="5000000">₹50,00,000 (Corporate Prime)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Terms *</label>
                <select
                  value={formData.paymentTermsDays}
                  onChange={e => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="30">Net-30 Days</option>
                  <option value="60">Net-60 Days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company GSTIN Number *</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-mono"
                  placeholder="22AAAAA0000A1Z5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company PAN Number *</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border rounded-xl text-sm font-mono"
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Financial Statement / Audited Balance Sheet URL</label>
              <input
                type="url"
                value={formData.financialDocUrl}
                onChange={e => setFormData({ ...formData, financialDocUrl: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 flex items-start gap-3">
              <ShieldCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
              <p>By applying for HinchMart Trade Credit, you authorize automated credit score verification and agrees to pay within Net-30 or Net-60 days of invoice generation.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Submit Trade Credit Application <ArrowRight size={20} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
