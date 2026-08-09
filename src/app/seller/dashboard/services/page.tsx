"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Wrench, Calendar, MapPin, Clock, Briefcase, RefreshCw, Loader2, PlusCircle
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const TABS = [
  { key: 'overview', label: 'Service Dashboard', icon: Briefcase },
  { key: 'offerings', label: 'Service Categories', icon: Wrench },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'slots', label: 'Time Slots', icon: Clock },
  { key: 'areas', label: 'Service Areas', icon: MapPin },
];

export default function ServicesHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [overview, setOverview] = useState<any>({});
  const [offerings, setOfferings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  // Form States
  const [oName, setOName] = useState('');
  const [oDesc, setODesc] = useState('');
  const [oPrice, setOPrice] = useState('');
  const [oDuration, setODuration] = useState('60');

  const [sDay, setSDay] = useState('1');
  const [sStart, setSStart] = useState('');
  const [sEnd, setSEnd] = useState('');

  const [aPincode, setAPincode] = useState('');
  const [aCity, setACity] = useState('');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await fetch(`${API}/vendors/services/overview?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setOverview(data.data);
      }
      if (tab === 'offerings') {
        const res = await fetch(`${API}/vendors/services/offerings?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setOfferings(data.data);
      }
      if (tab === 'slots') {
        const res = await fetch(`${API}/vendors/services/slots?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setSlots(data.data);
      }
      if (tab === 'areas') {
        const res = await fetch(`${API}/vendors/services/areas?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setAreas(data.data);
      }
      if (tab === 'bookings') {
        const res = await fetch(`${API}/vendors/services/bookings?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setBookings(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleAddOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/services/offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, name: oName, description: oDesc, price: oPrice, durationMin: oDuration })
      });
      if ((await res.json()).success) {
        setOName(''); setODesc(''); setOPrice(''); setODuration('60'); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/services/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, dayOfWeek: sDay, startTime: sStart, endTime: sEnd })
      });
      if ((await res.json()).success) {
        setSStart(''); setSEnd(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/services/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, pincode: aPincode, city: aCity })
      });
      if ((await res.json()).success) {
        setAPincode(''); setACity(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/vendors/services/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if ((await res.json()).success) loadData();
    } catch (e) { console.error(e); }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services Hub</h1>
          <p className="text-slate-500 mt-1">Manage service offerings, booking slots, and service areas.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Sync
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-teal-600 text-teal-700 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && (!overview || !offerings) ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Dashboard Overview */}
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
                    <p className="text-teal-600 text-sm font-semibold flex items-center gap-1"><Wrench size={16}/> Active Services</p>
                    <p className="text-3xl font-extrabold text-teal-900 mt-2">{overview.activeServices || 0}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <p className="text-blue-600 text-sm font-semibold flex items-center gap-1"><Calendar size={16}/> Upcoming Bookings</p>
                    <p className="text-3xl font-extrabold text-blue-900 mt-2">{overview.upcomingBookings || 0}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                    <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1"><Briefcase size={16}/> Completed</p>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-2">{overview.completedBookings || 0}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <p className="text-amber-600 text-sm font-semibold flex items-center gap-1"><MapPin size={16}/> Service Areas</p>
                    <p className="text-3xl font-extrabold text-amber-900 mt-2">{overview.activeAreas || 0}</p>
                  </div>
                </div>
              )}

              {/* 2. Service Offerings (Categories) */}
              {tab === 'offerings' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddOffering} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><PlusCircle size={18}/> Add New Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Name</label>
                        <input value={oName} onChange={e => setOName(e.target.value)} required placeholder="e.g. AC Installation" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base Price (₹)</label>
                        <input type="number" value={oPrice} onChange={e => setOPrice(e.target.value)} required placeholder="e.g. 500" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Est. Duration (Minutes)</label>
                        <input type="number" value={oDuration} onChange={e => setODuration(e.target.value)} required placeholder="e.g. 60" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                        <textarea value={oDesc} onChange={e => setODesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2}></textarea>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                      Save Service
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {offerings.map(s => (
                      <div key={s.id} className="border border-slate-200 p-4 rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description || 'No description provided.'}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-teal-700 font-bold">₹{s.price}</span>
                          <span className="text-slate-500 text-xs flex items-center gap-1"><Clock size={12}/> {s.durationMin} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Bookings */}
              {tab === 'bookings' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date & Time</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Customer</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Service</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{new Date(b.scheduledDate).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{b.timeSlot}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{b.customerName}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{b.serviceAddress}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{b.serviceOffering?.name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                              b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {b.status === 'CONFIRMED' && (
                              <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} className="text-emerald-600 font-semibold text-xs hover:underline">Mark Completed</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No service bookings yet.</div>}
                </div>
              )}

              {/* 4. Time Slots */}
              {tab === 'slots' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddSlot} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Day of Week</label>
                      <select value={sDay} onChange={e => setSDay(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        {daysOfWeek.map((day, i) => <option key={i} value={i}>{day}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time (HH:MM)</label>
                      <input type="time" value={sStart} onChange={e => setSStart(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time (HH:MM)</label>
                      <input type="time" value={sEnd} onChange={e => setSEnd(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px]">
                      Add Slot
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {slots.map(s => (
                      <div key={s.id} className="border border-slate-200 p-4 rounded-xl text-center bg-white shadow-sm">
                        <p className="font-bold text-slate-900 mb-2">{daysOfWeek[s.dayOfWeek]}</p>
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-mono border border-slate-200">
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Service Areas */}
              {tab === 'areas' && (
                <div className="space-y-6 max-w-2xl">
                  <form onSubmit={handleAddArea} className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode / Zip Code</label>
                      <input value={aPincode} onChange={e => setAPincode(e.target.value)} required placeholder="e.g. 500001" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">City (Optional)</label>
                      <input value={aCity} onChange={e => setACity(e.target.value)} placeholder="e.g. Hyderabad" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px]">
                      Add Area
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-3">
                    {areas.map(a => (
                      <div key={a.id} className="inline-flex items-center gap-2 bg-white border border-teal-200 px-3 py-2 rounded-lg shadow-sm">
                        <MapPin size={16} className="text-teal-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{a.pincode}</p>
                          {a.city && <p className="text-[10px] text-slate-500">{a.city}</p>}
                        </div>
                      </div>
                    ))}
                    {areas.length === 0 && <div className="text-slate-500 text-sm py-4">No service areas defined.</div>}
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
