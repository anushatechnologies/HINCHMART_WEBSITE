"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Layers, Boxes, Warehouse, ShoppingCart,
  Users, Megaphone, Wallet, BarChart3, Settings, ExternalLink, LogOut,
  ChevronRight, Search, Bell, Menu, X, Building2, Lock, Gift, User, FileText,
  Plus, ShieldCheck, ChevronDown, Sparkles
} from 'lucide-react';
import CommandPalette from '@/components/seller/CommandPalette';
import WelcomeModal from '@/components/seller/WelcomeModal';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  locked?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/seller/dashboard/analytics', icon: BarChart3 },
      { name: 'Finance & Payouts', href: '/seller/dashboard/finance', icon: Wallet },
    ]
  },
  {
    label: 'CATALOG & INVENTORY',
    items: [
      { name: 'Products', href: '/seller/dashboard/products', icon: Package, badge: 'SKUs' },
      { name: 'Inventory', href: '/seller/dashboard/inventory', icon: Boxes },
      { name: 'Brands', href: '/seller/dashboard/brands', icon: Tag },
      { name: 'Categories', href: '/seller/dashboard/categories', icon: Layers },
      { name: 'Warehouses', href: '/seller/dashboard/warehouses', icon: Warehouse },
    ]
  },
  {
    label: 'SALES & ORDERS',
    items: [
      { name: 'Customer Orders', href: '/seller/dashboard/orders', icon: ShoppingCart, badge: 'Live' },
      { name: 'B2B Customers', href: '/seller/dashboard/customers', icon: Users },
      { name: 'Marketing & Ads', href: '/seller/dashboard/marketing', icon: Megaphone },
    ]
  },
  {
    label: 'STORE ACCOUNT',
    items: [
      { name: 'Store Profile', href: '/seller/dashboard/profile', icon: User, badge: 'Info' },
      { name: 'Documents & KYC', href: '/seller/dashboard/documents', icon: FileText, badge: 'KYC' },
      { name: 'Store Settings', href: '/seller/dashboard/settings', icon: Settings },
    ]
  }
];

