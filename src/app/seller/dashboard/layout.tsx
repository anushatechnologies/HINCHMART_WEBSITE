"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  X,
  IndianRupee,
  TrendingUp,
  Users,
  MapPin,
  Box,
  Boxes,
  Wallet,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState('Seller');
  const [sellerStatus, setSellerStatus] = useState('PENDING');

  useEffect(() => {
    const token = localStorage.getItem('seller_token');
    if (!token) {
      router.push('/seller/login');
      return;
    }
    const info = localStorage.getItem('seller_info');
    if (info) {
      try {
        const parsed = JSON.parse(info);
        
        // Enforce Onboarding flow
        if (parsed.onboardingStep && parsed.onboardingStep < 9) {
          router.push('/seller/onboarding');
          return;
        }

        setSellerName(parsed.companyName || parsed.ownerName || 'Seller');
        setSellerStatus(parsed.status || 'PENDING');
      } catch (e) {}
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_info');
    document.cookie = 'seller_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/seller/login');
  };

  const navItems = [
    { name: 'Overview', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Sales Dashboard', href: '/seller/dashboard/sales', icon: TrendingUp },
    { name: 'Orders Dashboard', href: '/seller/dashboard/orders', icon: ShoppingCart },
    { name: 'Inventory Dashboard', href: '/seller/dashboard/inventory', icon: Boxes },
    { name: 'Products', href: '/seller/dashboard/products', icon: Box },
    { name: 'Finance & Settlements', href: '/seller/dashboard/finance', icon: Wallet },
    { name: 'Analytics Dashboard', href: '/seller/dashboard/analytics', icon: BarChart3 },
    { name: 'Team Roles', href: '/seller/dashboard/team', icon: Users },
    { name: 'Warehouses', href: '/seller/dashboard/warehouses', icon: MapPin },
    { name: 'Store Settings', href: '/seller/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/seller/dashboard" className="text-xl font-black text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-lg">H</span>
            </div>
            Seller Portal
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <User size={20} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold truncate w-40">{sellerName}</p>
              {sellerStatus === 'ACTIVE' || sellerStatus === 'APPROVED' ? (
                <p className="text-xs text-emerald-400 font-semibold">Verified Seller</p>
              ) : (
                <p className="text-xs text-amber-400 font-semibold">Registration Pending</p>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/" className="text-sm font-medium text-red-600 hover:underline">
              View Marketplace
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {sellerStatus !== 'ACTIVE' && sellerStatus !== 'APPROVED' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Account Registration & KYC Verification Pending</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Your profile documents are pending review. Upload GSTIN, PAN, and Bank details to complete verification.</p>
                </div>
              </div>
              <Link href="/seller/onboarding" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex-shrink-0">
                Upload Documents
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
