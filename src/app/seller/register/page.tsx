"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, ShieldCheck, ArrowRight, Sparkles, Zap, Globe, Star,
  Eye, EyeOff, CheckCircle, Building2, Loader2, BadgeCheck
} from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const BENEFITS = [
  { icon: Globe, title: 'Reach 50L+ B2B Buyers', desc: 'Pan-India network of industrial buyers' },
  { icon: Zap, title: 'Net-7 Fast Payouts', desc: 'Escrow-protected automated settlements' },
  { icon: BadgeCheck, title: 'GST-Compliant Invoicing', desc: 'Auto-generate ITC-eligible B2B invoices' },
  { icon: Star, title: 'Premium Seller Analytics', desc: 'AI-powered insights & demand forecasting' },
];

function FloatingInput({
  label, name, value, onChange, type = 'text', required = false, disabled = false,
  suffix, mono = false, placeholder = ''
}: {
  label: string; name: string; value: string; onChange: (e: any) => void;
  type?: string; required?: boolean; disabled?: boolean; suffix?: React.ReactNode; mono?: boolean; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const hasValue = value && value.length > 0;
  const isPassword = type === 'password';
  return (
    <div className="relative">
      <input
        type={isPassword && showPw ? 'text' : type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        placeholder={focused ? placeholder : ' '}
        className={`peer w-full px-4 pt-6 pb-2 border rounded-2xl text-sm bg-white/5 text-white transition-all duration-200 outline-none backdrop-blur-sm
          ${mono ? 'font-mono tracking-wider uppercase' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${focused ? 'border-violet-500/80 shadow-lg shadow-violet-500/10 bg-white/8' : (hasValue ? 'border-white/20' : 'border-white/10')}
          ${suffix ? 'pr-32' : ''}
        `}
      />
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${(focused || hasValue) ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-violet-400' : 'top-4 text-sm text-white/30'}
      `}>
        {label}
      </label>
      {isPassword && (
        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      {suffix && <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

export default function SellerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    country: 'India', contactEmail: '', password: '', firstName: '', lastName: '',
    companyName: '', contactPhone: '', businessType: 'RETAILER', gstin: '', panNumber: '',
  });

  const [agreement, setAgreement] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderVerified, setSliderVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebasePhoneToken, setFirebasePhoneToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sliderVerified) return;
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val === 100) {
      setSliderVerified(true);
      if (formData.contactEmail) handleSendOtp('EMAIL');
      if (formData.contactPhone) handleSendOtp('PHONE');
    }
  };

  const handleSendOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? formData.contactEmail : formData.contactPhone;
    if (!target) return;
    setOtpMessage({ type: '', text: '' });
    if (type === 'PHONE') {
      try {
        const formattedPhone = target.startsWith('+91') ? target : `+91${target}`;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
        setConfirmationResult(confirmation);
        setPhoneOtpSent(true);
      } catch (err: any) {
        setOtpMessage({ type: 'error', text: 'Firebase error: ' + err.message });
      }
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type })
      });
      const data = await res.json();
      if (data.success) { setEmailOtpSent(true); }
      else { setOtpMessage({ type: 'error', text: data.message || 'Failed to send OTP' }); }
    } catch { setOtpMessage({ type: 'error', text: 'Error sending OTP' }); }
  };

  const handleVerifyOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? formData.contactEmail : formData.contactPhone;
    const otp = type === 'EMAIL' ? emailOtp : phoneOtp;
    if (!otp) { setOtpMessage({ type: 'error', text: 'Please enter the OTP' }); return; }
    if (type === 'PHONE' && confirmationResult) {
      try {
        const result = await confirmationResult.confirm(otp);
        const token = await result.user.getIdToken();
        setFirebasePhoneToken(token);
        setPhoneVerified(true);
      } catch { setOtpMessage({ type: 'error', text: 'Invalid Firebase OTP' }); }
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type, otp })
      });
      const data = await res.json();
      if (data.success) { setEmailVerified(true); }
      else { setOtpMessage({ type: 'error', text: data.message || 'Invalid OTP' }); }
    } catch { setOtpMessage({ type: 'error', text: 'Error verifying OTP' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) { setError('You must agree to the Membership Agreement.'); return; }
    if (!sliderVerified) { setError('Please slide to verify.'); return; }
    setLoading(true); setError('');
    const payload = {
      ...formData,
      ownerName: `${formData.firstName} ${formData.lastName}`.trim(),
      firebasePhoneToken,
      gstin: formData.gstin || '22AAAAA0000A1Z5',
      panNumber: formData.panNumber || 'ABCDE1234F',
    };
    try {
      const res = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        router.push('/seller');
      } else { setError(data.message || 'Registration failed'); }
    } catch { setError('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const res = await fetch('http://localhost:5000/api/vendors/verify-firebase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: result.user.displayName, email: result.user.email })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        document.cookie = `seller_token=${data.token}; path=/; max-age=604800; samesite=strict`;
        router.push(data.data.onboardingStep && data.data.onboardingStep < 9 ? '/seller/onboarding' : '/seller/dashboard');
      } else { setError(data.message || 'Google registration failed'); }
    } catch (err: any) { setError(err.message || 'Error during Google registration'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#070710] flex relative overflow-hidden">
      <div id="recaptcha-container" />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-violet-700/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -right-60 w-[700px] h-[700px] bg-blue-700/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-fuchsia-700/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
      </div>

      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 relative z-10 p-12 border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/30 text-white font-black text-lg">H</div>
          <div>
            <p className="text-white font-black text-lg tracking-tight leading-none">HinchMart</p>
            <p className="text-white/30 text-xs">Seller Central</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-violet-300 text-xs font-bold uppercase tracking-wider">Enterprise B2B Platform</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Start selling<br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">globally today.</span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed">Join 2,50,000+ verified sellers on India's most advanced B2B marketplace.</p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-violet-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{b.title}</p>
                    <p className="text-white/40 text-xs">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['🧑‍💼', '👩‍💼', '👨‍💼', '🧑‍🦱'].map((e, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 border-2 border-[#070710] flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
          <p className="text-white/40 text-xs">4,200+ sellers joined this month</p>
        </div>
      </div>

      {/* RIGHT: Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-lg space-y-6">
          {/* Top links (mobile logo + sign in) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-sm">H</div>
              <span className="text-white font-black text-sm">HinchMart Seller</span>
            </div>
            <p className="text-white/30 text-sm ml-auto">
              Have an account?{' '}
              <Link href="/seller/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5">
              <h2 className="text-white text-2xl font-black tracking-tight">Create seller account</h2>
              <p className="text-white/40 text-sm mt-1">Free to join. Start listing in minutes.</p>
            </div>

            {/* Google SSO */}
            <div className="px-8 pt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all group disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {loading ? 'Please wait...' : 'Continue with Google'}
                <ArrowRight size={15} className="ml-auto text-white/30 group-hover:translate-x-0.5 group-hover:text-white/60 transition-all" />
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
              {/* Error / OTP messages */}
              <AnimatePresence>
                {(error || otpMessage.text) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`p-4 rounded-2xl text-sm font-medium border
                      ${error || otpMessage.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}
                    `}
                  >
                    {error || otpMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <FloatingInput label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>

              <FloatingInput label="Company / Store Name *" name="companyName" value={formData.companyName} onChange={handleChange} required />

              {/* Email with OTP */}
              <div className="space-y-2">
                <FloatingInput
                  label="Business Email *" name="contactEmail" value={formData.contactEmail}
                  onChange={handleChange} type="email" required disabled={emailVerified}
                  suffix={
                    emailVerified
                      ? <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20"><CheckCircle2 size={12} />Verified</span>
                      : !emailOtpSent
                        ? <button type="button" onClick={() => handleSendOtp('EMAIL')} className="px-3 py-1.5 rounded-xl bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/20 hover:bg-violet-500/30 transition-colors">Send OTP</button>
                        : <button type="button" onClick={() => handleSendOtp('EMAIL')} className="px-3 py-1.5 rounded-xl bg-white/5 text-white/40 text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors">Resend</button>
                  }
                />
                <AnimatePresence>
                  {emailOtpSent && !emailVerified && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2">
                      <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="Enter 6-digit OTP"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-mono tracking-widest outline-none focus:border-violet-500/80 placeholder-white/20" />
                      <button type="button" onClick={() => handleVerifyOtp('EMAIL')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs font-bold hover:from-violet-500 hover:to-purple-500 transition-all">
                        Verify
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <FloatingInput label="Password *" name="password" value={formData.password} onChange={handleChange} type="password" required />

              {/* Phone with OTP */}
              <div className="space-y-2">
                <div className="flex gap-2 items-stretch">
                  <div className="flex items-center px-4 rounded-2xl border border-white/10 bg-white/5 text-white/50 text-sm font-mono flex-shrink-0">+91</div>
                  <FloatingInput
                    label="Mobile Number *" name="contactPhone" value={formData.contactPhone}
                    onChange={handleChange} type="tel" required disabled={phoneVerified}
                    suffix={
                      phoneVerified
                        ? <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20"><CheckCircle2 size={12} />Verified</span>
                        : !phoneOtpSent
                          ? <button type="button" onClick={() => handleSendOtp('PHONE')} className="px-3 py-1.5 rounded-xl bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/20 hover:bg-violet-500/30 transition-colors">Send OTP</button>
                          : <button type="button" onClick={() => handleSendOtp('PHONE')} className="px-3 py-1.5 rounded-xl bg-white/5 text-white/40 text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors">Resend</button>
                    }
                  />
                </div>
                <AnimatePresence>
                  {phoneOtpSent && !phoneVerified && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2">
                      <input type="text" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} placeholder="Enter SMS OTP"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-mono tracking-widest outline-none focus:border-violet-500/80 placeholder-white/20" />
                      <button type="button" onClick={() => handleVerifyOtp('PHONE')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs font-bold hover:from-violet-500 hover:to-purple-500 transition-all">
                        Verify
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Business type */}
              <div className="relative">
                <label className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-violet-400 z-10">Business Type *</label>
                <select name="businessType" value={formData.businessType} onChange={handleChange}
                  className="w-full px-4 pt-6 pb-2 border border-white/10 rounded-2xl text-white text-sm bg-white/5 outline-none focus:border-violet-500/80 focus:bg-white/8 appearance-none transition-all">
                  <option value="RETAILER" className="bg-[#0d0d1a]">Retailer / Dealer</option>
                  <option value="WHOLESALER" className="bg-[#0d0d1a]">Wholesaler / Distributor</option>
                  <option value="MANUFACTURER" className="bg-[#0d0d1a]">Manufacturer / OEM</option>
                  <option value="RENTAL_PROVIDER" className="bg-[#0d0d1a]">Rental & Service Provider</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 rotate-90 pointer-events-none" />
              </div>

              {/* Slider Captcha */}
              <div>
                <div className={`relative h-12 w-full rounded-2xl border overflow-hidden transition-all ${sliderVerified ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                  {!sliderVerified && (
                    <>
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500/30 to-blue-500/30 transition-all duration-75 rounded-2xl" style={{ width: `${sliderValue}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-medium select-none pointer-events-none">Slide right to verify →</span>
                      <input type="range" min="0" max="100" value={sliderValue} onChange={handleSliderChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
                      <div className="absolute top-1 bottom-1 w-10 flex items-center justify-center bg-white/10 rounded-xl border border-white/20 pointer-events-none transition-all"
                        style={{ left: `calc(${sliderValue}% - ${Math.round(sliderValue / 100 * 40)}px)` }}>
                        <ChevronRight size={14} className="text-white/60" />
                      </div>
                    </>
                  )}
                  {sliderVerified && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck size={18} /> Verified — You're human!
                    </div>
                  )}
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${agreement ? 'bg-violet-600 border-violet-600' : 'border-white/20 group-hover:border-white/40'}`}
                  onClick={() => setAgreement(v => !v)}>
                  {agreement && <CheckCircle size={12} className="text-white" />}
                </div>
                <input type="checkbox" checked={agreement} onChange={e => setAgreement(e.target.checked)} className="hidden" />
                <p className="text-white/30 text-xs leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Free Membership Agreement</a>,{' '}
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Use</a>, and{' '}
                  <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</a> of HinchMart.
                </p>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading || !sliderVerified}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating your account...</>
                ) : (
                  <>Agree & Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/20 text-xs">
            Protected by enterprise-grade SSL · SOC 2 Compliant · ISO 27001
          </p>
        </div>
      </div>
    </div>
  );
}
