"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchWishlistCount = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        setCount(guestWishlist.length);
        return;
      }

      fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) {
            setCount(d.data.length);
          }
        })
        .catch(() => {});
    };

    fetchWishlistCount();

    window.addEventListener('wishlist-updated', fetchWishlistCount);
    return () => window.removeEventListener('wishlist-updated', fetchWishlistCount);
  }, []);

  return (
    <Link href="/wishlist" className="flex flex-col items-center justify-center group cursor-pointer relative hidden sm:flex w-[50px]">
      <Heart size={24} className="text-slate-600 group-hover:text-orange-500 transition-colors" strokeWidth={1.5}/>
      {count > 0 ? (
        <span className="absolute -top-1.5 right-1 w-5 h-5 bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
          {count}
        </span>
      ) : (
        <span className="absolute -top-1 right-1.5 w-4 h-4 bg-slate-200 text-[9px] font-bold text-slate-500 flex items-center justify-center rounded-full border border-white">
          0
        </span>
      )}
      <span className="text-[11px] font-bold text-slate-500 mt-1 group-hover:text-orange-600 transition-colors">Wishlist</span>
    </Link>
  );
}
