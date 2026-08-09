"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Scale, Share2, Download, Play, MessageCircle, Star, Package, Truck, Shield, RotateCcw, CheckCircle, AlertCircle, CreditCard, ThumbsUp, ThumbsDown, Wrench, Calendar, Camera, Maximize } from 'lucide-react';
import Link from 'next/link';

interface PDPClientProps {
  product: any;
}

export default function PDPClient({ product }: PDPClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  
  // Set default selected variant if variants exist
  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null);
  const [qty, setQty] = useState(product?.moq || 1);
  const [cartMsg, setCartMsg] = useState({ text: '', type: '' });
  const [adding, setAdding] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Rental specific states
  const [rentalStart, setRentalStart] = useState<string>('');
  const [rentalEnd, setRentalEnd] = useState<string>('');
  const [operatorRequired, setOperatorRequired] = useState(false);

  const primaryImages = product?.images || [];
  
  // Dynamic price depending on variant or base price
  const displayPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product?.basePrice || 0);
  const displayMrp = product?.mrp ? parseFloat(product.mrp) : displayPrice;
  const discount = displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : 0;

  useEffect(() => {
    if (product?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/products/${product.id}/reviews`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            if (data.summary) setRatingSummary(data.summary);
            if (data.data) setReviews(data.data);
          }
        })
        .catch(console.error);
        
      // Check wishlist
      const token = localStorage.getItem('token');
      if (!token) {
        const gw = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
        setIsInWishlist(gw.some((i: any) => i.productId === product.id));
      } else {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(d => {
            if (d.success) {
              setIsInWishlist(d.data.some((i: any) => i.productId === product.id));
            }
          })
          .catch(() => {});
      }
    }
  }, [product?.id]);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      let gw = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      if (isInWishlist) {
        gw = gw.filter((i: any) => i.productId !== product.id);
      } else {
        gw.push({
          productId: product.id,
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            basePrice: product.basePrice,
            slug: product.slug,
            images: product.images
          }
        });
      }
      localStorage.setItem('guestWishlist', JSON.stringify(gw));
      const nowInWishlist = !isInWishlist;
      setIsInWishlist(nowInWishlist);
      window.dispatchEvent(new Event('wishlist-updated'));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'wishlist',
          title: nowInWishlist ? '♥️ Saved to Wishlist' : 'Removed from Wishlist',
          message: product?.name,
          duration: 2800,
        }
      }));
      return;
    }

    try {
      if (isInWishlist) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/wishlist`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: product.id })
        });
      }
      const nowInWishlist = !isInWishlist;
      setIsInWishlist(nowInWishlist);
      window.dispatchEvent(new Event('wishlist-updated'));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'wishlist',
          title: nowInWishlist ? '♥️ Saved to Wishlist' : 'Removed from Wishlist',
          message: product?.name,
          duration: 2800,
        }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: 'details', label: 'Product Details' },
    { id: 'downloads', label: `Downloads (${product?.documents?.length || 0})` },
    { id: 'qna', label: `Q&A (${product?.qnas?.length || 0})` },
    { id: 'reviews', label: `Reviews (${ratingSummary.totalReviews})` },
    { id: 'warranty', label: 'Warranty & Returns' },
  ];

  const handleAddToCart = async (redirectToCheck = false) => {
    setCartMsg({ text: '', type: '' });
    const token = localStorage.getItem('token');
    
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const vId = selectedVariant?.id || 0;
      const existing = guestCart.find((i: any) => i.variant?.product?.id === product.id && i.variant?.id === vId);
      
      if (existing) {
        existing.quantity += qty;
      } else {
        guestCart.push({
          id: Date.now(), // temporary id
          quantity: qty,
          isRental: product.productType === 'RENTAL',
          rentalStart: rentalStart || undefined,
          rentalEnd: rentalEnd || undefined,
          operatorRequired,
          variant: {
            id: vId,
            sku: selectedVariant?.sku || 'N/A',
            price: selectedVariant?.price || (product.productType === 'RENTAL' ? product.rentalDetails?.pricePerDay : product.basePrice),
            stockQty: selectedVariant?.stockQty || 100,
            product: {
              id: product.id,
              name: product.name,
              brand: product.brand,
              moq: product.moq,
              productType: product.productType,
              stockStatus: product.stockStatus,
              images: product.images
            }
          }
        });
      }
      
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      setCartMsg({ text: '', type: '' });
      window.dispatchEvent(new Event('cart-updated'));
      // Show toast instead of opening cart drawer
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          type: 'cart',
          title: '🛒 Added to Cart!',
          message: product?.name || 'Item added successfully',
          duration: 3500,
          image: (() => {
            const img = product?.images?.find((i: any) => i.isPrimary)?.url || product?.images?.[0]?.url;
            return img ? (img.startsWith('http') ? img : `http://localhost:5000${img}`) : undefined;
          })(),
          action: { label: 'View Cart', href: '/cart' }
        }
      }));
      
      if (redirectToCheck) {
        window.location.href = '/cart';
      }
      return;
    }

    if (!selectedVariant && variants.length > 0) {
      setCartMsg({ text: 'Please select a product variant first.', type: 'error' });
      return;
    }

    // Minimum Order Quantity validation
    if (product.productType !== 'RENTAL' && qty < product.moq) {
      setCartMsg({ text: `Minimum order quantity is ${product.moq} units.`, type: 'error' });
      return;
    }
    
    if (product.productType === 'RENTAL') {
      if (!rentalStart || !rentalEnd) {
        setCartMsg({ text: 'Please select rental start and end dates.', type: 'error' });
        return;
      }
      if (new Date(rentalStart) > new Date(rentalEnd)) {
        setCartMsg({ text: 'End date must be after start date.', type: 'error' });
        return;
      }
    }

    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/cart/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variantId: selectedVariant?.id || null,
          productId: product.id,
          quantity: qty,
          isRental: product.productType === 'RENTAL',
          rentalStart: rentalStart || undefined,
          rentalEnd: rentalEnd || undefined,
          operatorRequired
        })
      });
      const data = await res.json();
      if (data.success) {
        setCartMsg({ text: '', type: '' });
        // Fire event to update cart badge instantly
        window.dispatchEvent(new Event('cart-updated'));
        // Show toast instead of opening cart drawer
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            type: 'cart',
            title: '🛒 Added to Cart!',
            message: product?.name || 'Item added successfully',
            duration: 3500,
            image: (() => {
              const img = product?.images?.find((i: any) => i.isPrimary)?.url || product?.images?.[0]?.url;
              return img ? (img.startsWith('http') ? img : `http://localhost:5000${img}`) : undefined;
            })(),
            action: { label: 'View Cart', href: '/cart' }
          }
        }));
        
        if (redirectToCheck) {
          window.location.href = '/cart';
        }
      } else {
        setCartMsg({ text: data.message || 'Failed to add item to cart.', type: 'error' });
      }
    } catch {
      setCartMsg({ text: 'Error connecting to cart service.', type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      {cartMsg.text && cartMsg.type === 'error' && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-4 font-bold text-sm border shadow-sm bg-blue-50 border-red-200 text-red-800">
          <AlertCircle size={18} className="text-blue-600 shrink-0" />
          {cartMsg.text}
        </div>
      )}

      {/* Main PDP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 relative group cursor-crosshair">
            {primaryImages[activeImage] ? (
              <img
                src={primaryImages[activeImage].url.startsWith('http') ? primaryImages[activeImage].url : `http://localhost:5000${primaryImages[activeImage].url}`}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-150"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-8xl">📦</div>
            )}
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {discount > 0 && (
                <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg w-max shadow-sm">
                  -{discount}% OFF
                </span>
              )}
              {product?.isRentable && (
                <span className="bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-lg w-max shadow-sm uppercase tracking-wider">
                  🔑 Rentable
                </span>
              )}
            </div>

            {/* Hover actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors" title="View 360">
                <Maximize size={18} />
              </button>
            </div>

            {product?.stockStatus === 'OUT_OF_STOCK' && (
              <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
                <span className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {primaryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {primaryImages.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Media Links (Videos / 360) */}
          <div className="flex gap-4">
            {product?.videos?.filter((v: any) => v.type !== '360_VIEW').length > 0 && (
              <div className="flex-1 border border-slate-200 rounded-xl p-4 bg-white hover:border-blue-300 transition-colors">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Play size={14} className="text-blue-600"/> Watch Videos</h4>
                <div className="space-y-2">
                  {product.videos.filter((v: any) => v.type !== '360_VIEW').map((vid: any, i: number) => (
                    <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-800 font-semibold hover:text-blue-600 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Play size={10} className="ml-0.5"/></div>
                      {vid.title || `Product Video ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 border border-slate-200 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                <RotateCcw size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Interactive 360° View</p>
              <p className="text-xs text-slate-500 mt-1">Drag to rotate product</p>
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col gap-6">
          {/* Brand & Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {product?.brand && (
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{product.brand}</p>
              )}
              <div className="flex gap-4 text-xs font-semibold text-slate-500">
                <span>SKU: {selectedVariant?.sku || product?.sku || 'N/A'}</span>
                {product?.model && <span>Model: {product.model}</span>}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">{product?.name}</h1>
            
            {/* Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(ratingSummary.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{ratingSummary.averageRating || 'New'}</span>
              <span className="text-sm text-slate-500 cursor-pointer hover:text-blue-600 transition" onClick={() => {
                setActiveTab('reviews');
                document.getElementById('pdp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>({ratingSummary.totalReviews} Reviews)</span>
              <span className="text-sm text-emerald-600 font-bold">✓ Verified Seller</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div>
            {product?.productType === 'RENTAL' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-black text-slate-900">₹{Number(product.rentalDetails?.pricePerDay || 0).toLocaleString('en-IN')}</span>
                  <span className="text-sm font-bold text-amber-700">/ Day</span>
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-600 mb-4">
                  <span>Hourly: ₹{product.rentalDetails?.pricePerHour || 0}</span>
                  <span>Weekly: ₹{product.rentalDetails?.pricePerWeek || 0}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start Date</label>
                    <input type="date" value={rentalStart} onChange={e => setRentalStart(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">End Date</label>
                    <input type="date" value={rentalEnd} onChange={e => setRentalEnd(e.target.value)} min={rentalStart || new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
                {product.rentalDetails?.operatorAvailable && (
                  <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={operatorRequired} onChange={e => setOperatorRequired(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                    Include Operator (+₹{product.rentalDetails?.operatorPricePerDay}/day)
                  </label>
                )}
                {rentalStart && rentalEnd && new Date(rentalEnd) >= new Date(rentalStart) && (
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                      <span>Rental Duration:</span>
                      <span>{Math.ceil((new Date(rentalEnd).getTime() - new Date(rentalStart).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-1">
                      <span>Security Deposit:</span>
                      <span>₹{Number(product.rentalDetails?.securityDeposit || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {product?.isContractPrice && (
                  <div className="mb-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2 py-1 rounded">
                    <CheckCircle size={14} /> Contract Price Applied
                  </div>
                )}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-black text-slate-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-slate-500 font-medium">(Incl. of all taxes)</span>
                </div>
                {(displayMrp > displayPrice && !product?.isContractPrice) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-500">MRP <span className="line-through">₹{displayMrp.toLocaleString('en-IN')}</span></span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">{discount}% OFF</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 mb-4 border-b border-slate-100 pb-4">₹{Math.floor(displayPrice * 0.82)} + ₹{Math.ceil(displayPrice * 0.18)} GST (18%)</p>
                
                {/* Buy More & Save More */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-4 shadow-sm">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Buy More & Save More</span>
                  </div>
                  <div className="grid grid-cols-5 bg-white divide-x divide-slate-100">
                    {[
                      { q: '2', d: 2 }, { q: '3', d: 3 }, { q: '4-5', d: 5 }, { q: '6-7', d: 8 }, { q: '8+', d: 10 }
                    ].map((tier, idx) => (
                      <div key={idx} className="p-3 text-center">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">Qty {tier.q}</p>
                        <p className="text-xs font-black text-slate-900 mb-1">₹{Math.floor(displayPrice * (1 - tier.d/100))}/pc</p>
                        <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded inline-block">{discount + tier.d}% OFF</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Insights */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-4">
              <span className="text-2xl mt-0.5">💡</span>
              <div>
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Hinchmart Insights</p>
                <p className="text-xs text-blue-900 font-medium">8% of the users prefer other items in this category in the ₹{Math.floor(displayPrice*0.8)} - ₹{Math.floor(displayPrice*1.2)} price range.</p>
              </div>
            </div>
            
            {/* Delivery Details */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white mt-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck size={16} className="text-slate-500" /> Delivery Details</h4>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Enter Pincode" className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" defaultValue="500072" />
                <button className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">Check</button>
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Delivery available at 500072 in 2-3 day(s)</p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Free Delivery on this order</p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Cash on Delivery (COD) Available</p>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Primary Actions (Buy/Add/Book) */}
              <div className="flex flex-col sm:flex-row gap-3">
                {product?.productType === 'RENTAL' ? (
                  <>
                    <button
                      onClick={() => handleAddToCart(false)}
                      disabled={adding || !rentalStart || !rentalEnd || product?.stockStatus === 'OUT_OF_STOCK'}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 uppercase text-sm tracking-widest"
                    >
                      <Calendar size={18}/> {adding ? 'Booking...' : 'Book Rental'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shrink-0 h-14">
                      <button onClick={() => setQty(Math.max(product?.moq || 1, qty - 1))} className="w-12 h-full flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-lg transition-colors">-</button>
                      <span className="w-12 text-center font-black text-slate-900">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="w-12 h-full flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-lg transition-colors">+</button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(false)}
                      disabled={adding || product?.stockStatus === 'OUT_OF_STOCK'}
                      className="flex-1 bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-500 font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 uppercase text-sm tracking-widest shadow-sm"
                    >
                      <ShoppingCart size={18}/> {adding ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleAddToCart(true)}
                      disabled={adding || product?.stockStatus === 'OUT_OF_STOCK'}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 uppercase text-sm tracking-widest"
                    >
                      Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* Secondary Actions (Rent/Book/Compare/Wishlist) */}
              <div className="flex flex-col sm:flex-row gap-3">
                {product?.productType !== 'RENTAL' && (
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-blue-200">
                    <Wrench size={18} /> Book Installation
                  </button>
                )}
                <div className="flex gap-3 shrink-0">
                  <button 
                    className="w-12 h-12 border border-slate-300 rounded-xl flex items-center justify-center hover:border-slate-400 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all shadow-sm"
                    title="Compare Product"
                  >
                    <Scale size={20} />
                  </button>
                  <button 
                    onClick={handleWishlistToggle}
                    className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-all shadow-sm ${
                      isInWishlist ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-300 hover:border-slate-400 text-slate-600 hover:text-blue-600 hover:bg-slate-50 bg-white'
                    }`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={20} className={isInWishlist ? 'fill-blue-600' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6">
              {[
                { icon: Shield, label: 'Genuine\nProduct' },
                { icon: RotateCcw, label: 'Easy\nReturn' },
                { icon: CheckCircle, label: 'Get GST\nInvoice' },
                { icon: CreditCard, label: 'Secure\nPayments' },
                { icon: MessageCircle, label: '365 Days\nHelp Desk' },
                { icon: Truck, label: 'Nationwide\nDelivery' },
              ].map((badge, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-slate-300 transition-colors">
                  <badge.icon size={20} className="text-slate-400"/>
                  <span className="text-[9px] font-bold text-slate-700 leading-tight text-center whitespace-pre-line">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Request Quote CTA (Moglix style) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 rounded-full blur-3xl opacity-50 -z-10 group-hover:bg-blue-200 transition-colors" />
              <p className="text-sm font-black text-slate-900 mb-1">Looking to purchase in bulk?</p>
              <p className="text-xs text-slate-500 font-medium mb-4">Get the best price for your business.</p>
              <Link href="/rfq" className="block text-center w-full bg-slate-900 hover:bg-slate-800 py-3.5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest transition-all hover:shadow-lg">
                Click to Raise Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Info Section */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600 bg-white'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Details Tab (Moglix Style) */}
          {activeTab === 'details' && (
            <div className="space-y-12">
              {/* About this product */}
              {product?.description && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
                    About This Product
                  </h3>
                  <div className="prose max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {product?.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
                    Key Features
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Specifications */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
                  Product Specifications
                </h3>
                {product?.technicalSpecs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.technicalSpecs as Record<string, any>).map(([key, val], i) => (
                      <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-semibold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">No technical specifications provided.</p>
                )}
              </div>
            </div>
          )}

          {/* Downloads Tab */}
          {activeTab === 'downloads' && (
            <div className="space-y-3">
              {product?.documents?.length > 0 ? product.documents.map((doc: any, i: number) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-red-300 hover:bg-blue-50 transition-all group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Download size={20} className="text-blue-600"/>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{doc.title}</p>
                    <p className="text-xs text-slate-500 uppercase">{doc.type}</p>
                  </div>
                  <Download size={16} className="ml-auto text-slate-400 group-hover:text-blue-600 transition-colors"/>
                </a>
              )) : (
                <p className="text-slate-400 italic">No documents available for this product.</p>
              )}
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qna' && (
            <div className="space-y-6">
              {product?.qnas?.length > 0 ? product.qnas.map((qna: any, i: number) => (
                <div key={i} className="border-b border-slate-100 pb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 font-bold text-blue-700 text-xs">Q</div>
                    <p className="font-semibold text-slate-900 text-sm">{qna.question}</p>
                  </div>
                  <div className="flex items-start gap-3 ml-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 font-bold text-emerald-700 text-xs">A</div>
                    <div>
                      <p className="text-slate-600 text-sm">{qna.answer}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-slate-400 font-medium">Was this answer helpful?</span>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"><ThumbsUp size={12}/> {Math.floor(Math.random() * 50)}</button>
                          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"><ThumbsDown size={12}/> {Math.floor(Math.random() * 5)}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <MessageCircle size={48} className="text-slate-300 mx-auto mb-4"/>
                  <p className="text-slate-500 font-medium">No questions yet. Be the first to ask!</p>
                  <button className="mt-4 bg-blue-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">Ask a Question</button>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map((rev: any, i: number) => (
                <div key={i} className="border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700">{rev.user?.name?.[0] || 'U'}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{rev.user?.name || 'Customer'}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-slate-500">Verified Purchase ✓</span>
                  </div>
                  <p className="text-sm text-slate-600 ml-13 mb-3">{rev.comment}</p>
                  
                  {/* Mock Media Attachments */}
                  {i % 3 === 0 && (
                    <div className="ml-13 flex gap-2 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <Camera size={20} />
                      </div>
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <Play size={20} />
                      </div>
                    </div>
                  )}

                  {/* Helpful Voting */}
                  <div className="ml-13 flex items-center gap-4 border-t border-slate-100 pt-3 mt-2">
                    <span className="text-xs text-slate-400 font-medium">Was this review helpful?</span>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <ThumbsUp size={12} /> Yes ({Math.floor(Math.random() * 20)})
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <ThumbsDown size={12} /> No ({Math.floor(Math.random() * 3)})
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Star size={48} className="text-slate-300 mx-auto mb-4"/>
                  <p className="text-slate-500 font-medium">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Warranty Tab */}
        {activeTab === 'warranty' && (
          <div className="p-8">
            <h3 className="text-lg font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
              Warranty & Return Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Shield size={16} className="text-blue-600"/> Warranty Information</h4>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  This product is covered by a standard {product?.warrantyDuration || '1-Year'} manufacturer warranty against manufacturing defects. The warranty does not cover normal wear and tear, misuse, or physical damage.
                </p>
                <a href="#" className="text-sm text-blue-600 font-bold hover:underline">Download Warranty Terms (PDF)</a>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><RotateCcw size={16} className="text-emerald-600"/> Return Policy</h4>
                <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                  Eligible for return within {product?.returnWindow || '7'} days of delivery. The item must be unused, in its original packaging, and with all tags intact.
                </p>
                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                  <li>No questions asked returns for damaged items</li>
                  <li>Free pickup for return replacements</li>
                  <li>Refund credited to original payment method within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {product?.relatedFrom?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"/>
            Similar Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {product.relatedFrom.map((rel: any, i: number) => (
              <a key={i} href={`/products/${rel.relatedProduct?.slug}`} className="border border-slate-200 rounded-xl p-3 hover:border-red-300 hover:shadow-md transition-all group">
                <div className="aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center text-slate-300">
                  {rel.relatedProduct?.images?.[0] ? (
                    <img src={rel.relatedProduct.images[0].url} alt="" className="w-full h-full object-contain p-2 rounded-lg" />
                  ) : '📦'}
                </div>
                <h3 className="text-xs font-medium text-slate-800 line-clamp-2 group-hover:text-blue-600">{rel.relatedProduct?.name}</h3>
                <p className="text-sm font-black text-slate-900 mt-1">₹{Number(rel.relatedProduct?.basePrice).toLocaleString('en-IN')}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
