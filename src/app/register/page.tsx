'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Loader2, Apple, Briefcase, CheckCircle } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });
  
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

  const handleSendOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? email : phone;
    if (!target) {
      setOtpMessage({ type: 'error', text: `Please enter your ${type.toLowerCase()} first.` });
      return;
    }
    setOtpMessage({ type: '', text: '' });

    if (type === 'PHONE') {
      try {
        const formattedPhone = target.startsWith('+91') ? target : `+91${target}`;
        const appVerifier = (window as any).recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setPhoneOtpSent(true);
        setOtpMessage({ type: 'success', text: 'SMS sent to ' + formattedPhone });
      } catch (err: any) {
        setOtpMessage({ type: 'error', text: 'Firebase error: ' + err.message });
      }
      return;
    }
    
    // EMAIL OTP logic (AWS SES mock in backend)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type })
      });
      const data = await res.json();

      if (data.success) {
        setEmailOtpSent(true);
        console.log(`MOCK OTP for EMAIL:`, data.mockOtp);
        setOtpMessage({ type: 'success', text: `OTP sent to ${target}` });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Failed to send OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error sending OTP' });
    }
  };

  const handleVerifyOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? email : phone;
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
        setOtpMessage({ type: 'success', text: 'Phone verified successfully!' });
      } catch (err: any) {
        setOtpMessage({ type: 'error', text: 'Invalid Firebase OTP' });
      }
      return;
    }

    // Email Verify via Backend
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type, otp })
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerified(true);
        setOtpMessage({ type: 'success', text: `Email verified successfully!` });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Invalid OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error verifying OTP' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!emailVerified && !phoneVerified) {
       return setError('You must verify either your email or phone number to register.');
    }
    
    if (phone.length !== 10) return setError('Phone number must be exactly 10 digits.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (!businessName.trim()) return setError('Business Name is required.');

    setLoading(true);
    try {
      // NOTE: We're passing the firebase token if phone was verified.
      // If we used a pure Firebase backend like verifyFirebaseToken, we'd hit that.
      // But we built a custom register endpoint that takes normal fields.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, businessName })
      });
      const data = await res.json();
      
      if (data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));

        // Sync Guest Cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length > 0) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/cart/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ items: guestCart })
            });
            localStorage.removeItem('guestCart');
            window.dispatchEvent(new Event('cart-updated'));
          } catch (e) {}
        }
        
        router.push('/');
        router.refresh();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        setLoading(true);
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
        // Post to backend to verify and create user
        const res = await fetch(`${apiUrl}/api/auth/verify-firebase`, {
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
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('userToken', data.data.token);
          localStorage.setItem('userData', JSON.stringify(data.data.user));
          
          // Sync Guest Cart
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          if (guestCart.length > 0) {
            try {
              await fetch(`${apiUrl}/api/cart/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.data.token}` },
                body: JSON.stringify({ items: guestCart })
              });
              localStorage.removeItem('guestCart');
              window.dispatchEvent(new Event('cart-updated'));
            } catch (e) {}
          }
          
          router.push('/');
          router.refresh();
        } else {
          setError(data.message || 'Google signup failed');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        setError(err.message || 'Error during Google signup');
        setLoading(false);
      }
    } else {
      alert(`Initiating ${provider} signup...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')]">
      <div id="recaptcha-container"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-600">
          Join HinchMart to unlock premium shopping features
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-white">
          
          {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center backdrop-blur-sm animate-in fade-in zoom-in-95">{error}</div>}
          
          {otpMessage.text && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-bold text-center ${otpMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {otpMessage.text}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-slate-400" /></div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>Email Address {(!phoneVerified && !emailVerified) ? '*' : ''}</span>
                {emailVerified && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Verified</span>}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                  <input type="email" required={!phoneVerified} disabled={emailVerified} value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50 disabled:bg-slate-100 disabled:text-slate-500" placeholder="you@example.com" />
                </div>
                {!emailVerified && (
                  <button type="button" onClick={() => handleSendOtp('EMAIL')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">
                    {emailOtpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
              </div>
              {emailOtpSent && !emailVerified && (
                <div className="mt-2 flex gap-2">
                  <input type="text" placeholder="Enter OTP" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-slate-50" />
                  <button type="button" onClick={() => handleVerifyOtp('EMAIL')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">Verify</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>Phone Number {(!emailVerified && !phoneVerified) ? '*' : ''}</span>
                {phoneVerified && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Verified</span>}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone size={18} className="text-slate-400" /></div>
                  <input type="text" required={!emailVerified} disabled={phoneVerified} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50 disabled:bg-slate-100 disabled:text-slate-500" placeholder="10-digit mobile number" />
                </div>
                {!phoneVerified && (
                  <button type="button" onClick={() => handleSendOtp('PHONE')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">
                    {phoneOtpSent ? 'Resend' : 'Send OTP'}
                  </button>
                )}
              </div>
              {phoneOtpSent && !phoneVerified && (
                <div className="mt-2 flex gap-2">
                  <input type="text" placeholder="Enter SMS OTP" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} className="block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-slate-50" />
                  <button type="button" onClick={() => handleVerifyOtp('PHONE')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">Verify</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Briefcase size={18} className="text-slate-400" /></div>
                <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="Your Company Name" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading || (!emailVerified && !phoneVerified)} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
                {loading ? <Loader2 size={18} className="animate-spin" /> : (!emailVerified && !phoneVerified ? 'Verify Email or Phone to Register' : 'Create Account')}
              </button>
            </div>
          </form>

          {/* Social Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Or register with</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSocialLogin('Google')} className="flex justify-center items-center py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                <span className="text-sm font-bold text-slate-700">Google</span>
              </button>
              <button onClick={() => handleSocialLogin('Apple')} className="flex justify-center items-center py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm gap-2">
                <Apple size={20} className="text-slate-900" />
                <span className="text-sm font-bold text-slate-700">Apple</span>
              </button>
            </div>
          </div>

        </div>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-extrabold text-blue-600 hover:text-blue-700 hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
