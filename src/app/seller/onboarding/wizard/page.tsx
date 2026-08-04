"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, FileText, CreditCard, MapPin, Upload, Store, CheckCircle, ChevronRight, ChevronLeft,
  Loader2, ShieldCheck, Sparkles, ArrowRight, Check, Star, Zap, Globe, BadgeCheck
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const STEPS = [
  { id: 1, title: 'Business Info', subtitle: 'Company details', icon: Building2, color: 'from-violet-500 to-purple-600' },
  { id: 2, title: 'GST Details', subtitle: 'Tax registration', icon: FileText, color: 'from-blue-500 to-cyan-600' },
  { id: 3, title: 'PAN Details', subtitle: 'Identity proof', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
  { id: 4, title: 'Bank Account', subtitle: 'Payout setup', icon: CreditCard, color: 'from-amber-500 to-orange-600' },
  { id: 5, title: 'Warehouse', subtitle: 'Dispatch location', icon: MapPin, color: 'from-rose-500 to-pink-600' },
  { id: 6, title: 'Documents', subtitle: 'Legal papers', icon: Upload, color: 'from-indigo-500 to-blue-600' },
  { id: 7, title: 'Store Profile', subtitle: 'Branding setup', icon: Store, color: 'from-pink-500 to-fuchsia-600' },
  { id: 8, title: 'Review & Submit', subtitle: 'Final check', icon: BadgeCheck, color: 'from-green-500 to-emerald-600' },
];

// Premium floating label input
function FloatingInput({
  label, name, value, onChange, type = 'text', placeholder = ' ', required = false, className = '', mono = false
}: {
  label: string; name: string; value: string; onChange: (e: any) => void;
  type?: string; placeholder?: string; required?: boolean; className?: string; mono?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ' '}
        required={required}
        className={`peer w-full px-4 pt-6 pb-2 border-2 rounded-2xl text-slate-900 text-sm bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none
          ${focused ? 'border-violet-500 shadow-lg shadow-violet-100' : (hasValue ? 'border-slate-300' : 'border-slate-200')}
          ${mono ? 'font-mono tracking-wider uppercase' : ''}
        `}
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${(focused || hasValue) ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-violet-600' : 'top-4 text-sm text-slate-400'}
      `}>
        {label}
      </label>
    </div>
  );
}

function FloatingSelect({
  label, name, value, onChange, children, className = ''
}: {
  label: string; name: string; value: string; onChange: (e: any) => void;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-violet-600 z-10">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 pt-6 pb-2 border-2 border-slate-200 rounded-2xl text-slate-900 text-sm bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none focus:border-violet-500 focus:shadow-lg focus:shadow-violet-100 appearance-none"
      >
        {children}
      </select>
      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
    </div>
  );
}

function FloatingTextarea({
  label, name, value, onChange, rows = 3, className = ''
}: {
  label: string; name: string; value: string; onChange: (e: any) => void; rows?: number; className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  return (
    <div className={`relative ${className}`}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        className={`peer w-full px-4 pt-6 pb-2 border-2 rounded-2xl text-slate-900 text-sm bg-white/80 backdrop-blur-sm transition-all duration-200 outline-none resize-none
          ${focused ? 'border-violet-500 shadow-lg shadow-violet-100' : (hasValue ? 'border-slate-300' : 'border-slate-200')}
        `}
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${(focused || hasValue) ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-violet-600' : 'top-4 text-sm text-slate-400'}
      `}>
        {label}
      </label>
    </div>
  );
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', businessType: 'RETAILER', contactEmail: '', contactPhone: '',
    gstin: '', panNumber: '', bankAccountNumber: '', ifscCode: '', bankName: '',
    pickupAddress: '', businessAddress: '', msmeNumber: '', cinNumber: '',
    businessDocUrl: '', aboutStore: '', logoUrl: '', bannerUrl: ''
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
      if (currentStep < 8) setCurrentStep(prev => prev + 1);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(prev => prev - 1); };

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
        setCurrentStep(9);
      }
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const progress = (currentStep / 8) * 100;
  const currentStepData = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Top Nav */}
      {currentStep <= 8 && (
        <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 text-white font-black text-lg">H</div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">HinchMart Seller</p>
              <p className="text-white/40 text-xs">Verification Wizard</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/seller/dashboard')}
            className="text-white/50 hover:text-white/80 text-xs font-semibold transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl"
          >
            Save & Exit
          </button>
        </nav>
      )}

      <div className="relative z-10 flex-1 flex flex-col">
        {currentStep <= 8 && (
          <>
            {/* Step Indicator Bar */}
            <div className="px-6 py-4 max-w-5xl mx-auto w-full">
              <div className="flex items-center gap-1.5 mb-3">
                {STEPS.map((s, i) => {
                  const isDone = currentStep > s.id;
                  const isCurrent = currentStep === s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-1.5 flex-1">
                      <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${isDone ? 'bg-gradient-to-r from-violet-500 to-blue-500' : (isCurrent ? 'bg-violet-500/50' : 'bg-white/10')}`} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">Step {currentStep} of 8</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/60 text-xs font-semibold">{currentStepData?.title}</span>
                </div>
                <span className="text-white/40 text-xs">{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 px-6 pb-8 max-w-5xl mx-auto w-full">
              {/* Left: Step navigator (desktop) */}
              <div className="hidden lg:flex flex-col gap-1 w-56 flex-shrink-0 pt-2">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isDone = currentStep > s.id;
                  const isCurrent = currentStep === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 cursor-default
                        ${isCurrent ? 'bg-white/10 backdrop-blur-md' : 'hover:bg-white/5'}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                        ${isDone ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30'
                          : isCurrent ? `bg-gradient-to-br ${s.color} shadow-lg`
                          : 'bg-white/10'}
                      `}>
                        {isDone ? <Check size={14} className="text-white" /> : <Icon size={14} className={isCurrent ? 'text-white' : 'text-white/30'} />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-white' : (isDone ? 'text-white/60' : 'text-white/30')}`}>{s.title}</p>
                        <p className={`text-[10px] ${isCurrent ? 'text-white/50' : 'text-white/20'}`}>{s.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Form card */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                  >
                    {/* Card Header */}
                    {currentStepData && (
                      <div className={`px-8 pt-8 pb-6 border-b border-white/5 bg-gradient-to-br ${currentStepData.color} bg-opacity-10 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        <div className="relative z-10 flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-xl`}>
                            <currentStepData.icon size={26} className="text-white" />
                          </div>
                          <div>
                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-0.5">Step {currentStep} / 8</p>
                            <h2 className="text-white text-2xl font-black tracking-tight">{currentStepData.title}</h2>
                            <p className="text-white/50 text-sm">{currentStepData.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-8 space-y-5">
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="Company / Store Name *" name="companyName" value={formData.companyName} onChange={handleChange} required />
                            <FloatingInput label="Owner / Contact Person Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                          </div>
                          <FloatingSelect label="Business Type *" name="businessType" value={formData.businessType} onChange={handleChange}>
                            <option value="RETAILER">Retailer / Dealer</option>
                            <option value="WHOLESALER">Wholesaler / Distributor</option>
                            <option value="MANUFACTURER">Manufacturer / OEM</option>
                            <option value="RENTAL_PROVIDER">Rental & Service Provider</option>
                          </FloatingSelect>
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="Business Email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} type="email" />
                            <FloatingInput label="Business Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} type="tel" />
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                            <Zap size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-blue-200 text-xs leading-relaxed">Your GSTIN enables automated B2B invoice generation, ITC tax claim eligibility, and unlocks B2B bulk order categories.</p>
                          </div>
                          <FloatingInput label="15-Digit GSTIN Number *" name="gstin" value={formData.gstin} onChange={handleChange} required mono placeholder="22AAAAA0000A1Z5" />
                          <div className="grid grid-cols-2 gap-3 text-xs text-white/40">
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                              <Check size={14} className="text-emerald-400" />Auto B2B Invoice Generation
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                              <Check size={14} className="text-emerald-400" />ITC Tax Credit Eligibility
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-emerald-200 text-xs leading-relaxed">PAN is required for TDS deductions (u/s 194O) and generating Form 16A tax certificates for your quarterly filings.</p>
                          </div>
                          <FloatingInput label="10-Digit Business / Proprietor PAN *" name="panNumber" value={formData.panNumber} onChange={handleChange} required mono placeholder="ABCDE1234F" />
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <CreditCard size={18} className="text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-amber-200 text-xs leading-relaxed">Bank details are used for automated Net-7 / Net-14 escrow payouts after successful order fulfillment and return window expiry.</p>
                          </div>
                          <FloatingInput label="Bank Account Number *" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} required mono />
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="IFSC Code *" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required mono placeholder="SBIN0001234" />
                            <FloatingInput label="Bank Name *" name="bankName" value={formData.bankName} onChange={handleChange} required />
                          </div>
                        </div>
                      )}

                      {currentStep === 5 && (
                        <div className="space-y-4">
                          <FloatingTextarea label="Primary Warehouse / Pickup Address *" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} rows={3} />
                          <FloatingTextarea label="Business Registered Address (if different)" name="businessAddress" value={formData.businessAddress} onChange={handleChange} rows={2} />
                        </div>
                      )}

                      {currentStep === 6 && (
                        <div className="space-y-4">
                          <FloatingInput label="GST Certificate / Canceled Cheque URL" name="businessDocUrl" value={formData.businessDocUrl} onChange={handleChange} type="url" placeholder="https://..." />
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="MSME / Udyam Number (Optional)" name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} mono placeholder="UDYAM-XX-00-0000000" />
                            <FloatingInput label="CIN Number (Optional)" name="cinNumber" value={formData.cinNumber} onChange={handleChange} mono placeholder="U12345MH2020PTC000000" />
                          </div>
                        </div>
                      )}

                      {currentStep === 7 && (
                        <div className="space-y-4">
                          <FloatingTextarea label="About Your Store / Business Bio" name="aboutStore" value={formData.aboutStore} onChange={handleChange} rows={4} />
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput label="Store Logo URL" name="logoUrl" value={formData.logoUrl} onChange={handleChange} type="url" placeholder="https://..." />
                            <FloatingInput label="Store Banner URL" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} type="url" placeholder="https://..." />
                          </div>
                        </div>
                      )}

                      {currentStep === 8 && (
                        <div className="space-y-4">
                          {[
                            { label: 'Company', value: formData.companyName },
                            { label: 'Owner', value: formData.ownerName },
                            { label: 'GSTIN', value: formData.gstin || 'Not provided', mono: true },
                            { label: 'PAN', value: formData.panNumber || 'Not provided', mono: true },
                            { label: 'Bank Account', value: formData.bankAccountNumber ? '••••••' + formData.bankAccountNumber.slice(-4) : 'Not provided', mono: true },
                            { label: 'IFSC', value: formData.ifscCode || 'Not provided', mono: true },
                          ].map(row => (
                            <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                              <span className="text-white/40 text-xs font-bold uppercase tracking-wider">{row.label}</span>
                              <span className={`text-white text-sm font-semibold ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                            </div>
                          ))}
                          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-emerald-200 text-xs">By submitting, you authorize HinchMart to verify your documents and agree to our <span className="underline cursor-pointer">Seller Terms & Conditions</span>.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-8 pb-8 flex items-center justify-between gap-4">
                      <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                      >
                        <ChevronLeft size={16} /> Back
                      </button>

                      <div className="flex items-center gap-1">
                        {STEPS.map((s) => (
                          <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === s.id ? 'w-6 bg-violet-400' : currentStep > s.id ? 'w-3 bg-white/30' : 'w-3 bg-white/10'}`} />
                        ))}
                      </div>

                      {currentStep < 8 ? (
                        <button
                          onClick={handleNext}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 disabled:opacity-60"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Next Step <ChevronRight size={16} /></>}
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitFinal}
                          disabled={submitting}
                          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 disabled:opacity-60"
                        >
                          {submitting ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Submit for Review</>}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {/* Completion Screen */}
        {currentStep === 9 && (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg w-full text-center space-y-8"
            >
              {/* Animated sparkle orb */}
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 animate-pulse blur-2xl opacity-60" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                  <Sparkles size={54} className="text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-5xl font-black text-white tracking-tight">Congratulations! 🎉</h1>
                <p className="text-white/50 text-lg">Your seller verification has been submitted to HinchMart compliance.</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Application ID</span>
                  <span className="font-mono font-black text-white bg-white/10 px-3 py-1.5 rounded-xl text-sm">{applicationId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Status</span>
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-2"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />Under Review</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Estimated Time</span>
                  <span className="text-white/70 text-sm">24 – 48 Business Hours</span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-white/30 text-xs text-center">You'll receive an email, SMS, and in-app notification upon approval.</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/seller/dashboard')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-black text-base transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Go to Seller Dashboard <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
