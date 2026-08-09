'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Calendar, Clock, MapPin, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function DashboardServicesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/api/services/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setBookings(data.data);
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
      case 'PENDING': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', icon: <Clock size={14} />, label: 'Awaiting Confirmation' };
      case 'CONFIRMED': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: <ShieldCheck size={14} />, label: 'Scheduled' };
      case 'IN_PROGRESS': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', icon: <Wrench size={14} className="animate-pulse" />, label: 'Technician Dispatched' };
      case 'COMPLETED': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <CheckCircle2 size={14} />, label: 'Completed' };
      case 'CANCELLED': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: <AlertTriangle size={14} />, label: 'Cancelled' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: <Clock size={14} />, label: status };
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="pb-12">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Service & AMC</h1>
          <p className="text-slate-500 font-medium">Track your scheduled professional services, repairs, and AMCs.</p>
        </div>
        <Link 
          href="/services" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm flex items-center gap-2 hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Wrench size={18} /> Book a Service
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-slate-50">
            <AnimatePresence>
              {bookings.map((booking, idx) => {
                const statusInfo = getStatusConfig(booking.status);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={booking.id} 
                    className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-5 flex-1 w-full">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all text-indigo-500 shadow-sm">
                        <Wrench size={28} className="transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                            {booking.serviceOffering?.name || 'Professional Service'}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm w-max ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50 w-max">
                            <Calendar size={14} className="text-indigo-500" />
                            {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                            <Clock size={14} className="text-indigo-500" />
                            {booking.scheduledTime}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50">
                            <MapPin size={14} className="text-rose-500 shrink-0" />
                            <span className="line-clamp-1">{booking.serviceAddress || 'No address provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end w-full lg:w-auto gap-6 border-t border-slate-100 lg:border-0 pt-5 lg:pt-0 mt-4 lg:mt-0">
                      <div className="text-left lg:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                        <p className="font-black text-slate-900 text-xl tracking-tight">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</p>
                      </div>
                      
                      <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm group-hover:border-indigo-200">
                        View Details <ChevronRight size={14} />
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
              <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl animate-pulse"></div>
              <Wrench size={40} className="text-slate-300 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Service Bookings</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">You don't have any active service appointments. Need maintenance or a repair? Book an expert technician now.</p>
            <Link 
              href="/services" 
              className="bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
            >
              Explore Services
            </Link>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
