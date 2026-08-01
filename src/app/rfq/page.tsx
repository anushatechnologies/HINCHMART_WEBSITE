'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RfqPage() {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    targetPrice: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            productName: formData.productName,
            quantity: formData.quantity,
            targetPrice: formData.targetPrice
          }],
          notes: formData.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('RFQ Submitted successfully! Our team will contact you with a quotation shortly.');
        router.push('/');
      } else {
        alert('Failed to submit RFQ: ' + data.message);
      }
    } catch (error) {
      alert('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Request for Quotation</h1>
          <p className="text-slate-500 text-lg">Need bulk materials for your next project? Tell us what you need, and we'll get you the best B2B pricing within 24 hours.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4 mb-6">
              <span className="text-blue-500 text-xl">ℹ️</span>
              <div>
                <h4 className="text-blue-900 font-bold text-sm">Enterprise Buyer Tip</h4>
                <p className="text-blue-700 text-sm">For complex requirements, simply describe your needs in the notes. Our procurement engineers will analyze it and prepare a custom BOQ.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full">
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Description / Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. UltraTech Cement 50kg Bags or Bosch GWS 900"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Required Quantity <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Price (Optional)</label>
                <input 
                  type="number"
                  placeholder="Your expected price per unit (₹)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Specifications or Notes</label>
                <textarea 
                  rows={4}
                  placeholder="Specify material grades, delivery timelines, or attach any specific requirements..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Submit Request for Quote'}
                {!loading && <span className="text-xl">&rarr;</span>}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
