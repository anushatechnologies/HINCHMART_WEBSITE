'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, TrendingUp, ShoppingBag, Crown, Zap, Sparkles, Medal, History as HistoryIcon } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: 'text-amber-700', bg: 'bg-gradient-to-br from-amber-100 to-amber-200', border: 'border-amber-300', icon: '🥉' },
  { name: 'Silver', min: 1000, max: 4999, color: 'text-slate-600', bg: 'bg-gradient-to-br from-slate-100 to-slate-200', border: 'border-slate-300', icon: '🥈' },
  { name: 'Gold', min: 5000, max: 19999, color: 'text-yellow-700', bg: 'bg-gradient-to-br from-yellow-100 to-yellow-300', border: 'border-yellow-400', icon: '🥇' },
  { name: 'Platinum', min: 20000, max: Infinity, color: 'text-blue-700', bg: 'bg-gradient-to-br from-blue-100 to-blue-300', border: 'border-blue-400', icon: '💎' },
];

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any>({ balance: 0, totalEarned: 0, totalRedeemed: 0, walletValue: '0', history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/api/rewards`, { headers: { Authorization: `Bearer ${token}` } });
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.data) setRewards(data.data);
        }
      } catch (e) { 
        console.error(e); 
      }
      setLoading(false);
    };
    fetch_data();
  }, []);

  const currentTier = TIERS.find(t => rewards.totalEarned >= t.min && rewards.totalEarned <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier ? Math.min(100, ((rewards.totalEarned - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Rewards & Loyalty</h1>
          <p className="text-slate-500 font-medium">Earn points on purchases and redeem them for exclusive benefits.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* VIP Tier Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className={`${currentTier.bg} rounded-3xl border-2 ${currentTier.border} p-8 text-center relative overflow-hidden shadow-lg transform transition-transform hover:-translate-y-1 duration-500`}>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>
            
            <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-300 inline-block">
              {currentTier.icon}
            </div>

            <span className="text-[11px] font-black tracking-widest uppercase text-slate-500 bg-white/60 px-3 py-1 rounded-full border border-white/40 shadow-sm mb-2 inline-block">
              Current Tier
            </span>

            <h2 className={`text-3xl font-black ${currentTier.color} mb-6 tracking-tight flex items-center justify-center gap-2`}>
              {currentTier.name} Member
            </h2>

            {nextTier ? (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                  <span>Progress to {nextTier.name}</span>
                  <span>{rewards.totalEarned} / {nextTier.min} pts</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300/50">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${progressToNext}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-2">
                  Earn <span className="font-bold text-slate-700">{(nextTier.min - rewards.totalEarned).toLocaleString()} more points</span> to unlock {nextTier.name} perks!
                </p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
                <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <Crown size={14} /> You have achieved the highest tier!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Balance & Stats Cards */}
        <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-white">{rewards.balance.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-orange-400">
                  <Crown size={24} />
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 w-fit">
                <Zap size={13} className="text-orange-400" /> Equivalent to <span className="font-bold text-white">₹{rewards.walletValue}</span> in store credit
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-semibold">100 Points = ₹10 Credit</span>
              <Link 
                href="/search" 
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95"
              >
                Use Points
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-6 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} /> Points Activity Summary
              </h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Lifetime Earned</p>
                      <p className="text-lg font-black text-slate-900">+{rewards.totalEarned.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Total Redeemed</p>
                      <p className="text-lg font-black text-slate-900">-{rewards.totalRedeemed.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-medium">Points expire 12 months after date of issuance.</p>
            </div>
          </div>

        </motion.div>
      </div>

      {/* How to Earn Points Cards */}
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
          <Medal className="text-amber-500" size={20} /> Ways to Earn Points
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-center items-center text-center group hover:bg-blue-600 hover:text-white transition-colors">
            <ShoppingBag size={24} className="text-blue-500 mb-3 group-hover:text-blue-200 transition-colors" />
            <span className="font-bold text-sm mb-1">Make a Purchase</span>
            <span className="font-black text-blue-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">10 pts / ₹100 Spent</span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center group hover:bg-emerald-600 hover:text-white transition-colors">
            <Sparkles size={24} className="text-emerald-500 mb-3 group-hover:text-emerald-200 transition-colors" />
            <span className="font-bold text-sm mb-1">Product Reviews</span>
            <span className="font-black text-emerald-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">50 pts / Item</span>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col justify-center items-center text-center group hover:bg-purple-600 hover:text-white transition-colors">
            <Gift size={24} className="text-purple-500 mb-3 group-hover:text-purple-200 transition-colors" />
            <span className="font-bold text-sm mb-1">Referrals</span>
            <span className="font-black text-purple-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">200 pts / Friend</span>
          </div>
        </div>
      </motion.div>

      {/* Points History Ledger */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col relative">
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <HistoryIcon className="text-blue-500" size={20} /> Rewards Ledger
          </h3>
        </div>
        
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Rewards...</p>
            </div>
          ) : rewards.history && rewards.history.length > 0 ? (
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {rewards.history.map((item: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    className="p-5 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors group"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm group-hover:scale-105 transition-transform ${
                      item.type === 'EARNED' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-orange-50 text-orange-500 border-orange-100'
                    }`}>
                      {item.type === 'EARNED' ? <TrendingUp size={24} /> : <ShoppingBag size={24} />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm sm:text-base mb-1 tracking-tight">{item.reason}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className={`font-black text-lg sm:text-xl tracking-tight ${item.type === 'EARNED' ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {item.type === 'EARNED' ? '+' : '-'}{item.points.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Points
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-orange-500/5 rounded-3xl animate-pulse"></div>
                <Gift size={40} className="text-slate-300 relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Points Yet</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-sm">You haven't earned any reward points yet. Start shopping to earn points that can be redeemed for store credit.</p>
              <Link 
                href="/search" 
                className="bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
              >
                Shop to Earn
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
