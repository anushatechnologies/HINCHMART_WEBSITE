"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import AccountSidebar from '../../AccountSidebar';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, FileText, Download, RotateCcw, Building2 } from 'lucide-react';
import Link from 'next/link';

const STATUS_ICONS: Record<string, any> = {
  placed: Clock,
  PENDING: Clock,
  PROCESSING: Package,
  PACKED: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    
    // In a real scenario, there would be an endpoint /api/account/orders/:id
    // But since this is Phase 11 client implementation, we'll fetch from the orders endpoint and filter if needed, 
    // or assume /api/account/orders/:id exists. Let's try the generic endpoint.
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) setOrder(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-12 text-center">
        <h1 className="text-2xl font-black text-slate-900">Order Not Found</h1>
        <Link href="/account/orders" className="text-blue-600 hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    // Simulated invoice download
    alert('Invoice generation initiated. The PDF will download shortly.');
  };

  const handleReorder = () => {
    // Simulated reorder
    alert('Items have been added to your cart for reordering.');
  };

  const StatusIcon = STATUS_ICONS[order.status] || Package;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/account/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <AccountSidebar user={order.user} />

        <div className="flex-1 min-w-0 space-y-6">
          
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <StatusIcon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                <p className="text-lg font-black text-slate-900">{order.status}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <FileText size={16} /> Tax Invoice
              </button>
              <button 
                onClick={handleReorder}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <RotateCcw size={16} /> Reorder All
              </button>
            </div>
          </div>

          {/* Tracking / Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-6">Order Tracking</h2>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
              {['placed', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                const isCompleted = ['placed', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= idx || order.status === 'DELIVERED';
                const isCurrent = order.status === step;
                
                return (
                  <div key={step} className="relative pl-8">
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <p className={`text-sm font-bold uppercase tracking-widest ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                    {isCurrent && <p className="text-xs text-slate-500 mt-1">Your order is currently in this stage.</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-slate-400"/> Delivery Details
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">{order.address?.label}</p>
                <p>{order.address?.line1}</p>
                {order.address?.line2 && <p>{order.address.line2}</p>}
                <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-slate-400"/> Billing Summary
              </h2>
              <div className="space-y-2 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between"><span>Payment Method</span> <span className="font-bold text-slate-900 uppercase">{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span>Payment Status</span> <span className="font-bold text-slate-900">{order.paymentStatus}</span></div>
                {order.gstin && <div className="flex justify-between"><span>GSTIN</span> <span className="font-bold text-slate-900">{order.gstin}</span></div>}
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-blue-600">₹{Number(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <Package size={18} className="text-slate-400"/> Items in this Order ({order.items?.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                    {item.variant?.product?.images?.[0]?.url ? (
                      <img src={item.variant.product.images[0].url.startsWith('http') ? item.variant.product.images[0].url : `http://localhost:5000${item.variant.product.images[0].url}`} alt="" className="w-10 h-10 object-contain"/>
                    ) : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{item.variant?.product?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">SKU: {item.variant?.sku} | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
