'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package2, Calendar, ChevronRight, Clock, AlertCircle, RefreshCw, FileText, FileCheck2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function DashboardRentalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/api/rentals/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setRequests(data.data);
        }
      } catch (e) { 
        console.error(e); 
      }
      setLoading(false);
    };
    fetch_data();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: <Clock size={14} />, label: 'Approval Pending' };
      case 'CONFIRMED': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: <FileCheck2 size={14} />, label: 'Confirmed' };
      case 'ACTIVE': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <RefreshCw size={14} className="animate-spin-slow" />, label: 'Active Lease' };
      case 'RETURNED': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: <CheckCircle2 size={14} />, label: 'Returned' };
      case 'CANCELLED': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: <AlertCircle size={14} />, label: 'Cancelled' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: <Clock size={14} />, label: status };
    }
  };

  // Mocking CheckCircle2 for returned state
  const CheckCircle2 = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">My Rentals</h1>
          <p className="text-slate-500 font-medium">Track your active leases and past equipment rental requests.</p>
        </div>
        <Link 
          href="/rentals" 
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-slate-900/20 text-sm flex items-center gap-2 hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Package2 size={18} /> Browse Equipment
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Rentals...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-slate-50">
            <AnimatePresence>
              {requests.map((req, idx) => {
                const statusInfo = getStatusConfig(req.status);
                const endDate = new Date(req.startDate);
                endDate.setDate(endDate.getDate() + req.durationDays);
                const isOverdue = req.status === 'ACTIVE' && endDate < new Date();
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={req.id} 
                    className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-5 flex-1 w-full">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
                        {req.product?.images?.[0] ? (
                          <img 
                            src={req.product.images[0].url.startsWith('http') ? req.product.images[0].url : `${API}${req.product.images[0].url}`} 
                            className="w-full h-full object-cover" 
                            alt={req.product.name} 
                          />
                        ) : (
                          <Package2 size={32} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                            {req.product?.name || 'Equipment Rental'}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm w-max ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50 w-max max-w-full">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> Start: {new Date(req.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-500"/> {req.durationDays} Day{req.durationDays !== 1 ? 's' : ''}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : ''}`}>
                            End: {endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {isOverdue && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded ml-1">OVERDUE</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t border-slate-100 md:border-0 pt-5 md:pt-0">
                      <div className="flex gap-2">
                        {req.status === 'ACTIVE' && (
                          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm">
                            <RefreshCw size={14} /> Renew
                          </button>
                        )}
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm">
                          <FileText size={14} /> Contract
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Lease</p>
                        <p className="font-black text-slate-900 text-xl tracking-tight">₹{Number(req.totalAmount).toLocaleString('en-IN')}</p>
                      </div>
                      
                      <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all text-slate-400 shrink-0 shadow-sm hidden sm:flex">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-blue-500/5 rounded-3xl animate-pulse"></div>
              <Package2 size={40} className="text-slate-300 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Active Rentals</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">You haven't requested any equipment rentals yet. Need heavy machinery or tools? Explore our fleet.</p>
            <Link 
              href="/rentals" 
              className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5"
            >
              Explore Equipment
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
