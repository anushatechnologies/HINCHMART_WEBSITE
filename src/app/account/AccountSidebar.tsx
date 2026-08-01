"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Heart, Scale, MapPin,
  User, Bell, Star, Tag, Wallet, RefreshCw, FileText, ClipboardList, LogOut, Building2
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'My Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'My Company', href: '/account/company', icon: Building2 },
  { label: 'RFQ & Quotes', href: '/account/rfqs', icon: ClipboardList },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Compare', href: '/compare', icon: Scale },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Reward Points', href: '/account/rewards', icon: Star },
  { label: 'Wallet', href: '/account/wallet', icon: Wallet },
  { label: 'Coupons', href: '/account/coupons', icon: Tag },
  { label: 'Returns & Refunds', href: '/account/returns', icon: RefreshCw },
  { label: 'Download Invoices', href: '/account/invoices', icon: FileText },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Profile Settings', href: '/account/profile', icon: User },
];

export default function AccountSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0">
      {/* User Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
          <span className="text-white font-black text-2xl">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <h2 className="font-black text-slate-900 text-sm">{user?.name || 'Customer'}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email || user?.phone}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            {user?.role || 'Customer'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <nav className="py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-4 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border-blue-600'
                    : 'text-slate-700 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                }`}>
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-slate-100 mt-2 pt-2">
            <button
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full border-l-4 border-transparent hover:border-red-300 transition-all">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
