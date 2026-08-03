"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function LoginFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Setup reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const phoneNumber = `+91${mobile}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(3); // Go to OTP verification
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !confirmationResult) return;

    setLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Get the ID token from Firebase
      const idToken = await user.getIdToken();
      await syncWithBackend(idToken);
      
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await syncWithBackend(idToken);
    } catch (err: any) {
      console.error(err);
      setError("Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const syncWithBackend = async (idToken: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: idToken,
          name: name || undefined,
          email: email || undefined,
          referralCode: referralCode || undefined
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Save the backend JWT token
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        
        // Merge guest cart logic here later
        
        setStep(5); // Success step
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sync with server.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white p-6 text-center relative">
        <h2 className="text-2xl font-black tracking-tight mb-1">
          HINCH<span className="text-orange-500">MART</span>
        </h2>
        <p className="text-slate-400 text-xs">Join India&apos;s largest B2B platform</p>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>

        {/* STEP 1: Choose Registration Method */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-800 text-center mb-6">Create Your Account</h3>
            
            <button 
              onClick={() => setStep(2)}
              className="w-full flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold p-3.5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Phone size={16} />
              </div>
              <span className="flex-1 text-left">Continue with Mobile Number</span>
              <ArrowRight size={18} className="opacity-70" />
            </button>

            <button 
              onClick={() => setStep(2)} // For now, email will also go to mobile for OTP as primary
              className="w-full flex items-center gap-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold p-3.5 rounded-xl transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-slate-500" />
              </div>
              <span className="flex-1 text-left">Continue with Email</span>
            </button>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center gap-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold p-3.5 rounded-xl transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                <svg width="18" height="18" viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </div>
              <span className="flex-1 text-left">{loading ? 'Please wait...' : 'Continue with Google'}</span>
            </button>
          </div>
        )}

        {/* STEP 2: Mobile Number */}
        {step === 2 && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Enter Mobile Number</h3>
              <p className="text-xs text-slate-500 mt-1">We will send you a 6-digit verification code.</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 w-14 flex items-center justify-center border-r border-slate-200 text-sm font-bold text-slate-600 bg-slate-50 rounded-l-xl">
                +91
              </div>
              <input 
                type="tel" 
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Mobile Number" 
                className="w-full h-12 pl-16 pr-4 rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-medium text-slate-800 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full bg-[#1a1a2e] hover:bg-orange-500 text-white font-bold p-3.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 p-2"
            >
              Back to options
            </button>
          </form>
        )}

        {/* STEP 3: OTP Verification */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Enter OTP</h3>
              <p className="text-xs text-slate-500 mt-1">Code sent to +91 {mobile}</p>
            </div>
            
            <input 
              type="text" 
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••" 
              className="w-full h-14 text-center text-2xl tracking-[1em] font-black rounded-xl border border-slate-200 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-800 transition-all"
            />

            <button 
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#1a1a2e] hover:bg-orange-500 text-white font-bold p-3.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button 
              type="button" 
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full text-xs font-bold text-orange-600 hover:text-orange-700 p-2 text-center"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* STEP 5: Complete */}
        {step === 5 && (
          <div className="text-center space-y-5 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Welcome to HinchMart!</h3>
              <p className="text-sm text-slate-500 mt-2">Your account has been verified successfully.</p>
            </div>

            <button 
              onClick={() => router.push('/account')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3.5 rounded-xl transition-all shadow-sm hover:shadow-md mt-4"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full text-sm font-bold text-slate-600 hover:text-slate-900 p-2"
            >
              Start Shopping
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <ShieldCheck size={14} className="text-green-500" />
          Secure & Encrypted Connection
        </div>
      </div>
    </div>
  );
}
