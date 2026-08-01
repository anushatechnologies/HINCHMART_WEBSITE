'use client';
import Link from 'next/link';
import { HelpCircle, MessageSquare, PhoneCall, BookOpen, Package, RotateCcw, Truck, Search, ChevronRight } from 'lucide-react';

const supportOptions = [
  { icon: MessageSquare, label: 'Live Chat', desc: 'Chat with our support team instantly', href: '/live-chat', color: 'bg-blue-50 text-blue-600' },
  { icon: PhoneCall, label: 'Contact Us', desc: 'Email or call our support agents', href: '/contact', color: 'bg-orange-50 text-orange-600' },
  { icon: BookOpen, label: 'FAQs', desc: 'Browse frequently asked questions', href: '/faqs', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Truck, label: 'Track Order', desc: 'Check your order status', href: '/track-order', color: 'bg-purple-50 text-purple-600' },
  { icon: RotateCcw, label: 'Returns & Refunds', desc: 'Initiate a return request', href: '/return-center', color: 'bg-rose-50 text-rose-600' },
  { icon: Package, label: 'My Support Tickets', desc: 'View your previous tickets', href: '/dashboard/support', color: 'bg-slate-50 text-slate-600' }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <HelpCircle size={14} /> Help Center
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto shadow-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              placeholder="Search for articles, tracking, returns..." 
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium focus:ring-4 focus:ring-blue-400/50 outline-none text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportOptions.map((opt, i) => (
            <Link key={i} href={opt.href} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-start hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${opt.color}`}>
                <opt.icon size={28} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xl mb-2">{opt.label}</h3>
              <p className="text-slate-500 font-medium mb-6 flex-1">{opt.desc}</p>
              <div className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
