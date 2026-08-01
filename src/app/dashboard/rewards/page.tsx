'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, TrendingUp, ShoppingBag, Crown, Zap } from 'lucide-react';

const API = 'http://localhost:5000';

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🥉' },
  { name: 'Silver', min: 1000, max: 4999, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-300', icon: '🥈' },
  { name: 'Gold', min: 5000, max: 19999, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🥇' },
  { name: 'Platinum', min: 20000, max: Infinity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: '💎' },
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
        if (data.success) setRewards(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch_data();
  }, []);

  const currentTier = TIERS.find(t => rewards.totalEarned >= t.min && rewards.totalEarned <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressToNext = nextTier ? Math.min(100, ((rewards.totalEarned - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Rewards & Loyalty</h1>
      <p className="text-slate-500 mb-8">Earn points on every purchase and redeem them for exclusive rewards.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Points Card */}
        <div className="lg:col-span-1">
          <div className={`${currentTier.bg} rounded-2xl border-2 ${currentTier.border} p-8 text-center relative overflow-hidden shadow-sm`}>
            <div className="text-5xl mb-4">{currentTier.icon}</div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${currentTier.color}`}>{currentTier.name} Member</p>
            <p className="text-4xl font-black text-slate-900 mb-1">{rewards.balance.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-bold mb-6">Points Balance</p>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1">Wallet Value</p>
              <p className="text-xl font-black text-emerald-600">₹{rewards.walletValue}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><TrendingUp size={22} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                <p className="text-2xl font-black text-slate-900">{rewards.totalEarned.toLocaleString()} pts</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0"><ShoppingBag size={22} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Redeemed</p>
                <p className="text-2xl font-black text-slate-900">{rewards.totalRedeemed.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          {nextTier && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Crown size={16} className="text-yellow-500" /> Tier Progress</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{(nextTier.min - rewards.totalEarned).toLocaleString()} more points to reach <span className="font-bold">{nextTier.name}</span></p>
                </div>
                <span className="text-2xl">{nextTier.icon}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-orange-400 transition-all duration-700 shadow-sm" style={{ width: `${progressToNext}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                <span>{currentTier.name}: {currentTier.min.toLocaleString()} pts</span>
                <span>{nextTier.name}: {nextTier.min.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          {/* How to earn */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Zap size={16} className="text-orange-500" /> How to Earn Points</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="font-medium text-slate-700">Every ₹1 spent on purchases</span>
                <span className="font-black text-blue-600">1 point</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="font-medium text-slate-700">Writing a product review</span>
                <span className="font-black text-blue-600">50 points</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-slate-700">Referring a friend</span>
                <span className="font-black text-blue-600">200 points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-extrabold text-slate-900">Points History</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading...</div>
        ) : rewards.history.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {rewards.history.map((item: any) => (
              <div key={item.id} className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'EARNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-500'}`}>
                  {item.type === 'EARNED' ? <TrendingUp size={18} /> : <ShoppingBag size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">{item.reason}</p>
                  <p className="text-xs font-medium text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <p className={`font-black text-base ${item.type === 'EARNED' ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {item.type === 'EARNED' ? '+' : '-'}{item.points.toLocaleString()} pts
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <Gift size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Points Yet</h3>
            <p className="text-slate-500 mb-6">Start shopping to earn reward points!</p>
            <Link href="/search" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm uppercase tracking-widest text-sm">
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
