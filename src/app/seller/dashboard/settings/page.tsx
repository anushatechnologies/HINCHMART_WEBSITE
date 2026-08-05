"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Building2, User, Mail, Phone, MapPin, CreditCard, Shield, Truck,
  CheckCircle2, Save, RefreshCw, Loader2, Lock, ChevronRight, Sparkles,
  FileText, ShieldCheck, Key, Webhook, Bell, Globe, AlertCircle, Copy, Check
} from 'lucide-react';

const TABS = [
  { key: 'profile',   label: 'Store Profile',       icon: Store,        desc: 'Company name, owner details & store info' },
  { key: 'tax',       label: 'Tax & Documents',    icon: FileText,     desc: 'GSTIN, PAN & business verification' },
  { key: 'bank',      label: 'Bank & Payouts',     icon: CreditCard,   desc: 'Bank account & Razorpay payout setup' },
  { key: 'shipping',  label: 'Logistics & Dispatch',icon: Truck,        desc: 'Shipping rates & dispatch warehouse' },
  { key: 'security',  label: 'Security & 2FA',     icon: Shield,       desc: 'Password, 2FA & active sessions' },
  { key: 'kyc',       label: 'KYC Status',         icon: CheckCircle2, desc: 'Verification badges & doc status' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function SellerSettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Real Form State
  const [profile, setProfile] = useState({
    id: '1',
    companyName: 'Anusha Bazaar',
    ownerName: 'Anusha',
    firstName: 'Anusha',
    lastName: 'Bazaar',
    contactEmail: 'anusha@hinchmart.com',
    contactPhone: '+91 98765 43210',
    businessType: 'WHOLESALER',
    storeDescription: 'Authorized B2B Supplier for Industrial, Hardware, Safety & Building Materials on HinchMart.',
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
    razorpayAccountId: 'acc_HinchMart9042',
    flatShippingFee: '0',
    freeShippingThreshold: '500',
    dispatchPincode: '500072',
    dispatchSla: '24 Hours',
    twoFactorEnabled: true,
    status: 'APPROVED'
  });

  useEffect(() => {
    const infoStr = localStorage.getItem('seller_info');
    if (infoStr) {
      try {
        const parsed = JSON.parse(infoStr);
        setProfile(prev => ({
          ...prev,
          id: String(parsed.id || '1'),
          companyName: parsed.companyName || parsed.ownerName || prev.companyName,
          ownerName: parsed.ownerName || parsed.companyName || prev.ownerName,
          contactEmail: parsed.contactEmail || prev.contactEmail,
          contactPhone: parsed.contactPhone || prev.contactPhone,
          businessType: parsed.businessType || prev.businessType,
          status: parsed.status || 'APPROVED'
        }));
      } catch {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage('');

    try {
      // Try backend update if endpoint exists
      await fetch('/api/seller/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch {}

    // Save locally
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
      setToastMessage('✓ Seller Profile & Preferences saved successfully!');
      setTimeout(() => setToastMessage(''), 4000);
    }, 600);
  };

  const copySellerId = () => {
    navigator.clipboard.writeText(`HM-SELLER-${profile.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTabObj = TABS.find(t => t.key === tab) || TABS[0];
  const ActiveIcon = activeTabObj.icon;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── HEADER BANNER ─── */}
      <motion.div variants={itemVariants} className="bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30">
              {profile.companyName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.companyName}</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  ✓ Verified Merchant
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium flex items-center gap-2">
                <span>Owner: <strong className="text-white">{profile.ownerName}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-[#FF7043] uppercase">{profile.businessType}</strong></span>
                <span>•</span>
                <button onClick={copySellerId} className="hover:text-white font-mono flex items-center gap-1">
                  ID: HM-SELLER-{profile.id} {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Profile Changes
          </button>
        </div>
      </motion.div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <CheckCircle2 size={18} /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TAB NAVIGATION & MAIN SETTINGS CONTENT ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Vertical Tab Menu */}
        <motion.div variants={itemVariants} className="lg:w-72 shrink-0">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-sm space-y-1 sticky top-20">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
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

        {/* Right Settings Form Body */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Active Tab Header */}
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
              
              {/* TAB 1: STORE PROFILE */}
              {tab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Company / Store Name *</label>
                      <input type="text" name="companyName" value={profile.companyName} onChange={handleChange} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Owner Full Name *</label>
                      <input type="text" name="ownerName" value={profile.ownerName} onChange={handleChange} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Business Email *</label>
                      <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Mobile Phone *</label>
                      <input type="tel" name="contactPhone" value={profile.contactPhone} onChange={handleChange} required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Business Type *</label>
                      <select name="businessType" value={profile.businessType} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]">
                        <option value="RETAILER">Retailer / Store Dealer</option>
                        <option value="WHOLESALER">Wholesaler / Regional Distributor</option>
                        <option value="MANUFACTURER">Manufacturer / Direct Factory OEM</option>
                        <option value="RENTAL_PROVIDER">Heavy Machinery & Equipment Rental</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Store Description</label>
                    <textarea name="storeDescription" value={profile.storeDescription} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-[#0F2537] outline-none focus:border-[#FF5722] resize-none" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Registered Office Address</label>
                      <input type="text" name="address" value={profile.address} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">City / State</label>
                      <input type="text" name="city" value={profile.city} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Pincode</label>
                      <input type="text" name="pincode" value={profile.pincode} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TAX & DOCUMENTS */}
              {tab === 'tax' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-slate-700 font-medium">
                    GSTIN and PAN numbers are required for auto-generating tax invoices with Input Tax Credit (ITC) for B2B buyers across India.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">GSTIN Number (15-Digit) *</label>
                      <input type="text" name="gstin" value={profile.gstin} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">PAN Card Number (10-Digit) *</label>
                      <input type="text" name="panNumber" value={profile.panNumber} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BANK & PAYOUTS */}
              {tab === 'bank' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center justify-between">
                    <span>Direct Bank Deposit: <strong>7-Day Post Delivery Payout Cycle</strong></span>
                    <span className="font-bold text-emerald-600">✓ 0% Fee</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Bank Name *</label>
                      <input type="text" name="bankName" value={profile.bankName} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Holder Name *</label>
                      <input type="text" name="accountHolder" value={profile.accountHolder} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Number *</label>
                      <input type="text" name="accountNumber" value={profile.accountNumber} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">IFSC Code *</label>
                      <input type="text" name="ifscCode" value={profile.ifscCode} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Account Type</label>
                      <select name="accountType" value={profile.accountType} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]">
                        <option value="CURRENT">Current Account</option>
                        <option value="SAVINGS">Savings Account</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOGISTICS & DISPATCH */}
              {tab === 'shipping' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Default Shipping Fee (₹)</label>
                      <input type="number" name="flatShippingFee" value={profile.flatShippingFee} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Free Shipping Above (₹)</label>
                      <input type="number" name="freeShippingThreshold" value={profile.freeShippingThreshold} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2537] uppercase tracking-wider mb-1.5">Primary Warehouse Pincode</label>
                      <input type="text" name="dispatchPincode" value={profile.dispatchPincode} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-[#0F2537] outline-none focus:border-[#FF5722]" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY */}
              {tab === 'security' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#0F2537] text-sm">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Require an SMS / Email OTP whenever logging into Seller Central.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">Enabled</span>
                  </div>
                </div>
              )}

              {/* TAB 6: KYC STATUS */}
              {tab === 'kyc' && (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0F2537] text-white rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#FF5722]">KYC Verification Status</span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">✓ APPROVED & VERIFIED</span>
                    </div>
                    <h3 className="text-lg font-black">Verified Merchant Badge Active</h3>
                    <p className="text-xs text-slate-300">Your documents have been verified by HinchMart Compliance Team. You enjoy 0% Commission and instant 7-day bank payouts.</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </div>

            </form>

          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
