"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Receipt, LogOut, Store, Menu, X } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If it's the login page, we don't need to enforce auth
    if (pathname === '/seller/login') return;

    const token = localStorage.getItem('seller_token');
    const info = localStorage.getItem('seller_info');

    if (!token || !info) {
      router.push('/seller/login');
    } else {
      setVendor(JSON.parse(info));
    }
  }, [pathname, router]);

  // Don't render the sidebar on the login page
  if (pathname === '/seller/login') {
    return <>{children}</>;
  }

  // If not logged in yet (and not on login page), don't render content to avoid flash
  if (!vendor) return null;

  const handleLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_info');
    router.push('/seller/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
    { name: 'My Products', href: '/seller/products', icon: Package },
    { name: 'Settlements', href: '/seller/settlements', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950">
            <Store className="text-white mr-2" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">Seller Central</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <div className="mb-6 px-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Store</p>
                <p className="text-sm font-bold text-white truncate mt-1">{vendor.companyName}</p>
              </div>
              
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-slate-800 p-4">
            <button onClick={handleLogout} className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <LogOut className="inline-block h-9 w-9 rounded-full text-slate-300 group-hover:text-white p-1" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Log out</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <Store className="text-white mr-2" size={20} />
          <span className="text-lg font-bold text-white tracking-tight">Seller Central</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 pt-16">
          <nav className="px-4 py-6 space-y-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-4 py-4 text-base font-medium rounded-xl ${
                      isActive ? 'bg-slate-800 text-white' : 'text-slate-300'
                    }`}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                );
            })}
            <button onClick={handleLogout} className="w-full text-left group flex items-center px-4 py-4 text-base font-medium rounded-xl text-red-400">
              <LogOut className="mr-4 h-6 w-6" />
              Log out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 md:pl-64 mt-16 md:mt-0">
        <main className="flex-1 relative focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
