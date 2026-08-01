"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Star, ShieldCheck, User } from 'lucide-react';

interface ServiceClientProps {
  service: any;
}

export default function ServiceClient({ service }: ServiceClientProps) {
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [adding, setAdding] = useState(false);

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  const handleBook = () => {
    if (!bookingDate) return alert('Please select a date');
    if (!timeSlot) return alert('Please select a time slot');
    if (!address.trim()) return alert('Please provide service address');
    
    setAdding(true);
    setTimeout(() => {
      alert('Service booked successfully! The professional will arrive at the scheduled time.');
      setAdding(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* Left: Info */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <CheckCircle size={14} /> Verified Professional
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">{service.name}</h1>
          <p className="text-slate-600 text-lg mb-6 leading-relaxed">
            {service.description || "Expert service delivered by certified professionals at your location."}
          </p>

          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Star size={24} className="text-orange-400 fill-orange-400" />
              <div>
                <span className="block text-xl font-black text-slate-900">4.8</span>
                <span className="text-xs text-slate-500 font-bold uppercase">124 Reviews</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={24} className="text-blue-500" />
              <div>
                <span className="block text-xl font-black text-slate-900">{service.durationMinutes || 60}m</span>
                <span className="text-xs text-slate-500 font-bold uppercase">Est. Time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
              <User size={20} className="text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{service.vendor?.businessName || 'Pro Services Partner'}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> Background Checked</p>
            </div>
          </div>
          <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
            <li>Standard tools and equipment included</li>
            <li>Post-service cleanup provided</li>
            <li>30-day service guarantee</li>
          </ul>
        </div>
      </div>

      {/* Right: Booking Form */}
      <div className="flex flex-col gap-6">
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xl shadow-slate-200/40">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Book Service</h2>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><CalendarIcon size={16} className="text-orange-500" /> 1. Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3.5 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all bg-slate-50 hover:bg-white focus:bg-white"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock size={16} className="text-orange-500" /> 2. Select Time</label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                      timeSlot === slot 
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-300 hover:bg-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> 3. Service Address</label>
              <textarea 
                rows={3}
                placeholder="Enter complete address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none bg-slate-50 hover:bg-white focus:bg-white"
              ></textarea>
            </div>

            {/* Summary & Pay */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Base Price</p>
                <p className="text-2xl font-black text-slate-900">₹{Number(service.basePrice).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400">Material costs extra</p>
              </div>
              <button
                onClick={handleBook}
                disabled={adding}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {adding ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
