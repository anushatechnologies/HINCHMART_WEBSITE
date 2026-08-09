'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Truck, ShieldCheck, Phone, Calendar, ChevronRight, Zap, RefreshCw } from 'lucide-react';

const CITIES = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata'];

export default function RentPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [duration, setDuration] = useState(7);
  const [showForm, setShowForm] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', startDate: '', notes: '' });
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/rentals`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error('Failed to load rentals', e);
    }
    setLoading(false);
  };

  const handleSubmit = async (product: any) => {
    if (!formData.name || !formData.phone || !formData.startDate || !selectedCity) {
      setError('Please fill in Name, Phone, Start Date, and select a City.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const totalAmount = Number(product.rentPricePerDay) * duration;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/rentals/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: formData.name,
          customerPhone: formData.phone,
          startDate: formData.startDate,
          durationDays: duration,
          city: selectedCity,
          notes: formData.notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(product.id);
        setShowForm(null);
        setFormData({ name: '', phone: '', startDate: '', notes: '' });
        setTimeout(() => setSubmitted(null), 5000);
      } else {
        setError(json.message || 'Submission failed. Please try again.');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-16">

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 50%)' }} />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-5 inline-block">
                🔑 Rent, Don&apos;t Buy
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                Rent Construction <span className="text-amber-400">Equipment</span>
              </h1>
              <p className="text-slate-300 text-lg mb-8 max-w-xl">
                Access world-class machinery without the capital cost. Available by the day, week, or month.
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                {[['⚡', 'Same-Day Availability'], ['🛡️', 'Insured Equipment'], ['📞', '24/7 Support'], ['📋', 'GST Invoice']].map(([icon, text]) => (
                  <div key={text as string} className="flex items-center gap-2 text-slate-300">
                    <span className="text-xl">{icon}</span>
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-[380px] bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 text-amber-400">Quick Rental Calculator</h3>
              <div className="space-y-3">
                <select className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={e => setSelectedCity(e.target.value)} value={selectedCity}>
                  <option value="">Select Your City</option>
                  {CITIES.map(c => <option key={c} className="text-slate-900" value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-300 whitespace-nowrap">Duration (days):</label>
                  <input type="number" min={1} max={365} value={duration}
                    onChange={e => setDuration(parseInt(e.target.value) || 1)}
                    className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                {products[0] && (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-sm text-amber-300 font-medium">Est. ({products[0].name.substring(0, 20)}...)</span>
                    <span className="text-xl font-black text-white">₹{(Number(products[0].rentPricePerDay) * duration).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <button onClick={() => products[0] && setShowForm(products[0].id)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider">
                  Get Instant Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-8 justify-center">
          {[
            { icon: <ShieldCheck className="text-emerald-500" size={20} />, text: 'Fully Insured Equipment' },
            { icon: <Truck className="text-blue-500" size={20} />, text: 'Delivered to Site' },
            { icon: <Phone className="text-amber-500" size={20} />, text: '24/7 Support' },
            { icon: <Clock className="text-purple-500" size={20} />, text: 'Same-Day Available in Select Cities' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2 text-sm font-medium text-slate-700">
              {b.icon} {b.text}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm mb-6 text-slate-500">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-semibold">Rent Equipment</span>
        </div>

        {/* City reminder */}
        {!selectedCity && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-amber-800">
            <MapPin size={16} className="shrink-0" />
            <span>Select your city in the calculator above to see availability and request rentals.</span>
          </div>
        )}

        {/* Success notification */}
        {submitted !== null && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-4 flex items-center gap-3 font-medium text-sm">
            <span className="text-2xl">✅</span>
            Rental request submitted! Our team will contact you within 2 hours to confirm availability.
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <RefreshCw className="animate-spin text-amber-500" size={40} />
            <span className="ml-3 text-slate-500 font-medium">Loading rental equipment...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-24 text-center">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Equipment Available for Rent</h3>
            <p className="text-slate-500 text-sm mb-6">
              Administrators can mark products as rentable from the <strong>Admin Panel → Products</strong> page.
            </p>
            <Link href="/products" className="bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl text-sm transition">
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">{products.length} Equipment Available for Rent</h2>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {products.map(item => {
                const isAvailable = item.stockStatus !== 'OUT_OF_STOCK';
                const imageUrl = item.images?.[0]?.url
                  ? (item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`)
                  : null;

                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                    {/* Image Area */}
                    <div className={`h-44 flex items-center justify-center relative overflow-hidden ${isAvailable ? 'bg-gradient-to-br from-slate-50 to-blue-50' : 'bg-slate-100'}`}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                      <span className={`absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-1 rounded-full ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {isAvailable ? '✓ Available' : '✗ Unavailable'}
                      </span>
                      <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-full uppercase">
                        🔑 For Rent
                      </span>
                      {item.isSameDayDelivery && (
                        <span className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
                          <Zap size={9} /> Same-Day
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {item.brand && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.brand} · {item.category?.name}</p>}
                      <h2 className="text-base font-black text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">{item.name}</h2>

                      <div className="flex items-end justify-between mb-4 mt-auto">
                        <div>
                          <p className="text-2xl font-black text-slate-900">₹{Number(item.rentPricePerDay).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-slate-500 font-medium">per day + GST</p>
                        </div>
                        <div className="text-right">
                          {item.minRentalDays && (
                            <p className="text-sm font-bold text-blue-600">Min {item.minRentalDays} day{item.minRentalDays > 1 ? 's' : ''}</p>
                          )}
                          <p className="text-xs text-slate-500">₹{(Number(item.rentPricePerDay) * 7).toLocaleString('en-IN')} / week</p>
                        </div>
                      </div>

                      {showForm === item.id ? (
                        <div className="border-t border-slate-100 pt-4 space-y-2">
                          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                          <input placeholder="Your Name *" value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                          <input placeholder="Phone Number *" value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                          {!selectedCity && (
                            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                              onChange={e => setSelectedCity(e.target.value)} value={selectedCity}>
                              <option value="">Select City *</option>
                              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                          <input type="date" value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-600 whitespace-nowrap font-medium">Duration:</label>
                            <input type="number" min={item.minRentalDays || 1} value={duration}
                              onChange={e => setDuration(parseInt(e.target.value) || 1)}
                              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                            <span className="text-xs text-slate-500">days</span>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex justify-between text-sm font-bold">
                            <span className="text-slate-600">Total Estimate:</span>
                            <span className="text-amber-700">₹{(Number(item.rentPricePerDay) * duration).toLocaleString('en-IN')}</span>
                          </div>
                          <textarea placeholder="Additional notes (optional)" rows={2} value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSubmit(item)} disabled={submitting}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
                              {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                            <button onClick={() => { setShowForm(null); setError(''); }}
                              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button disabled={!isAvailable} onClick={() => isAvailable && setShowForm(item.id)}
                          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${isAvailable ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                          {isAvailable ? '🔑 Request Rental' : 'Currently Unavailable'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Need a Custom Rental Package?</h3>
            <p className="text-slate-300 text-sm">Contact our B2B rental team for project-based pricing and long-term contracts.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/rfq" className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-4 rounded-xl text-sm uppercase text-center">
              Submit RFQ
            </Link>
            <a href="tel:+918001234567" className="border-2 border-white/30 hover:border-white text-white font-bold px-8 py-4 rounded-xl text-sm text-center flex items-center gap-2 justify-center">
              <Phone size={16} /> Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
