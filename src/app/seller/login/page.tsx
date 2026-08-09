"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, Check, Phone, Mail, Sparkles, Building2, Package, CheckCircle2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SellerLogin() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  
  // Password Mode State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP Mode State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Scenario B Link State
  const [requireOtpLink, setRequireOtpLink] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkMaskedPhone, setLinkMaskedPhone] = useState('');
  const [pendingGoogleToken, setPendingGoogleToken] = useState('');

  const storeSessionAndRedirect = (accessToken: string, refreshToken: string, info: any) => {
    localStorage.setItem('seller_token', accessToken);
    localStorage.setItem('seller_refresh_token', refreshToken);
    localStorage.setItem('seller_info', JSON.stringify(info));

    document.cookie = `seller_token=${accessToken}; path=/; max-age=900; samesite=lax;`;
    document.cookie = `seller_refresh_token=${refreshToken}; path=/; max-age=604800; samesite=lax;`;
    document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(info))}; path=/; max-age=604800; samesite=lax;`;

    window.dispatchEvent(new Event('seller_info_updated'));
    router.push('/seller/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/seller/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && (data.accessToken || data.token)) {
         const sellerData = data.data;
         const token = data.accessToken || data.token;
         localStorage.setItem('seller_token', token);
         localStorage.setItem('seller_refresh_token', data.refreshToken);
         localStorage.setItem('seller_info', JSON.stringify(sellerData));
         document.cookie = `seller_token=${token}; path=/; max-age=900; samesite=lax;`;
         document.cookie = `seller_refresh_token=${data.refreshToken}; path=/; max-age=604800; samesite=lax;`;
         document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(sellerData))}; path=/; max-age=604800; samesite=lax;`;
         
         window.dispatchEvent(new Event('seller_info_updated'));

         if (sellerData.kycStatus === 'NOT_STARTED' || sellerData.onboardingStep < 8) {
            router.push('/seller/register');
         } else {
            router.push('/seller/dashboard');
         }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { setError('Recaptcha expired. Please try again.'); }
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${phone}`;
      const confirmResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setOtpValues(['', '', '', '', '', '']);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      if (!confirmationResult) throw new Error('No OTP session found.');
      const result = await confirmationResult.confirm(enteredOtp);
      const idToken = await result.user.getIdToken();
      
      const res = await fetch('/api/seller/auth/verify-firebase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken, phone: result.user.phoneNumber })
      });
      const data = await res.json();
      
      if (data.success) {
         const sellerData = data.data;
         localStorage.setItem('seller_token', data.accessToken);
         localStorage.setItem('seller_refresh_token', data.refreshToken);
         localStorage.setItem('seller_info', JSON.stringify(sellerData));
         document.cookie = `seller_token=${data.accessToken}; path=/; max-age=900; samesite=lax;`;
         document.cookie = `seller_refresh_token=${data.refreshToken}; path=/; max-age=604800; samesite=lax;`;
         document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(sellerData))}; path=/; max-age=604800; samesite=lax;`;
         
         window.dispatchEvent(new Event('seller_info_updated'));

         if (sellerData.kycStatus === 'NOT_STARTED' || sellerData.onboardingStep < 8) {
            router.push('/seller/register');
         } else {
            router.push('/seller/dashboard');
         }
      } else {
         throw new Error(data.message || 'Failed to authenticate on backend');
      }
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Invalid OTP');
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
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await fetch('/api/seller/auth/verify-firebase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken, email: result.user.email, name: result.user.displayName })
      });
      const data = await res.json();
      
      if (data.success) {
         const sellerData = data.data;
         localStorage.setItem('seller_token', data.accessToken);
         localStorage.setItem('seller_refresh_token', data.refreshToken);
         localStorage.setItem('seller_info', JSON.stringify(sellerData));
         document.cookie = `seller_token=${data.accessToken}; path=/; max-age=900; samesite=lax;`;
         document.cookie = `seller_refresh_token=${data.refreshToken}; path=/; max-age=604800; samesite=lax;`;
         document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(sellerData))}; path=/; max-age=604800; samesite=lax;`;
         
         window.dispatchEvent(new Event('seller_info_updated'));

         if (sellerData.kycStatus === 'NOT_STARTED' || sellerData.onboardingStep < 8) {
            router.push('/seller/register');
         } else {
            router.push('/seller/dashboard');
         }
      } else if (data.requireOtpLink) {
         setRequireOtpLink(true);
         setLinkEmail(data.email);
         setLinkMaskedPhone(data.maskedPhone);
         setPendingGoogleToken(idToken);
      } else {
         throw new Error(data.message || 'Failed to authenticate on backend');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${phone}`;
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

  const handleVerifyLinkOtp = async () => {
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      if (!confirmationResult) throw new Error('No OTP session found.');
      const result = await confirmationResult.confirm(enteredOtp);
      const phoneToken = await result.user.getIdToken();
      
      const res = await fetch('/api/seller/auth/link-provider', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: pendingGoogleToken, phoneToken })
      });
      const data = await res.json();
      
      if (data.success) {
         const sellerData = data.data;
         localStorage.setItem('seller_token', data.accessToken);
         localStorage.setItem('seller_refresh_token', data.refreshToken);
         localStorage.setItem('seller_info', JSON.stringify(sellerData));
         document.cookie = `seller_token=${data.accessToken}; path=/; max-age=900; samesite=lax;`;
         document.cookie = `seller_refresh_token=${data.refreshToken}; path=/; max-age=604800; samesite=lax;`;
         document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(sellerData))}; path=/; max-age=604800; samesite=lax;`;
         
         window.dispatchEvent(new Event('seller_info_updated'));

         if (sellerData.kycStatus === 'NOT_STARTED' || sellerData.onboardingStep < 8) {
            router.push('/seller/register');
         } else {
            router.push('/seller/dashboard');
         }
      } else {
         throw new Error(data.message || 'Failed to link account');
      }
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT BRAND PANEL (DESKTOP 50% SPLIT SCREEN)
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1F3A] text-white flex-col justify-between p-12 relative overflow-hidden shrink-0">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B2C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-10">
          
          {/* Logo Pill */}
          <Link href="/seller" className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border border-white/20">
            <img src="/logo.png" alt="HinchMart" className="h-8 w-auto max-w-[130px] object-contain" />
            <span className="text-[10px] font-black uppercase text-[#FF6B2C] bg-[#FFF1EA] px-2 py-0.5 rounded tracking-wider">
              Supplier Central
            </span>
          </Link>

          {/* Headline & Value Propositions */}
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Sell More. <br />
              Grow Your Business <span className="text-[#FF6B2C]">with HinchMart</span>
            </h1>

            <div className="space-y-4 pt-2">
              {[
                'Reach B2B buyers across India',
                'Easy product listing & instant cataloging',
                'Bulk orders & RFQ direct negotiations',
                'Secure 7-day automated bank settlements',
                'Real-time business & price analytics'
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom B2B Commercial Photography Card */}
        <div className="relative z-10 mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#102A43]/80 p-2">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80"
            alt="B2B Warehouse & Logistics"
            className="w-full h-44 object-cover rounded-xl"
          />
          <div className="p-3 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Pan-India Construction & Industrial Logistics
            </span>
            <span className="text-white font-bold">28,000+ Pincodes</span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. RIGHT AUTHENTICATION CONTAINER (CENTERED 440px CARD)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        
        <div className="w-full max-w-[440px] space-y-6">

          {/* Mobile Header Logo */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <Link href="/seller" className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <img src="/logo.png" alt="HinchMart" className="h-7 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase text-[#FF6B2C] bg-[#FFF1EA] px-2 py-0.5 rounded">Supplier</span>
            </Link>
          </div>

          {/* Header Titles */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">Welcome back</h2>
            <p className="text-[#667085] text-sm font-medium mt-1">Login to your HinchMart seller account</p>
          </div>

          {/* White Login Card */}
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(16,24,40,0.08)] space-y-6">
            
            {requireOtpLink ? (
              <div className="space-y-5">
                <div className="bg-[#FFF8F1] border border-[#FFD8C4] rounded-lg p-4">
                  <h3 className="text-[#0B1F3A] font-bold text-sm mb-1">Account Found</h3>
                  <p className="text-[#667085] text-xs leading-relaxed">
                    We found an existing HinchMart seller account with the email <span className="font-semibold">{linkEmail}</span>.
                    To securely connect your Google account: <span className="font-bold text-[#FF6B2C]">Verify Mobile OTP</span>
                  </p>
                </div>
                
                {!otpSent ? (
                  <form onSubmit={handleSendLinkOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#172033] mb-1.5">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] font-medium">+91</span>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder={`Enter mobile ending in ${linkMaskedPhone.slice(-4)}`}
                          maxLength={10}
                          className="input-b2b pl-12"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="btn-primary w-full h-[46px]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRequireOtpLink(false); setPhone(''); setOtpSent(false); }}
                      className="w-full text-center text-xs font-semibold text-[#667085] hover:text-[#172033]"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#172033] mb-2 text-center">
                        Enter 6-digit OTP sent to +91 {phone}
                      </label>
                      <div className="flex justify-center gap-2 sm:gap-3">
                        {otpValues.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-input-${i}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpInput(i, e.target.value)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white border border-[#D0D5DD] rounded-xl focus:border-[#FF6B2C] focus:ring-4 focus:ring-[#FF6B2C]/10 outline-none transition-all"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyLinkOtp}
                      disabled={loading || otpValues.join('').length !== 6}
                      className="btn-primary w-full h-[46px]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Link Account'}
                    </button>
                  </div>
                )}
                <div id="recaptcha-container" className="hidden"></div>
              </div>
            ) : (
              <>
                {/* Mode Switcher Tabs */}
                <div className="flex border-b border-[#E4E7EC]">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('PASSWORD'); setError(''); }}
                    className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                      authMode === 'PASSWORD'
                        ? 'border-[#FF6B2C] text-[#0B1F3A] font-bold'
                        : 'border-transparent text-[#667085] hover:text-[#172033]'
                    }`}
                  >
                    Email & Password
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('OTP'); setError(''); }}
                    className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                      authMode === 'OTP'
                        ? 'border-[#FF6B2C] text-[#0B1F3A] font-bold'
                        : 'border-transparent text-[#667085] hover:text-[#172033]'
                    }`}
                  >
                    Mobile OTP
                  </button>
                </div>

            {/* Error Notification Toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-lg text-xs font-semibold bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── MODE 1: EMAIL & PASSWORD FORM ── */}
            {authMode === 'PASSWORD' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#172033] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input-b2b"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-[#172033]">
                      Password *
                    </label>
                    <Link href="/seller/forgot-password" className="text-xs font-semibold text-[#2563EB] hover:underline">
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-b2b pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#172033]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Logging in...</>
                  ) : (
                    'LOGIN'
                  )}
                </button>
              </form>
            )}

            {/* ── MODE 2: MOBILE OTP FORM ── */}
            {authMode === 'OTP' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#172033] mb-1.5">
                        Mobile Number *
                      </label>
                      <div className="flex items-center rounded-lg border border-[#D0D5DD] bg-white overflow-hidden focus-within:border-[#FF6B2C] focus-within:ring-2 focus-within:ring-[#FFF1EA]">
                        <span className="px-3 text-sm font-bold text-[#667085] border-r border-[#D0D5DD] bg-[#F8FAFC] py-3.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full px-3 text-sm text-[#172033] outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary w-full">
                      Send OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                    <div className="text-xs text-[#667085]">
                      OTP sent to <strong className="text-[#172033]">+91 {phone}</strong> via SMS
                    </div>

                    <div className="flex justify-between gap-2 py-1">
                      {otpValues.map((v, i) => (
                        <input
                          key={i}
                          id={`otp-input-${i}`}
                          type="text"
                          maxLength={1}
                          value={v}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          className="w-12 h-12 text-center text-lg font-bold border border-[#D0D5DD] rounded-lg outline-none focus:border-[#FF6B2C] focus:ring-2 focus:ring-[#FFF1EA]"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button type="button" onClick={() => setOtpSent(false)} className="text-[#2563EB] font-semibold hover:underline">
                        Change number
                      </button>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#E4E7EC]" />
              <span className="text-[#98A2B3] text-xs font-semibold">or continue with</span>
              <div className="flex-1 h-px bg-[#E4E7EC]" />
            </div>

            {/* Google SSO Button (WHITE BG + #D0D5DD BORDER) */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F8FAFC] text-[#344054] text-sm font-semibold transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            </>
            )}
          </div>

          {/* Footer Action: Create Seller Account */}
          <p className="text-center text-sm font-medium text-[#667085]">
            Don't have a seller account?{' '}
            <Link href="/seller/register" className="text-[#FF6B2C] font-bold hover:underline">
              Create Seller Account →
            </Link>
          </p>
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}
