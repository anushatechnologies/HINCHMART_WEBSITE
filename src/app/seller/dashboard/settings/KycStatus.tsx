"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Shield, Upload, FileText, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KycStatus() {
  const [vendor, setVendor] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      setVendor(JSON.parse(info));
    }
  }, []);

  if (!vendor) return null;

  const isRejected = vendor.kycStatus === 'REJECTED';
  const isPending = vendor.kycStatus === 'PENDING';
  const isVerified = vendor.kycStatus === 'VERIFIED';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
        {isVerified ? (
          <ShieldCheck size={28} className="text-emerald-500" />
        ) : isRejected ? (
          <ShieldAlert size={28} className="text-red-500" />
        ) : (
          <Shield size={28} className="text-amber-500" />
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900">KYC Verification Status</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your business documents and verification state</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Banner */}
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4">
            <XCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-red-900 text-lg">KYC Rejected</h3>
              <p className="text-red-700 mt-1">{vendor.kycRejectionReason || 'Your documents could not be verified.'}</p>
              <button 
                onClick={() => router.push('/seller/onboarding')}
                className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Update Documents & Re-submit
              </button>
            </div>
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Registration & KYC Pending</h3>
              <p className="text-amber-700 mt-1">Your business documents are pending submission or admin approval. Please ensure all details are provided.</p>
              <button 
                onClick={() => router.push('/seller/onboarding')}
                className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors shadow-sm"
              >
                Upload / Update Documents
              </button>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex gap-4">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">Account Verified</h3>
              <p className="text-emerald-700 mt-1">Your business has been fully verified. You can now sell and receive payouts without any restrictions.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText size={18} className="text-slate-400" />
                GST Registration
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${vendor.gstVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {vendor.gstVerified ? 'Verified API' : 'Unverified'}
              </span>
            </div>
            <p className="font-mono text-slate-900">{vendor.gstin || 'Not provided'}</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText size={18} className="text-slate-400" />
                Permanent Account Number
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${vendor.panVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {vendor.panVerified ? 'Verified API' : 'Unverified'}
              </span>
            </div>
            <p className="font-mono text-slate-900">{vendor.panNumber || 'Not provided'}</p>
          </div>
          
          <div className="border border-slate-200 rounded-xl p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <FileText size={18} className="text-slate-400" />
                Bank Account
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${vendor.bankPennyDropStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : vendor.bankPennyDropStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                {vendor.bankPennyDropStatus === 'VERIFIED' ? 'Verified Penny Drop' : 'Unverified'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Account Number</span>
                <p className="font-mono text-slate-900">{vendor.bankAccountNumber ? `XXXX-XXXX-${vendor.bankAccountNumber.slice(-4)}` : 'Not provided'}</p>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">IFSC Code</span>
                <p className="font-mono text-slate-900">{vendor.ifscCode || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Alerts section if we had document expiries */}
        {vendor.documentExpiries && Object.keys(vendor.documentExpiries).length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-slate-900 mb-4">Document Expiry Alerts</h3>
            <div className="space-y-3">
              {Object.entries(vendor.documentExpiries).map(([doc, dateStr]: [string, any]) => {
                const expiryDate = new Date(dateStr);
                const isExpiringSoon = (expiryDate.getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000;
                return (
                  <div key={doc} className={`p-4 rounded-lg flex items-center justify-between border ${isExpiringSoon ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-medium text-sm text-slate-700 capitalize">{doc.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`text-sm font-bold ${isExpiringSoon ? 'text-red-600' : 'text-slate-600'}`}>
                      Expires: {expiryDate.toLocaleDateString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
