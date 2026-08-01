"use client";

import { Package, Wallet, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountDashboardPage() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name) setUserName(user.name);
    }
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {userName}!</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-800">0</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Wallet Balance</p>
            <h3 className="text-3xl font-black text-slate-800">₹0</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Reward Points</p>
            <h3 className="text-3xl font-black text-slate-800">0</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm">
            <Gift size={24} />
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-3" strokeWidth={1} />
          <h3 className="text-slate-600 font-bold mb-1">No recent orders found</h3>
          <p className="text-sm text-slate-500 mb-4">Looks like you haven&apos;t placed any orders yet.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-[#1a1a2e] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
