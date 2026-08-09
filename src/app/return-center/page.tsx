'use client';
import { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, Search, Package, AlertCircle, CheckCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function ReturnCenterPage() {
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({ type: 'error', msg: 'Please log in to initiate a return.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/returns/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, reason })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Return request submitted successfully. Our team will review it shortly.' });
        setOrderId('');
        setReason('');
      } else {
        setStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <RotateCcw size={14} /> Return Center
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Easy Returns & Refunds</h1>
          <p className="text-slate-500 font-medium text-lg">
            Not satisfied with your order? Initiate a return request within 7 days of delivery.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
          <div className="p-8 sm:p-12">
            {status.msg && (
              <div className={`mb-8 p-4 rounded-xl font-bold border flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {status.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" size={20} /> : <AlertCircle className="shrink-0 mt-0.5" size={20} />}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order ID *</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    required type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                    placeholder="e.g. 10024" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-bold text-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">You can find your Order ID in your account dashboard or order confirmation email.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Return *</label>
                <select 
                  required value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-bold text-slate-900 bg-white"
                >
                  <option value="">Select a reason</option>
                  <option value="Damaged Product">Product is damaged or defective</option>
                  <option value="Wrong Item">Received wrong item</option>
                  <option value="Quality Issue">Quality not as expected</option>
                  <option value="Missing Parts">Missing parts or accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                <h4 className="font-extrabold text-slate-900 text-sm mb-2">Return Policy Guidelines:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 font-medium">
                  <li>Item must be unused and in original packaging.</li>
                  <li>Return request must be placed within 7 days of delivery.</li>
                  <li>Certain heavy machinery items may incur a restocking fee.</li>
                </ul>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 text-lg">
                <RotateCcw size={20} /> {loading ? 'Submitting...' : 'Initiate Return'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm font-bold text-slate-500">
          Have questions about our return policy? <Link href="/faqs" className="text-rose-600 hover:underline">Read FAQs</Link>
        </p>
      </div>
    </div>
  );
}
