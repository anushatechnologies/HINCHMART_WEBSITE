"use client";
import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export default function WishlistButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);

  const handleWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add to wishlist');
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const json = await res.json();
      
      if (json.success) {
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
      className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition shadow-sm border border-rose-100 active:scale-95 flex-shrink-0"
      title="Add to Wishlist"
    >
      <Heart size={24} className={loading ? 'animate-pulse' : ''} />
    </button>
  );
}
