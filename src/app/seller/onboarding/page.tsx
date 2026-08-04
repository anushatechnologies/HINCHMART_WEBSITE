"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store, Building2, FileText, CreditCard, MapPin, Upload,
  ShieldCheck, CheckCircle, ChevronRight, ChevronLeft,
  Sparkles, ArrowRight, Loader2
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Welcome', icon: Sparkles },
  { id: 2, label: 'Business Info', icon: Building2 },
  { id: 3, label: 'Business Focus', icon: MapPin },
  { id: 4, label: 'GST Details', icon: FileText },
  { id: 5, label: 'PAN Details', icon: FileText },
  { id: 6, label: 'Bank Account', icon: CreditCard },
  { id: 7, label: 'Pickup Address', icon: MapPin },
  { id: 8, label: 'Documents', icon: Upload },
  { id: 9, label: 'Verification', icon: ShieldCheck },
];

const BUSINESS_TYPES = [
  'INDIVIDUAL', 'BUSINESS', 'MANUFACTURER', 'DISTRIBUTOR',
  'DEALER', 'WHOLESALER', 'RETAILER', 'RENTAL_PROVIDER', 'SERVICE_PROVIDER'
];

export default function SellerOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState('');
  const [error, setError] = useState('');
  const [verifications, setVerifications] = useState({ gst: false, pan: false, bank: false });

  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    businessType: 'BUSINESS',
    gstin: '',
    panNumber: '',
    aadhaarNumber: '',
    cinNumber: '',
    msmeNumber: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    pickupAddress: '',
    businessDocUrl: '',
    targetAudiences: [] as string[],
    serviceCities: [] as string[],
    primaryCategories: [] as string[],
    documentExpiries: {
      gstExpiry: '',
      panExpiry: '',
      tradeLicenseExpiry: '',
      fssaiExpiry: ''
    },
  });

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (!info) {
      router.push('/seller/login');
      return;
    }
    const parsed = JSON.parse(info);
    setVendorId(parsed.id);
    // Pre-fill with any saved data
    setFormData(prev => ({
      ...prev,
      companyName: parsed.companyName || '',
      ownerName: parsed.ownerName || '',
      businessType: parsed.businessType || 'BUSINESS',
      gstin: parsed.gstin || '',
      panNumber: parsed.panNumber || '',
      targetAudiences: parsed.targetAudiences || [],
      serviceCities: parsed.serviceCities || [],
      primaryCategories: parsed.primaryCategories || [],
      msmeNumber: parsed.msmeNumber || '',
      cinNumber: parsed.cinNumber || '',
      aadhaarNumber: parsed.aadhaarNumber || '',
      documentExpiries: parsed.documentExpiries || { gstExpiry: '', panExpiry: '', tradeLicenseExpiry: '', fssaiExpiry: '' },
    }));
    
    setVerifications({
      gst: parsed.gstVerified || false,
      pan: parsed.panVerified || false,
      bank: parsed.bankPennyDropStatus === 'VERIFIED',
    });
    // Resume from saved step
    if (parsed.onboardingStep && parsed.onboardingStep > 1) {
      setCurrentStep(parsed.onboardingStep);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      documentExpiries: {
        ...formData.documentExpiries,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleArrayToggle = (field: 'targetAudiences' | 'serviceCities' | 'primaryCategories', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const saveProgress = async (step: number) => {
    if (!vendorId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/vendors/${vendorId}/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, onboardingStep: step })
      });
      const data = await res.json();
      if (data.success) {
        // Update local cache
        const current = JSON.parse(localStorage.getItem('seller_info') || '{}');
        localStorage.setItem('seller_info', JSON.stringify({ ...current, ...data.data }));
      } else {
        setError(data.message || 'Failed to save progress');
      }
    } catch {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < 8) {
      await saveProgress(currentStep + 1);
      if (!error) setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleVerify = async (type: 'gst' | 'pan' | 'bank') => {
    if (!vendorId) return;
    setVerifying(type);
    setError('');
    
    try {
      const endpoints = {
        gst: `/kyc/verify-gst`,
        pan: `/kyc/verify-pan`,
        bank: `/kyc/penny-drop`
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendors/${vendorId}${endpoints[type]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setVerifications(prev => ({ ...prev, [type]: true }));
        // Update local cache
        const current = JSON.parse(localStorage.getItem('seller_info') || '{}');
        localStorage.setItem('seller_info', JSON.stringify({ ...current, ...data.data }));
      } else {
        setError(data.message || `Failed to verify ${type.toUpperCase()}`);
      }
    } catch {
      setError('An error occurred during verification.');
    } finally {
      setVerifying('');
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveProgress(8);
    // Final KYC Submission
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendors/${vendorId}/kyc/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/seller/dashboard');
      }
    } catch (e) {
      setError('Failed to submit KYC. Please try again.');
    }
    setSaving(false);
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">HinchMart Seller Central</span>
        </div>
        <Link href="/seller/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">
          Skip for now →
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Step Indicators */}
        <div className="w-full max-w-3xl mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-white/60 text-sm font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step Pills */}
          <div className="flex items-center justify-between mt-4 overflow-x-auto gap-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone ? 'bg-emerald-500' : isActive ? 'bg-red-500 ring-2 ring-red-300/50' : 'bg-white/10'
                  }`}>
                    {isDone ? <CheckCircle size={16} className="text-white" /> : <Icon size={14} className="text-white" />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {/* STEP 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles size={36} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900">Welcome to HinchMart!</h1>
                  <p className="text-slate-500 mt-3 text-lg leading-relaxed">
                    Let's set up your seller account in just a few minutes. We'll collect some details to verify your business and get you selling to thousands of B2B buyers.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { label: '5 min', desc: 'To complete setup' },
                    { label: '24hrs', desc: 'KYC verification time' },
                    { label: '₹0', desc: 'No setup fees' },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-2xl font-extrabold text-red-600">{item.label}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Business Information</h2>
                  <p className="text-slate-500 mt-1">Tell us about your business entity.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Legal Business Name *</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="As per GST registration" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Owner / Authorized Person *</label>
                    <input name="ownerName" value={formData.ownerName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Full legal name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Business Type *</label>
                    <select name="businessType" value={formData.businessType} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      {BUSINESS_TYPES.map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CIN Number (Optional)</label>
                    <input name="cinNumber" value={formData.cinNumber} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="For Private/Public Ltd companies" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">MSME / Udyam Number (Optional)</label>
                    <input name="msmeNumber" value={formData.msmeNumber} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="UDYAM-XX-00-0000000" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Business Focus */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Business Focus</h2>
                  <p className="text-slate-500 mt-1">Help us customize your dashboard by telling us what you sell and to whom.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Audience (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['B2B Builders', 'B2C Homeowners', 'Contractors', 'Interior Designers', 'Retailers'].map(aud => (
                      <label key={aud} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.targetAudiences.includes(aud) ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="checkbox" checked={formData.targetAudiences.includes(aud)} onChange={() => handleArrayToggle('targetAudiences', aud)} className="w-4 h-4 text-red-600 rounded" />
                        <span className="text-sm font-medium text-slate-700">{aud}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Service Cities (Select your primary locations)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune'].map(city => (
                      <button key={city} type="button" onClick={() => handleArrayToggle('serviceCities', city)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${formData.serviceCities.includes(city) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Plywood & MDF', 'Laminates', 'Doors & HDHMR', 'Adhesives & Hardware', 'Plumbing', 'Electrical'].map(cat => (
                      <label key={cat} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.primaryCategories.includes(cat) ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="checkbox" checked={formData.primaryCategories.includes(cat)} onChange={() => handleArrayToggle('primaryCategories', cat)} className="w-4 h-4 text-red-600 rounded" />
                        <span className="text-sm font-medium text-slate-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: GST Details */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">GST Details</h2>
                  <p className="text-slate-500 mt-1">Your GSTIN is required for tax compliance on all transactions.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <FileText size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">Your GSTIN must be active and match your legal business name. This will be verified during KYC review.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">GSTIN *</label>
                  <div className="flex gap-2">
                    <input name="gstin" value={formData.gstin} onChange={handleChange} disabled={verifications.gst}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-wider disabled:bg-slate-100"
                      placeholder="22AAAAA0000A1Z5" maxLength={15} />
                    <button type="button" onClick={() => handleVerify('gst')} disabled={formData.gstin.length !== 15 || verifying === 'gst' || verifications.gst}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm shrink-0 disabled:opacity-50 flex items-center gap-2">
                      {verifying === 'gst' ? <Loader2 size={16} className="animate-spin" /> : verifications.gst ? <CheckCircle size={16} className="text-emerald-400" /> : null}
                      {verifications.gst ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">15-character alphanumeric GST Identification Number</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar Number (for Individual/Sole Proprietor)</label>
                  <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-wider"
                    placeholder="XXXX XXXX XXXX" maxLength={12} />
                </div>
              </div>
            )}

            {/* STEP 5: PAN Details */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">PAN Details</h2>
                  <p className="text-slate-500 mt-1">Required for TDS deductions on your settlement payouts.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">PAN Number *</label>
                  <div className="flex gap-2">
                    <input name="panNumber" value={formData.panNumber} onChange={handleChange} disabled={verifications.pan}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest uppercase disabled:bg-slate-100"
                      placeholder="ABCDE1234F" maxLength={10} />
                    <button type="button" onClick={() => handleVerify('pan')} disabled={formData.panNumber.length !== 10 || verifying === 'pan' || verifications.pan}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm shrink-0 disabled:opacity-50 flex items-center gap-2">
                      {verifying === 'pan' ? <Loader2 size={16} className="animate-spin" /> : verifications.pan ? <CheckCircle size={16} className="text-emerald-400" /> : null}
                      {verifications.pan ? 'Verified' : 'Verify'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">10-character alphanumeric PAN</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Why we need PAN:</strong> As per Indian tax laws, TDS @ 1% is deducted on all payments above ₹30,000. Your PAN is required to credit this TDS to your account.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar Number (Optional)</label>
                  <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest"
                    placeholder="1234 5678 9012" maxLength={14} />
                  <p className="text-xs text-slate-500 mt-1">Used for secondary KYC verification if PAN is unavailable.</p>
                </div>
              </div>
            )}

            {/* STEP 6: Bank Account */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Bank Account for Payouts</h2>
                  <p className="text-slate-500 mt-1">Settlements will be transferred to this account within 7-14 business days.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Name *</label>
                    <input name="bankName" value={formData.bankName} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., State Bank of India" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Account Number *</label>
                    <input name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} type="password"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-wider"
                      placeholder="Account Number" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">IFSC Code *</label>
                    <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} disabled={verifications.bank}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-widest uppercase disabled:bg-slate-100"
                      placeholder="SBIN0001234" maxLength={11} />
                  </div>
                  <button type="button" onClick={() => handleVerify('bank')} disabled={!formData.bankAccountNumber || !formData.ifscCode || verifying === 'bank' || verifications.bank}
                    className="w-full px-4 py-3 mt-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {verifying === 'bank' ? <Loader2 size={18} className="animate-spin" /> : verifications.bank ? <CheckCircle size={18} /> : null}
                    {verifications.bank ? 'Bank Account Verified Successfully' : 'Verify Bank Account (₹1 Penny Drop)'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: Pickup Address */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Primary Pickup Address</h2>
                  <p className="text-slate-500 mt-1">Courier partners will arrive here to pickup your shipments.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Pickup Address *</label>
                  <textarea name="pickupAddress" value={formData.pickupAddress} onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Flat/Unit No, Building Name, Street, Area, City, State, Pincode" />
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600">
                    💡 You can manage multiple warehouse/pickup addresses after your store is approved from the <strong>Warehouses</strong> section in your dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 8: Business Documents */}
            {currentStep === 8 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Business Documents</h2>
                  <p className="text-slate-500 mt-1">Upload scanned copies of your key business documents for KYC verification.</p>
                </div>
                <div className="grid gap-4">
                  {[
                    { label: 'GST Registration Certificate URL', desc: 'Link to your GST certificate PDF/image' },
                    { label: 'Cancelled Cheque / Bank Statement URL', desc: 'For bank account verification' },
                    { label: 'Business PAN Card URL', desc: 'Scanned copy of company PAN' },
                  ].map((doc, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{doc.label}</label>
                      <p className="text-xs text-slate-500 mb-2">{doc.desc}</p>
                      <input
                        type="url"
                        name={i === 0 ? 'businessDocUrl' : undefined}
                        value={i === 0 ? formData.businessDocUrl : ''}
                        onChange={i === 0 ? handleChange : undefined}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Document Expiry Dates</h3>
                  <p className="text-sm text-slate-500 mb-4">Set alerts for when your licenses expire.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Trade License Expiry (Optional)</label>
                      <input type="date" name="tradeLicenseExpiry" value={formData.documentExpiries.tradeLicenseExpiry} onChange={handleDocumentExpiryChange}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">FSSAI Expiry (Optional)</label>
                      <input type="date" name="fssaiExpiry" value={formData.documentExpiries.fssaiExpiry} onChange={handleDocumentExpiryChange}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">GST Expiry (Optional)</label>
                      <input type="date" name="gstExpiry" value={formData.documentExpiries.gstExpiry} onChange={handleDocumentExpiryChange}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: Verification Status */}
            {currentStep === 9 && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={48} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Application Submitted!</h2>
                  <p className="text-slate-500 mt-3 text-lg">Your store application is now under review.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-left space-y-3">
                  <h3 className="font-bold text-slate-900">What happens next?</h3>
                  {[
                    { step: '1', text: 'Our team verifies your GST, PAN and bank details (24-48 hrs).' },
                    { step: '2', text: 'You receive an email confirmation once your KYC is approved.' },
                    { step: '3', text: 'You can start listing your products immediately!' },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <p className="text-sm text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-medium">
                    ⏳ Current KYC Status: <span className="font-bold uppercase">Pending Review</span>
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 py-2 px-4 rounded-lg font-medium">
                {error}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {currentStep < 8 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {saving ? 'Saving...' : currentStep === 1 ? "Let's Get Started" : 'Continue'}
                {!saving && <ChevronRight size={18} />}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
