'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight, Tag, Star, Package } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

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
      
      const res = await fetch(`${API}/api/wishlist`, {
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

      await fetch(`${API}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Optimistic UI update
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading Wishlist</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
              My Saved Items <span className="bg-rose-100 text-rose-600 text-sm font-black px-3 py-1 rounded-full">{wishlist.length}</span>
            </h1>
            <p className="text-slate-500 font-medium">Keep track of the products you love and want to buy later.</p>
          </div>
        </motion.div>
        
        {wishlist.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 relative z-10">
              <Heart size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight relative z-10">Your Wishlist is Empty</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm relative z-10">You haven't saved any items yet. Browse our catalog and hit the heart icon to save items here.</p>
            <Link href="/" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2 relative z-10">
              Discover Products <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
            <AnimatePresence>
              {wishlist.map((item) => {
                const product = item.product || {};
                const imageUrl = product.images?.[0]?.url 
                  ? (product.images[0].url.startsWith('http') ? product.images[0].url : `${API}${product.images[0].url}`)
                  : null;
                  
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    key={item.productId} 
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
                  >
                    <div className="relative h-64 w-full bg-slate-50 block overflow-hidden">
                      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10"></Link>
                      
                      {/* Image */}
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <Package size={40} className="mb-2 opacity-50" />
                          <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                        </div>
                      )}

                      {/* Overlays */}
                      <div className="absolute top-4 left-4 z-20">
                        {product.discount > 0 && (
                          <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Tag size={10} /> {product.discount}% OFF
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-4 right-4 z-20">
                        <button 
                          onClick={() => removeFromWishlist(item.productId)} 
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Remove from Wishlist"
                        >
                          <Heart size={20} className="fill-current" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col relative z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                          {product.brand || 'Premium'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                          <Star size={12} className="fill-current" /> 4.8
                        </div>
                      </div>
                      
                      <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                        <Link href={`/products/${product.slug}`}>{product.name || 'Unknown Product'}</Link>
                      </h3>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-black text-slate-900 tracking-tight">₹{Number(product.basePrice || 0).toLocaleString('en-IN')}</p>
                              {product.mrp && product.mrp > product.basePrice && (
                                <p className="text-sm font-bold text-slate-400 line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link 
                            href={`/products/${product.slug}`} 
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95"
                          >
                            <ShoppingCart size={16} /> View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
