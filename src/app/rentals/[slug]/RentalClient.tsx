"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Package, Truck, Info, CheckCircle, Shield } from 'lucide-react';

interface RentalClientProps {
  product: any;
}

export default function RentalClient({ product }: RentalClientProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adding, setAdding] = useState(false);

  // Dynamic pricing
  const dailyRate = product.rentPricePerDay || 0;
  const weeklyRate = product.rentPricePerWeek || dailyRate * 6;
  const monthlyRate = product.rentPricePerMonth || dailyRate * 20;
  
  // Hardcoded deposit for now, since it wasn't on the backend model maybe
  const securityDeposit = product.securityDeposit || 5000;
  
  let days = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start day
  }

  const basePrice = days > 0 ? (days * dailyRate) : 0;
  const totalPrice = basePrice + securityDeposit;

  const handleBook = () => {
    if (!startDate || !endDate) return alert('Please select rental dates');
    if (days < (product.minRentalDays || 1)) return alert(`Minimum rental period is ${product.minRentalDays || 1} days`);
    
    setAdding(true);
    setTimeout(() => {
      alert('Rental booked successfully! A representative will contact you shortly.');
      setAdding(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* Left: Gallery & Info */}
      <div className="space-y-6">
        <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 p-8 flex items-center justify-center relative">
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
            Rental Equipment
          </div>
          {product?.images?.[0] ? (
            <img src={product.images[0].url.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0].url}`} alt={product.name} className="max-h-full" />
          ) : (
            <Package size={64} className="text-slate-300" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Equipment Details</h2>
          <div className="prose text-sm text-slate-600">
            {product.description || "High-quality industrial equipment maintained to professional standards."}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase">Brand</span>
              <p className="font-bold text-slate-900 mt-1">{product.brand || 'N/A'}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase">Min. Duration</span>
              <p className="font-bold text-slate-900 mt-1">{product.minRentalDays || 1} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Booking Flow */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{product.name}</h1>
          <p className="text-slate-500 font-medium">Professional grade equipment ready for deployment.</p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 text-center">
            <span className="text-xs font-bold text-blue-600 uppercase block mb-1">Daily</span>
            <p className="font-black text-slate-900">₹{dailyRate.toLocaleString('en-IN')}</p>
          </div>
          <div className="border border-slate-200 bg-white rounded-xl p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Weekly</span>
            <p className="font-black text-slate-900">₹{weeklyRate.toLocaleString('en-IN')}</p>
          </div>
          <div className="border border-slate-200 bg-white rounded-xl p-4 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Monthly</span>
            <p className="font-black text-slate-900">₹{monthlyRate.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm mt-2">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CalendarIcon size={18} className="text-blue-600" /> Select Rental Period</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Start Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">End Date</label>
              <input 
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 mt-2">
          <h3 className="font-bold text-slate-900 mb-4">Rental Summary</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Rental Duration</span>
              <span className="font-bold text-slate-900">{days} Days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Base Rent ({days}x ₹{dailyRate})</span>
              <span className="font-bold text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1">Security Deposit <Info size={12} className="text-slate-400"/></span>
              <span className="font-bold text-slate-900">₹{securityDeposit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Delivery & Pickup</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4 flex justify-between items-end mb-6">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Due</span>
              <span className="text-3xl font-black text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={adding || days === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {adding ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>

        {/* Info Badges */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-lg">
            <Shield size={16} className="text-blue-600"/> Fully Insured
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-lg">
            <Truck size={16} className="text-emerald-600"/> Fast On-site Delivery
          </div>
        </div>
      </div>
    </div>
  );
}
