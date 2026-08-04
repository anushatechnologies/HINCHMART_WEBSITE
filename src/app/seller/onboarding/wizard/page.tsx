"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, FileText, CreditCard, MapPin, Upload, Store, CheckCircle, ChevronRight, ChevronLeft, Loader2, ShieldCheck, Sparkles
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'GST Details', icon: FileText },
  { id: 3, title: 'PAN Details', icon: FileText },
  { id: 4, title: 'Bank Account', icon: CreditCard },
  { id: 5, title: 'Warehouse', icon: MapPin },
  { id: 6, title: 'Documents', icon: Upload },
  { id: 7, title: 'Store Profile', icon: Store },
  { id: 8, title: 'Review & Submit', icon: ShieldCheck },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    businessType: 'RETAILER',
    contactEmail: '',
    contactPhone: '',
    gstin: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    pickupAddress: '',
    businessAddress: '',
    msmeNumber: '',
    cinNumber: '',
    businessDocUrl: '',
    aboutStore: '',
    logoUrl: '',
    bannerUrl: ''
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) {
      const parsed = JSON.parse(info);
      setVendorId(parsed.id);
      setFormData(prev => ({
        ...prev,
        companyName: parsed.companyName || '',
        ownerName: parsed.ownerName || '',
        businessType: parsed.businessType || 'RETAILER',
        contactEmail: parsed.contactEmail || '',
        contactPhone: parsed.contactPhone || '',
        gstin: parsed.gstin || '',
        panNumber: parsed.panNumber || '',
        bankAccountNumber: parsed.bankAccountNumber || '',
        ifscCode: parsed.ifscCode || '',
        bankName: parsed.bankName || '',
        pickupAddress: parsed.pickupAddress || ''
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      await fetch(`${API}/vendors/onboarding/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, step: currentStep, payload: formData })
      });
      if (currentStep < 8) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmitFinal = async () => {
    if (!vendorId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/vendors/onboarding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      });
      const data = await res.json();
      if (data.success) {
        setApplicationId(data.applicationId || `HMKYC${vendorId}`);
        const info = localStorage.getItem('seller_info');
        if (info) {
          const parsed = JSON.parse(info);
          parsed.kycStatus = 'KYC_SUBMITTED';
          parsed.status = 'UNDER_REVIEW';
          localStorage.setItem('seller_info', JSON.stringify(parsed));
        }
        setCurrentStep(9); // Completed screen
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl">H</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Seller Verification Wizard</h1>
            <p className="text-xs text-slate-500">Complete all steps to unlock full marketplace access</p>
          </div>
        </div>
        <button onClick={() => router.push('/seller/dashboard')} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
          Save & Exit
        </button>
      </div>

      {/* Stepper Bar */}
      {currentStep <= 8 && (
        <div className="max-w-4xl w-full mx-auto mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px]">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDone ? 'bg-emerald-500 text-white' : (isCurrent ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400')}`}>
                    {isDone ? <CheckCircle size={16} /> : s.id}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                  {s.id < 8 && <ChevronRight size={14} className="text-slate-300 ml-1" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Form Container */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex-1">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Building2 className="text-red-600" /> Step 1: Business Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Store Name *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="e.g. Acme Enterprises" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner / Contact Person Name *</label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Full legal name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Type *</label>
              <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white">
                <option value="RETAILER">Retailer / Dealer</option>
                <option value="WHOLESALER">Wholesaler / Distributor</option>
                <option value="MANUFACTURER">Manufacturer / OEM</option>
                <option value="RENTAL_PROVIDER">Rental & Service Provider</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="text-red-600" /> Step 2: GST Verification</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">15-Digit GSTIN Number *</label>
              <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono uppercase" placeholder="22AAAAA0000A1Z5" />
              <p className="text-xs text-slate-500 mt-1">Providing your GSTIN enables automated B2B invoice generation and ITC tax claims.</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="text-red-600" /> Step 3: PAN Verification</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">10-Digit Business/Proprietor PAN *</label>
              <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono uppercase" placeholder="ABCDE1234F" />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CreditCard className="text-red-600" /> Step 4: Bank Account Setup</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account Number *</label>
              <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono" placeholder="Account Number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code *</label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono uppercase" placeholder="SBIN0001234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name *</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Bank Name" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="text-red-600" /> Step 5: Warehouse & Pickup Address</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Warehouse Dispatch Address *</label>
              <textarea name="pickupAddress" rows={3} value={formData.pickupAddress} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Plot No, Street, City, State, Pincode" />
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Upload className="text-red-600" /> Step 6: Business Documents</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GST Certificate / Canceled Cheque Document URL</label>
              <input type="url" name="businessDocUrl" value={formData.businessDocUrl} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MSME / Udyam Number (Optional)</label>
                <input type="text" name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono" placeholder="UDYAM-XX-00-0000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CIN Number (Optional)</label>
                <input type="text" name="cinNumber" value={formData.cinNumber} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono" placeholder="U12345MH2020PTC000000" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Store className="text-red-600" /> Step 7: Store Profile Setup</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">About Store / Business Bio</label>
              <textarea name="aboutStore" rows={3} value={formData.aboutStore} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm" placeholder="Tell buyers about your manufacturing capabilities, product quality, and supply history." />
            </div>
          </div>
        )}

        {currentStep === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="text-red-600" /> Step 8: Final Review & Submission</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Company:</span> <strong className="text-slate-900">{formData.companyName}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Owner:</span> <strong className="text-slate-900">{formData.ownerName}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">GSTIN:</span> <strong className="font-mono text-slate-900">{formData.gstin || 'N/A'}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">PAN:</span> <strong className="font-mono text-slate-900">{formData.panNumber || 'N/A'}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500 font-medium">Bank Account:</span> <strong className="font-mono text-slate-900">{formData.bankAccountNumber || 'N/A'}</strong></div>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Sparkles size={44} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Congratulations!</h2>
            <p className="text-slate-600 max-w-md mx-auto">Your business verification application has been submitted successfully to HinchMart Compliance Admin.</p>
            
            <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-md mx-auto space-y-2 text-left shadow-xl">
              <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider"><span>Application ID</span> <span>Status</span></div>
              <div className="flex justify-between font-mono font-bold text-lg"><span>{applicationId}</span> <span className="text-amber-400">Under Review</span></div>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">Estimated review time: 24 - 48 hours.</p>
            </div>

            <button onClick={() => router.push('/seller/dashboard')} className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all">
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {currentStep <= 8 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            <button onClick={handleBack} disabled={currentStep === 1} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1">
              <ChevronLeft size={16} /> Back
            </button>
            {currentStep < 8 ? (
              <button onClick={handleNext} disabled={loading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <>Next Step <ChevronRight size={16} /></>}
              </button>
            ) : (
              <button onClick={handleSubmitFinal} disabled={submitting} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <>Submit for Review <CheckCircle size={16} /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
