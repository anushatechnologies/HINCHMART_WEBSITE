"use client";

import { useEffect, useState, useTransition } from 'react';
import { ShoppingCart, Trash2, ShieldCheck, Truck, RotateCcw, HelpCircle, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: number;
  quantity: number;
  variant: {
    id: number;
    sku: string;
    price: string;
    stockQty: number;
    product: {
      id: number;
      name: string;
      brand: string | null;
      moq: number;
      stockStatus: string;
      images: { url: string; isPrimary: boolean }[];
    };
  };
}

export default function CartPageClient() {
  const [cart, setCart] = useState<any>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const [discountAmount, setDiscountAmount] = useState(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchCart = async () => {
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setItems(guestCart);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCart(data.data);
        setItems(data.data.items || []);
      }
    } catch {
      setErrorMsg('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = async (itemId: number, currentQty: number, offset: number, moq: number, maxStock: number) => {
    const targetQty = currentQty + offset;
    setErrorMsg('');

    if (targetQty < moq) {
      setErrorMsg(`Cannot reduce quantity below the Minimum Order Quantity (MOQ) of ${moq} units.`);
      return;
    }
    if (targetQty > maxStock) {
      setErrorMsg(`Cannot increase quantity beyond available stock of ${maxStock} units.`);
      return;
    }

    startTransition(async () => {
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existing = guestCart.find((i: any) => i.id === itemId);
        if (existing) {
          existing.quantity = targetQty;
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
          fetchCart();
          window.dispatchEvent(new Event('cart-updated'));
        }
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: targetQty })
        });
        const data = await res.json();
        if (data.success) {
          fetchCart();
        } else {
          setErrorMsg(data.message);
        }
      } catch {
        setErrorMsg('Failed to update quantity');
      }
    });
  };

  const handleRemove = async (itemId: number) => {
    setErrorMsg('');
    startTransition(async () => {
      if (!token) {
        let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        guestCart = guestCart.filter((i: any) => i.id !== itemId);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        fetchCart();
        window.dispatchEvent(new Event('cart-updated'));
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          fetchCart();
        } else {
          setErrorMsg(data.message);
        }
      } catch {
        setErrorMsg('Failed to remove item');
      }
    });
  };

  const handleMoveToWishlist = async (itemId: number, productId: number) => {
    setErrorMsg('');
    startTransition(async () => {
      if (!token) {
        setErrorMsg('Please login to save items to your wishlist.');
        return;
      }
      try {
        // 1. Add to Wishlist
        await fetch('http://localhost:5000/api/wishlist', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
        
        // 2. Remove from Cart
        const res = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (data.success) {
          fetchCart();
          window.dispatchEvent(new Event('cart-updated'));
          window.dispatchEvent(new Event('wishlist-updated'));
        } else {
          setErrorMsg(data.message);
        }
      } catch {
        setErrorMsg('Failed to move item to wishlist');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  if (!token && items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 text-center max-w-lg">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-extrabold mb-4 text-slate-900">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8 text-lg">Browse our catalog to find products and request custom quotations.</p>
        <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition duration-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  // Calculate prices
  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.variant.price);
    return acc + price * item.quantity;
  }, 0);

  const totalGST = subtotal * 0.18; // Est 18% generic GST
  const freeShippingThreshold = 5000;
  const shippingFee = subtotal > freeShippingThreshold || subtotal === 0 ? 0 : 250;
  const grandTotal = subtotal + totalGST + shippingFee - discountAmount;

  const applyCoupon = async () => {
    setCouponMsg({ text: '', type: '' });
    if (!couponCode) return;

    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.data.discountAmount);
        setCouponMsg({ text: data.data.message || 'Coupon applied!', type: 'success' });
      } else {
        setDiscountAmount(0);
        setCouponMsg({ text: data.message, type: 'error' });
      }
    } catch {
      setCouponMsg({ text: 'Error applying coupon', type: 'error' });
    }
  };

  // Free shipping progress calculation
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingCart className="text-blue-600" /> Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review items and adjust quantities before placing order.</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-6 bg-blue-50 border border-red-200 rounded-xl p-4 text-sm font-bold text-blue-600">
            {errorMsg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
              You haven't added any products to your cart yet. Explore HINCHMART's mega catalog of construction materials and hardware supplies to start.
            </p>
            <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition shadow-lg shadow-red-200">
              Browse Industrial Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left side: Items List */}
            <div className="flex-1 w-full space-y-4">
              {/* Free Shipping Progress Alert */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-2">
                  <span className="flex items-center gap-1.5"><Truck size={16} className="text-blue-600"/> Free Shipping Goal</span>
                  <span>{subtotal >= freeShippingThreshold ? 'Goal Reached!' : `₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more to go`}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Get free delivery on construction material orders over ₹5,000.</p>
              </div>

              {/* Items Card List */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
                {isPending && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const price = parseFloat(item.variant.price);
                    const prod = item.variant.product;
                    const img = prod.images?.[0]?.url;
                    return (
                      <div key={item.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Image */}
                          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl relative">
                            {img ? (
                              <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={prod.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <div className="min-w-0">
                            {prod.brand && (
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{prod.brand}</p>
                            )}
                            <Link href={`/products/${prod.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                              {prod.name}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1">SKU: {item.variant.sku}</p>
                            
                            {item.isRental ? (
                              <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2 inline-block">
                                <p className="text-xs font-bold text-amber-800">
                                  📅 {item.rentalStart} to {item.rentalEnd}
                                </p>
                                {item.operatorRequired && (
                                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">+ Operator Included</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-orange-600 mt-1">MOQ Limit: {prod.moq} units</p>
                            )}
                          </div>
                        </div>

                        {/* Qty & Price actions */}
                        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                          {/* Quantity Selector */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                              <button
                                onClick={() => handleQtyChange(item.id, item.quantity, -1, prod.moq, item.variant.stockQty)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                              >
                                -
                              </button>
                              <span className="w-12 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                              <button
                                onClick={() => handleQtyChange(item.id, item.quantity, 1, prod.moq, item.variant.stockQty)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400">Stock: {item.variant.stockQty}</span>
                          </div>

                          {/* Line price */}
                          <div className="text-right min-w-[100px]">
                            <p className="text-base font-black text-slate-900">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-slate-400 mt-0.5">₹{price.toLocaleString('en-IN')} each</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMoveToWishlist(item.id, prod.id)}
                              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                              title="Move to Wishlist / Save for Later"
                            >
                              <Heart size={18} />
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Summary Card */}
            <div className="w-full lg:w-[400px] shrink-0 sticky top-28 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-black text-slate-950 mb-4 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-600"/> Order Summary
                </h2>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated GST (18%)</span>
                    <span className="font-bold text-slate-900">₹{totalGST.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping Charges</span>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">₹{shippingFee}</span>
                    )}
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-baseline">
                    <span className="font-black text-slate-900">Grand Total</span>
                    <span className="text-2xl font-black text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Coupon UI */}
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Apply Promo / Gift Card</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FESTIVE20 or GIFT500"
                      className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="bg-slate-900 text-white font-bold px-4 rounded-xl text-sm hover:bg-slate-800 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg.text && (
                    <p className={`text-xs mt-2 font-bold ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {token ? (
                  <Link href="/checkout" className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition duration-200 flex items-center justify-center gap-2 mb-4 uppercase tracking-widest text-sm">
                    Proceed to Checkout <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link href="/login" className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition duration-200 flex items-center justify-center gap-2 mb-4 uppercase tracking-widest text-sm">
                    Log In to Checkout <ArrowRight size={18} />
                  </Link>
                )}
              </div>

              {/* B2B Trust Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-600">
                <div className="flex gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0"/>
                  <span><strong>100% Genuine Supplies:</strong> All bulk items are sourced directly from verified manufacturers.</span>
                </div>
                <div className="flex gap-2">
                  <Truck size={16} className="text-blue-600 shrink-0"/>
                  <span><strong>Hassle-free Logistics:</strong> Secure shipping using regional industrial carriers.</span>
                </div>
                <div className="flex gap-2">
                  <RotateCcw size={16} className="text-purple-600 shrink-0"/>
                  <span><strong>7-Day Returns:</strong> Eligible for refund if transit damage or spec mismatch occurs.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
