"use client";

import { useEffect, useState, useTransition } from 'react';
import { ShoppingCart, MapPin, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Plus, Wallet, FileText, ArrowRight, Loader, Truck } from 'lucide-react';
import Link from 'next/link';

interface Address {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  quantity: number;
  variant: {
    id: number;
    sku: string;
    price: string;
    product: {
      id: number;
      name: string;
      brand: string | null;
    };
  };
}

export default function CheckoutClient() {
  const [cart, setCart] = useState<any>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [gstin, setGstin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('online');
  
  // Address creation form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const loadData = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      const [cartRes, addrRes] = await Promise.all([
        fetch('http://localhost:5000/api/cart', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('http://localhost:5000/api/addresses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);

      if (cartRes.success && cartRes.data) {
        setCart(cartRes.data);
        setItems(cartRes.data.items || []);
      }
      if (addrRes.success && addrRes.data) {
        const list: Address[] = addrRes.data;
        setAddresses(list);
        // Default select default address
        const def = list.find(a => a.isDefault) || list[0];
        if (def) setSelectedAddress(def.id);
      }
    } catch {
      setErrorMsg('Failed to load checkout details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSavingAddress(true);
    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddress)
      }).then(r => r.json());

      if (res.success) {
        setAddresses(p => [...p, res.data]);
        setSelectedAddress(res.data.id);
        setShowAddForm(false);
        setNewAddress({ label: 'HOME', line1: '', line2: '', city: '', state: '', pincode: '' });
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Could not save new address');
    } finally {
      setSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal })
      }).then(r => r.json());
      if (res.success) {
        setAppliedCoupon(res.data);
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon');
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponInput('');
  };

  const handlePlaceOrder = async () => {
    setErrorMsg('');
    if (!selectedAddress) {
      setErrorMsg('Please select a shipping/delivery address.');
      return;
    }
    setPlacing(true);

    try {
      // ── Step 1: Create the HinchMart DB Order ──────────────────────────────
      const orderRes = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          deliveryMethod,
          gstin: gstin.trim() || undefined,
          companyName: companyName.trim() || undefined,
          couponCode: appliedCoupon?.code || undefined
        })
      }).then(r => r.json());

      if (!orderRes.success) {
        setErrorMsg(orderRes.message || 'Failed to place order.');
        setPlacing(false);
        return;
      }

      const dbOrder = orderRes.data;
      window.dispatchEvent(new Event('cart-updated'));

      // ── Step 2: If Razorpay selected, open the payment modal ───────────────
      if (paymentMethod === 'online') {
        // Create Razorpay Order on backend
        const rpRes = await fetch('http://localhost:5000/api/orders/create-razorpay-order', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: dbOrder.total })
        }).then(r => r.json());

        if (!rpRes.success) {
          setErrorMsg('Failed to initiate payment. Your order has been saved. Please contact support.');
          setOrderResult(dbOrder);
          return;
        }

        // Load Razorpay checkout.js dynamically
        const loadScript = () => new Promise<boolean>((resolve) => {
          if ((window as any).Razorpay) { resolve(true); return; }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        const loaded = await loadScript();
        if (!loaded) {
          setErrorMsg('Failed to load payment gateway. Please try again.');
          setPlacing(false);
          return;
        }

        // Open Razorpay Modal
        const rzp = new (window as any).Razorpay({
          key: rpRes.data.keyId,
          amount: rpRes.data.amount,
          currency: rpRes.data.currency,
          order_id: rpRes.data.orderId,
          name: 'HinchMart B2B Store',
          description: `Order #${dbOrder.orderNumber}`,
          theme: { color: '#DC2626' },
          prefill: {
            email: '',
            contact: '',
          },
          handler: async (response: any) => {
            // Verify signature on backend
            const verifyRes = await fetch('http://localhost:5000/api/orders/verify-payment', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrder.id,
              })
            }).then(r => r.json());

            if (verifyRes.success) {
              setOrderResult({ ...dbOrder, paymentStatus: 'PAID' });
            } else {
              setErrorMsg('Payment verification failed. Please contact support.');
              setOrderResult(dbOrder);
            }
          },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              // Order was placed in DB, but not paid — show order summary anyway
              setOrderResult(dbOrder);
            }
          }
        });
        rzp.open();
        return;
      }

      // ── Step 3: COD / NEFT — just show success ─────────────────────────────
      setOrderResult(dbOrder);

    } catch {
      setErrorMsg('Error sending order request.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Preparing checkout details...</p>
        </div>
      </div>
    );
  }

  // ─── Order Success UI Screen ───
  if (orderResult) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] py-16 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={42} className="text-emerald-600 animate-bounce" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
          <p className="text-slate-500 mb-6 text-sm">Your order has been placed successfully and is now being processed.</p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 text-left space-y-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-extrabold text-slate-900">#{orderResult.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method of Payment:</span>
              <span className="font-extrabold text-slate-900 uppercase">{orderResult.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-xs ${orderResult.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {orderResult.paymentStatus === 'PAID' ? '✓ Paid Online' : 'Pending / COD'}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-slate-900 font-bold">Total Amount Paid:</span>
              <span className="text-lg font-black text-blue-600">₹{Number(orderResult.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account/orders" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-center text-sm transition-colors">
              Track Your Order
            </Link>
            <Link href="/products" className="flex-1 border border-slate-300 hover:border-red-400 py-4 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cost calculation Formulas
  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.variant.price);
    return acc + price * item.quantity;
  }, 0);
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const taxableAmount = subtotal - couponDiscount;
  const taxAmount = taxableAmount * 0.18;
  const baseShippingFee = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  
  // Delivery speed premium
  const deliveryPremium = deliveryMethod === 'express' ? 300 : (deliveryMethod === 'scheduled' ? 100 : 0);
  const shippingFee = baseShippingFee + deliveryPremium;
  
  const total = taxableAmount + taxAmount + shippingFee;

  const selectedAddr = addresses.find(a => a.id === selectedAddress);
  const isLocalState = selectedAddr?.state?.toLowerCase().includes('telangana');

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-16">
      {/* breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-sm">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <Link href="/cart" className="text-slate-500 hover:text-blue-600 transition-colors">Cart</Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-950 font-bold">Checkout</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-6 bg-blue-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 font-bold text-blue-600 text-sm">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main flow steps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Delivery Location */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">1</span>
                Select Delivery Site / Address
              </h2>

              {!showAddForm ? (
                <div className="space-y-4">
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                            selectedAddress === addr.id
                              ? 'border-blue-600 bg-blue-50/10 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-350'
                          }`}
                        >
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                            addr.label === 'HOME' ? 'bg-blue-100 text-blue-700' : addr.label === 'WORK' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                          }`}>{addr.label}</span>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed mt-2.5">
                            {addr.line1} {addr.line2 ? `, ${addr.line2}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{addr.city}, {addr.state} – {addr.pincode}</p>
                          {addr.isDefault && (
                            <span className="absolute top-4 right-4 text-[9px] font-black text-emerald-600 bg-emerald-55/10 px-1.5 py-0.5 rounded">DEFAULT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No addresses saved. Please add one below.</p>
                  )}

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 border-2 border-dashed border-red-300 hover:border-blue-600 text-blue-600 font-bold px-6 py-3 rounded-xl text-xs transition-colors w-full justify-center"
                  >
                    <Plus size={16} /> Add New Delivery Site
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddAddress} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Add New Site Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Site/Address Label</label>
                      <select value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
                        <option>HOME</option><option>WORK</option><option>SITE</option><option>OTHER</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Address Line 1*</label>
                      <input required value={newAddress.line1} onChange={e => setNewAddress(p => ({ ...p, line1: e.target.value }))} placeholder="Flat, Building No., Area"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Address Line 2 (Optional)</label>
                      <input value={newAddress.line2} onChange={e => setNewAddress(p => ({ ...p, line2: e.target.value }))} placeholder="Landmark, Street name"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">City*</label>
                      <input required value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} placeholder="City name"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">State*</label>
                      <input required value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} placeholder="State name"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Pincode*</label>
                      <input required value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="6-digit ZIP code"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={savingAddress}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors">
                      {savingAddress ? 'Saving...' : 'Add Address'}
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="border border-slate-300 px-6 py-2.5 rounded-lg text-xs hover:bg-slate-100 bg-white">Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Delivery Method */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">2</span>
                Delivery Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'standard', label: 'Standard', desc: '3-5 Business Days', fee: 'Free above ₹5,000' },
                  { id: 'express', label: 'Express / Next Day', desc: '1-2 Business Days', fee: '+ ₹300' },
                  { id: 'scheduled', label: 'Scheduled', desc: 'Choose a later date', fee: '+ ₹100' }
                ].map(m => (
                  <div
                    key={m.id}
                    onClick={() => setDeliveryMethod(m.id)}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                      deliveryMethod === m.id
                        ? 'border-blue-600 bg-blue-50/10 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-350'
                    }`}
                  >
                    <Truck size={24} className={deliveryMethod === m.id ? 'text-blue-600' : 'text-slate-400'} />
                    <p className="font-bold text-sm text-slate-900 mt-3">{m.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{m.desc}</p>
                    <p className="text-[10px] font-bold text-blue-600 mt-2">{m.fee}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">3</span>
                Payment Options
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay at site upon receipt', icon: Truck },
                  { id: 'online', label: 'Razorpay Online', desc: 'UPI, Card, Net Banking', icon: CreditCard },
                  ...(cart?.user?.company ? [{
                    id: 'corporate_credit',
                    label: 'Corporate Credit',
                    desc: `Available: ₹${Number(cart.user.company.availableCredit).toLocaleString('en-IN')}`,
                    icon: Wallet
                  }] : [{ id: 'neft', label: 'RTGS / Bank Transfer', desc: 'For large corporate orders', icon: Wallet }])
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id)}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                        paymentMethod === p.id
                          ? 'border-blue-600 bg-blue-50/10 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                    >
                      <Icon size={24} className={paymentMethod === p.id ? 'text-blue-600' : 'text-slate-400'} />
                      <p className="font-bold text-sm text-slate-900 mt-3">{p.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Business Details (Optional) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">4</span>
                Business & GST Details (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">Company Name</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter Company Name"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase">GSTIN</label>
                  <input value={gstin} onChange={e => setGstin(e.target.value)} placeholder="29XXXXX0000X0Z5"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white uppercase"/>
                </div>
              </div>
            </div>

            {/* Step 5: Coupon / Promo Code */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">5</span>
                Promo / Gift Card Code
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-black text-emerald-800">✓ {appliedCoupon.code} applied</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{appliedCoupon.message}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs font-bold text-blue-500 hover:text-blue-700 ml-4">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-3">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter promo code (e.g. SAVE20B2B)"
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-mono uppercase outline-none focus:border-blue-500 bg-white"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-blue-600 font-bold mt-2">{couponError}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right side: Items Overview and pricing breakdown */}
          <div className="space-y-4">
            {/* Order Items review card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingCart size={16} className="text-blue-600" /> Items in Order
              </h3>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.variant.product.name}</p>
                      <p className="text-slate-400 mt-0.5">Qty: {item.quantity} • SKU: {item.variant.sku}</p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">₹{(parseFloat(item.variant.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-bold">Coupon ({appliedCoupon?.code})</span>
                    <span className="font-black">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {isLocalState ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST (9%)</span>
                      <span className="font-bold text-slate-800">₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SGST (9%)</span>
                      <span className="font-bold text-slate-800">₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>IGST (18%)</span>
                    <span className="font-bold text-slate-800">₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-800">₹{shippingFee}</span>
                  )}
                </div>
                <div className="border-t border-slate-100 pt-4 mt-3 flex justify-between items-baseline">
                  <span className="font-black text-slate-900">Total Payable</span>
                  <span className="text-xl font-black text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-orange-500/30 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 uppercase tracking-widest"
              >
                {placing ? (
                  <>
                    <Loader className="animate-spin" size={16} /> Placing Order...
                  </>
                ) : (
                  <>
                    Place Secure Order <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Shield trust note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-[10px] text-slate-500">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By placing the order, you agree to HINCHMART's B2B supply terms, shipping policy, and automatic GST invoice generation terms.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
