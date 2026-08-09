"use client";

import { useEffect, useState, useTransition } from 'react';
import { X, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchCart = async () => {
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setItems(guestCart);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      fetchCart();
    };
    
    // Listen to custom event to open the drawer
    window.addEventListener('open-cart-drawer', handleOpen);
    
    // We also want to fetch if standard cart-updated event fires (so if it's already open, it updates)
    window.addEventListener('cart-updated', fetchCart);

    return () => {
      window.removeEventListener('open-cart-drawer', handleOpen);
      window.removeEventListener('cart-updated', fetchCart);
    };
  }, [token]);

  const handleQtyChange = async (itemId: number, currentQty: number, offset: number, moq: number, maxStock: number) => {
    const targetQty = currentQty + offset;

    if (targetQty < moq || targetQty > maxStock) {
      return; // Basic validation
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/cart/items/${itemId}`, {
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
          window.dispatchEvent(new Event('cart-updated'));
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleRemove = async (itemId: number) => {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          fetchCart();
          window.dispatchEvent(new Event('cart-updated'));
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.variant?.price || '0');
    return acc + (price * item.quantity);
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-slate-700" />
            <h2 className="text-lg font-black text-slate-900">Your Cart</h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length} items</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingCart size={48} className="mb-4 text-slate-400" />
              <p className="text-lg font-bold text-slate-900">Your cart is empty</p>
              <p className="text-sm text-slate-500">Looks like you haven't added anything yet.</p>
            </div>
          ) : (
            items.map((item) => {
              const product = item.variant?.product;
              const image = product?.images?.find((img: any) => img.isPrimary)?.url || product?.images?.[0]?.url;
              const imageUrl = image ? (image.startsWith('http') ? image : `http://localhost:5000${image}`) : '/placeholder.jpg';

              return (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 shrink-0 overflow-hidden p-2">
                    <img src={imageUrl} alt={product?.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{product?.name}</h3>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {product?.brand && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{product.brand}</p>}
                    
                    <div className="mt-auto flex items-end justify-between">
                      <p className="text-sm font-black text-red-600">
                        ₹{parseFloat(item.variant?.price || '0').toLocaleString('en-IN')}
                      </p>
                      
                      {/* Qty Selector */}
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity, -1, product?.moq || 1, item.variant?.stockQty || 100)}
                          disabled={item.quantity <= (product?.moq || 1) || isPending}
                          className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity, 1, product?.moq || 1, item.variant?.stockQty || 100)}
                          disabled={item.quantity >= (item.variant?.stockQty || 100) || isPending}
                          className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 rounded disabled:opacity-30 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-sm font-bold text-slate-600">Subtotal</span>
              <span className="text-xl font-black text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/cart" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm"
              >
                View Cart
              </Link>
              {token ? (
                <Link 
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-200 transition-all text-sm"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md transition-all text-sm"
                >
                  Log In <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
