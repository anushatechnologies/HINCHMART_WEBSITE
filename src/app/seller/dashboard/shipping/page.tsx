"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Truck, Package, MapPin, Search, Calendar, FileText, CheckCircle, Clock,
  RefreshCw, Loader2, ArrowRight, UploadCloud, FileDown, PlusCircle, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'tracking', label: 'Tracking & Delivery', icon: MapPin },
  { key: 'pickups', label: 'Pickup Requests', icon: Calendar },
  { key: 'labels', label: 'Shipping Labels', icon: FileText },
  { key: 'couriers', label: 'Courier Partners', icon: Truck },
];

export default function ShippingHub() {
  const [tab, setTab] = useState('tracking');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [overview, setOverview] = useState<any>({ activeShipments: [], deliveredShipments: [], readyToShip: [] });
  const [couriers, setCouriers] = useState<any[]>([]);
  const [pickups, setPickups] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Form States for new Courier
  const [newCourier, setNewCourier] = useState('');
  const [newAccountCode, setNewAccountCode] = useState('');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'tracking' || tab === 'labels' || tab === 'pickups') {
        const res = await fetch(`${API}/vendors/shipping/overview?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setOverview(data.data);
      }
      if (tab === 'couriers' || tab === 'pickups') {
        const res = await fetch(`${API}/vendors/shipping/couriers?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setCouriers(data.data);
      }
      if (tab === 'pickups') {
        const res = await fetch(`${API}/vendors/shipping/pickups?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setPickups(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleAddCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !newCourier) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/shipping/couriers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, courierName: newCourier, accountCode: newAccountCode, isDefault: couriers.length === 0 })
      });
      const data = await res.json();
      if (data.success) {
        setNewCourier(''); setNewAccountCode('');
        loadData();
      } else alert(data.message);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSchedulePickup = async () => {
    if (!vendorId || overview.readyToShip.length === 0) return alert('No orders ready to ship.');
    if (couriers.length === 0) return alert('Please configure a courier partner first.');
    
    const courier = couriers.find(c => c.isDefault) || couriers[0];
    const orderItemIds = overview.readyToShip.map((item: any) => item.id);
    
    // Default to tomorrow 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/shipping/pickups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, courierName: courier.courierName, scheduledDate: tomorrow.toISOString(), orderItemIds })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pickup scheduled with ${courier.courierName} for ${overview.readyToShip.length} items!`);
        loadData();
      } else alert(data.message);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipping & Fulfillment</h1>
          <p className="text-slate-500 mt-1">Manage pickups, generate labels, and track deliveries.</p>
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
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-red-600 text-red-700 bg-red-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && (!overview || !couriers) ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Tracking & Delivery */}
              {tab === 'tracking' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                      <p className="text-blue-600 text-sm font-semibold">Active Shipments</p>
                      <p className="text-3xl font-extrabold text-blue-900 mt-1">{overview.activeShipments?.length || 0}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                      <p className="text-emerald-600 text-sm font-semibold">Delivered (Last 30 Days)</p>
                      <p className="text-3xl font-extrabold text-emerald-900 mt-1">{overview.deliveredShipments?.length || 0}</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Order Ref</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Customer</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Tracking Info</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...(overview.activeShipments||[]), ...(overview.deliveredShipments||[])].map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{item.order.orderNumber}</td>
                            <td className="px-4 py-3 text-slate-600">{item.order.user?.name || 'Guest'}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">{item.courierName}</p>
                              <p className="font-mono text-xs text-slate-500">{item.trackingNumber}</p>
                            </td>
                            <td className="px-4 py-3">
                              {item.status === 'DELIVERED' ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle size={12}/> Delivered</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full"><Truck size={12}/> In Transit</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!overview.activeShipments?.length && !overview.deliveredShipments?.length) && <div className="text-center py-8 text-slate-500 text-sm">No active tracking data available.</div>}
                  </div>
                </div>
              )}

              {/* 2. Pickup Requests */}
              {tab === 'pickups' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div>
                      <h3 className="font-bold text-slate-900">Schedule a Pickup</h3>
                      <p className="text-sm text-slate-500 mt-1">You have <strong className="text-red-600">{overview.readyToShip?.length || 0}</strong> items marked as Ready to Ship.</p>
                    </div>
                    <button onClick={handleSchedulePickup} disabled={overview.readyToShip?.length === 0}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors">
                      <Calendar size={16} /> Request Courier Pickup
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Request Date</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Scheduled For</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Courier</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Items</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pickups.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{new Date(item.scheduledDate).toLocaleString()}</td>
                            <td className="px-4 py-3 font-semibold text-slate-700">{item.courierName}</td>
                            <td className="px-4 py-3 font-mono">{Array.isArray(item.orderItemIds) ? item.orderItemIds.length : 0} boxes</td>
                            <td className="px-4 py-3">
                              <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pickups.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No pickup requests history.</div>}
                  </div>
                </div>
              )}

              {/* 3. Shipping Labels */}
              {tab === 'labels' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <p className="text-sm font-medium">Select orders below to generate A4 or Thermal shipping labels. Ensure tracking details are entered before printing.</p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600 w-10"><input type="checkbox" className="rounded" /></th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Order Ref</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Customer</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.readyToShip?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{item.order.orderNumber}</td>
                            <td className="px-4 py-3 text-slate-700">{item.variant?.product?.name}</td>
                            <td className="px-4 py-3 text-slate-600">{item.order.companyName || item.order.user?.name}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => alert('Generating PDF label...')} className="text-red-600 font-semibold hover:underline flex items-center justify-end gap-1 w-full text-xs">
                                <FileDown size={14}/> Print AWB
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!overview.readyToShip?.length && <div className="text-center py-8 text-slate-500 text-sm">No orders waiting for labels.</div>}
                  </div>
                </div>
              )}

              {/* 4. Courier Selection */}
              {tab === 'couriers' && (
                <div className="space-y-6 max-w-4xl">
                  <form onSubmit={handleAddCourier} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><PlusCircle size={18}/> Add Courier Partner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Courier Name</label>
                        <select value={newCourier} onChange={e => setNewCourier(e.target.value)} required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-red-500">
                          <option value="">Select a partner</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="BlueDart">BlueDart</option>
                          <option value="Ecom Express">Ecom Express</option>
                          <option value="Shadowfax">Shadowfax</option>
                          <option value="XpressBees">XpressBees</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Code (Optional)</label>
                        <input value={newAccountCode} onChange={e => setNewAccountCode(e.target.value)}
                          placeholder="Your courier account ID" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                      Save Partner
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {couriers.map(c => (
                      <div key={c.id} className={`border p-4 rounded-xl relative ${c.isDefault ? 'border-red-500 bg-red-50/20' : 'border-slate-200 bg-white'}`}>
                        {c.isDefault && <span className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Default</span>}
                        <h4 className="font-bold text-slate-900 text-lg">{c.courierName}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1 mt-2">Account: {c.accountCode || 'N/A'}</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Active integration</p>
                      </div>
                    ))}
                    {couriers.length === 0 && <div className="col-span-3 text-center py-8 text-slate-500 border border-dashed rounded-xl">No courier partners configured.</div>}
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
