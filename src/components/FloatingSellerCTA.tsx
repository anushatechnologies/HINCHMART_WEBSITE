"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, X, ChevronRight } from 'lucide-react';

export default function FloatingSellerCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after 3 seconds scroll delay
    const timer = setTimeout(() => {
      const wasDismissed = sessionStorage.getItem('seller-cta-dismissed');
      if (!wasDismissed) setVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('seller-cta-dismissed', '1');
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9998] animate-in slide-in-from-bottom-4 fade-in duration-500"
      style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
    >
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-2xl shadow-orange-500/40 overflow-hidden w-[260px]">
        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          aria-label="Close"
        >
          <X size={12} />
        </button>

        {/* Glow orb */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

        <div className="p-5 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <div className="font-black text-sm leading-tight">Grow Your Business</div>
              <div className="text-orange-100 text-[10px]">Join 10,000+ Sellers</div>
            </div>
          </div>

          <p className="text-orange-100 text-xs mb-4 leading-relaxed">
            Start selling on HinchMart today. Free registration, weekly payouts.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              href="/sell"
              className="flex items-center justify-center gap-2 bg-white text-orange-600 font-black text-sm py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <Store size={14} />
              Become a Seller
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/sell?type=MANUFACTURER"
              className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs py-2 rounded-xl transition-colors"
            >
              🏭 Become a Vendor
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(1rem) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
