"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User, Menu, X,
  IndianRupee, TrendingUp, MapPin, Boxes, Wallet, BarChart3, Lock, Bell,
  Zap, ExternalLink, Box, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeModal from '@/components/seller/WelcomeModal';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { name: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard, locked: false },
      { name: 'Business Setup', href: '/seller/onboarding/wizard', icon: Settings, locked: false },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { name: 'Sales', href: '/seller/dashboard/sales', icon: TrendingUp, locked: true },
      { name: 'Orders', href: '/seller/dashboard/orders', icon: ShoppingCart, locked: true },
      { name: 'Products', href: '/seller/dashboard/products', icon: Box, locked: true },
      { name: 'Inventory', href: '/seller/dashboard/inventory', icon: Boxes, locked: true },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Finance & Payouts', href: '/seller/dashboard/finance', icon: Wallet, locked: true },
      { name: 'Analytics', href: '/seller/dashboard/analytics', icon: BarChart3, locked: true },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Warehouses', href: '/seller/dashboard/warehouses', icon: MapPin, locked: true },
      { name: 'Store Settings', href: '/seller/dashboard/settings', icon: Settings, locked: false },
    ]
  }
];

function SidebarLink({ item, isActive, isLocked }: { item: any; isActive: boolean; isLocked: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={isLocked ? '/seller/onboarding/wizard' : item.href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
        ${isActive
          ? 'bg-white/10 text-white shadow-inner'
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
        }
        ${isLocked ? 'pointer-events-auto' : ''}
      `}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-violet-400 to-blue-400 rounded-r-full" />
      )}
      <Icon size={16} className={isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'} />
      <span className="flex-1 truncate">{item.name}</span>
      {isLocked && <Lock size={11} className="text-white/20 flex-shrink-0" />}
      {isActive && <ChevronRight size={13} className="text-white/40 flex-shrink-0" />}
    </Link>
  );
}

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState('Seller');
  const [sellerStatus, setSellerStatus] = useState('REGISTERED');
  const [onboardingProgress, setOnboardingProgress] = useState(10);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('seller_token');
    if (!token) { router.push('/seller/login'); return; }
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        setSellerName(parsed.companyName || parsed.ownerName || 'Seller');
        setSellerStatus(parsed.status || 'REGISTERED');
        setOnboardingProgress(parsed.onboardingProgress || 10);
        if (parsed.status === 'REGISTERED' && !sessionStorage.getItem('welcome_shown')) {
          setShowWelcomeModal(true);
          sessionStorage.setItem('welcome_shown', 'true');
        }
      } catch {}
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_info');
    document.cookie = 'seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/seller/login');
  };

  const isApproved = sellerStatus === 'ACTIVE' || sellerStatus === 'APPROVED';

  const initials = sellerName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-[#0d0d16] border-r border-white/5 flex flex-col
        transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 flex-shrink-0">
          <Link href="/seller/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 text-white font-black text-sm">H</div>
            <div>
              <p className="text-white font-black text-sm leading-none">HinchMart</p>
              <p className="text-white/25 text-[10px]">Seller Portal</p>
            </div>
          </Link>
          <button className="md:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Seller profile */}
        <div className="px-4 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {initials || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{sellerName}</p>
              {isApproved ? (
                <p className="text-emerald-400 text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Verified Seller</p>
              ) : (
                <p className="text-amber-400 text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />Pending Approval</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const isLocked = !isApproved && item.locked;
                  return <SidebarLink key={item.name} item={item} isActive={isActive} isLocked={isLocked} />;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Logout */}
        <div className="px-4 py-4 border-t border-white/5 flex-shrink-0 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 text-sm font-semibold transition-all">
            <ExternalLink size={16} /> View Marketplace
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-[#0d0d16] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button
            className="md:hidden p-2 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0d0d16]" />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">{initials || 'S'}</div>
              <span className="text-white/70 text-sm font-semibold hidden sm:block">{sellerName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* KYC progress banner */}
          {!isApproved && (
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Zap size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">Complete your KYC to unlock all seller features</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all" style={{ width: `${onboardingProgress}%` }} />
                      </div>
                      <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider">{onboardingProgress}% Complete</span>
                    </div>
                  </div>
                </div>
                <Link href="/seller/onboarding/wizard"
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 flex items-center gap-2">
                  <Zap size={14} /> Continue Setup
                </Link>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

        <WelcomeModal
          type="INITIAL_REGISTRATION"
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          vendorName={sellerName}
          progress={onboardingProgress}
        />
      </div>
    </div>
  );
}
