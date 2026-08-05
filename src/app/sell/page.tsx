"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('seller_token');
    if (token) {
      router.replace('/seller/dashboard');
    } else {
      router.replace('/seller');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F2537] flex items-center justify-center text-white font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#FF5722] rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold tracking-wider text-slate-300">Loading HinchMart Supplier Portal...</p>
      </div>
    </div>
  );
}
