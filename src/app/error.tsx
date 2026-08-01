'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-16 max-w-2xl w-full text-center shadow-xl shadow-slate-200/40">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <AlertTriangle size={48} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">Something went wrong!</h1>
        
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          An unexpected error occurred while trying to process your request. Our technical team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors uppercase tracking-widest text-sm"
          >
            <RotateCcw size={18} /> Try Again
          </button>
          <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all uppercase tracking-widest text-sm"
          >
            <Home size={18} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
