'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Star, MapPin, Clock, ArrowRight } from 'lucide-react';

const API = 'http://localhost:5000';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const res = await fetch(`${API}/api/services`);
        const data = await res.json();
        if (data.success) setServices(data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch_data();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-white/30">
            <Wrench size={14} /> Professional Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Hire Verified Experts</h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto font-medium">
            Book certified plumbers, electricians, civil contractors, painters, and more. All professionals are background-checked and insured.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {['Plumbing', 'Electrical', 'Civil', 'Painting', 'Carpentry', 'HVAC'].map((cat) => (
            <button key={cat} className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-orange-400 hover:bg-orange-50 transition-all group shadow-sm">
              <Wrench size={24} className="text-slate-400 group-hover:text-orange-500 transition-colors mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">{cat}</p>
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Available Services</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                    <Wrench size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-slate-900 mb-1">{service.name}</h3>
                    <p className="text-sm font-bold text-blue-600">{service.vendor?.businessName}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">{service.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
                  <span className="flex items-center gap-1"><Star size={12} className="fill-orange-400 text-orange-400" /> 4.8</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} mins</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-xl font-black text-slate-900">₹{Number(service.basePrice).toLocaleString('en-IN')}</p>
                  <Link href={`/services/${service.id}`} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center gap-1 shadow-sm">
                    Book Now <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center">
            <Wrench size={64} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Services Coming Soon</h3>
            <p className="text-slate-500">Our network of verified professionals is being onboarded. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
