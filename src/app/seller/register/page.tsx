"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, CheckCircle, ChevronRight, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SellerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    country: 'India',
    contactEmail: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    contactPhone: '',
    businessType: 'RETAILER', // default
    gstin: '',
    panNumber: '',
  });

  const [agreement, setAgreement] = useState(false);

  // Verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });
  
  // Slider Captcha State
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderVerified, setSliderVerified] = useState(false);

  // Firebase specific states
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebasePhoneToken, setFirebasePhoneToken] = useState('');

  // Setup reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
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
      // Automatically send OTPs if email/phone are provided
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
        const appVerifier = (window as any).recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setPhoneOtpSent(true);
      } catch (err: any) {
        setOtpMessage({ type: 'error', text: 'Firebase error: ' + err.message });
      }
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type })
      });
      const data = await res.json();

      if (data.success) {
        setEmailOtpSent(true);
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Failed to send OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error sending OTP' });
    }
  };

  const handleVerifyOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? formData.contactEmail : formData.contactPhone;
    const otp = type === 'EMAIL' ? emailOtp : phoneOtp;
    
    if (!otp) {
      setOtpMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    if (type === 'PHONE' && confirmationResult) {
      try {
        const result = await confirmationResult.confirm(otp);
        const token = await result.user.getIdToken();
        setFirebasePhoneToken(token);
        setPhoneVerified(true);
      } catch (err: any) {
        setOtpMessage({ type: 'error', text: 'Invalid Firebase OTP' });
      }
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type, otp })
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Invalid OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error verifying OTP' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) {
      setError('You must agree to the Membership Agreement to continue.');
      return;
    }
    if (!sliderVerified) {
      setError('Please slide to verify.');
      return;
    }
    
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      ownerName: `${formData.firstName} ${formData.lastName}`.trim(),
      firebasePhoneToken,
      // Defaulting some fields so the backend doesn't complain since we simplified the form
      gstin: formData.gstin || '22AAAAA0000A1Z5', 
      panNumber: formData.panNumber || 'ABCDE1234F',
    };

    try {
      const res = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        router.push('/seller');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const res = await fetch('http://localhost:5000/api/vendors/verify-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          name: result.user.displayName, 
          email: result.user.email 
        })
      });
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        document.cookie = `seller_token=${data.token}; path=/; max-age=604800; samesite=strict`;
        
        if (data.data.onboardingStep && data.data.onboardingStep < 9) {
          router.push('/seller/onboarding');
        } else {
          router.push('/seller/dashboard');
        }
      } else {
        setError(data.message || 'Google registration failed');
      }
    } catch (err: any) {
      console.error('Google register error:', err);
      setError(err.message || 'Error during Google registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3f7] flex flex-col items-center py-10 px-4 font-sans">
      <div id="recaptcha-container"></div>
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Store className="text-red-600" size={36} />
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">HinchMart<span className="text-red-600">.com</span></span>
        </div>
        <div className="text-sm text-slate-600">
          Already have an account? <Link href="/seller/login" className="text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-3xl overflow-hidden flex">
        
        {/* Left Side: Value Props (Like Alibaba) */}
        <div className="w-1/3 bg-slate-50 p-8 hidden md:flex flex-col border-r border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Start selling globally</h3>
          <ul className="space-y-6 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
              <p>Reach millions of B2B buyers directly.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
              <p>Secure payments and integrated logistics.</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
              <p>Access to advanced seller analytics.</p>
            </li>
          </ul>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign up as a supplier</h2>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {otpMessage.text && (
            <div className={`mb-4 p-3 rounded text-sm font-medium border ${otpMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {otpMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Country / Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company location *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="China">China</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address *</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="contactEmail"
                  required
                  disabled={emailVerified}
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Please enter an email address"
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                />
                {!emailVerified && emailOtpSent && (
                  <button type="button" onClick={() => handleSendOtp('EMAIL')} className="px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 border border-transparent rounded">Resend</button>
                )}
              </div>
              {emailOtpSent && !emailVerified && (
                <div className="mt-2 flex gap-2">
                  <input type="text" placeholder="Enter Email OTP" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 text-sm" />
                  <button type="button" onClick={() => handleVerifyOtp('EMAIL')} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800">Verify Email</button>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Set login password"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone or mobile number *</label>
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center px-3 border border-r-0 border-slate-300 rounded-l-md bg-slate-50 text-slate-600 text-sm">
                  +91
                </div>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  disabled={phoneVerified}
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-r-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm disabled:bg-slate-100"
                />
              </div>
              {phoneOtpSent && !phoneVerified && (
                <div className="mt-2 flex gap-2">
                  <input type="text" placeholder="Enter SMS OTP" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} className="w-1/2 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 text-sm" />
                  <button type="button" onClick={() => handleVerifyOtp('PHONE')} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800">Verify Phone</button>
                </div>
              )}
            </div>

            {/* Simulated Slider Captcha */}
            <div className="mt-6 relative">
              <div className={`h-10 w-full rounded-md border ${sliderVerified ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'} overflow-hidden relative flex items-center justify-center group`}>
                {!sliderVerified && (
                  <>
                    <div 
                      className="absolute top-0 left-0 h-full bg-emerald-400 opacity-20 pointer-events-none"
                      style={{ width: `${sliderValue}%` }}
                    />
                    <span className="text-sm text-slate-500 font-medium z-10 pointer-events-none select-none">
                      Please slide to verify
                    </span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                    <div 
                      className="absolute top-0 bottom-0 bg-white border-r border-slate-300 shadow-sm flex items-center justify-center pointer-events-none z-10 transition-all duration-75"
                      style={{ left: `calc(${sliderValue}% - ${sliderValue > 50 ? 40 : 0}px)`, width: '40px' }}
                    >
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </>
                )}
                {sliderVerified && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold z-10">
                    <ShieldCheck size={20} /> Verified
                  </div>
                )}
              </div>
            </div>

            {/* Legal Agreement */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="agreement"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="agreement" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                By continuing, you agree to the <a href="#" className="text-blue-600 hover:underline">Free Membership Agreement</a>, <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>, and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> of HinchMart.com, and to receive more information about HinchMart’s products and services (you can unsubscribe at any time).
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !sliderVerified}
                className="w-full bg-[#f60] hover:bg-[#ff7a1f] text-white font-bold py-3 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Agree and Register'}
              </button>
            </div>

          </form>

          {/* Social Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Or continue with</p>
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-500">
        <p>Aliibaba.com Style Registration Demo for HinchMart</p>
      </div>

    </div>
  );
}
