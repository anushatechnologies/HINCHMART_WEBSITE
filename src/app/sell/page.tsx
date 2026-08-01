"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store, Factory, Tag, Users, Package, Truck, Wrench,
  Building, ChevronRight, CheckCircle, Star, TrendingUp,
  Shield, Zap, Globe, IndianRupee, ArrowRight, Play
} from 'lucide-react';

const BUSINESS_TYPES = [
  { id: 'RETAILER', icon: Store, label: 'Retail Seller', desc: 'Sell products directly to buyers', color: 'orange', href: '/seller/register' },
  { id: 'MANUFACTURER', icon: Factory, label: 'Manufacturer', desc: 'List your manufactured goods', color: 'blue', href: '/seller/register' },
  { id: 'BRAND', icon: Tag, label: 'Brand Owner', desc: 'Launch your official brand store', color: 'purple', href: '/seller/register' },
  { id: 'DISTRIBUTOR', icon: Users, label: 'Distributor', desc: 'Distribute products at scale', color: 'green', href: '/seller/register' },
  { id: 'WHOLESALER', icon: Package, label: 'Wholesaler', desc: 'Bulk supply at wholesale rates', color: 'cyan', href: '/seller/register' },
  { id: 'RENTAL', icon: Truck, label: 'Rental Provider', desc: 'List equipment for rent', color: 'amber', href: '/rent/register' },
  { id: 'SERVICE', icon: Wrench, label: 'Service Provider', desc: 'Offer professional services', color: 'pink', href: '/services/register' },
  { id: 'CONTRACTOR', icon: Building, label: 'Contractor', desc: 'Manage projects & supply', color: 'slate', href: '/seller/register' },
  { id: 'DEALER', icon: Globe, label: 'Dealer / Agent', desc: 'Become an authorized dealer', color: 'indigo', href: '/seller/register' },
];

const COLORMAP: Record<string, string> = {
  orange: 'bg-orange-50 border-orange-200 hover:border-orange-400 text-orange-600',
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-600',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-600',
  green: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-600',
  cyan: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400 text-cyan-600',
  amber: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-600',
  pink: 'bg-pink-50 border-pink-200 hover:border-pink-400 text-pink-600',
  slate: 'bg-slate-100 border-slate-200 hover:border-slate-400 text-slate-600',
  indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 text-indigo-600',
};

const STATS = [
  { value: '50,000+', label: 'Active Buyers' },
  { value: '₹500Cr+', label: 'GMV Processed' },
  { value: '98%', label: 'Payment on Time' },
  { value: '48hr', label: 'Onboarding Time' },
];

const BENEFITS = [
  { icon: TrendingUp, title: 'Reach Thousands of Customers', desc: 'Get instant access to 50,000+ verified B2B buyers across India' },
  { icon: Globe, title: 'Sell Across India', desc: 'Pan-India logistics network with same-day delivery in 100+ cities' },
  { icon: IndianRupee, title: 'Fast Payments', desc: 'Weekly payouts directly to your bank account, zero delays' },
  { icon: Zap, title: 'Marketing Support', desc: 'Free SEO, ads support and featured placement to boost your sales' },
  { icon: Shield, title: 'Seller Protection', desc: 'Buyer dispute resolution, fraud protection and return management' },
  { icon: Store, title: 'Easy Product Listing', desc: 'Bulk upload with CSV, API integration, and mobile app listing' },
];

export default function SellPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleProceed = () => {
    const type = BUSINESS_TYPES.find(b => b.id === selected);
    if (type) router.push(`${type.href}?type=${selected}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="max-w-[1100px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <Zap size={12} className="animate-pulse" /> Join 10,000+ Sellers on HinchMart
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            Grow Your Business<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">with HinchMart</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            India's largest B2B construction marketplace. Reach contractors, builders and businesses nationwide.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <a href="#choose" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">
              Start Selling Today <ArrowRight size={18} />
            </a>
            <button className="border border-white/20 hover:border-white/40 text-white font-bold px-8 py-4 rounded-xl backdrop-blur-sm transition-all hover:-translate-y-0.5 flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black text-orange-400">{s.value}</div>
                <div className="text-xs text-slate-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BENEFITS ── */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Why Sell on HinchMart?</h2>
            <p className="text-slate-500">Everything you need to grow your business online</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <b.icon size={22} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHOOSE BUSINESS TYPE ── */}
      <div id="choose" className="py-16 px-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Join HinchMart</h2>
            <p className="text-slate-500 text-lg">Choose your business type to get started</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {BUSINESS_TYPES.map(type => {
              const isSelected = selected === type.id;
              const colorClass = COLORMAP[type.color];
              return (
                <button
                  key={type.id}
                  onClick={() => setSelected(type.id)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100 scale-[1.02]'
                      : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-md`
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={20} className="text-orange-500" fill="currentColor" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${isSelected ? 'bg-orange-100 border-orange-200' : colorClass}`}>
                    <type.icon size={22} />
                  </div>
                  <div className="font-black text-slate-900 text-base mb-1">{type.label}</div>
                  <div className="text-slate-500 text-sm">{type.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={handleProceed}
              disabled={!selected}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
            >
              {selected ? `Continue as ${BUSINESS_TYPES.find(b => b.id === selected)?.label}` : 'Select a Business Type'} →
            </button>
          </div>
        </div>
      </div>

      {/* ── REGISTRATION FLOW ── */}
      <div className="bg-[#1a1a2e] py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">Simple Onboarding in 7 Steps</h2>
          <p className="text-slate-400 mb-10">Get your store live in less than 48 hours</p>
          <div className="flex flex-wrap justify-center gap-0">
            {[
              'Choose Type', 'Create Account', 'Business Details',
              'GST & PAN', 'Bank Details', 'Upload Docs', 'Go Live! 🚀'
            ].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${i === 6 ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-white'}`}>
                    {i + 1}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 max-w-[70px] text-center leading-tight">{step}</div>
                </div>
                {i < 6 && <div className="w-8 h-0.5 bg-white/20 mb-5 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="py-16 px-4 bg-slate-50">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10">What Our Sellers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rajesh Kumar', role: 'Steel Distributor, Mumbai', quote: 'My monthly revenue tripled within 3 months of joining HinchMart. The B2B buyer base is incredible.', stars: 5 },
              { name: 'Priya Mehta', role: 'Electrical Retailer, Delhi', quote: 'Payments are always on time and the seller support team is very responsive. Highly recommend!', stars: 5 },
              { name: 'Suresh Reddy', role: 'Safety Equipment Manufacturer, Hyderabad', quote: 'HinchMart gave us national reach overnight. We now ship to 28 states every week.', stars: 5 },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 italic mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-500">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="py-16 px-4 bg-orange-500 text-white text-center">
        <h2 className="text-4xl font-black mb-4">Ready to Start Selling?</h2>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          Join 10,000+ sellers already growing their business on HinchMart. Free registration, no setup fee.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="#choose" className="bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
            Register as Seller
          </Link>
          <Link href="/seller/login" className="border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
            Already a Seller? Log In
          </Link>
        </div>
      </div>

    </div>
  );
}
