"use client";
import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  user: { name: string } | null;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
}

const StarRating = ({ value, interactive = false, onChange }: { value: number; interactive?: boolean; onChange?: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={interactive ? 26 : 14}
          className={`transition-colors ${
            i <= (interactive ? (hovered || value) : value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-200'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
};

export default function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({ averageRating: 0, totalReviews: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchReviews(); }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`);
      const json = await res.json();
      if (json.success) {
        setReviews(json.data);
        setSummary(json.summary || { averageRating: 0, totalReviews: 0 });
      }
    } catch (error) { console.error(error); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) { setError('Please login to leave a review.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setComment('');
        setRating(5);
      } else {
        setError(json.message || 'Submission failed.');
      }
    } catch { setError('An error occurred. Try again.'); }
    finally { setSubmitting(false); }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="mt-16 border-t border-slate-200 pt-12">
      <h3 className="font-extrabold text-2xl text-slate-900 mb-10">Customer Reviews</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ─── Left: Aggregate Rating Summary ─── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Big Rating */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="text-6xl font-black text-slate-900">{summary.averageRating || '—'}</div>
            <div className="my-3 flex justify-center">
              <StarRating value={Math.round(summary.averageRating)} />
            </div>
            <div className="text-xs text-slate-500 font-medium">{summary.totalReviews} verified review{summary.totalReviews !== 1 ? 's' : ''}</div>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="space-y-2">
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 font-bold w-4">{star}</span>
                <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-slate-400 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Center: Reviews List ─── */}
        <div className="lg:col-span-1 space-y-5">
          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ThumbsUp size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 font-medium">No reviews yet</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                    {(review.user?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">{review.user?.name || 'Customer'}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle size={9} /> Verified
                      </span>
                    </div>
                    <StarRating value={review.rating} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* ─── Right: Write Review Form ─── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-xl shadow-slate-100/60 sticky top-24">
            <h4 className="font-extrabold text-lg text-slate-900 mb-1">Write a Review</h4>
            <p className="text-xs text-slate-400 mb-6">Your feedback helps other buyers make decisions.</p>

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
                <p className="font-bold text-slate-900">Review Submitted!</p>
                <p className="text-xs text-slate-500 mt-1">It will appear once approved by our team.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-5">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">{error}</div>}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Your Rating</label>
                  <StarRating value={rating} interactive onChange={setRating} />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Your Review *</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="What did you like or dislike about this product?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-lg disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
