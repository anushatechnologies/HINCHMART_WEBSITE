'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to request password reset. Server error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">Reset Password</h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-600">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-white">
          
          {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center backdrop-blur-sm animate-in fade-in zoom-in-95">{error}</div>}
          
          {success ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Mail size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Check your email</h3>
              <p className="text-sm font-medium text-slate-600 mb-8">We sent a password reset link to <br/><span className="font-bold text-slate-900">{email}</span></p>
              
              <Link href="/login" className="w-full inline-flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="you@example.com" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all hover:-translate-y-0.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

        </div>
        
        {!success && (
          <div className="mt-8 flex justify-center">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
