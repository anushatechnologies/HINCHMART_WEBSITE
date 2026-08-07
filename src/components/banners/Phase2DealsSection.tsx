"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Gift, CreditCard, Users, Percent, Copy, Check, ArrowRight, Tag, ShieldCheck } from "lucide-react";

export default function Phase2DealsSection() {
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* ─── 1. FESTIVAL SALE & COUPON BANNER GRID (2 COLS) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Festival / Event Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-amber-200 w-fit">
              <Sparkles size={12} /> Grand Festival Sale
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Diwali & Festive Special • <span className="text-amber-300">Up to 70% OFF</span>
            </h3>
            <p className="text-xs text-rose-100 font-medium max-w-md">
              Special bulk discounts on power tools, cement, TMT bars and electrical supplies for festive construction projects.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center justify-between">
            <Link
              href="/products?search=sale"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              Explore Festive Deals <ArrowRight size={14} />
            </Link>
            <span className="text-[10px] font-bold text-rose-200 uppercase tracking-widest hidden sm:inline">Limited Time Only</span>
          </div>
        </div>

        {/* Coupon Claim Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-200 w-fit">
              <Gift size={12} /> Welcome Bonus
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Get <span className="text-emerald-300">₹500 Instant OFF</span> On First Order
            </h3>
            <p className="text-xs text-emerald-100 font-medium">
              Use coupon code at checkout to claim instant flat ₹500 discount on B2B orders above ₹4,999.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex items-center gap-3">
            <div className="bg-black/30 backdrop-blur-md border-2 border-dashed border-emerald-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 font-mono font-black text-sm text-emerald-300">
              <Tag size={16} /> WELCOME500
            </div>
            <button
              onClick={() => handleCopyCoupon('WELCOME500')}
              className="px-5 py-3 bg-white text-[#0F2537] hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedCoupon ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copiedCoupon ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

      </div>

      {/* ─── 2. FINANCE, REFERRAL & CLEARANCE GRID (3 COLS) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Finance Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black">
              <CreditCard size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Corporate Credit Line</span>
              <h4 className="text-lg font-black text-[#0F2537] mt-0.5">Easy EMI & Business Loans</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Get up to ₹10 Lakhs pre-approved credit line with 30-day interest-free credit terms for verified businesses.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link href="/account" className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Apply Credit Line <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Referral Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-black">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Referral Program</span>
              <h4 className="text-lg font-black text-[#0F2537] mt-0.5">Invite Businesses & Earn ₹500</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Earn ₹500 cashback in your HinchMart Wallet for every contractor or business owner who registers and places their first order.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link href="/account" className="text-xs font-black text-purple-600 hover:text-purple-800 flex items-center gap-1">
              Invite Friends <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Warehouse Clearance Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5722] border border-orange-200 flex items-center justify-center font-black">
              <Percent size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#FF5722] tracking-wider">Stock Clearance</span>
              <h4 className="text-lg font-black text-[#0F2537] mt-0.5">Warehouse Clearance Sale</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Flat 50% to 70% OFF on overstocked industrial hardware, safety gear, and spare parts while stock lasts.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link href="/products?search=clearance" className="text-xs font-black text-[#FF5722] hover:text-orange-700 flex items-center gap-1">
              Shop Clearance Items <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
