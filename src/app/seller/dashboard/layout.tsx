"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Layers, Boxes, Warehouse, ShoppingCart,
  Users, Megaphone, Wallet, BarChart3, Settings, ExternalLink, LogOut,
  ChevronRight, Search, Bell, Menu, X, Building2, Lock, Gift, User, FileText,
  Plus, ShieldCheck, ChevronDown, Sparkles, HelpCircle, Truck, Star
} from 'lucide-react';
import CommandPalette from '@/components/seller/CommandPalette';

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
      { name: 'Reviews', href: '/seller/dashboard/reviews', icon: Star },
      { name: 'Logistics', href: '/seller/dashboard/shipping', icon: Truck },
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
        className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 opacity-50 cursor-not-allowed text-xs font-semibold select-none"
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
        flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group
        ${isActive
          ? 'bg-[#FF6B2C] text-white font-bold shadow-xs'
          : 'text-[#CBD5E1] hover:text-white hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
          isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[#FF6B2C]'
        }`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState('Anusha Bazaar');
  const [sellerStatus, setSellerStatus] = useState('APPROVED');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const loadInfo = () => {
      const info = localStorage.getItem('seller_info');
      if (info) {
        try {
          const parsed = JSON.parse(info);
          setSellerName(parsed.companyName || parsed.ownerName || 'Anusha Bazaar');
          setSellerStatus(parsed.status || 'APPROVED');
        } catch {}
      }
    };
    loadInfo();
    window.addEventListener('seller_info_updated', loadInfo);
    return () => window.removeEventListener('seller_info_updated', loadInfo);
  }, [router]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('seller_refresh_token');
      if (refreshToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch {}

    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_refresh_token');
    localStorage.removeItem('seller_info');

    document.cookie = 'seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'seller_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'seller_info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    router.push('/seller/login');
  };

  const isApproved = sellerStatus === 'ACTIVE' || sellerStatus === 'APPROVED';
  const initials = sellerName ? sellerName.substring(0, 2).toUpperCase() : 'AB';
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F7F9FC] flex font-sans text-[#172033]">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR (240px, #0B1F3A CORPORATE NAVY)
         ───────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[240px] h-full bg-[#0B1F3A] flex flex-col text-white shrink-0
        transition-transform duration-200 ease-in-out border-r border-[#102A43]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#102A43] shrink-0 bg-[#0B1F3A]">
          <Link href="/seller/dashboard" prefetch={true} className="flex items-center gap-2.5">
            <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm flex items-center justify-center border border-white/20">
              <img src="/logo.png" alt="HinchMart" className="h-6 w-auto max-w-[110px] object-contain" />
            </div>
            <span className="text-[9px] font-bold uppercase text-[#FF6B2C] bg-[#FFF1EA] px-1.5 py-0.5 rounded tracking-wider">
              Seller
            </span>
          </Link>
          <button className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Seller Profile Card */}
        <div className="px-3 py-3 border-b border-[#102A43] shrink-0 bg-[#102A43]/40">
          <Link href="/seller/dashboard/profile" className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/10 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B2C] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate group-hover:text-[#FF6B2C] transition-colors">{sellerName}</p>
              <p className="text-[#16A34A] text-[10px] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full inline-block" />Verified Seller
              </p>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="space-y-1">
              <div className="flex items-center gap-2 px-3 mb-1">
                <span className="w-1 h-2.5 rounded-full bg-[#FF6B2C]" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{group.label}</p>
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
        <div className="px-3 py-3 border-t border-[#102A43] shrink-0 bg-[#0B1F3A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut size={15} /> Logout Account
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. RIGHT MAIN CONTENT CANVAS (WHITE HEADER 72px + LIGHT GREY CANVAS)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* White Top Header (Height 72px, Border #E4E7EC) */}
        <header className="h-[72px] bg-white border-b border-[#E4E7EC] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-xs">
          
          {/* Left: Mobile Toggle & Page Greeting */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-[#172033] capitalize leading-snug">
                {pageTitle}
              </h1>
              <p className="text-xs text-[#667085] font-medium hidden sm:block">
                Good morning, {sellerName} 👋
              </p>
            </div>
          </div>

          {/* Right Action Icons & Seller Profile */}
          <div className="flex items-center gap-3">
            
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-[#667085] hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Search products, orders, customers..."
            >
              <Search size={18} />
            </button>

            {/* Notifications Bell */}
            <Link
              href="/seller/dashboard/notifications"
              className="p-2.5 text-[#667085] hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF6B2C] rounded-full" />
            </Link>

            {/* Help Button */}
            <Link
              href="/seller/dashboard/support"
              className="p-2.5 text-[#667085] hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Help & Support"
            >
              <HelpCircle size={18} />
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-[#E4E7EC] mx-1" />

            {/* Add Product Orange Button */}
            <Link
              href="/seller/dashboard/products/add"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#FF6B2C] hover:bg-[#E9551C] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} /> Add Product
            </Link>

            {/* Seller Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] text-white font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <ChevronDown size={14} className="text-[#667085]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4E7EC] rounded-xl shadow-lg p-1.5 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-[#E4E7EC]">
                    <p className="text-xs font-bold text-[#172033] truncate">{sellerName}</p>
                    <p className="text-[11px] text-[#667085] truncate">Seller ID: HM-{sellerName.slice(0, 3).toUpperCase()}</p>
                  </div>

                  <Link href="/seller/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-[#FFF1EA] hover:text-[#FF6B2C] rounded-lg">
                    <User size={14} /> Store Profile
                  </Link>

                  <Link href="/seller/dashboard/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#172033] hover:bg-[#FFF1EA] hover:text-[#FF6B2C] rounded-lg">
                    <Settings size={14} /> Account Settings
                  </Link>

                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50 rounded-lg cursor-pointer">
                    <LogOut size={14} /> Logout Account
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dynamic Page Canvas (Light Grey #F7F9FC) */}
        <main className="flex-1 p-6 sm:p-8 bg-[#F7F9FC] max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
