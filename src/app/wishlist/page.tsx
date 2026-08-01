"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        setWishlist(guestWishlist);
        setLoading(false);
        return;
      }
      
      const res = await fetch('http://localhost:5000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setWishlist(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        let guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        guestWishlist = guestWishlist.filter((item: any) => item.productId !== productId);
        localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
        setWishlist(guestWishlist);
        window.dispatchEvent(new Event('wishlist-updated'));
        return;
      }

      await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchWishlist();
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading wishlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Saved Lists / Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 mb-4">You haven't saved any items yet. Save items to quickly reorder later.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
              <Link href={`/products/${item.product.slug}`} className="relative h-48 w-full bg-slate-100 block">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0].url.startsWith('http') ? item.product.images[0].url : `http://localhost:5000${item.product.images[0].url}`} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                </h3>
                <p className="text-sm text-slate-500 mb-2">{item.product.brand}</p>
                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-extrabold text-slate-900">₹{item.product.basePrice}</p>
                    <button onClick={() => removeFromWishlist(item.productId)} className="text-slate-400 hover:text-red-500 text-sm font-medium transition">Remove</button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => removeFromWishlist(item.productId)} className="w-full border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold py-2.5 rounded-xl transition-colors uppercase tracking-widest text-[10px]">
                      Remove
                    </button>
                    <Link href={`/products/${item.product.slug}`} className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors uppercase tracking-widest text-[10px] shadow-sm">
                      View / Buy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
