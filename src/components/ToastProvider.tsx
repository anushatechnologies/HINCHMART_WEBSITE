"use client";

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, ShoppingCart, Heart, Bell } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'cart' | 'wishlist';

export interface ToastPayload {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    href: string;
  };
  image?: string;
}

interface Toast extends ToastPayload {
  id: string;
  visible: boolean;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="text-emerald-400" />,
  error: <XCircle size={20} className="text-red-400" />,
  warning: <AlertTriangle size={20} className="text-amber-400" />,
  info: <Info size={20} className="text-blue-400" />,
  cart: <ShoppingCart size={20} className="text-indigo-400" />,
  wishlist: <Heart size={20} className="text-pink-400" />,
};

const ACCENT: Record<ToastType, string> = {
  success: 'from-emerald-500 to-teal-500',
  error: 'from-red-500 to-rose-500',
  warning: 'from-amber-500 to-orange-500',
  info: 'from-blue-500 to-indigo-500',
  cart: 'from-indigo-500 to-purple-500',
  wishlist: 'from-pink-500 to-rose-500',
};

const BORDER: Record<ToastType, string> = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  warning: 'border-amber-500/30',
  info: 'border-blue-500/30',
  cart: 'border-indigo-500/30',
  wishlist: 'border-pink-500/30',
};

let toastQueue: ((payload: ToastPayload) => void) | null = null;

/** Call this from anywhere (non-React context) to show a toast */
export function showToast(payload: ToastPayload) {
  if (toastQueue) {
    toastQueue(payload);
  } else {
    // Queue via window event as fallback
    window.dispatchEvent(new CustomEvent('show-toast', { detail: payload }));
  }
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((payload: ToastPayload) => {
    const id = payload.id ?? `toast-${Date.now()}-${Math.random()}`;
    const duration = payload.duration ?? (payload.type === 'error' ? 5000 : 3500);

    setToasts(prev => [
      { ...payload, id, visible: true },
      ...prev.slice(0, 4), // max 5 toasts
    ]);

    // Start hide animation
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, visible: false } : t))
      );
    }, duration - 350);

    // Remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Register queue handler
  useEffect(() => {
    toastQueue = addToast;
    return () => { toastQueue = null; };
  }, [addToast]);

  // Listen to window events (for non-React callers)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (detail) addToast(detail);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, [addToast]);

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: '380px', width: 'calc(100vw - 2rem)' }}
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`
            pointer-events-auto
            relative overflow-hidden
            bg-[#0f1117]/95 backdrop-blur-xl
            border ${BORDER[toast.type]}
            rounded-2xl shadow-2xl shadow-black/40
            transition-all duration-350 ease-out
            ${toast.visible
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-8 scale-95'
            }
          `}
          style={{
            animation: toast.visible ? 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
          }}
        >
          {/* Gradient top bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${ACCENT[toast.type]}`} />

          <div className="flex items-start gap-3 p-4">
            {/* Product image or icon */}
            {toast.image ? (
              <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                <img src={toast.image} alt="" className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${ACCENT[toast.type]} bg-opacity-20 flex items-center justify-center`}>
                {ICONS[toast.type]}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>
              )}
              {toast.action && (
                <a
                  href={toast.action.href}
                  className={`
                    inline-flex items-center gap-1 mt-2 text-xs font-bold px-3 py-1.5 rounded-lg
                    bg-gradient-to-r ${ACCENT[toast.type]} text-white
                    hover:opacity-90 transition-opacity
                  `}
                >
                  {toast.action.label} →
                </a>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div
            className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r ${ACCENT[toast.type]} opacity-40`}
            style={{
              animation: `shrinkWidth ${(toast.duration ?? 3500)}ms linear forwards`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(2rem) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}
