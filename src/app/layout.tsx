import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Phone, MapPin, HelpCircle } from 'lucide-react';
import SmartSearchBar from '../components/layout/SmartSearchBar';
import MegaMenu from '../components/layout/MegaMenu';
import ProfileButton from '../components/layout/ProfileButton';
import CartBadge from '../components/layout/CartBadge';
import CartDrawer from '../components/layout/CartDrawer';
import WishlistBadge from '../components/layout/WishlistBadge';
import Chatbot from '../components/Chatbot';
import ToastProvider from '../components/ToastProvider';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "HINCHMART | B2B Construction & Industrial Supplies",
  description: "India's largest B2B marketplace for construction materials, heavy machinery, tools, safety equipment, and industrial hardware supplies. GST billing, bulk orders, same-day delivery.",
  keywords: ["B2B Marketplace", "Construction Materials", "Industrial Hardware", "Procurement", "Wholesale", "India", "Bulk Orders", "GST Invoice"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">

        {/* ── Top Utility Bar ── */}
        <div className="bg-[#1a1a2e] text-white text-xs py-2 hidden md:block">
          <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-orange-400" />
              <span className="text-slate-300">Delivering to Hyderabad, 500072</span>
            </div>
            <div className="flex items-center gap-8 font-medium">
              <span className="text-slate-300">One Day Delivery</span>
              <span className="h-3 w-px bg-slate-600" />
              <span className="text-slate-300">Best Quality</span>
              <span className="h-3 w-px bg-slate-600" />
              <span className="text-slate-300">Best Prices</span>
            </div>
            <div className="flex items-center gap-5 text-slate-300">
              <Link href="/track-order" className="hover:text-white flex items-center gap-1 transition-colors">
                🔍 Track Order
              </Link>
              <Link href="/help" className="hover:text-white flex items-center gap-1 transition-colors">
                <HelpCircle size={11} /> Help & Support
              </Link>
              <Link href="/sell" className="hover:text-orange-400 font-bold transition-colors">
                🏪 Sell on HinchMart
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Header ── */}
        <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 h-[72px] flex items-center gap-4">

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-3 group min-w-[210px]">
              <Image
                src="/logo.png"
                alt="HinchMart"
                width={220}
                height={78}
                priority
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </Link>

            {/* Search */}
            <div className="flex-1 flex justify-center px-4">
              <SmartSearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 shrink-0 ml-4">
              <div className="flex items-center gap-5">
                <ProfileButton />
                <WishlistBadge />
                <CartBadge />
              </div>

              <div className="w-px h-8 bg-slate-200 hidden lg:block -mx-2"></div>

              <Link href="/sell" className="hidden lg:flex items-center gap-2 bg-[#1a1a2e] hover:bg-orange-500 text-white px-4 py-2.5 rounded-lg font-bold text-[13px] tracking-wide transition-all shadow-sm hover:shadow-md">
                Sell on HinchMart
              </Link>
            </div>
          </div>

          {/* ── Nav Bar ── */}
          <nav className="bg-[#1a1a2e] hidden md:block">
            <div className="max-w-[1400px] mx-auto px-4 flex items-stretch h-[44px] gap-0">
              <MegaMenu />

              {/* Nav Links */}
              <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="flex items-stretch h-full px-2 min-w-max">
                  {[
                    { label: 'Brands', href: '/brands', badge: null },
                    { label: 'Same Day Delivery', href: '/search?delivery=sameday', badge: 'NEW' },
                  { label: 'Rentals', href: '/rent', badge: null },
                  { label: 'Services', href: '/services', badge: null },
                  { label: 'Offers', href: '/offers', badge: 'HOT' },
                  { label: 'Bulk Orders', href: '/rfq', badge: null },
                ].map((item) => (
                    <Link key={item.label} href={item.href}
                      className="relative h-full flex items-center px-3.5 text-[13px] font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">
                      {item.label}
                      {item.badge && (
                        <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${item.badge === 'NEW' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Call Now */}
              <Link href="tel:18001234567"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 h-full transition-colors shrink-0">
                <Phone size={15} />
                <div className="leading-tight">
                  <div className="text-[9px] font-medium opacity-80">Call Us Now</div>
                  <div className="text-sm font-black">+91 8388899999</div>
                </div>
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#1a1a2e] text-slate-300">
          <div className="max-w-[1400px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="HinchMart"
                  width={180}
                  height={64}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                India&apos;s trusted B2B marketplace for construction materials, industrial supplies, tools, and equipment with fast delivery and GST billing.
              </p>
              <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-4 mb-4">
                <Phone size={20} className="text-orange-400" />
                <div>
                  <div className="text-xs text-slate-400">Customer Support</div>
                  <div className="text-white font-bold">+91 8388899999</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-2.5 text-sm">
                {['About Us', 'Careers', 'Corporate Governance', 'Impact & CSR', 'Press & Media'].map((label) => (
                  <li key={label}>
                    <Link href="#" className="hover:text-orange-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Business</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Sell on HinchMart', href: '/sell' },
                  { label: 'Supplier Portal', href: '#' },
                  { label: 'Submit RFQ', href: '/rfq' },
                  { label: 'Contractor Zone', href: '#' },
                  { label: 'Partner Program', href: '#' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-orange-400 transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Help & Policies</h3>
              <ul className="space-y-2.5 text-sm">
                {['Help Center', 'Track Order', 'Return Policy', 'Privacy Policy', 'Terms of Use'].map((label) => (
                  <li key={label}>
                    <Link href="#" className="hover:text-orange-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800">
            <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
              <p>© {new Date().getFullYear()} HINCHMART Technologies Pvt. Ltd. All rights reserved.</p>
              <div className="flex gap-6 mt-3 md:mt-0">
                {['Terms of Use', 'Privacy Policy', 'Return Policy', 'Sitemap'].map((label) => (
                  <Link key={label} href="#" className="hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

        <Chatbot />
        <CartDrawer />
        <ToastProvider />
      </body>
    </html>
  );
}
