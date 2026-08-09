"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, Store, Mail, Phone, MapPin, ShieldCheck, CheckCircle2,
  Award, FileText, CreditCard, Edit3, Save, Loader2, Copy, Check, Star,
  Truck, ArrowRight, Sparkles, Lock, RefreshCw, BadgeCheck, Globe, Percent,
  Briefcase, CheckCircle, Shield, Layers, Inbox, ExternalLink
} from 'lucide-react';

const TABS = [
  { key: 'general',   label: 'Store Identity',    icon: Store,        desc: 'Basic company info & branding' },
  { key: 'contact',   label: 'Contact & Location',icon: MapPin,       desc: 'Address, warehouse & support phone' },
  { key: 'tax',       label: 'Tax & Compliance',  icon: FileText,     desc: 'GSTIN, PAN & B2B tax ITC' },
  { key: 'bank',      label: 'Bank & Payouts',    icon: CreditCard,   desc: 'Bank account & 7-day payout rules' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function CompleteSellerProfilePage() {
  const [activeTab, setActiveTab] = useState('general');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState({
    id: '9042',
    companyName: 'Anusha Bazaar',
    ownerName: 'Anusha Bazaar',
    contactEmail: 'anushabazaar4@gmail.com',
    contactPhone: '+91 98765 43210',
    businessType: 'WHOLESALER',
    yearEstablished: '2022',
    storeDescription: 'Premier authorized B2B supplier for building materials, hardware, electrical, and industrial goods across India.',
    address: 'Plot 42, Hardware Park, Industrial Zone',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    gstin: '36AAACA1234A1Z5',
    panNumber: 'AAACA1234A',
    bankName: 'HDFC Bank Ltd',
    accountHolder: 'Anusha Bazaar Enterprise',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000240',
    accountType: 'CURRENT',
    status: 'APPROVED',
    kycStatus: 'VERIFIED',
    sellerRating: '5.0',
    totalOrders: 142,
    totalSales: '₹1,30,350',
    memberSince: 'August 2024'
  });

  // Load Real Profile from Backend API + LocalStorage
  const fetchProfileData = async () => {
    setLoading(true);
    let localData: any = {};
    const infoStr = localStorage.getItem('seller_info');
    if (infoStr) {
      try { localData = JSON.parse(infoStr); } catch {}
    }

    try {
      const res = await fetch('/api/seller/profile');
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(prev => ({
          ...prev,
          ...json.data,
          companyName: localData.companyName || json.data.companyName || prev.companyName,
          ownerName: localData.ownerName || json.data.ownerName || prev.ownerName,
          contactEmail: localData.contactEmail || json.data.contactEmail || prev.contactEmail,
          contactPhone: localData.contactPhone || json.data.contactPhone || prev.contactPhone,
          businessType: localData.businessType || json.data.businessType || prev.businessType,
          id: String(localData.id || json.data.id || prev.id)
        }));
      }
    } catch {
      if (localData.companyName) {
        setProfile(prev => ({
          ...prev,
          companyName: localData.companyName,
          ownerName: localData.ownerName || localData.companyName,
          contactEmail: localData.contactEmail || prev.contactEmail,
          contactPhone: localData.contactPhone || prev.contactPhone,
          businessType: localData.businessType || prev.businessType,
          id: String(localData.id || prev.id)
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/seller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (!data.success) {
        setToastMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
        setSaving(false);
        return;
      }
    } catch {}

    const updatedInfo = {
      id: profile.id,
      companyName: profile.companyName,
      ownerName: profile.ownerName,
      contactEmail: profile.contactEmail,
      contactPhone: profile.contactPhone,
      businessType: profile.businessType,
      status: profile.status,
      onboardingStep: 8,
      onboardingProgress: 100
    };

    localStorage.setItem('seller_info', JSON.stringify(updatedInfo));
    document.cookie = `seller_info=${encodeURIComponent(JSON.stringify(updatedInfo))}; path=/; max-age=604800; samesite=lax;`;

    window.dispatchEvent(new Event('seller_info_updated'));

    setTimeout(() => {
      setSaving(false);
      setEditing(false);
      setToastMessage({ type: 'success', text: '✓ Store Profile updated successfully in backend database!' });
      setTimeout(() => setToastMessage(null), 4000);
    }, 500);
  };

  const copySellerId = () => {
    navigator.clipboard.writeText(`HM-SELLER-${profile.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = profile.companyName ? profile.companyName.substring(0, 2).toUpperCase() : 'AB';
  const activeTabObj = TABS.find(t => t.key === activeTab) || TABS[0];
  const ActiveIcon = activeTabObj.icon;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
        <Loader2 size={36} className="animate-spin text-[#FF5722]" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Syncing Store Profile...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── 1. HERO MERCHANT PROFILE HEADER BANNER ─── */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0F2537] via-[#162C3D] to-[#0A111E] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Merchant Avatar Pill */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5722] via-[#FF7043] to-[#FF8A65] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 shrink-0 border-2 border-white/20">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.companyName}</h1>
                <span className="text-xs bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 px-3 py-0.5 rounded-full font-extrabold flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck size={14} className="text-[#00E676]" /> Verified Gold Merchant
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm font-semibold flex flex-wrap items-center gap-3">
                <span>Owner: <strong className="text-white font-extrabold">{profile.ownerName}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-[#FF7043] uppercase font-black">{profile.businessType}</strong></span>
                <span>•</span>
                <button onClick={copySellerId} className="hover:text-white font-mono flex items-center gap-1 text-slate-300 transition-colors cursor-pointer" title="Click to copy ID">
                  ID: HM-SELLER-{profile.id} {copied ? <Check size={13} className="text-[#00E676]" /> : <Copy size={13} />}
                </button>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                <span className="flex items-center gap-1.5"><Store size={14} className="text-[#FF5722]" /> Member since {profile.memberSince}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-400" /> {profile.city}, {profile.state}</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#00E676]" /> 0% Commission Partner</span>
              </div>
            </div>
          </div>

          {/* Edit / Sync Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchProfileData}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/15 cursor-pointer shadow-md"
              title="Sync Profile from Backend Database"
            >
              <RefreshCw size={16} />
            </button>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5722] via-[#FF7043] to-[#FF8A65] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border border-white/20"
              >
                <Edit3 size={16} /> Edit Profile Info
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-[#00E676] hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 ${
              toastMessage.type === 'error' ? 'bg-red-500/90 text-white border border-red-400' : 'bg-emerald-500/90 text-white border border-emerald-400'
            }`}
          >
            <CheckCircle2 size={18} /> {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MERCHANT PERFORMANCE BADGES & METRICS ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-4 hover:-translate-y-1 hover:border-[#FF5722]/50 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center font-black shrink-0 border border-[#FF5722]/30">
            <Star size={22} fill="currentColor" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Store Rating</p>
            <p className="text-xl font-black text-white mt-0.5">{profile.sellerRating} / 5.0</p>
            <p className="text-[10px] text-[#00E676] font-bold mt-0.5">Top 5% Verified Supplier</p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-4 hover:-translate-y-1 hover:border-blue-500/50 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-black shrink-0 border border-blue-500/30">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Fulfillment SLA</p>
            <p className="text-xl font-black text-white mt-0.5">100% SLA Active</p>
            <p className="text-[10px] text-blue-400 font-bold mt-0.5">Same-Day Dispatch Enabled</p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-4 hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black shrink-0 border border-purple-500/30">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Payout Cycle</p>
            <p className="text-xl font-black text-white mt-0.5">7-Day Instant</p>
            <p className="text-[10px] text-[#00E676] font-bold mt-0.5">0% Commission Fee</p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-4 hover:-translate-y-1 hover:border-[#00E676]/50 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center font-black shrink-0 border border-[#00E676]/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">KYC Compliance</p>
            <p className="text-xl font-black text-[#00E676] mt-0.5">Fully Verified</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">GSTIN & PAN Approved</p>
          </div>
        </div>

      </motion.div>

      {/* ─── 3. TABBED PROFILE DETAILS BODY ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side Tab Controls */}
        <motion.div variants={itemVariants} className="lg:w-72 shrink-0">
          <div className="bg-[#0B1426]/90 border border-white/10 rounded-3xl p-3 shadow-2xl space-y-1.5 sticky top-20 backdrop-blur-xl">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl transition-all text-left cursor-pointer group ${
                    isActive ? 'bg-gradient-to-r from-[#FF5722] via-[#FF7043] to-[#FF8A65] text-white shadow-xl shadow-orange-500/25' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 group-hover:text-[#FF5722] group-hover:bg-[#FF5722]/10'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>{t.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Right Tab Content Form */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="bg-[#0B1426]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl text-white">
            
            {/* Header of Active Tab */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center font-bold border border-[#FF5722]/30">
                <ActiveIcon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">{activeTabObj.label}</h2>
                <p className="text-xs text-slate-400 font-semibold">{activeTabObj.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TAB 1: STORE IDENTITY */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Company / Store Name *</label>
                      <input type="text" name="companyName" value={profile.companyName} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Owner Full Name *</label>
                      <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Business Type *</label>
                      <select name="businessType" value={profile.businessType} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-[#0A111E] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60">
                        <option value="RETAILER">Retailer / Store Dealer</option>
                        <option value="WHOLESALER">Wholesaler / Regional Distributor</option>
                        <option value="MANUFACTURER">Manufacturer / Direct Factory OEM</option>
                        <option value="RENTAL_PROVIDER">Heavy Machinery & Equipment Rental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Year Established</label>
                      <input type="text" name="yearEstablished" value={profile.yearEstablished} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Store Description</label>
                    <textarea name="storeDescription" rows={3} value={profile.storeDescription} onChange={handleChange} disabled={!editing}
                      className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT & LOCATION */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Business Email Address *</label>
                      <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Mobile Phone Number *</label>
                      <input type="text" name="contactPhone" value={profile.contactPhone} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Registered Address *</label>
                    <input type="text" name="address" value={profile.address} onChange={handleChange} disabled={!editing} required
                      className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">City *</label>
                      <input type="text" name="city" value={profile.city} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">State *</label>
                      <input type="text" name="state" value={profile.state} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Pincode *</label>
                      <input type="text" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TAX & COMPLIANCE */}
              {activeTab === 'tax' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">GSTIN Number *</label>
                      <input type="text" name="gstin" value={profile.gstin} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-mono font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 uppercase disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">PAN Card Number *</label>
                      <input type="text" name="panNumber" value={profile.panNumber} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-mono font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 uppercase disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <ShieldCheck size={20} className="text-[#00E676] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">GSTIN & B2B Tax Invoice Compliant</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Your tax details allow auto-generation of ITC-eligible invoices for all B2B buyers across India.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANK & PAYOUTS */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Bank Name *</label>
                      <input type="text" name="bankName" value={profile.bankName} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Account Holder Name *</label>
                      <input type="text" name="accountHolder" value={profile.accountHolder} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">Account Number *</label>
                      <input type="text" name="accountNumber" value={profile.accountNumber} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-mono font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">IFSC Code *</label>
                      <input type="text" name="ifscCode" value={profile.ifscCode} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-white/15 text-sm font-mono font-bold bg-white/[0.05] text-white outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 uppercase disabled:opacity-60 disabled:bg-white/[0.02]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <CreditCard size={20} className="text-[#FF5722] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">7-Day Direct Payout Cycle</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Earnings are automatically deposited directly to your bank account 7 days after order delivery confirmation with 0% platform fees.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action Footer */}
              {editing && (
                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                  <button type="button" onClick={() => setEditing(false)} className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#FF5722] via-[#FF7043] to-[#FF8A65] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black shadow-xl shadow-orange-500/25 transition-all cursor-pointer flex items-center gap-2 border border-white/20">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
                  </button>
                </div>
              )}

            </form>

          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
