"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent, ShieldCheck, Zap, TrendingUp, Truck, CreditCard,
  CheckCircle2, ChevronRight, Play, Star, HelpCircle, Mail, Phone,
  ArrowRight, Award, Lock, Sparkles, Building2, Package, Users, Globe,
  FileText, Clock, BarChart3, AlertCircle, X, LayoutDashboard, ChevronDown,
  Layers, Factory, Tag, Wrench, Shield, MessageSquare, Check, ArrowUpRight,
  Monitor, RefreshCcw, PieChart, Volume2, Search, Filter, Tool, Menu
} from 'lucide-react';

export default function HinchMartSupplierLanding() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ title: string; seller: string; city: string; quote: string } | null>(null);

  const handleStartSelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber) {
      localStorage.setItem('temp_seller_phone', phoneNumber);
    }
    router.push('/seller/register');
  };

  const handleDemoAccess = () => {
    const demoInfo = {
      id: 1,
      companyName: 'Apex Hardware & Steel Pvt Ltd',
      ownerName: 'Ramesh Sharma',
      contactEmail: 'ramesh@apexsteel.com',
      status: 'APPROVED',
      onboardingStep: 8,
      onboardingProgress: 100
    };
    localStorage.setItem('seller_token', 'active_seller_token_hinchmart');
    localStorage.setItem('seller_info', JSON.stringify(demoInfo));
    document.cookie = 'seller_token=active_seller_token_hinchmart; path=/; max-age=864000;';
    window.dispatchEvent(new Event('seller_info_updated'));
    router.push('/seller/dashboard');
  };

  // 12-Step Selling Process
  const SELLING_STEPS = [
    { num: '01', title: 'Create Account', desc: 'Enter mobile number & basic business name' },
    { num: '02', title: 'Verify Mobile', desc: 'Instant 6-digit OTP phone verification' },
    { num: '03', title: 'Business Details', desc: 'Add GSTIN or Enrolment ID / UIN' },
    { num: '04', title: 'Upload Documents', desc: 'Bank statement / cancelled cheque & PAN' },
    { num: '05', title: 'Admin Verification', desc: 'Instant 24-hr fast track verification' },
    { num: '06', title: 'Create Store', desc: 'Customize company logo, banner & profile' },
    { num: '07', title: 'Upload Products', desc: 'Bulk CSV / Excel or single product upload' },
    { num: '08', title: 'Receive Orders', desc: 'Get live orders from 10 Crore+ buyers' },
    { num: '09', title: 'Pack Orders', desc: 'Print HinchMart branded shipping labels' },
    { num: '10', title: 'Ship Orders', desc: 'Free doorstep pickup by logistics partner' },
    { num: '11', title: 'Receive Payments', desc: '7-day direct bank deposit post delivery' },
    { num: '12', title: 'Grow Business', desc: 'Unlock AI price recommendations & ads' },
  ];

  // 12 Seller Types
  const SELLER_TYPES = [
    { name: 'Manufacturer', icon: Factory, desc: 'Direct factory suppliers & producers' },
    { name: 'Distributor', icon: Users, desc: 'Regional stockists & brand distributors' },
    { name: 'Wholesaler', icon: Package, desc: 'Bulk supply at B2B wholesale rates' },
    { name: 'Dealer / Agent', icon: Globe, desc: 'Authorized product agents & dealers' },
    { name: 'Retailer', icon: Building2, desc: 'Local hardware & material shop owners' },
    { name: 'Brand Owner', icon: Tag, desc: 'Launch official verified brand store' },
    { name: 'Importer', icon: Layers, desc: 'Imported equipment & tool suppliers' },
    { name: 'Exporter', icon: TrendingUp, desc: 'Pan-India & cross-border exporters' },
    { name: 'Rental Provider', icon: Truck, desc: 'Heavy machinery & equipment rental' },
    { name: 'Service Provider', icon: Wrench, desc: 'Contractors & industrial specialists' },
    { name: 'Contractor', icon: Shield, desc: 'EPC project material procurement' },
    { name: 'Corporate Supplier', icon: Award, desc: 'B2B enterprise corporate accounts' }
  ];

  // 20 Categories
  const CATEGORIES = [
    'Construction Materials', 'Hardware & Tools', 'Electrical & Wiring', 'Paint & Finishes',
    'Steel & TMT Bars', 'Cement & Concrete', 'Power Tools', 'Safety Equipment',
    'Plumbing & Pipes', 'Agriculture Tools', 'Industrial Supplies', 'Cleaning Chemical',
    'Lighting & Fixtures', 'Furniture & Fittings', 'Office Stationery', 'Packaging Material',
    'Automotive Tools', 'Solar Panels & Inverters', 'HVAC & Ventilation', 'Heavy Rental Equipment'
  ];

  // Seller Features
  const FEATURES = [
    'Unlimited Product Catalog', 'Unlimited High-Res Images', 'Bulk Excel / CSV Upload',
    'Bulk Price & Stock Update', 'Automated Inventory Sync', 'Real-Time Order Tracking',
    'Direct Bank Payout Ledger', 'Advanced Sales Analytics', 'Discount Coupons & Deals',
    'Sponsored Product Ads', 'Customized Brand Storefront', 'Dedicated Account Manager'
  ];

  // FAQs
  const FAQS = [
    { q: 'How to Register as a Seller on HinchMart?', a: 'Click "Start Selling" or enter your mobile number. Complete basic company details, upload GSTIN/Enrolment ID, bank account details, and start listing products in under 5 minutes.' },
    { q: 'Do I need a Regular GSTIN to sell?', a: 'No! If you do not have a Regular GSTIN, you can register using an Enrolment ID / UIN under the non-GST seller scheme and sell across India.' },
    { q: 'What is the Commission Fee?', a: 'HinchMart charges 0% Commission Fee. You keep 100% of your product profit margins on every order.' },
    { q: 'When do I receive my Payments?', a: 'Payments are deposited directly into your bank account following a strict 7-day cycle from the order delivery date.' },
    { q: 'How does Shipping & Pickup work?', a: 'HinchMart logistics partners pick up packed orders directly from your warehouse or doorstep and deliver to buyers across 28,000+ pincodes.' },
    { q: 'Are there any order cancellation penalties?', a: 'No! We charge 0 Penalty Fees for unavoidable order cancellations or late dispatches.' },
    { q: 'How do I get Brand Approval?', a: 'Submit your trademark certificate or authorization letter from the brand in your seller panel under Brand Access to get instant approval.' },
    { q: 'Can I list Rental Equipment on HinchMart?', a: 'Yes! Select "Rental Provider" during onboarding to list JCBs, excavators, scaffolding, and heavy machinery for flexible rental terms.' },
    { q: 'How do Bulk RFQ Quotes work?', a: 'B2B buyers submit RFQ (Request for Quote) requests. You can submit custom wholesale price bids directly from your seller dashboard.' }
  ];

  const TESTIMONIALS = [
    { seller: 'Ramesh & Vikas Sharma', company: 'Apex Hardware & Steel', city: 'Tiruppur, TN', orders: '10,000+ orders/month', growth: '10X Growth', revenue: '₹4.8 Cr/Yr', quote: 'Our building materials business expanded nationwide beyond our expectations. HinchMart insights helped us stock high-demand items continuously.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
    { seller: 'Suman Verma', company: 'Keshav Fashion & Retail', city: 'Hisar, Haryana', orders: '1,200+ orders/day', growth: '5X Growth', revenue: '₹1.5 Cr/Yr', quote: 'I started selling on HinchMart with 4-5 orders on day one. Within weeks, we were shipping over 1,000 orders every single day. It felt like magic!', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { seller: 'Mohit Rathi', company: 'Meira Electricals & Tools', city: 'Ahmedabad, Gujarat', orders: '5,000+ orders/week', growth: '8X Growth', revenue: '₹3.2 Cr/Yr', quote: 'HinchMart made it extremely simple to transition to online selling. Suddenly our products were delivering to every single corner of India!', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-[#FF5722] selection:text-white">
      
      {/* ─── ELEGANT ULTRA-PROFESSIONAL STICKY HEADER (H-20) ─── */}
      <header className="sticky top-0 z-50 bg-[#0F2537] border-b border-white/10 shadow-xl text-white backdrop-blur-xl bg-opacity-95">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Left: Official Brand Logo + SUPPLIERS Pill */}
          <Link href="/seller" className="flex items-center gap-3 shrink-0">
            <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center justify-center border border-white/20">
              <img src="/logo.png" alt="HinchMart" className="h-8 w-auto max-w-[140px] object-contain" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-[#FF5722]/30 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
              <span className="text-[11px] font-black uppercase text-[#FF7043] tracking-widest">Suppliers</span>
            </div>
          </Link>

          {/* Center Navigation Links (Spacious & Clean) */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold text-slate-300">
            <a href="#sell-online" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">Sell Online</a>
            <a href="#how-it-works" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">How It Works</a>
            <a href="#pricing" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">Pricing & Commission</a>
            <a href="#benefits" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">Benefits</a>
            <a href="#seller-types" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">Seller Types</a>
            <a href="#stories" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">Success Stories</a>
            <a href="#faqs" className="hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all">FAQs</a>
          </nav>

          {/* Right Action Buttons (Login & Start Selling) */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/seller/login"
              className="px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              Login
            </Link>

            <Link
              href="/seller/register"
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              Start Selling <ChevronRight size={15} />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[#0F2537] border-b border-white/10 px-6 py-4 space-y-2 text-sm font-bold text-slate-200"
            >
              <a href="#sell-online" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">Sell Online</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">Pricing & Commission</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">Benefits</a>
              <a href="#seller-types" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">Seller Types</a>
              <a href="#stories" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">Success Stories</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FF5722]">FAQs</a>
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link href="/seller/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 bg-white/10 text-white rounded-xl text-xs font-bold text-center block">
                  Login
                </Link>
                <Link href="/seller/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 bg-[#FF5722] text-white rounded-xl text-xs font-black text-center block">
                  Start Selling Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── SECTION 2: HERO BANNER ─── */}
      <section id="sell-online" className="bg-gradient-to-b from-[#0F2537] via-[#132A40] to-[#0F2537] text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500/10 border border-[#FF5722]/30 rounded-full text-xs font-bold text-[#FF7043]">
                <Zap size={14} className="text-[#FF5722]" /> 0% Commission Fee — Keep 100% Profits
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Become a <span className="text-[#FF5722]">HinchMart Seller</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
                Sell Construction Materials, Industrial Products, Hardware, Electrical, Safety & Rental Equipment Across India. Reach lakhs of B2B Buyers and grow faster.
              </p>

              {/* Quick Mobile Form */}
              <form onSubmit={handleStartSelling} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit Mobile Number"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-bold text-[#0F2537] bg-white outline-none focus:ring-2 focus:ring-[#FF5722] placeholder:text-slate-400 shadow-md"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-sm font-black rounded-xl shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Start Selling <ArrowRight size={16} />
                </button>
              </form>

              {/* Trust Pills Grid */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {['GST Seller', 'Non GST Seller', 'Manufacturer', 'Distributor', 'Wholesaler', 'Rental Provider', 'Contractor'].map((pill, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-bold text-slate-200">
                    ✓ {pill}
                  </span>
                ))}
              </div>

            </motion.div>

            {/* Right Side: Professional Seller Dashboard Visual */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl shadow-2xl text-slate-800 border border-slate-100 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-400 ml-2">seller.hinchmart.com</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">LIVE STORE</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-[#0F2537] to-[#1E3A8A] text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-300">Today's Revenue</p>
                      <p className="text-2xl font-black">₹1,73,200</p>
                    </div>
                    <div className="px-3 py-1 bg-[#FF5722] text-white rounded-lg text-xs font-black">+24.5%</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">Active Orders</p>
                      <p className="text-lg font-black text-[#0F2537]">228 Orders</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">Coverage</p>
                      <p className="text-lg font-black text-[#FF5722]">28,000+ Pins</p>
                    </div>
                  </div>

                  <Link
                    href="/seller/register"
                    className="w-full py-3 bg-[#FF5722] hover:bg-[#e64a19] text-white rounded-xl font-black text-xs text-center flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    Start Selling on HinchMart <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3: TRUST NUMBERS (6 STATS) ─── */}
      <section className="bg-white border-y border-slate-200/80 py-12 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center divide-x divide-slate-100">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight">10 Lakh+</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Verified Sellers</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#FF5722] tracking-tight">10 Crore+</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Active Buyers</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight">28,000+</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">PIN Codes</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#FF5722] tracking-tight">700+</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight">100+</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Top Brands</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#FF5722] tracking-tight">24x7</p>
              <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">Support Desk</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: WHY SELL ON HINCHMART (6 CARDS) ─── */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            6 Core Advantages
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
            Why Sell on HinchMart?
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Built specifically to empower Indian manufacturers, stockists, and suppliers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Zero Commission', desc: 'Keep 100% of your earnings on every transaction with zero listing or selling fee.', icon: Percent, color: 'text-[#FF5722] bg-orange-50' },
            { title: 'Fast 7-Day Payments', desc: 'Reliable weekly payouts directly deposited to your bank account after delivery.', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Lowest Cost Shipping', desc: 'Nationwide doorstep pickup and fast delivery across 28,000+ pincodes.', icon: Truck, color: 'text-blue-600 bg-blue-50' },
            { title: 'Dedicated 24x7 Support', desc: 'Personalized seller helpline and account manager support whenever you need help.', icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
            { title: 'Nationwide Reach', desc: 'Expand your market beyond local borders to crores of active B2B buyers across India.', icon: Globe, color: 'text-amber-600 bg-amber-50' },
            { title: 'Business Growth AI', desc: 'Unlock AI price recommendations, sponsored ads, and demand analytics.', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform font-bold`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-black text-[#0F2537] mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 5: SELLER BENEFITS (LARGE CARDS) ─── */}
      <section id="benefits" className="py-20 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              Enterprise Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
              Comprehensive Seller Benefits
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Easy Product Listing', 'Bulk Excel Upload', 'Same Day Pickup', 'Multiple Warehouses',
              'Bulk B2B Orders', 'RFQ Quote Bidding', 'Rental Equipment Orders', 'GST Compliant Invoicing',
              'Sponsored Ads Tools', 'Sales Reports Export', 'Real-Time Analytics', '0 Penalty Easy Returns'
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center shrink-0 font-bold">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-bold text-xs text-[#0F2537]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: SELLING PROCESS (12-STEP VERTICAL FLOW) ─── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            Step-By-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
            The Complete 12-Step Selling Process
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            From account creation to receiving payouts and growing your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {SELLING_STEPS.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative group">
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-[#0F2537] text-white font-black text-xs flex items-center justify-center shadow-md">
                  {step.num}
                </span>
                <span className="text-xs text-[#FF5722] font-black">Step {idx + 1}</span>
              </div>
              <h4 className="font-black text-[#0F2537] text-base mb-1">{step.title}</h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 7: SELLER TYPES GRID ─── */}
      <section id="seller-types" className="py-20 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              For Every Business Model
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
              Who Can Sell on HinchMart?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SELLER_TYPES.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs hover:border-[#FF5722] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5722] flex items-center justify-center mx-auto mb-3 font-bold group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-black text-xs text-[#0F2537] mb-1">{st.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: CATEGORIES GRID (20 CATEGORIES) ─── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            Marketplace Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
            Popular Categories to Sell Online
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href="/seller/register"
              className="px-5 py-2.5 bg-white border border-slate-200 hover:border-[#FF5722] hover:text-[#FF5722] text-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              Sell {cat} Online <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SECTION 9: SELLER FEATURES ─── */}
      <section className="py-16 bg-[#0F2537] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-full border border-[#FF5722]/30">
              Powerful Selling Infrastructure
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-3">
              Included Free in Every Seller Portal
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                <CheckCircle2 size={16} className="text-[#FF5722] shrink-0" />
                <span className="text-xs font-bold text-slate-200">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: DASHBOARD PREVIEW MOCKUP ─── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0F2537] to-[#1E3A8A] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Live Software Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Manage Orders, Inventory & Payouts in One Place
            </h2>
            <p className="text-slate-300 text-sm font-medium">
              Take complete control of your store with our high-tech seller dashboard featuring instant CSV upload, real-time analytics, and automated tax invoicing.
            </p>
            <button
              onClick={handleDemoAccess}
              className="px-8 py-4 bg-[#FF5722] hover:bg-[#e64a19] text-white font-black text-sm rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Monitor size={18} /> Explore Interactive Live Dashboard Demo
            </button>
          </div>

          <div className="w-full lg:w-1/2 bg-white text-slate-800 p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-black text-[#0F2537]">SELLER PORTAL v2.4</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">STORE ACTIVE</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-[#0F2537]">
                <span>Today's Sales</span>
                <span className="text-[#FF5722]">₹1,73,200</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-[#0F2537]">
                <span>Active Orders</span>
                <span>228 Orders</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-[#0F2537]">
                <span>Bank Payout Status</span>
                <span className="text-emerald-600">✓ Ready for Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: SUCCESS STORIES ─── */}
      <section id="stories" className="py-20 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              Proven Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2537] tracking-tight mt-3">
              Seller Success Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={t.image} alt={t.seller} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0" />
                    <div>
                      <h4 className="font-black text-[#0F2537] text-sm">{t.seller}</h4>
                      <p className="text-xs text-[#FF5722] font-bold">{t.company}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{t.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">{t.growth}</span>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-black">{t.revenue}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <button
                    onClick={() => {
                      setCurrentVideo({ title: t.company, seller: t.seller, city: t.city, quote: t.quote });
                      setVideoModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] hover:text-[#e64a19] transition-colors"
                  >
                    <Play size={13} fill="currentColor" /> Watch Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 12: FAQ ACCORDION ─── */}
      <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-black text-[#FF5722] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-black text-[#0F2537] tracking-tight mt-3">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-5 text-left font-black text-sm text-[#0F2537] flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180 text-[#FF5722]' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 13: FINAL CTA BANNER ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white rounded-3xl p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Grow Your Business Across India?
          </h2>
          <p className="text-white/90 text-sm sm:text-base font-medium max-w-xl mx-auto mb-8">
            Join 10 Lakh+ suppliers on India's largest B2B construction & industrial marketplace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/seller/register"
              className="px-8 py-4 bg-[#0F2537] hover:bg-[#1E3A8A] text-white font-black text-sm rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Create Seller Account Now <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:supplier@hinchmart.com"
              className="px-8 py-4 bg-white text-[#0F2537] hover:bg-slate-100 font-bold text-sm rounded-2xl shadow-md transition-all"
            >
              Contact Sales Desk
            </a>
          </div>
        </div>
      </section>

      {/* ─── SECTION 14: COMPREHENSIVE FOOTER ─── */}
      <footer className="bg-[#0F2537] text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-xs">
            <div>
              <h4 className="font-black text-white text-sm mb-4">Sellers</h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li><Link href="/seller/login" className="hover:text-white">Seller Login</Link></li>
                <li><Link href="/seller/register" className="hover:text-white">Create Account</Link></li>
                <li><Link href="/seller/dashboard" className="hover:text-white">Seller Dashboard</Link></li>
                <li><a href="#benefits" className="hover:text-white">Pricing & Commission</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white text-sm mb-4">Business</h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li><a href="#benefits" className="hover:text-white">Grow Business</a></li>
                <li><a href="#benefits" className="hover:text-white">Sponsored Ads</a></li>
                <li><a href="#benefits" className="hover:text-white">Bulk B2B Orders</a></li>
                <li><a href="#benefits" className="hover:text-white">Rental Supplies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li><a href="#how-it-works" className="hover:text-white">Selling Process</a></li>
                <li><a href="#stories" className="hover:text-white">Success Stories</a></li>
                <li><a href="#faqs" className="hover:text-white">FAQs & Help</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-slate-300 font-medium">
                <li><Link href="/about" className="hover:text-white">About HinchMart</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white text-sm mb-4">Contact</h4>
              <p className="text-slate-300 font-medium mb-1">Email: supplier@hinchmart.com</p>
              <p className="text-slate-300 font-medium mb-1">Helpline: +91 8388899999</p>
              <p className="text-slate-400 text-[11px] mt-2">HinchMart Internet India Pvt Ltd.</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
            <p>© 2026 HinchMart Inc. All Rights Reserved.</p>
            <p className="text-[#FF5722] font-bold">Built for India's Growing Suppliers 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && currentVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setVideoModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full z-10 shadow-2xl relative"
            >
              <button onClick={() => setVideoModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
                <X size={16} />
              </button>
              <div className="w-full h-48 bg-gradient-to-br from-[#0F2537] to-[#1E3A8A] rounded-2xl flex items-center justify-center text-white mb-4 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-[#FF5722] flex items-center justify-center shadow-lg shadow-orange-500/40">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
              <h3 className="text-lg font-black text-[#0F2537]">{currentVideo.seller}</h3>
              <p className="text-xs font-bold text-[#FF5722]">{currentVideo.title} • {currentVideo.city}</p>
              <p className="text-xs text-slate-600 font-medium mt-3 italic">"{currentVideo.quote}"</p>
              <button onClick={() => setVideoModalOpen(false)} className="mt-5 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl">
                Close Video
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
