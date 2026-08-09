'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Mail, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        router.push('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reset password. Server error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('/grid.svg')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">Create New Password</h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-600">
          Enter the token sent to your email and your new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-white">
          
          {error && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 text-sm font-bold rounded-xl text-center backdrop-blur-sm animate-in fade-in zoom-in-95">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reset Token</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound size={18} className="text-slate-400" /></div>
                <input type="text" required value={token} onChange={e => setToken(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono tracking-widest font-bold shadow-sm bg-white/50 uppercase" placeholder="ABC123XYZ" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm bg-white/50" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all hover:-translate-y-0.5">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Set New Password'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
