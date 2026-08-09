"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Copy, User } from 'lucide-react';

export default function SellerOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [orderItem, setOrderItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Status Update States
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const info = localStorage.getItem('seller_info');
      if (!info) return;
      const vendorId = JSON.parse(info).id;

      // In a real app, we'd have a specific GET /api/vendors/orders/:id endpoint
      // For now, we'll fetch all and filter to simulate it, or just use the same endpoint
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
      const res = await fetch(`${API}/api/vendors/orders?vendorId=${vendorId}`);
      const data = await res.json();
      
      if (data.success) {
        const item = data.data.find((i: any) => i.id === parseInt(id as string));
        if (item) {
          setOrderItem(item);
          setStatus(item.status);
          setTrackingNumber(item.trackingNumber || '');
          setCourierName(item.courierName || '');
        } else {
          setMessage('Order item not found.');
        }
      }
    } catch (error) {
      setMessage('Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
      const res = await fetch(`${API}/api/vendors/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber, courierName })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Status updated successfully!');
        setOrderItem(data.data);
        // Reset message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (err) {
      setMessage('An error occurred during update.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!orderItem) return <div className="p-8 text-center text-red-500">{message}</div>;

  const orderDate = new Date(orderItem.order?.createdAt).toLocaleString();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/seller/dashboard/orders" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Fulfill Item #{orderItem.id}
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide
              ${orderItem.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                orderItem.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                orderItem.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {orderItem.status}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">From Order: {orderItem.order?.orderNumber} &bull; Placed on {orderDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-slate-400" />
              Product Details
            </h2>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={40} className="text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{orderItem.variant?.product?.name}</h3>
                <p className="text-slate-500 text-sm mt-1">Quantity: <span className="font-medium text-slate-900">{orderItem.quantity}</span></p>
                <p className="text-slate-500 text-sm">Unit Price: <span className="font-medium text-slate-900">₹{orderItem.priceAtPurchase}</span></p>
                <div className="mt-3 p-3 bg-red-50 rounded-lg inline-block border border-red-100">
                  <p className="text-sm font-bold text-red-900">
                    Total: ₹{(orderItem.priceAtPurchase * orderItem.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-slate-400" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Name</p>
                <p className="text-slate-900 font-medium">{orderItem.order?.user?.firstName} {orderItem.order?.user?.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-900 font-medium flex items-center gap-2">
                  {orderItem.order?.user?.email}
                  <button className="text-slate-400 hover:text-slate-600"><Copy size={14} /></button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck size={20} className="text-red-600" />
              Update Status
            </h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="PENDING">Pending (Awaiting fulfillment)</option>
                  <option value="PACKED">Packed (Ready for dispatch)</option>
                  <option value="SHIPPED">Shipped (In transit)</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {(status === 'SHIPPED' || status === 'DELIVERED') && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Courier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. BlueDart, Delhivery"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="AWB / Tracking ID"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                    />
                  </div>
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message.includes('success') ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-6"
              >
                {updating ? 'Saving Changes...' : 'Save Updates'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