function SidebarLink({ item, isActive, isLocked }: { item: NavItem; isActive: boolean; isLocked?: boolean }) {
  const Icon = item.icon;
  if (isLocked) {
    return (
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 opacity-50 cursor-not-allowed text-xs font-semibold select-none"
        title="Complete onboarding verification to unlock"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} />
          <span>{item.name}</span>
        </div>
        <Lock size={12} className="text-slate-400" />
      </div>
    );
  }
  return (
    <Link
      href={item.href}
      prefetch={true}
      className={`
        flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group
        ${isActive
          ? 'bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white shadow-md shadow-orange-500/20'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[#FF5722]'
        }`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/seller/dashboard';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [sellerName, setSellerName] = useState('Anusha Bazaar');
  const [sellerStatus, setSellerStatus] = useState('APPROVED');
  const [onboardingProgress, setOnboardingProgress] = useState(100);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadInfo = () => {
      const token = localStorage.getItem('seller_token');
      if (!token) {
        router.push('/seller/login');
        return;
      }
      const info = localStorage.getItem('seller_info');
      if (info) {
        try {
          const parsed = JSON.parse(info);
          setSellerName(parsed.companyName || parsed.ownerName || 'Anusha Bazaar');
          setSellerStatus(parsed.status || 'APPROVED');
          let progress = 100;
          if (parsed.status === 'ACTIVE' || parsed.status === 'APPROVED') {
            progress = 100;
          } else if (parsed.onboardingStep) {
            progress = Math.min(100, Math.round((parsed.onboardingStep / 8) * 100));
          } else {
            progress = parsed.onboardingProgress || 100;
          }
          setOnboardingProgress(progress);
        } catch {}
      }
    };
    loadInfo();
    window.addEventListener('seller_info_updated', loadInfo);
    return () => window.removeEventListener('seller_info_updated', loadInfo);
  }, [router]);

  const handleLogout = async () => {
    try {
      // Revoke refresh token in DB
      const refreshToken = localStorage.getItem('seller_refresh_token');
      if (refreshToken) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch { /* ignore errors on logout */ }

    // Clear all local tokens
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_refresh_token');
    localStorage.removeItem('seller_info');

    document.cookie = 'seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'seller_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'seller_info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    router.push('/seller');
  };

  const isApproved = sellerStatus === 'ACTIVE' || sellerStatus === 'APPROVED';
  const initials = sellerName ? sellerName.substring(0, 2).toUpperCase() : 'AB';
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── LEFT SIDEBAR (STATIC ON DESKTOP, SLIDE-OVER ON MOBILE) ─── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[245px] h-full bg-[#0A111E] flex flex-col text-white shrink-0
        transition-transform duration-200 ease-in-out border-r border-slate-800/80
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Official Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0 bg-[#0B1426]/60 backdrop-blur-md">
          <Link href="/seller/dashboard" prefetch={true} className="flex items-center gap-2.5">
            <div className="bg-white p-1.5 rounded-xl shadow-lg shadow-black/20 flex items-center justify-center border border-white/20">
              <img src="/logo.png" alt="HinchMart" className="h-7 w-auto max-w-[125px] object-contain" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#FF5722] bg-[#FF5722]/10 px-2 py-0.5 rounded-md border border-[#FF5722]/30 tracking-wider shadow-xs">
              Seller
            </span>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Seller profile card */}
        <div className="px-3 py-3.5 border-b border-slate-800/80 shrink-0 bg-[#0B1426]/40">
          <Link href="/seller/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-orange-500/20 border border-white/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-black truncate group-hover:text-[#FF8A65] transition-colors">{sellerName}</p>
              <p className="text-[#00E676] text-[10px] font-extrabold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-pulse inline-block shadow-xs" />Verified Seller
              </p>
            </div>
          </Link>
        </div>

        {/* Independent Scrollable Navigation Bar */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="space-y-1">
              <div className="flex items-center gap-2 px-3 mb-1.5">
                <span className="w-1 h-3 rounded-full bg-[#FF5722]" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.18em]">{group.label}</p>
              </div>
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = item.href === '/seller/dashboard'
                    ? pathname === '/seller/dashboard'
                    : (pathname === item.href || pathname.startsWith(item.href + '/'));
                  const isLocked = !isApproved && item.locked;
                  return <SidebarLink key={item.name} item={item} isActive={isActive} isLocked={isLocked} />;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Logout Action */}
        <div className="px-3 py-3.5 border-t border-slate-800/80 shrink-0 bg-[#0B1426]/60 backdrop-blur-md">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-slate-300 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut size={15} /> Logout Account
          </button>
        </div>
      </aside>

      {/* ─── RIGHT MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* World-Class Enterprise Navigation Bar (Sticky Top Bar) */}
        <header className="h-16 bg-gradient-to-r from-[#0B132B] via-[#0F2537] to-[#1C2541] border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-xl text-white sticky top-0 z-30 backdrop-blur-md">
          
          {/* Left Controls: Hamburger + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Path */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Store Online</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Building2 size={14} className="text-[#FF5722]" />
                <span>Seller Portal</span>
                <ChevronRight size={13} className="text-slate-500" />
                <span className="font-bold text-white uppercase tracking-wide capitalize text-xs">
                  {pageTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Quick Add + Search + Notifications + Profile Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Quick Add Product Button */}
            <Link
              href="/seller/dashboard/products/add"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#e64a19] hover:to-[#ff5722] text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={15} /> Add Product
            </Link>

            {/* Quick Command Search ⌘K */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs text-slate-200 transition-all cursor-pointer shadow-sm group"
            >
              <Search size={14} className="text-[#FF5722]" />
              <span className="font-semibold group-hover:text-white">Search or jump to...</span>
              <kbd className="ml-2 text-[10px] bg-black/30 border border-white/20 text-slate-300 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5722] rounded-full ring-2 ring-[#0F2537]" />
            </button>

            <div className="h-6 w-px bg-white/10" />

            {/* ─── INTERACTIVE PROFILE DROPDOWN MENU ─── */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center text-white text-xs font-black shadow-md shadow-orange-500/20">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-none group-hover:text-[#FF7043] transition-colors">{sellerName}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Verified Merchant</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Floating Dropdown Window */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0F2537] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-white space-y-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-xs font-black text-white">{sellerName}</p>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5">ID: HM-SELLER-9042</p>
                    <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">
                      ✓ Verified Partner (0% Fee)
                    </span>
                  </div>

                  <Link
                    href="/seller/dashboard/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User size={15} className="text-[#FF5722]" /> Store Profile
                  </Link>

                  <Link
                    href="/seller/dashboard/documents"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FileText size={15} className="text-[#FF7043]" /> Documents & KYC
                  </Link>

                  <Link
                    href="/seller/dashboard/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Settings size={15} className="text-slate-400" /> Store Settings
                  </Link>

                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} /> Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

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
