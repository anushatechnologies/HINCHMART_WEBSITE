"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, ArrowRight } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SellerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        document.cookie = `seller_token=${data.token}; path=/; max-age=604800; samesite=strict`;
        router.push('/seller/dashboard');
      } else {
        setError(data.message || 'Login failed');
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
        router.push('/seller/dashboard');
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Error during Google signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
            <Store className="text-white" size={32} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Seller Central
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Manage your products, view orders, and grow your B2B business.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  placeholder="vendor@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/seller/forgot-password" className="font-medium text-slate-600 hover:text-slate-900">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in to Seller Central'}
              </button>
            </div>
          </form>

            <div className="mt-6">
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

            <div className="mt-6">
              <Link
                href="/seller/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-slate-200 rounded-lg shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Register as a Vendor <ArrowRight size={16} />
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
