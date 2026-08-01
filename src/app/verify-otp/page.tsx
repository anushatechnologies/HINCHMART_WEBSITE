'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck, RefreshCw, Phone, CheckCircle2 } from 'lucide-react';

const API = 'http://localhost:5000';
const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

function digitsOnly(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

function formatPhone(phone: string) {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [phone] = useState(() => digitsOnly(searchParams.get('phone') || ''));
  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [phone]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleLoginSuccess = async (token: string, user: Record<string, unknown>) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));

    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      try {
        await fetch(`${API}/api/cart/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: guestCart }),
        });
        localStorage.removeItem('guestCart');
        window.dispatchEvent(new Event('cart-updated'));
      } catch {
        // Ignore sync failures so login still succeeds.
      }
    }

    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
    if (guestWishlist.length > 0) {
      try {
        await fetch(`${API}/api/wishlist/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: guestWishlist }),
        });
        localStorage.removeItem('guestWishlist');
        window.dispatchEvent(new Event('wishlist-updated'));
      } catch {
        // Ignore sync failures so login still succeeds.
      }
    }

    router.push('/');
    router.refresh();
  };

  const handleChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 1);
    if (!nextValue && value) return;

    const nextOtp = [...otp];
    nextOtp[index] = nextValue;
    setOtp(nextOtp);
    setError('');

    if (nextValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const nextOtp = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || '');
    setOtp(nextOtp);
    setError('');

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const fullOtp = otp.join('');

    if (!phone || phone.length !== 10) {
      setError('Your mobile number is missing. Please go back and enter it again.');
      return;
    }

    if (fullOtp.length !== OTP_LENGTH) {
      setError(`Please enter the full ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    setLoading(true);
    setError('');
    setStatus('');

    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('Verification complete. Signing you in...');
        await handleLoginSuccess(data.data.token, data.data.user);
        return;
      }

      setError(data.message || 'Invalid OTP. Please try again.');
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || phone.length !== 10) {
      setError('Your mobile number is missing. Please go back and enter it again.');
      return;
    }

    setResending(true);
    setError('');
    setStatus('');

    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
        setCooldown(RESEND_SECONDS);
        setStatus('OTP sent again. Check your mobile phone.');
        inputRefs.current[0]?.focus();
        return;
      }

      setError(data.message || 'Could not resend OTP.');
    } catch {
      setError('Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const isPhoneReady = phone.length === 10;
  const isOtpComplete = otp.every(Boolean);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fff7ed,_#f8fafc_40%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[#0f172a] px-8 py-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.22),_transparent_36%),linear-gradient(135deg,_rgba(30,41,59,1),_rgba(15,23,42,1))]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-orange-200">
                <ShieldCheck size={12} />
                Step 2 of 2
              </div>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white">
                Enter the OTP to finish signing in.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                We sent a 4-digit verification code to your mobile number. Enter it below to access your account and sync your cart.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              {[
                'Instant access to your account',
                'Guest cart and wishlist sync after login',
                'No password needed for customers',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mx-auto max-w-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">Verify Mobile</p>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">One-time code</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {isPhoneReady
                  ? <>Code sent to <span className="font-bold text-slate-900">+91 {formatPhone(phone)}</span>.</>
                  : 'We could not find your mobile number. Please go back and enter it again.'}
              </p>

              {!isPhoneReady && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  Your login session expired or the mobile number was not provided.
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {status && !error && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{status}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    Enter OTP
                  </label>
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={!isPhoneReady || loading}
                        className="h-16 w-full rounded-2xl border border-slate-200 bg-white text-center text-2xl font-black tracking-[0.12em] shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPhoneReady || !isOtpComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Verify and Login
                </button>
              </form>

              <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0 || !isPhoneReady}
                  className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {resending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>

                <Link href={isPhoneReady ? `/login?phone=${phone}` : '/login'} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900">
                  <ArrowLeft size={16} />
                  Edit mobile number
                </Link>
              </div>

              <p className="mt-8 text-center text-sm text-slate-600">
                Having trouble? Check your network and make sure the mobile number belongs to the account you want to use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
