"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, Package, Heart, Scale, Truck, Wrench, Wallet, Gift, 
  Tag, MapPin, Bell, Star, LifeBuoy, FileText, Settings, LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/account', icon: User },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Compare', href: '/account/compare', icon: Scale },
  { label: 'Rental Orders', href: '/account/rentals', icon: Truck },
  { label: 'Service Bookings', href: '/account/services', icon: Wrench },
  { label: 'Wallet', href: '/account/wallet', icon: Wallet },
  { label: 'Rewards', href: '/account/rewards', icon: Gift },
  { label: 'Coupons', href: '/account/coupons', icon: Tag },
  { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Reviews', href: '/account/reviews', icon: Star },
  { label: 'Support Tickets', href: '/account/support', icon: LifeBuoy },
  { label: 'Invoices', href: '/account/invoices', icon: FileText },
  { label: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Simple route guard
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xl mb-3">
                {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="font-bold text-slate-800">
                {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.name || 'User'}
              </h3>
              <p className="text-xs text-slate-500">
                {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.phone || 'B2B Member'}
              </p>
            </div>

            <nav className="p-3 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-orange-500'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} className="text-red-500" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
