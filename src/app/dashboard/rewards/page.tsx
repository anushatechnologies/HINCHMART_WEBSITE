'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, TrendingUp, ShoppingBag, Crown, Zap, Sparkles, Medal, History } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        const data = await res.json();
        if (data.success && data.data) setRewards(data.data);
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
            
            <div className="relative z-10">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 drop-shadow-lg"
              >
                {currentTier.icon}
              </motion.div>
              
              <div className="inline-flex items-center gap-1.5 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/50">
                <Medal size={14} className={currentTier.color} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentTier.color}`}>{currentTier.name} VIP</span>
              </div>
              
              <p className="text-5xl font-black text-slate-900 mb-1 tracking-tighter drop-shadow-sm">
                {loading ? '...' : rewards.balance.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 font-black uppercase tracking-widest mb-8">Available Points</p>
              
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/60 flex items-center justify-between group cursor-pointer hover:bg-white transition-colors">
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Store Credit Value</p>
                  <p className="text-2xl font-black text-emerald-600 tracking-tight group-hover:scale-105 transition-transform origin-left">₹{rewards.walletValue}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-inner group-hover:rotate-12 transition-transform">
                  <Sparkles size={20} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex items-center gap-5 group hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Earned</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{rewards.totalEarned.toLocaleString()} <span className="text-lg text-slate-400 font-bold">pts</span></p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex items-center gap-5 group hover:border-rose-200 transition-colors">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Redeemed</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{rewards.totalRedeemed.toLocaleString()} <span className="text-lg text-slate-400 font-bold">pts</span></p>
              </div>
            </div>
          </div>

          {/* Tier Progress Indicator */}
          {nextTier && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-lg">
                    <Crown size={20} className="text-yellow-500" /> Unlock {nextTier.name} Status
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Earn <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md mx-1">{(nextTier.min - rewards.totalEarned).toLocaleString()}</span> more points to upgrade your VIP tier.
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-sm">
                  {nextTier.icon}
                </div>
              </div>
              
              <div className="relative pt-2">
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progressToNext}%` }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm relative overflow-hidden" 
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%' }}></div>
                  </motion.div>
                </div>
                
                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className={currentTier.color}>{currentTier.name}: {currentTier.min.toLocaleString()}</span>
                  <span className={nextTier.color}>{nextTier.name}: {nextTier.min.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Earn Guide */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-2 text-lg tracking-tight">
              <Zap size={20} className="text-orange-500" /> Fast Track Your Points
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-center items-center text-center group hover:bg-blue-600 hover:text-white transition-colors">
                <ShoppingBag size={24} className="text-blue-500 mb-3 group-hover:text-blue-200 transition-colors" />
                <span className="font-bold text-sm mb-1">Shopping</span>
                <span className="font-black text-blue-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">1 pt / ₹1</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center group hover:bg-emerald-600 hover:text-white transition-colors">
                <Sparkles size={24} className="text-emerald-500 mb-3 group-hover:text-emerald-200 transition-colors" />
                <span className="font-bold text-sm mb-1">Reviews</span>
                <span className="font-black text-emerald-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">50 pts / Item</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col justify-center items-center text-center group hover:bg-purple-600 hover:text-white transition-colors">
                <Gift size={24} className="text-purple-500 mb-3 group-hover:text-purple-200 transition-colors" />
                <span className="font-bold text-sm mb-1">Referrals</span>
                <span className="font-black text-purple-600 group-hover:text-white bg-white/60 group-hover:bg-white/20 px-3 py-1 rounded-full text-xs">200 pts / Friend</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Points History Ledger */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col relative">
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <History className="text-blue-500" size={20} /> Rewards Ledger
          </h3>
        </div>
        
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Syncing Rewards...</p>
            </div>
          ) : rewards.history.length > 0 ? (
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
