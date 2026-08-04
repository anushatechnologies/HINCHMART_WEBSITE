"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8 text-center relative overflow-hidden"
        >
          {/* Top Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

          {type === 'INITIAL_REGISTRATION' ? (
            <>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                🎉 Welcome to HinchMart!
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Your seller account for <strong className="text-slate-800">{vendorName}</strong> has been created successfully.
              </p>

              {/* Progress Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setup Progress</span>
                  <span className="text-sm font-black text-red-600">{progress}% Complete</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-6">
                Complete your 8-step business onboarding to unlock full marketplace access, product listings, and order fulfillment.
              </p>

              <button
                onClick={() => {
                  onClose();
                  router.push('/seller/onboarding/wizard');
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 group"
              >
                Continue Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                <ShieldCheck size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                🎉 Account Activated!
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Congratulations <strong className="text-slate-800">{vendorName}</strong>, your business KYC has been fully verified and approved by HinchMart admins.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Unlimited Product Catalog Management
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Real-time Order Fulfillment & Shipping
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Automated Bank Payouts & Finance Ledgers
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
              >
                Go to Seller Dashboard
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
