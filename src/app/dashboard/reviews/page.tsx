'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Package, Edit3, Trash2, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API}/api/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) setReviews(data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div 
            key={star}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: star * 0.1 }}
          >
            <Star
              size={18}
              className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">My Reviews & Ratings</h1>
          <p className="text-slate-500 font-medium">View and manage the feedback you've left on your purchased products.</p>
        </div>
      </motion.div>

      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-400 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
            <AnimatePresence>
              {reviews.map((review, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  key={review.id} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-50">
                    <div className="flex flex-col gap-2">
                      {renderStars(review.rating)}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Verified Purchase
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex-1 mb-8 relative">
                    <div className="absolute -top-4 -left-2 text-6xl text-slate-100/50 font-serif leading-none select-none">"</div>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight mb-3 relative z-10">{review.title}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed relative z-10">{review.comment}</p>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                    <Link href={`/products/${review.product?.slug}`} className="flex items-center gap-4 group/product w-full max-w-[70%]">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2 shrink-0 group-hover/product:bg-blue-50 group-hover/product:border-blue-100 transition-colors">
                        {review.product?.images?.[0] ? (
                          <img src={review.product.images[0].url.startsWith('http') ? review.product.images[0].url : `${API}${review.product.images[0].url}`} alt={review.product.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package size={24} className="text-slate-300 group-hover/product:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{review.product?.brand || 'Premium'}</p>
                        <h5 className="text-sm font-bold text-slate-900 group-hover/product:text-blue-600 transition-colors truncate">
                          {review.product?.name || 'Product'}
                        </h5>
                      </div>
                    </Link>
                    
                    <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-amber-400/10 rounded-full animate-pulse"></div>
              <Star size={40} className="text-amber-400 relative z-10 fill-amber-400/20" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Reviews Found</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">You haven't reviewed any products yet. Share your experience with products you've purchased to help other shoppers and earn reward points!</p>
            <Link 
              href="/dashboard/orders" 
              className="bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 flex items-center gap-2"
            >
              View Past Orders <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
