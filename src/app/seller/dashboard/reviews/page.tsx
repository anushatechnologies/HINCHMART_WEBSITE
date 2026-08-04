"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Star, AlertOctagon, TrendingUp, RefreshCw, Loader2, ThumbsUp, ThumbsDown,
  MessageCircle, StarHalf, ShieldAlert, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
  { key: 'analytics', label: 'Rating Analytics', icon: TrendingUp },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };



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

  const renderStars = (rating: number, size = 14) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = !isFull && i < rating;
      
      if (isFull) return <Star key={i} size={size} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />;
      if (isHalf) return <StarHalf key={i} size={size} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />;
      return <Star key={i} size={size} className="fill-slate-200 text-slate-200" />;
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Feedback</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <MessageCircle size={16} className="text-indigo-500" /> Engage with customers, reply to reviews, and monitor product sentiment.
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Reviews
        </button>
      </motion.div>

      {/* Main Container */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all relative
                  ${isActive ? 'border-indigo-600 text-indigo-700 bg-white shadow-[0_-1px_0_0_#f8fafc]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-indigo-500' : ''} /> 
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-0 bg-slate-50/30">
          {loading && reviews.length === 0 && !analytics ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Loading feedback...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* 1. Customer Reviews */}
              {tab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full">
                  <div className="space-y-6">
                    {reviews.map((r, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={r.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className="relative">
                              <img src={r.user?.avatarUrl || `https://ui-avatars.com/api/?name=${r.user?.firstName}+${r.user?.lastName}&background=e2e8f0&color=475569`} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                {r.user?.firstName} {r.user?.lastName}
                                {r.isVerifiedPurchase && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">Verified Buyer</span>}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex gap-0.5">{renderStars(r.rating, 16)}</div>
                                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                  <Clock size={12}/> {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {r.isReported ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 font-black px-2.5 py-1 rounded-lg border border-red-200">
                              <ShieldAlert size={12}/> IN REVIEW
                            </span>
                          ) : (
                            <button onClick={() => setReportingId(r.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Report Review">
                              <AlertOctagon size={18}/>
                            </button>
                          )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 inline-flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Product:</span>
                          <span className="text-sm font-semibold text-slate-900">{r.product?.name}</span>
                        </div>

                        <div className="text-slate-700 text-sm leading-relaxed mb-4">
                          {r.comment ? `"${r.comment}"` : <span className="italic text-slate-400">No written feedback provided, only rating.</span>}
                        </div>
                        
                        {r.imageUrl && (
                          <div className="mb-4">
                            <img src={r.imageUrl} alt="Review attachment" className="h-24 w-auto rounded-xl border border-slate-200 object-cover shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                          {r.vendorReply ? (
                            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-5 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 uppercase tracking-wider">
                                  <MessageSquare size={14} className="fill-indigo-100"/> Your Reply
                                </p>
                                <span className="text-[10px] font-semibold text-indigo-400">{new Date(r.vendorRepliedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium">{r.vendorReply}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  placeholder="Write a public reply to thank the customer or address concerns..." 
                                  className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                  value={replyText[r.id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                                />
                              </div>
                              <button onClick={() => handleReply(r.id)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 sm:w-auto w-full flex justify-center items-center gap-2">
                                Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Reviews Yet</h3>
                        <p className="text-slate-500 font-medium text-sm">When customers review your products, they will appear here.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. Rating Analytics */}
              {tab === 'analytics' && analytics && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Average Rating Card */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 flex flex-col items-center justify-center border border-indigo-800 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
                        
                        <h3 className="text-indigo-200 font-bold mb-4 text-xs uppercase tracking-widest flex items-center gap-2 relative z-10">
                          <Star size={14} /> Overall Store Rating
                        </h3>
                        <div className="text-7xl font-black mb-4 tracking-tighter relative z-10 drop-shadow-md">
                          {Number(analytics.averageRating).toFixed(1)}
                        </div>
                        <div className="flex gap-1 mb-4 relative z-10 scale-125">
                          {renderStars(analytics.averageRating, 18)}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-semibold relative z-10">
                          <MessageCircle size={14}/> Based on {analytics.totalReviews} verified reviews
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">5-Star Ratio</p>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-emerald-600">
                              {analytics.totalReviews > 0 ? Math.round(((analytics.distribution[5] || 0) / analytics.totalReviews) * 100) : 0}%
                            </span>
                            <TrendingUp size={16} className="text-emerald-500 mb-1" />
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Response Rate</p>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-blue-600">92%</span>
                            <CheckCircle size={16} className="text-blue-500 mb-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                      {/* Distribution */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 text-lg flex items-center gap-2">
                          <TrendingUp size={20} className="text-indigo-500"/> Rating Distribution
                        </h3>
                        <div className="space-y-4">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = analytics.distribution[star] || 0;
                            const percentage = analytics.totalReviews > 0 ? (count / analytics.totalReviews) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-4 group">
                                <span className="w-14 text-sm font-bold text-slate-600 flex items-center gap-1.5 justify-end">
                                  {star} <Star size={14} className="fill-slate-300 text-slate-300 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors"/>
                                </span>
                                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`absolute top-0 left-0 h-full rounded-full ${star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-red-500'}`}
                                  />
                                </div>
                                <span className="w-12 text-right text-sm font-black text-slate-700">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Weekly Trend Chart */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                          <TrendingUp size={20} className="text-amber-500" /> Average Rating Over Time
                        </h3>
                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                formatter={(value: any) => [`${value} Stars`, 'Avg Rating']}
                              />
                              <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" activeDot={{r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2}} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setReportingId(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="bg-red-50 p-6 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-xl">Report Review</h3>
                    <p className="text-xs text-red-700 mt-1 font-medium">Flag inappropriate content for moderation</p>
                  </div>
                </div>
                <button onClick={() => setReportingId(null)} className="text-red-400 hover:text-red-600 bg-red-100/50 hover:bg-red-100 p-1.5 rounded-full transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleReport} className="p-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for reporting</label>
                <textarea 
                  value={reportReason} 
                  onChange={e => setReportReason(e.target.value)} 
                  required 
                  placeholder="e.g. Contains offensive language, spam link, or reveals personal information..." 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-medium resize-none" 
                  rows={4}
                ></textarea>
                <p className="text-xs text-slate-500 mt-3 font-medium flex items-start gap-1.5">
                  <ShieldAlert size={14} className="shrink-0 text-slate-400 mt-0.5"/>
                  Our moderation team will investigate this review within 24-48 hours. The review will remain visible during this time unless it severely violates terms of service.
                </p>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setReportingId(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Submit Report</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
