'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Loader2, Globe, Share2, Apple } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) return setError('Phone number must be exactly 10 digits.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
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
            await fetch('http://localhost:5000/api/cart/sync', {
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

  const handleSocialLogin = (provider: string) => {
    alert(`Initiating ${provider} signup...`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-600">
          Join HinchMart to unlock premium shopping features
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-white">
          
          {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center backdrop-blur-sm animate-in fade-in zoom-in-95">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-slate-400" /></div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone size={18} className="text-slate-400" /></div>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="10-digit mobile number" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all hover:-translate-y-0.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Social Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Or register with</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleSocialLogin('Google')} className="flex justify-center items-center py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Globe size={20} className="text-red-500" />
              </button>
              <button onClick={() => handleSocialLogin('Apple')} className="flex justify-center items-center py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Apple size={20} className="text-slate-900" />
              </button>
              <button onClick={() => handleSocialLogin('Facebook')} className="flex justify-center items-center py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Share2 size={20} className="text-blue-600" />
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
