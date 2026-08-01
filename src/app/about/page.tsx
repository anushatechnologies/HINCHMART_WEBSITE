import Link from 'next/link';
import { Building2, ShieldCheck, Truck, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">About HINCHMART</h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            India's premier B2B marketplace for construction materials, industrial hardware, and professional services.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Our Mission</h2>
              <p className="text-slate-600 mb-4 leading-relaxed text-lg">
                At HINCHMART, we are revolutionizing the construction and hardware procurement process. We bridge the gap between heavy-duty manufacturers and contractors, ensuring that high-quality materials reach construction sites on time and on budget.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                Whether you need bulk cement, professional-grade power tools, or specialized contractor services, HINCHMART is your single point of truth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Building2, title: 'B2B Focus', desc: 'Built for enterprise procurement' },
                { icon: ShieldCheck, title: 'Verified', desc: '100% genuine products' },
                { icon: Truck, title: 'Logistics', desc: 'On-site heavy delivery' },
                { icon: Users, title: 'Network', desc: '10,000+ verified pros' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center">
                    <Icon size={32} className="mx-auto text-blue-600 mb-3" />
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
