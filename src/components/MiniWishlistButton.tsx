"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export default function MiniWishlistButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add to wishlist');
        return;
      }
      
      const res = await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const json = await res.json();
      
      if (json.success) {
        setAdded(true);
        alert('Added to wishlist!');
      } else {
        alert(json.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleWishlist}
      disabled={loading}
      className={`absolute right-2 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${added ? 'bg-red-50 text-red-600 opacity-100' : 'bg-white text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
      title="Add to Wishlist"
    >
      <Heart size={13} className={loading ? 'animate-pulse' : (added ? 'fill-red-600 text-red-600' : '')} />
    </button>
  );
}
