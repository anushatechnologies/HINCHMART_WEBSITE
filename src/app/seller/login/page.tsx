"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, Sparkles, Zap, BarChart3, Package } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function FloatingInput({
  label, value, onChange, type = 'text', name, required = false
}: {
  label: string; value: string; onChange: (e: any) => void; type?: string; name: string; required?: boolean;
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
        placeholder=" "
        className={`peer w-full px-4 pt-6 pb-2 border rounded-2xl text-sm bg-white/5 text-white transition-all duration-200 outline-none backdrop-blur-sm
          ${focused ? 'border-violet-500/80 shadow-lg shadow-violet-500/10 bg-white/8' : (hasValue ? 'border-white/20' : 'border-white/10')}
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
    </div>
  );
}

const STATS = [
  { icon: Package, label: 'Active Sellers', value: '2.5L+' },
  { icon: BarChart3, label: 'Monthly GMV', value: '₹480Cr' },
  { icon: Zap, label: 'Avg. Payout Time', value: '7 Days' },
];

export default function SellerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        document.cookie = `seller_token=${data.token}; path=/; max-age=604800; samesite=strict`;
        router.push('/seller/dashboard');
      } else { setError(data.message || 'Login failed'); }
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
        router.push('/seller/dashboard');
      } else { setError(data.message || 'Google login failed'); }
    } catch (err: any) { setError(err.message || 'Error during Google login'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[600px] h-[600px] bg-violet-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -right-40 w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/40 text-white font-black text-xl">H</div>
            <div className="text-left">
              <p className="text-white font-black text-xl tracking-tight leading-none">HinchMart</p>
              <p className="text-white/30 text-xs">Seller Central</p>
            </div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight">Welcome back</h1>
            <p className="text-white/40 text-sm mt-1">Sign in to your seller dashboard</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.04] border border-white/8">
                <Icon size={14} className="text-violet-400" />
                <p className="text-white font-black text-sm">{s.value}</p>
                <p className="text-white/30 text-[10px] text-center leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 space-y-4">
            {/* Google */}
            <button
              type="button" onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all group disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
              <ArrowRight size={15} className="ml-auto text-white/30 group-hover:translate-x-0.5 group-hover:text-white/60 transition-all" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="p-4 rounded-2xl text-sm font-medium border bg-red-500/10 border-red-500/20 text-red-300">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-3">
              <FloatingInput label="Business Email" name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
              <FloatingInput label="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />

              <div className="flex justify-end">
                <Link href="/seller/forgot-password" className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>

          <div className="px-8 pb-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-white/30">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>256-bit SSL encrypted</span>
            </div>
            <Link href="/seller/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Create account →
            </Link>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs">
          HinchMart Seller Central · Enterprise B2B Platform
        </p>
      </div>
    </div>
  );
}
