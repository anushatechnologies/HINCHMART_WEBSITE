"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, Play, Calculator, Award, Eye, ArrowRight, ShieldCheck, 
  ChevronRight, Star, RefreshCw, FileText, CheckCircle2
} from "lucide-react";

export default function Phase3AdvancedSection() {
  // Interactive Calculator State
  const [builtAreaSqFt, setBuiltAreaSqFt] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'AI_RECS' | 'RECENTLY_VIEWED'>('AI_RECS');

  // Calculate material requirements automatically
  const cementBagsRequired = Math.round(builtAreaSqFt * 0.4); // ~400 bags per 1000 sq ft
  const steelTonsRequired = (builtAreaSqFt * 0.0035).toFixed(2); // ~3.5 tons per 1000 sq ft
  const estimatedTotalCost = (builtAreaSqFt * 1450).toLocaleString('en-IN'); // ~1450/sq ft structural material

  return (
    <div className="space-y-8">

      {/* ─── 1. INTERACTIVE COST CALCULATOR & SPONSORED OEM SPOTLIGHT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Interactive Material & Cost Estimator Banner (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Calculator size={14} /> Interactive Cost & BOQ Estimator
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Estimate Material Quantities & Project Budget
            </h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Adjust your project built-up area to instantly calculate cement bags, TMT steel tonnage, and total structural procurement cost.
            </p>
          </div>

          {/* Interactive Estimator Input */}
          <div className="relative z-10 my-6 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Built-Up Construction Area</label>
              <span className="text-lg font-black text-orange-400 font-mono">{builtAreaSqFt.toLocaleString()} Sq. Ft.</span>
            </div>

            <input
              type="range"
              min="500"
              max="10000"
              step="250"
              value={builtAreaSqFt}
              onChange={e => setBuiltAreaSqFt(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#FF5722]"
            />

            {/* Calculated Output Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 p-3 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-300 uppercase">Est. Cement</span>
                <span className="text-sm font-black text-white font-mono">{cementBagsRequired} Bags</span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-300 uppercase">Est. TMT Steel</span>
                <span className="text-sm font-black text-white font-mono">{steelTonsRequired} Tons</span>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/40 p-3 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-orange-300 uppercase">Est. Material Cost</span>
                <span className="text-sm font-black text-orange-300 font-mono">₹{estimatedTotalCost}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/rfq"
              className="px-6 py-3 bg-[#FF5722] hover:bg-[#e64a19] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <FileText size={15} /> Download Estimated BOQ Quote
            </Link>
            <span className="text-[10px] text-slate-400 font-mono">Includes 18% GST Credit Claim</span>
          </div>
        </div>

        {/* Sponsored Brand Spotlight Banner (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            Sponsored OEM
          </span>

          <div className="space-y-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 p-2 flex items-center justify-center">
              <Award size={36} className="text-[#FF5722]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                <ShieldCheck size={14} /> Verified Direct Manufacturer
              </div>
              <h4 className="text-xl font-black text-[#0F2537]">Bosch Professional Tools</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Official store for heavy-duty rotary hammers, angle grinders, and cordless power tool kits with 1-year warranty.
              </p>
            </div>

            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
              <span className="font-black text-[#0F2537] ml-1">4.9 ★</span>
              <span className="text-slate-400 text-[10px]">(1,420 Verified Reviews)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/products?brand=Bosch"
              className="w-full py-3 bg-[#0F2537] hover:bg-[#FF5722] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              Visit Bosch Official Store <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* ─── 2. AI RECOMMENDATIONS & VIDEO DEMO BANNER GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Video Machinery Demonstration Banner (1 Col) */}
        <div className="bg-gradient-to-br from-slate-900 via-[#1a2332] to-[#0F2537] text-white rounded-3xl p-6 shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Play size={10} className="fill-current" /> Video Demonstration
            </span>

            <h4 className="text-xl font-black text-white">JCB 3DX Heavy Excavator Demo</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Watch live site operation, fuel efficiency metrics, and attachments video overview for earthmoving equipment.
            </p>

            <div className="relative aspect-video rounded-2xl bg-black/50 border border-white/20 overflow-hidden flex items-center justify-center group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={20} className="fill-current ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/70 px-2 py-0.5 rounded text-white font-bold">
                03:45 HD
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link href="/rentals" className="text-xs font-black text-orange-400 hover:text-orange-300 flex items-center gap-1">
              Book Heavy Machinery Rental <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* AI Personalized Recommendation Engine Box (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-1">
                  <Sparkles size={13} /> AI Procurement Intelligence
                </span>
                <h3 className="text-xl font-black text-[#0F2537] mt-0.5">Recommended for Your Business Trade</h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('AI_RECS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'AI_RECS' ? 'bg-white text-[#0F2537] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  AI Best Matches
                </button>
                <button
                  onClick={() => setActiveTab('RECENTLY_VIEWED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'RECENTLY_VIEWED' ? 'bg-white text-[#0F2537] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Recently Viewed
                </button>
              </div>
            </div>

            {/* AI Product Match Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'UltraTech OPC 53 Grade Cement 50kg', brand: 'UltraTech', price: '₹409', moq: '10 Bags', icon: '🏗️' },
                { name: 'TATA Tiscon 550D TMT Bar 12mm', brand: 'Tata Steel', price: '₹61,500/Ton', moq: '1 Ton', icon: '🔩' },
                { name: 'Finolex Heavy PVC Pipe 4 Inch 6m', brand: 'Finolex', price: '₹325/Piece', moq: '5 Pcs', icon: '🚿' }
              ].map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-orange-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider block">{p.brand}</span>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-2 mt-0.5">{p.name}</h5>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-black text-xs text-[#0F2537]">{p.price}</div>
                      <div className="text-[9px] text-slate-400 font-medium">MOQ: {p.moq}</div>
                    </div>
                    <Link href="/products" className="p-1.5 bg-[#0F2537] hover:bg-[#FF5722] text-white rounded-lg transition-colors">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={14} /> Real-time Stock Availability Verified
            </span>
            <Link href="/products" className="text-orange-600 hover:underline flex items-center gap-1">
              View All Recommendations <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
