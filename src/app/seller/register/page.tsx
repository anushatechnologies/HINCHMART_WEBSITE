"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, CheckCircle, ArrowRight } from 'lucide-react';

export default function SellerRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    businessType: 'RETAILER',
    companyName: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    gstin: '',
    panNumber: '',
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? formData.contactEmail : formData.contactPhone;
    if (!target) {
      setOtpMessage({ type: 'error', text: `Please enter your ${type.toLowerCase()} first.` });
      return;
    }
    setOtpMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type })
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'EMAIL') setEmailOtpSent(true);
        if (type === 'PHONE') setPhoneOtpSent(true);
        // We log the mock OTP to console so the user can see it easily
        console.log(`MOCK OTP for ${type}:`, data.mockOtp);
        setOtpMessage({ type: 'success', text: `OTP sent to ${target} (Check console for mock OTP)` });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Failed to send OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error sending OTP' });
    }
  };

  const handleVerifyOtp = async (type: 'EMAIL' | 'PHONE') => {
    const target = type === 'EMAIL' ? formData.contactEmail : formData.contactPhone;
    const otp = type === 'EMAIL' ? emailOtp : phoneOtp;
    
    if (!otp) {
      setOtpMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type, otp })
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'EMAIL') setEmailVerified(true);
        if (type === 'PHONE') setPhoneVerified(true);
        setOtpMessage({ type: 'success', text: `${type} verified successfully!` });
      } else {
        setOtpMessage({ type: 'error', text: data.message || 'Invalid OTP' });
      }
    } catch (err) {
      setOtpMessage({ type: 'error', text: 'Error verifying OTP' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('seller_token', data.token);
        localStorage.setItem('seller_info', JSON.stringify(data.data));
        router.push('/seller');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Store className="text-white" size={32} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Become a HinchMart Seller
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Reach thousands of B2B customers nationwide
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            {otpMessage.text && (
              <div className={`p-3 rounded-lg text-sm text-center font-medium ${otpMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {otpMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Business Type *</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="RETAILER">Retailer</option>
                  <option value="WHOLESALER">Wholesaler</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="INDIVIDUAL">Individual / Service Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Company / Business Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Owner / Proprietor Name *</label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              {/* Email OTP Section */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    disabled={emailVerified}
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {!emailVerified && (
                    <button type="button" onClick={() => handleSendOtp('EMAIL')} className="whitespace-nowrap px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                      {emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {emailOtpSent && !emailVerified && (
                  <div className="mt-3 flex gap-2">
                    <input type="text" placeholder="Enter 6-digit OTP" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                    <button type="button" onClick={() => handleVerifyOtp('EMAIL')} className="whitespace-nowrap px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Verify</button>
                  </div>
                )}
                {emailVerified && <div className="mt-2 text-sm text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={16} /> Email Verified</div>}
              </div>

              {/* Phone OTP Section */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="tel"
                    name="contactPhone"
                    required
                    disabled={phoneVerified}
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {!phoneVerified && (
                    <button type="button" onClick={() => handleSendOtp('PHONE')} className="whitespace-nowrap px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                      {phoneOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {phoneOtpSent && !phoneVerified && (
                  <div className="mt-3 flex gap-2">
                    <input type="text" placeholder="Enter 6-digit OTP" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                    <button type="button" onClick={() => handleVerifyOtp('PHONE')} className="whitespace-nowrap px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Verify</button>
                  </div>
                )}
                {phoneVerified && <div className="mt-2 text-sm text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={16} /> Phone Verified</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">GSTIN (Optional for Individuals)</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm uppercase"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">PAN Number *</label>
                <input
                  type="text"
                  name="panNumber"
                  required
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-6">
              <p className="text-xs text-amber-800">
                By submitting, you agree to HinchMart's Seller Agreement. KYC verification will be processed within 24-48 hours.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !emailVerified || !phoneVerified}
              className={`w-full flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white ${(!emailVerified || !phoneVerified) ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 mt-4`}
            >
              {loading ? 'Creating Account...' : (!emailVerified || !phoneVerified ? 'Verify Email & Phone to Register' : 'Complete Registration')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have a seller account?{' '}
            <Link href="/seller/login" className="font-bold text-red-600 hover:text-red-500">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
