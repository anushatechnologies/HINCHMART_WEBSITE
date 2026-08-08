"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (element: any, index: number) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');
    
    if (otpString.length < 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
      const res = await fetch(`${apiUrl}/api/vendors/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpString, contactEmail: 'test@example.com' }) // Hardcoded for MVP flow
      });

      const data = await res.json();
      
      if (data.success) {
        // In a real app, this might log them in or finalize registration
        router.push('/seller/login');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
            <ShieldCheck size={28} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Verify your identity
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We've sent a 6-digit code to your email and phone number.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => {
                return (
                  <input
                    className="w-12 h-14 text-center text-2xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    type="text"
                    name="otp"
                    maxLength={1}
                    key={index}
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onFocus={e => e.target.select()}
                  />
                );
              })}
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center font-medium bg-red-50 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-slate-600">
                Didn't receive the code?{' '}
                <button type="button" className="font-medium text-red-600 hover:text-red-500">
                  Resend it
                </button>
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-200 mt-6 text-center">
              <Link href="/seller/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
                Back to Login <ArrowRight size={14} />
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
