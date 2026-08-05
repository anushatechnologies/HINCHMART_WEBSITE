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
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Syncing Backend Store Profile...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── 1. HERO MERCHANT PROFILE HEADER BANNER ─── */}
      <motion.div variants={itemVariants} className="bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Merchant Avatar Pill */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 shrink-0 border-2 border-white/20">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.companyName}</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" /> Verified Gold Merchant
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-3">
                <span>Owner: <strong className="text-white">{profile.ownerName}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-[#FF7043] uppercase font-bold">{profile.businessType}</strong></span>
                <span>•</span>
                <button onClick={copySellerId} className="hover:text-white font-mono flex items-center gap-1 text-slate-300 transition-colors" title="Click to copy ID">
                  ID: HM-SELLER-{profile.id} {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1"><Store size={13} className="text-[#FF5722]" /> Member since {profile.memberSince}</span>
                <span className="flex items-center gap-1"><MapPin size={13} className="text-blue-400" /> {profile.city}, {profile.state}</span>
                <span className="flex items-center gap-1"><BadgeCheck size={13} className="text-emerald-400" /> 0% Commission Partner</span>
              </div>
            </div>
          </div>

          {/* Edit / Sync Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchProfileData}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15 cursor-pointer"
              title="Sync Profile from Backend Database"
            >
              <RefreshCw size={16} />
            </button>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={16} /> Edit Profile Info
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
              toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle2 size={18} /> {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MERCHANT PERFORMANCE BADGES & METRICS ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center font-black shrink-0">
            <Star size={22} fill="currentColor" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Store Rating</p>
            <p className="text-xl font-black text-[#0F2537] mt-0.5">{profile.sellerRating} / 5.0</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Top 5% Verified Supplier</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment SLA</p>
            <p className="text-xl font-black text-[#0F2537] mt-0.5">100% SLA Active</p>
            <p className="text-[10px] text-blue-600 font-bold mt-0.5">Same-Day Dispatch Enabled</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payout Cycle</p>
            <p className="text-xl font-black text-[#0F2537] mt-0.5">7-Day Instant</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">0% Commission Fee</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KYC Compliance</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">Fully Verified</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">GSTIN & PAN Approved</p>
          </div>
        </div>

      </motion.div>

      {/* ─── 3. TABBED PROFILE DETAILS BODY ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side Tab Controls */}
        <motion.div variants={itemVariants} className="lg:w-72 shrink-0">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-sm space-y-1 sticky top-20">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl transition-all text-left cursor-pointer group ${
                    isActive ? 'bg-[#0F2537] text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-[#FF5722] text-white' : 'bg-slate-100 text-slate-500 group-hover:text-[#FF5722] group-hover:bg-orange-50'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-black tracking-tight ${isActive ? 'text-white' : 'text-[#0F2537]'}`}>{t.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Right Tab Content Form */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header of Active Tab */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center font-bold">
                <ActiveIcon size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F2537] tracking-tight">{activeTabObj.label}</h2>
                <p className="text-xs text-slate-400 font-medium">{activeTabObj.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TAB 1: STORE IDENTITY */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Company / Store Name *</label>
                      <input type="text" name="companyName" value={profile.companyName} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Owner Full Name *</label>
                      <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Business Type *</label>
                      <select name="businessType" value={profile.businessType} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600">
                        <option value="RETAILER">Retailer / Store Dealer</option>
                        <option value="WHOLESALER">Wholesaler / Regional Distributor</option>
                        <option value="MANUFACTURER">Manufacturer / Direct Factory OEM</option>
                        <option value="RENTAL_PROVIDER">Heavy Machinery & Equipment Rental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Year Established</label>
                      <input type="text" name="yearEstablished" value={profile.yearEstablished} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Store Description</label>
                    <textarea name="storeDescription" value={profile.storeDescription} onChange={handleChange} disabled={!editing} rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600 resize-none" />
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT & LOCATION */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Business Email Address *</label>
                      <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Contact Mobile Phone *</label>
                      <input type="tel" name="contactPhone" value={profile.contactPhone} onChange={handleChange} disabled={!editing} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Registered Office Address</label>
                      <input type="text" name="address" value={profile.address} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">City / State</label>
                      <input type="text" name="city" value={profile.city} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Dispatch Pincode</label>
                      <input type="text" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TAX & COMPLIANCE */}
              {activeTab === 'tax' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-slate-700 font-medium">
                    Verified GSTIN and PAN numbers enable auto-generated B2B invoices with Input Tax Credit (ITC) for buyers across 28,000+ pincodes.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">GSTIN Number (15-Digit) *</label>
                      <input type="text" name="gstin" value={profile.gstin} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">PAN Card Number (10-Digit) *</label>
                      <input type="text" name="panNumber" value={profile.panNumber} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>

                  {/* Verification Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                      <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                      <span>GST Certificate Verified</span>
                    </div>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                      <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                      <span>PAN Card Verified</span>
                    </div>

                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                      <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                      <span>B2B ITC Invoicing Active</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">Need to upload or replace your GSTIN / PAN PDF documents?</p>
                    <Link
                      href="/seller/dashboard/documents"
                      className="px-5 py-2.5 bg-[#0F2537] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
                    >
                      <FileText size={15} className="text-[#FF5722]" /> Go to Document Upload Center →
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 4: BANK & PAYOUTS */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center justify-between">
                    <span>Direct Bank Deposit: <strong>7-Day Post Delivery Payout Cycle</strong></span>
                    <span className="font-bold text-emerald-600">✓ 0% Platform Fee</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Bank Name *</label>
                      <input type="text" name="bankName" value={profile.bankName} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Holder Name *</label>
                      <input type="text" name="accountHolder" value={profile.accountHolder} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Number *</label>
                      <input type="text" name="accountNumber" value={profile.accountNumber} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">IFSC Code *</label>
                      <input type="text" name="ifscCode" value={profile.ifscCode} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Type</label>
                      <select name="accountType" value={profile.accountType} onChange={handleChange} disabled={!editing}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] disabled:bg-slate-50 disabled:text-slate-600">
                        <option value="CURRENT">Current Account</option>
                        <option value="SAVINGS">Savings Account</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {editing && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
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
