'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, CheckCircle, CreditCard, MapPin, ReceiptText, ArrowLeft } from 'lucide-react';

const API = 'http://localhost:5000';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-bold text-slate-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="p-20 text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Order Not Found</h3>
        <Link href="/dashboard/orders" className="text-blue-600 font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', icon: ReceiptText, date: order.createdAt },
    { label: 'Processing', icon: Package, date: order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null },
    { label: 'Shipped', icon: Truck, date: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? order.updatedAt : null },
    { label: 'Delivered', icon: CheckCircle, date: order.status === 'DELIVERED' ? order.updatedAt : null }
  ];

  let currentStep = 0;
  if (order.status === 'PROCESSING') currentStep = 1;
  else if (order.status === 'SHIPPED') currentStep = 2;
  else if (order.status === 'DELIVERED') currentStep = 3;

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order #{order.id}</h1>
            <p className="text-slate-500 font-medium mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto shadow-sm ${
            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 overflow-hidden">
          <h3 className="font-extrabold text-slate-900 mb-8">Track Order</h3>
          <div className="relative">
            <div className="absolute left-0 sm:left-auto sm:top-1/2 bottom-0 sm:bottom-auto w-1 sm:w-full h-full sm:h-1 bg-slate-100 -translate-x-1/2 sm:-translate-y-1/2 ml-6 sm:ml-0 rounded-full" />
            <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-4 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-all ${
                    idx <= currentStep ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${idx <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                    {step.date && idx <= currentStep && (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(step.date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900">Items Ordered</h3>
            </div>
            <div className="divide-y divide-slate-100 p-6">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-2 shrink-0">
                    {item.variant?.product?.images?.[0] ? (
                      <img src={item.variant.product.images[0].url.startsWith('http') ? item.variant.product.images[0].url : `${API}${item.variant.product.images[0].url}`} alt={item.variant.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.variant?.product?.slug}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {item.variant?.product?.name}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Subtotal</span>
                <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-blue-600">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> Shipping Details
            </h3>
            {order.address ? (
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 mb-2">{order.address.label || 'Home'}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No address details available.</p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" /> Payment Info
            </h3>
            <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block uppercase tracking-wider">
              {order.paymentMethod || 'Online Payment'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
