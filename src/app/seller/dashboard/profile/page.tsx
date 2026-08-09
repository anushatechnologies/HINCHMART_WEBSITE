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

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

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
      setToastMessage({ type: 'success', text: '✓ Store Profile updated successfully!' });
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
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <Loader2 size={36} className="animate-spin text-[#FF6B2C]" />
        <p className="text-[#667085] font-bold text-xs uppercase tracking-wider">Syncing Store Profile...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── 1. HERO MERCHANT PROFILE HEADER BANNER (NAVY #0B1F3A) ─── */}
      <motion.div variants={itemVariants} className="bg-[#0B1F3A] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B2C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Merchant Avatar Pill */}
            <div className="w-18 h-18 rounded-xl bg-[#FF6B2C] flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-sm border border-white/20">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{profile.companyName}</h1>
                <span className="text-xs bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#16A34A]" /> Verified Gold Merchant
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-3">
                <span>Owner: <strong className="text-white font-bold">{profile.ownerName}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-[#FF6B2C] uppercase font-bold">{profile.businessType}</strong></span>
                <span>•</span>
                <button onClick={copySellerId} className="hover:text-white font-mono flex items-center gap-1 text-slate-300 transition-colors cursor-pointer" title="Click to copy ID">
                  ID: HM-SELLER-{profile.id} {copied ? <Check size={13} className="text-[#16A34A]" /> : <Copy size={13} />}
                </button>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1.5"><Store size={14} className="text-[#FF6B2C]" /> Member since {profile.memberSince}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-400" /> {profile.city}, {profile.state}</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#16A34A]" /> 0% Commission Partner</span>
              </div>
            </div>
          </div>

          {/* Edit / Sync Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchProfileData}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer"
              title="Sync Profile from Database"
            >
              <RefreshCw size={16} />
            </button>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary px-6 py-2.5 text-xs"
              >
                <Edit3 size={16} /> Edit Profile Info
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-6 py-2 text-xs"
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
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className={`p-4 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 ${
              toastMessage.type === 'error' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' : 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
            }`}
          >
            <CheckCircle2 size={18} /> {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MERCHANT PERFORMANCE BADGES & METRICS (WHITE CARDS) ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-b2b p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#FFF1EA] text-[#FF6B2C] flex items-center justify-center font-bold shrink-0">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#667085]">Store Rating</p>
            <p className="text-xl font-bold text-[#172033] mt-0.5">{profile.sellerRating} / 5.0</p>
            <p className="text-[10px] text-[#16A34A] font-bold mt-0.5">Top 5% Verified Supplier</p>
          </div>
        </div>

        <div className="card-b2b p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#667085]">Fulfillment SLA</p>
            <p className="text-xl font-bold text-[#172033] mt-0.5">100% SLA Active</p>
            <p className="text-[10px] text-[#2563EB] font-bold mt-0.5">Same-Day Dispatch Enabled</p>
          </div>
        </div>

        <div className="card-b2b p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#667085]">Payout Cycle</p>
            <p className="text-xl font-bold text-[#172033] mt-0.5">7-Day Instant</p>
            <p className="text-[10px] text-[#16A34A] font-bold mt-0.5">0% Commission Fee</p>
          </div>
        </div>

        <div className="card-b2b p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#667085]">KYC Compliance</p>
            <p className="text-xl font-bold text-[#16A34A] mt-0.5">Fully Verified</p>
            <p className="text-[10px] text-[#667085] font-medium mt-0.5">GSTIN & PAN Approved</p>
          </div>
        </div>

      </motion.div>

      {/* ─── 3. TABBED PROFILE DETAILS BODY ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side Tab Controls */}
        <motion.div variants={itemVariants} className="lg:w-72 shrink-0">
          <div className="card-b2b p-2 space-y-1 sticky top-24">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left cursor-pointer group ${
                    isActive ? 'bg-[#0B1F3A] text-white shadow-xs' : 'hover:bg-[#F8FAFC] text-[#172033]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-[#FF6B2C] text-white' : 'bg-[#F8FAFC] text-[#667085] group-hover:text-[#FF6B2C]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#172033]'}`}>{t.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-[#667085]'}`}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Right Tab Content Form */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="card-b2b p-6 sm:p-8 space-y-6">
            
            {/* Header of Active Tab */}
            <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#FFF1EA] text-[#FF6B2C] flex items-center justify-center font-bold">
                <ActiveIcon size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#172033] tracking-tight">{activeTabObj.label}</h2>
                <p className="text-xs text-[#667085] font-medium">{activeTabObj.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* TAB 1: STORE IDENTITY */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Company / Store Name *</label>
                      <input type="text" name="companyName" value={profile.companyName} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Owner Full Name *</label>
                      <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Business Type *</label>
                      <select name="businessType" value={profile.businessType} onChange={handleChange} disabled={!editing} className="input-b2b">
                        <option value="RETAILER">Retailer / Store Dealer</option>
                        <option value="WHOLESALER">Wholesaler / Regional Distributor</option>
                        <option value="MANUFACTURER">Manufacturer / Direct Factory OEM</option>
                        <option value="RENTAL_PROVIDER">Heavy Machinery & Equipment Rental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Year Established</label>
                      <input type="text" name="yearEstablished" value={profile.yearEstablished} onChange={handleChange} disabled={!editing} className="input-b2b" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">Store Description</label>
                    <textarea name="storeDescription" rows={3} value={profile.storeDescription} onChange={handleChange} disabled={!editing} className="input-b2b h-auto py-3" />
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT & LOCATION */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Business Email Address *</label>
                      <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Mobile Phone Number *</label>
                      <input type="text" name="contactPhone" value={profile.contactPhone} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">Registered Address *</label>
                    <input type="text" name="address" value={profile.address} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">City *</label>
                      <input type="text" name="city" value={profile.city} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">State *</label>
                      <input type="text" name="state" value={profile.state} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Pincode *</label>
                      <input type="text" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TAX & COMPLIANCE */}
              {activeTab === 'tax' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">GSTIN Number *</label>
                      <input type="text" name="gstin" value={profile.gstin} onChange={handleChange} disabled={!editing} required className="input-b2b uppercase font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">PAN Card Number *</label>
                      <input type="text" name="panNumber" value={profile.panNumber} onChange={handleChange} disabled={!editing} required className="input-b2b uppercase font-mono" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                    <ShieldCheck size={20} className="text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#16A34A]">GSTIN & B2B Tax Invoice Compliant</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">Your tax details allow auto-generation of ITC-eligible invoices for all B2B buyers across India.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANK & PAYOUTS */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Bank Name *</label>
                      <input type="text" name="bankName" value={profile.bankName} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Account Holder Name *</label>
                      <input type="text" name="accountHolder" value={profile.accountHolder} onChange={handleChange} disabled={!editing} required className="input-b2b" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">Account Number *</label>
                      <input type="text" name="accountNumber" value={profile.accountNumber} onChange={handleChange} disabled={!editing} required className="input-b2b font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">IFSC Code *</label>
                      <input type="text" name="ifscCode" value={profile.ifscCode} onChange={handleChange} disabled={!editing} required className="input-b2b uppercase font-mono" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#FFF1EA] border border-[#FF6B2C]/30 flex items-start gap-3">
                    <CreditCard size={20} className="text-[#FF6B2C] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#FF6B2C]">7-Day Direct Bank Payout Cycle</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">Earnings are automatically deposited directly to your bank account 7 days after order delivery with 0% platform commission.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
              {editing && (
                <div className="flex items-center justify-end gap-3 border-t border-[#EAECF0] pt-4">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary px-4 py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary px-6 py-2 text-xs">
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
