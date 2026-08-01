"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Star, AlertOctagon, TrendingUp, RefreshCw, Loader2, ThumbsUp, ThumbsDown
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
  { key: 'analytics', label: 'Rating Analytics', icon: TrendingUp },
];

export default function ReviewsHub() {
  const [tab, setTab] = useState('reviews');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Form States
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'reviews') {
        const res = await fetch(`${API}/vendors/reviews?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setReviews(data.data);
      }
      if (tab === 'analytics') {
        const res = await fetch(`${API}/vendors/reviews/analytics?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setAnalytics(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleReply = async (reviewId: number) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;
    
    try {
      const res = await fetch(`${API}/vendors/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorReply: text })
      });
      if ((await res.json()).success) {
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingId) return;

    try {
      const res = await fetch(`${API}/vendors/reviews/${reportingId}/report`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason })
      });
      if ((await res.json()).success) {
        setReportingId(null);
        setReportReason('');
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-300'} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews & Feedback</h1>
          <p className="text-slate-500 mt-1">Engage with customers, reply to feedback, and monitor product sentiment.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && reviews.length === 0 && !analytics ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Customer Reviews */}
              {tab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.map(r => (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <img src={r.user?.avatarUrl || 'https://via.placeholder.com/40'} alt="User" className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                          <div>
                            <h4 className="font-bold text-slate-900">{r.user?.firstName} {r.user?.lastName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex">{renderStars(r.rating)}</div>
                              <span className="text-xs font-medium text-slate-400">• {new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                              Product: {r.product?.name}
                            </p>
                          </div>
                        </div>
                        {r.isReported ? (
                          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded-md border border-red-100">REPORTED</span>
                        ) : (
                          <button onClick={() => setReportingId(r.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Report Review">
                            <AlertOctagon size={16}/>
                          </button>
                        )}
                      </div>

                      <div className="mt-4 text-slate-700 text-sm">{r.comment || <span className="italic text-slate-400">No written feedback provided.</span>}</div>
                      
                      {r.imageUrl && (
                        <div className="mt-3">
                          <img src={r.imageUrl} alt="Review attachment" className="h-20 rounded-lg border border-slate-200 object-cover" />
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-slate-100">
                        {r.vendorReply ? (
                          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4">
                            <p className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1"><MessageSquare size={12}/> Your Reply</p>
                            <p className="text-sm text-slate-700">{r.vendorReply}</p>
                            <p className="text-[10px] text-slate-400 mt-2">Replied on {new Date(r.vendorRepliedAt).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Write a public reply..." 
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white transition-colors"
                              value={replyText[r.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                            />
                            <button onClick={() => handleReply(r.id)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && <div className="text-slate-500 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">No customer reviews available yet.</div>}
                </div>
              )}

              {/* 2. Rating Analytics */}
              {tab === 'analytics' && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 text-white rounded-xl p-8 flex flex-col items-center justify-center border border-slate-800 shadow-sm relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
                      <h3 className="text-slate-400 font-semibold mb-2 text-sm uppercase tracking-wider">Average Store Rating</h3>
                      <div className="text-6xl font-black mb-2">{analytics.averageRating}</div>
                      <div className="flex gap-1 mb-2">
                        {renderStars(Math.round(analytics.averageRating))}
                      </div>
                      <p className="text-slate-400 text-sm font-medium">Based on {analytics.totalReviews} total reviews</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4">Rating Distribution</h3>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = analytics.distribution[star] || 0;
                          const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="w-12 text-sm font-semibold text-slate-600 flex items-center gap-1">{star} <Star size={12} className="fill-slate-400 text-slate-400"/></span>
                              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="w-8 text-right text-xs font-bold text-slate-500">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
              <AlertOctagon className="text-red-600" size={24} />
              <h3 className="font-bold text-red-900 text-lg">Report Review</h3>
            </div>
            <form onSubmit={handleReport} className="p-6">
              <p className="text-sm text-slate-600 mb-4">Please provide a reason for reporting this review. Our moderation team will investigate it within 24-48 hours.</p>
              <textarea 
                value={reportReason} 
                onChange={e => setReportReason(e.target.value)} 
                required 
                placeholder="e.g. Contains offensive language or spam link..." 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-6 bg-slate-50 focus:bg-white" 
                rows={4}
              ></textarea>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setReportingId(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
