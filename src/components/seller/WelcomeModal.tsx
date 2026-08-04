"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Zap, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeModalProps {
  type: 'INITIAL_REGISTRATION' | 'FINAL_APPROVAL';
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
  progress?: number;
}

export default function WelcomeModal({
  type,
  isOpen,
  onClose,
  vendorName = 'Seller',
  progress = 10
}: WelcomeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const firstName = vendorName.split(' ')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-md w-full z-10 overflow-hidden"
        >
          {type === 'INITIAL_REGISTRATION' ? (
            <div className="bg-[#0d0d14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient header */}
              <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-violet-600/30 to-blue-600/20">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl" />

                {/* Icon */}
                <div className="relative w-20 h-20 mb-6 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-600 rounded-3xl blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <Sparkles size={36} className="text-white" />
                  </div>
                </div>

                <div className="relative text-center space-y-2">
                  <p className="text-violet-400 text-xs font-bold uppercase tracking-widest">Welcome to</p>
                  <h2 className="text-white text-3xl font-black tracking-tight">HinchMart Seller</h2>
                  <p className="text-white/50 text-sm">
                    Hey <span className="text-white font-semibold">{firstName}</span>, your account is ready. Let's set up your store.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 pb-8 space-y-6 pt-6">
                {/* Progress bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Setup Progress</span>
                    <span className="text-violet-400 text-xs font-black">{progress}% Complete</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Locked features */}
                <div className="space-y-2">
                  {[
                    { label: 'Product Catalog & Listings', locked: true },
                    { label: 'Order Management & Fulfillment', locked: true },
                    { label: 'Finance & Bank Payouts', locked: true },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                      <Lock size={14} className="text-white/20 flex-shrink-0" />
                      <span className="text-white/30 text-sm">{f.label}</span>
                      <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 font-bold">Locked</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { onClose(); router.push('/seller/onboarding/wizard'); }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Start Setup Wizard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onClose} className="w-full text-white/30 hover:text-white/60 text-xs font-semibold transition-colors py-1">
                  I'll do this later
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0d0d14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient header */}
              <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-emerald-600/30 to-green-600/20">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

                <div className="relative w-20 h-20 mb-6 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl">
                    <ShieldCheck size={36} className="text-white" />
                  </div>
                </div>

                <div className="relative text-center space-y-2">
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Approved & Active</p>
                  <h2 className="text-white text-3xl font-black tracking-tight">You're Live! 🎉</h2>
                  <p className="text-white/50 text-sm">
                    Congrats <span className="text-white font-semibold">{firstName}</span>, your seller account is verified and ready.
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 space-y-6 pt-6">
                <div className="space-y-2">
                  {[
                    'Add & manage your product catalog',
                    'Receive and fulfill orders',
                    'Automated bank escrow payouts',
                    'Run promotions and offers',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm transition-all shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap size={18} /> Enter Seller Dashboard
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
