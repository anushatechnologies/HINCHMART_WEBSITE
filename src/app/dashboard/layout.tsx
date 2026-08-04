'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, MapPin, Heart, Star, LogOut, 
  User, Menu, X, Package2, Wrench, Wallet, Gift, Bell, 
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{name?: string; email?: string}>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Rentals', href: '/dashboard/rentals', icon: Package2 },
    { name: 'Services', href: '/dashboard/services', icon: Wrench },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
  ];

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black">
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">My Account</div>
            <div className="text-[10px] text-slate-500 font-medium">Manage your profile</div>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-700 rounded-full active:scale-95 transition-transform"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : -320, opacity: isMobileMenuOpen ? 1 : 0 }}
        className={`
          fixed md:sticky top-[72px] md:top-0 left-0 h-[calc(100vh-72px)] md:h-screen w-72 
          bg-white border-r border-slate-200 shrink-0 z-30 overflow-y-auto flex flex-col shadow-2xl md:shadow-none
          md:translate-x-0 md:opacity-100 transition-none
          ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}
        `}
      >
        <div className="p-6 border-b border-slate-100 hidden md:flex items-center gap-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xl shrink-0 shadow-inner border border-blue-100">
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest mb-0.5">Welcome back</p>
            <p className="font-extrabold text-slate-900 truncate text-base">{user.name || 'Customer'}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 relative overflow-hidden ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-blue-600 -z-10" />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon size={18} className={`${isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
                  <span className="text-sm tracking-tight">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-blue-200 relative z-10" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 overflow-x-hidden min-h-screen relative">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
