"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ShoppingCart, Users, Settings, Wallet, BarChart3, TrendingUp, X, ChevronRight, Zap } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS = [
  { name: 'Dashboard Home', category: 'Navigation', href: '/seller/dashboard', icon: Zap },
  { name: 'Product Catalog', category: 'Catalog', href: '/seller/dashboard/products', icon: Package },
  { name: 'Add New Product', category: 'Catalog', href: '/seller/dashboard/products/add', icon: Package },
  { name: 'Orders Hub', category: 'Sales', href: '/seller/dashboard/orders', icon: ShoppingCart },
  { name: 'Customer Directory', category: 'Customers', href: '/seller/dashboard/customers', icon: Users },
  { name: 'Stock & Inventory', category: 'Inventory', href: '/seller/dashboard/inventory', icon: Zap },
  { name: 'Marketing & Promotions', category: 'Growth', href: '/seller/dashboard/marketing', icon: TrendingUp },
  { name: 'Finance & Payouts', category: 'Finance', href: '/seller/dashboard/finance', icon: Wallet },
  { name: 'Analytics & Performance', category: 'Analytics', href: '/seller/dashboard/analytics', icon: BarChart3 },
  { name: 'Store Settings', category: 'Settings', href: '/seller/dashboard/settings', icon: Settings },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0F2537]/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <Search size={18} className="text-[#FF5722] shrink-0 mr-3" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type a command or search page... (e.g. Products, Orders)"
              className="w-full bg-transparent text-sm font-semibold text-[#0F2537] outline-none placeholder:text-slate-400"
              autoFocus
            />
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs font-medium">
                No matching pages found for "{query}"
              </div>
            ) : (
              filtered.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(cmd.href)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5722] flex items-center justify-center shrink-0 group-hover:bg-[#FF5722] group-hover:text-white transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0F2537] group-hover:text-[#FF5722] transition-colors">{cmd.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{cmd.category}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#FF5722] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-xs">ESC</kbd> to close
            </span>
            <span className="flex items-center gap-1 text-[#FF5722] font-bold">
              <Zap size={11} /> Quick Navigation
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
