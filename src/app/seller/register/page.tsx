"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, ShieldCheck, ArrowRight, Building2, Loader2, Phone, Mail, Lock, Check, Search
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Business' },
  { id: 3, label: 'Tax' },
  { id: 4, label: 'Bank' },
  { id: 5, label: 'Warehouse' },
  { id: 6, label: 'Docs' },
  { id: 7, label: 'Brands' },
  { id: 8, label: 'Review' }
];

const BUSINESS_TYPES = [
  { id: 'MANUFACTURER', emoji: '🏭', title: 'Manufacturer', desc: 'Sell your own manufactured goods' },
  { id: 'WHOLESALER', emoji: '📦', title: 'Wholesaler / Distributor', desc: 'Sell products in bulk' },
  { id: 'RETAILER', emoji: '🏪', title: 'Retailer / Dealer', desc: 'Sell branded products' },
  { id: 'SERVICE_PROVIDER', emoji: '🛠', title: 'Service Provider', desc: 'Provide business services' },
];

export default function SellerRegister() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Firebase Phone Auth States
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    phone: '',
    phoneVerified: false,
    firstName: '',
    lastName: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    businessType: 'MANUFACTURER',
    companyName: '',
    businessDisplayName: '',
    yearEstablished: '2023',
    businessCategory: 'Construction Materials',
    address: '',
    state: 'Telangana',
    city: 'Hyderabad',
    pincode: '',
    hasGst: 'yes',
    gstin: '',
    panNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: 'State Bank of India',
    warehouseName: 'Primary Warehouse',
    warehouseContact: '',
    warehousePhone: '',
    warehouseAddress: '',
    warehouseState: 'Telangana',
    warehouseCity: 'Hyderabad',
    warehousePincode: ''
  });

  const [gstVerified, setGstVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

  useEffect(() => {
    // Attempt to load existing vendor session if they are continuing onboarding
    const infoStr = localStorage.getItem('seller_info');
    if (infoStr) {
      try {
        const info = JSON.parse(decodeURIComponent(infoStr));
        if (info && info.onboardingStatus === 'STARTED') {
           // pre-fill some fields if possible
           setFormData(prev => ({
             ...prev,
             phone: info.phone || prev.phone,
             contactEmail: info.email || prev.contactEmail,
             phoneVerified: info.phoneVerified || prev.phoneVerified,
           }));
           if (info.phoneVerified && currentStep === 1) {
              setCurrentStep(2);
           }
        }
      } catch (e) {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- Step 1: Firebase Phone Verification ---
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${formData.phone}`;
      const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setOtpValues(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      if (!confirmationResult) throw new Error('No OTP session found.');
      await confirmationResult.confirm(enteredOtp);
      setFormData(prev => ({ ...prev, phoneVerified: true }));
      setError('');
      nextStep();
    } catch (err: any) {
      setError('Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newArr = [...otpValues];
    newArr[index] = val.slice(-1);
    setOtpValues(newArr);
    if (val && index < 5) {
      document.getElementById(`otp-reg-${index + 1}`)?.focus();
    }
  };

  // --- Mock Verification APIs ---
  const handleVerifyGst = () => {
    if (!formData.gstin) return setError('Enter GSTIN');
    setLoading(true);
    setTimeout(() => { setGstVerified(true); setLoading(false); }, 1000);
  };

  const handleVerifyPan = () => {
    if (!formData.panNumber) return setError('Enter PAN');
    setLoading(true);
    setTimeout(() => { setPanVerified(true); setLoading(false); }, 1000);
  };

  const handleVerifyBank = () => {
    if (!formData.accountNumber) return setError('Enter Account Number');
    setLoading(true);
    setTimeout(() => { setBankVerified(true); setLoading(false); }, 1000);
  };

  // --- Submit Final Application ---
  const handleSubmitFinal = async () => {
    setLoading(true);
    // Here we would call POST /api/vendors/onboarding/complete
    // For now we simulate success and route to dashboard
    setTimeout(() => {
      const existingToken = localStorage.getItem('seller_token');
      
      const newInfo = {
        id: Date.now(),
        companyName: formData.companyName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.phone,
        status: 'ONBOARDING',
        kycStatus: 'UNDER_REVIEW',
        onboardingStep: 8,
        onboardingProgress: 100
      };

      if (existingToken) {
         localStorage.setItem('seller_info', JSON.stringify(newInfo));
         window.dispatchEvent(new Event('seller_info_updated'));
      }
      router.push('/seller/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex font-sans">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL (DESKTOP)
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0B1F3A] text-white flex-col p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B2C]/10 rounded-full blur-3xl" />
        
        <Link href="/" className="flex items-center gap-2 mb-16 relative z-10">
          <img src="/logo.png" alt="HinchMart" className="h-8 w-auto max-w-[130px] object-contain" />
          <span className="text-[10px] font-black uppercase text-[#FF6B2C] bg-[#FFF1EA] px-2 py-0.5 rounded tracking-wider">
            Seller KYC
          </span>
        </Link>

        <div className="space-y-6 relative z-10">
          <h1 className="text-3xl font-extrabold leading-tight">
            Complete Your <br/>
            <span className="text-[#FF6B2C]">Seller Verification</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-sm">
            Join 10 Lakh+ B2B manufacturers and distributors. Get verified to access bulk buyers pan-India.
          </p>

          <div className="space-y-6 mt-12">
            {[
              { title: 'Verify Identity', desc: 'Secure Mobile & Email linking', active: currentStep <= 2 },
              { title: 'Business Details', desc: 'GST, PAN & Bank Information', active: currentStep >= 3 && currentStep <= 6 },
              { title: 'Marketplace Setup', desc: 'Warehouses & Brands', active: currentStep >= 7 }
            ].map((step, idx) => (
              <div key={idx} className={`flex items-start gap-4 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${step.active ? 'border-[#FF6B2C] text-[#FF6B2C]' : 'border-slate-500 text-slate-500'}`}>
                  {step.active ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-500" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${step.active ? 'text-white' : 'text-slate-400'}`}>{step.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL (FORM)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto">
        <div className="p-6 border-b border-[#E4E7EC] bg-white sticky top-0 z-20 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-[#172033]">Seller Registration</h2>
             <Link href="/seller/login" className="text-sm font-semibold text-[#667085] hover:text-[#0B1F3A]">
               Already registered? <span className="text-[#2563EB]">Login</span>
             </Link>
          </div>
          
          {/* Stepper Dots */}
          <div className="flex items-center justify-between w-full max-w-2xl">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5 relative">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors
                  ${currentStep > s.id ? 'bg-[#16A34A] text-white' : currentStep === s.id ? 'bg-[#FF6B2C] text-white ring-4 ring-[#FFF1EA]' : 'bg-[#F8FAFC] border border-[#D0D5DD] text-[#667085]'}`}
                >
                  {currentStep > s.id ? <Check size={12} strokeWidth={3} /> : s.id}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep >= s.id ? 'text-[#172033]' : 'text-[#98A2B3]'}`}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute top-2.5 left-[60%] right-[-40%] h-0.5 -z-0
                    ${currentStep > s.id ? 'bg-[#16A34A]' : 'bg-[#E4E7EC]'}`} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-12 pb-24">
          <div className="max-w-xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-[#E4E7EC] p-6 sm:p-8">
            
            {error && (
              <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-semibold rounded-lg flex items-center gap-2">
                <ShieldCheck size={16} /> {error}
              </div>
            )}

            {/* STEP 1: MOBILE OTP */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Mobile Verification</h3>
                  <p className="text-sm text-[#667085] mt-1">We'll send a 6-digit code to verify your identity.</p>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Mobile Number *</label>
                      <div className="flex items-center rounded-lg border border-[#D0D5DD] bg-white overflow-hidden focus-within:border-[#FF6B2C] focus-within:ring-2 focus-within:ring-[#FFF1EA]">
                        <span className="px-3 text-sm font-bold text-[#667085] border-r border-[#D0D5DD] bg-[#F8FAFC] py-3.5">+91</span>
                        <input
                          type="tel" name="phone" maxLength={10} value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\\D/g, '')})}
                          placeholder="Enter 10-digit number" className="w-full px-3 text-sm text-[#172033] outline-none"
                        />
                      </div>
                    </div>
                    <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP via SMS'}
                    </button>
                    
                    <div className="relative flex items-center gap-3 my-6">
                      <div className="flex-1 h-px bg-[#E4E7EC]" />
                      <span className="text-xs font-semibold text-[#667085]">OR</span>
                      <div className="flex-1 h-px bg-[#E4E7EC]" />
                    </div>
                    
                    <button className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F8FAFC] text-[#344054] text-sm font-semibold transition-all">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                      Continue with Google
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs text-[#667085]">
                      OTP sent to <strong className="text-[#172033]">+91 {formData.phone}</strong>
                    </div>
                    <div className="flex justify-between gap-2 py-1">
                      {otpValues.map((v, i) => (
                        <input
                          key={i} id={`otp-reg-${i}`} type="text" maxLength={1} value={v}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          className="w-12 h-12 text-center text-lg font-bold border border-[#D0D5DD] rounded-lg outline-none focus:border-[#FF6B2C]"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <button type="button" onClick={() => setOtpValues(['1','2','3','4','5','6'])} className="text-[#FF6B2C] font-bold">Auto-fill Demo (123456)</button>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-[#2563EB] font-bold">Change number</button>
                    </div>
                    <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Mobile'}
                    </button>
                  </div>
                )}
                <div id="recaptcha-container"></div>
              </div>
            )}

            {/* STEP 2: BASIC ACCOUNT */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Create Your Account</h3>
                  <p className="text-sm text-[#667085] mt-1">Set up your seller login credentials.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-b2b w-full" placeholder="Rahul" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-b2b w-full" placeholder="Kumar" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">Business Email *</label>
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="input-b2b w-full" placeholder="sales@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-b2b w-full" placeholder="••••••••" />
                </div>
              </div>
            )}

            {/* STEP 3: BUSINESS TYPE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Business Type</h3>
                  <p className="text-sm text-[#667085] mt-1">What best describes your operation?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BUSINESS_TYPES.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setFormData({...formData, businessType: type.id})}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.businessType === type.id ? 'border-[#FF6B2C] bg-[#FFF1EA]' : 'border-[#E4E7EC] hover:border-[#D0D5DD] bg-white'}`}
                    >
                      <div className="text-2xl mb-2">{type.emoji}</div>
                      <h4 className={`text-sm font-bold ${formData.businessType === type.id ? 'text-[#FF6B2C]' : 'text-[#172033]'}`}>{type.title}</h4>
                      <p className="text-[11px] text-[#667085] mt-1">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: BUSINESS DETAILS */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Business Details</h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">Legal Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="input-b2b w-full" placeholder="ABC Pvt Ltd" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">Store / Display Name *</label>
                  <input type="text" name="businessDisplayName" value={formData.businessDisplayName} onChange={handleChange} className="input-b2b w-full" placeholder="ABC Traders" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-b2b w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="input-b2b w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GST / TAX */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Tax Verification</h3>
                </div>
                
                <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl space-y-4">
                  <div className="flex gap-4">
                     <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" checked={formData.hasGst === 'yes'} onChange={() => setFormData({...formData, hasGst: 'yes'})} /> I have GSTIN</label>
                     <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" checked={formData.hasGst === 'no'} onChange={() => setFormData({...formData, hasGst: 'no'})} /> No GST</label>
                  </div>
                  
                  {formData.hasGst === 'yes' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-[#172033]">Enter GSTIN *</label>
                      <div className="flex gap-2">
                        <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} maxLength={15} className="input-b2b flex-1 uppercase" placeholder="29XXXXX9999X1ZX" />
                        <button type="button" onClick={handleVerifyGst} disabled={gstVerified || loading} className={`px-4 rounded-lg text-xs font-bold text-white ${gstVerified ? 'bg-[#16A34A]' : 'bg-[#0B1F3A]'}`}>
                          {loading ? 'Verifying...' : gstVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}

                  {gstVerified && (
                    <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                      <p className="text-xs font-bold text-[#16A34A] flex items-center gap-1"><CheckCircle2 size={14}/> GSTIN Verified</p>
                      <p className="text-xs text-[#172033] mt-1 font-semibold">{formData.companyName || 'Verified Legal Name Pvt Ltd'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-[#172033]">Enter PAN *</label>
                  <div className="flex gap-2">
                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} maxLength={10} className="input-b2b flex-1 uppercase" placeholder="ABCDE1234F" />
                    <button type="button" onClick={handleVerifyPan} disabled={panVerified || loading} className={`px-4 rounded-lg text-xs font-bold text-white ${panVerified ? 'bg-[#16A34A]' : 'bg-[#0B1F3A]'}`}>
                      {loading ? 'Verifying...' : panVerified ? 'Verified ✓' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: BANK */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">Bank Account</h3>
                  <p className="text-sm text-[#667085] mt-1">For receiving automated payouts.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">Account Number *</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="input-b2b w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">IFSC Code *</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="input-b2b w-full uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="input-b2b w-full bg-[#F8FAFC]" readOnly />
                  </div>
                </div>
                <button type="button" onClick={handleVerifyBank} disabled={bankVerified || loading} className={`w-full h-12 rounded-lg text-sm font-bold text-white transition-all ${bankVerified ? 'bg-[#16A34A]' : 'bg-[#0B1F3A] hover:bg-[#102A43]'}`}>
                  {loading ? 'Verifying Bank (Penny Drop)...' : bankVerified ? '✓ Bank Account Verified' : 'Verify Bank Account'}
                </button>
              </div>
            )}

            {/* STEP 7 & 8: WAREHOUSE, DOCS & REVIEW */}
            {currentStep >= 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#172033]">{currentStep === 7 ? 'Primary Warehouse' : 'Review & Submit'}</h3>
                </div>
                {currentStep === 7 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-semibold mb-1.5">Warehouse Name</label>
                         <input type="text" name="warehouseName" value={formData.warehouseName} onChange={handleChange} className="input-b2b w-full" />
                      </div>
                      <div>
                         <label className="block text-xs font-semibold mb-1.5">Pincode</label>
                         <input type="text" name="warehousePincode" value={formData.warehousePincode} onChange={handleChange} className="input-b2b w-full" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border border-[#E4E7EC] rounded-xl flex items-center justify-between bg-[#F8FAFC]">
                      <div>
                        <p className="text-sm font-bold text-[#172033]">KYC Documents</p>
                        <p className="text-xs text-[#667085]">Upload GST, PAN, and Bank proof in dashboard later.</p>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">PENDING</span>
                    </div>
                    <div className="p-4 border border-[#E4E7EC] rounded-xl flex justify-between bg-[#F8FAFC]">
                      <div>
                        <p className="text-sm font-bold text-[#172033]">Account Status</p>
                        <p className="text-xs text-[#667085]">Ready for admin review</p>
                      </div>
                      <CheckCircle2 size={20} className="text-[#16A34A]" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {currentStep > 1 && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-[#E4E7EC]">
                <button type="button" onClick={prevStep} className="btn-secondary flex-1">Back</button>
                {currentStep < 8 ? (
                  <button type="button" onClick={nextStep} className="btn-primary flex-1">Continue <ArrowRight size={16} /></button>
                ) : (
                  <button type="button" onClick={handleSubmitFinal} disabled={loading} className="btn-primary flex-[2]">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
                  </button>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
