import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-16 max-w-2xl w-full text-center shadow-xl shadow-slate-200/40">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Search size={48} />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4">Page Not Found</h2>
        
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          The page or product you are looking for might have been removed, had its name changed, or is temporarily unavailable in our catalog.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-colors uppercase tracking-widest text-sm"
          >
            <Home size={18} /> Back to Home
          </Link>
          <Link 
            href="/products" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-all uppercase tracking-widest text-sm"
          >
            Browse Catalog <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
