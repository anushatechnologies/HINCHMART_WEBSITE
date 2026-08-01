'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const API = 'http://localhost:5000';

export default function WalletPage() {
  const [wallet, setWallet] = useState<{ balance: number; transactions: any[] }>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setWallet(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || isNaN(parseFloat(addAmount))) return;
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/wallet/add-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(addAmount), description: 'Manual Top-up' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: `₹${addAmount} added to your wallet!`, type: 'success' });
        setAddAmount('');
        fetchWallet();
      } else {
        setMsg({ text: data.message, type: 'error' });
      }
    } catch (e) { setMsg({ text: 'An error occurred.', type: 'error' }); }
    setIsAdding(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">My Wallet</h1>
      <p className="text-slate-500 mb-8">Manage your HinchMart store credits and transaction history.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2 relative z-10">Current Balance</p>
            <p className="text-4xl font-black mb-4 relative z-10">{loading ? '...' : `₹${wallet.balance.toLocaleString('en-IN')}`}</p>
            <p className="text-blue-200 text-sm font-medium relative z-10">HinchMart Store Credits</p>
          </div>

          {/* Quick Add */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-600" /> Add Funds</h3>
            {msg.text && (
              <div className={`mb-4 p-3 rounded-xl font-bold text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {msg.text}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[500, 1000, 2000].map(amt => (
                <button key={amt} onClick={() => setAddAmount(String(amt))}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${addAmount === String(amt) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'}`}>
                  ₹{amt}
                </button>
              ))}
            </div>
            <form onSubmit={handleAddFunds}>
              <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} min="1"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-900 mb-4"
                placeholder="Enter custom amount" />
              <button type="submit" disabled={isAdding || !addAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50">
                {isAdding ? 'Processing...' : 'Add to Wallet'}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-extrabold text-slate-900">Transaction History</h3>
            </div>
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
            ) : wallet.transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {wallet.transactions.map(tx => (
                  <div key={tx.id} className="p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {tx.type === 'CREDIT' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{tx.description}</p>
                      <p className="text-xs font-medium text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className={`font-black text-base ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <Wallet size={64} className="text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Yet</h3>
                <p className="text-slate-500 mb-6">Add funds to start using your wallet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
