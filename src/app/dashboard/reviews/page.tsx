'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Package } from 'lucide-react';

const API = 'http://localhost:5000';

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
      if (data.success) setReviews(data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-orange-500 text-orange-500' : 'text-slate-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Reviews</h1>
      <p className="text-slate-500 mb-8">View and manage the ratings and reviews you've left for products.</p>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                {renderStars(review.rating)}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex-1 mb-6">
                <h4 className="font-extrabold text-slate-900 mb-2">{review.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                  {review.product?.images?.[0] ? (
                    <img src={review.product.images[0].url.startsWith('http') ? review.product.images[0].url : `${API}${review.product.images[0].url}`} alt={review.product.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package size={20} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${review.product?.slug}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {review.product?.name}
                  </Link>
                  <p className="text-xs font-medium text-slate-500">{review.product?.brand || 'Generic'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center flex flex-col items-center">
          <Star size={64} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3>
          <p className="text-slate-500 mb-6 max-w-md">You haven't reviewed any products yet. Review products you've purchased to help others make informed decisions.</p>
          <Link href="/dashboard/orders" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            View Past Orders
          </Link>
        </div>
      )}
    </div>
  );
}
