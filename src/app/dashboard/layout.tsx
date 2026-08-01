'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, MapPin, Heart, Star, LogOut, User, Menu, X, Package2, Wrench, Wallet, Gift, Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) setUserName(user.name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Rentals', href: '/dashboard/rentals', icon: Package2 },
    { name: 'Services', href: '/dashboard/services', icon: Wrench },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="font-extrabold text-slate-900 text-lg">My Account</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:sticky md:top-[72px] md:h-[calc(100vh-72px)] overflow-y-auto`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center font-black text-xl shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : <User size={24} />}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Welcome back</p>
            <p className="font-extrabold text-slate-900 truncate">{userName || 'Customer'}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-left">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
