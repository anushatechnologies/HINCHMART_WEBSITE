'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MailCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    // Simulate API call for email verification
    setTimeout(() => {
      // In a real app: fetch(`/api/auth/verify-email?token=${token}`)
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now access all premium features.');
    }, 2000);

  }, [token]);

  return (
    <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-blue-900/5 sm:rounded-3xl border border-white text-center">
      {status === 'verifying' && (
        <div className="py-8 animate-in fade-in zoom-in-95">
          <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Verifying Email...</h3>
          <p className="text-slate-500 mt-2">Please wait while we confirm your email address.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <MailCheck size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h3>
          <p className="text-slate-600 font-medium mb-8 px-4">{message}</p>
          <Link href="/login" className="inline-flex justify-center items-center py-4 px-8 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5">
            Continue to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h3>
          <p className="text-slate-600 font-medium mb-8 px-4">{message}</p>
          <Link href="/register" className="inline-flex justify-center items-center py-4 px-8 rounded-xl shadow-md text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
            Back to Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">Email Verification</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
