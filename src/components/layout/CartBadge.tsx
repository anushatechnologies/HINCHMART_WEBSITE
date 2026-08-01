"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCount(guestCart.length);
        return;
      }

      fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data?.items) {
            setCount(d.data.items.length);
          }
        })
        .catch(() => {});
    };

    fetchCartCount();

    // Listen for custom event to update cart count instantly (e.g., when adding an item)
    window.addEventListener('cart-updated', fetchCartCount);
    return () => window.removeEventListener('cart-updated', fetchCartCount);
  }, []);

  return (
    <button 
      onClick={() => window.dispatchEvent(new Event('open-cart-drawer'))} 
      className="flex flex-col items-center justify-center group cursor-pointer relative bg-transparent border-none p-0 w-[50px]"
    >
      <ShoppingCart size={24} className="text-slate-600 group-hover:text-orange-500 transition-colors" strokeWidth={1.5}/>
      {count > 0 ? (
        <span className="absolute -top-1.5 right-1 w-5 h-5 bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
          {count}
        </span>
      ) : (
        <span className="absolute -top-1 right-1.5 w-4 h-4 bg-slate-200 text-[9px] font-bold text-slate-500 flex items-center justify-center rounded-full border border-white">
          0
        </span>
      )}
      <span className="text-[11px] font-bold text-slate-500 mt-1 group-hover:text-orange-600 transition-colors">Cart</span>
    </button>
  );
}
