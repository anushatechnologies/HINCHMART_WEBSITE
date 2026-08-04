'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, CheckCircle2, History } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

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
      if (data.success && data.data) setWallet(data.data);
    } catch (e) { 
      console.error(e); 
    }
    setLoading(false);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || isNaN(parseFloat(addAmount))) return;
    setIsAdding(true);
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/wallet/add-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(addAmount), description: 'Manual Wallet Top-up' }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: `₹${Number(addAmount).toLocaleString('en-IN')} added to your wallet successfully!`, type: 'success' });
        setAddAmount('');
        fetchWallet();
        setTimeout(() => setMsg({ text: '', type: '' }), 5000);
      } else {
        setMsg({ text: data.message || 'Failed to add funds', type: 'error' });
      }
    } catch (e) { 
      setMsg({ text: 'An unexpected error occurred. Please try again.', type: 'error' }); 
    }
    setIsAdding(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Hinchmart Wallet</h1>
          <p className="text-slate-500 font-medium">Manage your store credits, refunds, and transaction history.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Balance & Quick Add */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          
          {/* Credit Card Style Balance */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-8 bg-gradient-to-r from-amber-200 to-amber-400 rounded-md opacity-80 shadow-inner"></div>
              <Wallet size={28} className="text-white/50" />
            </div>

            <div className="relative z-10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Available Balance</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-2xl font-black text-white/50">₹</span>
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                  {loading ? '---' : wallet.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">Card Holder</p>
                <p className="font-bold text-sm tracking-widest uppercase">Premium Member</p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-white/20"></div>
                <div className="w-6 h-6 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>

          {/* Top Up Box */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-2 text-lg tracking-tight">
              <Plus size={20} className="text-blue-600 bg-blue-50 rounded-lg p-0.5" /> Quick Top-Up
            </h3>
            
            <AnimatePresence>
              {msg.text && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {msg.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <ShieldCheck size={18} className="shrink-0" />}
                  {msg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[500, 1000, 2000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => setAddAmount(String(amt))}
                  className={`py-3 rounded-xl text-sm font-black transition-all border-2 ${
                    addAmount === String(amt) 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                <input 
                  type="number" 
                  value={addAmount} 
                  onChange={e => setAddAmount(e.target.value)} 
                  min="1"
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-black text-slate-900 transition-all outline-none"
                  placeholder="Enter custom amount" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isAdding || !addAmount || parseFloat(addAmount) <= 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isAdding ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowRight size={18} />}
                {isAdding ? 'Processing Securely...' : 'Add to Wallet Balance'}
              </button>
              
              <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 mt-4 uppercase tracking-widest text-center">
                <ShieldCheck size={12} /> 100% Secure Encrypted Payment
              </p>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <History className="text-blue-500" size={20} /> Transaction Ledger
              </h3>
            </div>
            
            <div className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Ledger...</p>
                </div>
              ) : wallet.transactions.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {wallet.transactions.map((tx, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={tx.id} 
                        className="p-5 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors group"
                      >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm group-hover:scale-105 transition-transform ${
                          tx.type === 'CREDIT' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {tx.type === 'CREDIT' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm sm:text-base mb-1 tracking-tight">{tx.description || (tx.type === 'CREDIT' ? 'Funds Added' : 'Payment Deducted')}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></span>
                            <span className="hidden sm:block">{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <p className={`font-black text-lg sm:text-xl tracking-tight ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {tx.type === 'CREDIT' ? 'Credit' : 'Debit'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                  <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl animate-pulse"></div>
                    <Wallet size={40} className="text-slate-300 relative z-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Transactions Yet</h3>
                  <p className="text-slate-500 font-medium mb-8 max-w-sm">Your wallet ledger is empty. Add funds using the quick top-up box to start using your wallet for lightning-fast checkouts.</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
