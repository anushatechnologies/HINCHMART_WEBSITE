'use client';
import { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, MessageSquare } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', msg: data.message });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-slate-500 font-medium text-lg">
            Have a question, feedback, or need assistance? Our support team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col gap-8">
              <h3 className="text-xl font-extrabold text-slate-900">Contact Information</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <PhoneCall size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="font-extrabold text-slate-900 text-lg">+91 +91 8388899999</p>
                  <p className="text-sm text-slate-500 font-medium">Mon-Sat, 9am to 6pm IST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email Us</p>
                  <p className="font-extrabold text-slate-900 text-lg">support@hinchmart.com</p>
                  <p className="text-sm text-slate-500 font-medium">We reply within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Head Office</p>
                  <p className="font-extrabold text-slate-900 text-lg">HinchMart HQ</p>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">123 Tech Park, Phase 2<br />Cyber City, Gurugram<br />Haryana 122002, India</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
              <MessageSquare size={32} className="mb-4 text-blue-300" />
              <h3 className="text-xl font-extrabold mb-2">Need instant help?</h3>
              <p className="text-blue-100 font-medium mb-6">Chat with our live support agents right now.</p>
              <a href="/live-chat" className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-colors w-full text-center">Start Live Chat</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Send us a Message</h2>

              {status.msg && (
                <div className={`mb-8 p-4 rounded-xl font-bold border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {status.msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject *</label>
                    <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 bg-white">
                      <option value="">Select a topic</option>
                      <option value="Order Inquiry">Order Inquiry</option>
                      <option value="Product Information">Product Information</option>
                      <option value="Returns & Refunds">Returns & Refunds</option>
                      <option value="Vendor Registration">Vendor Registration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 resize-none" placeholder="How can we help you?" />
                </div>
                <button type="submit" disabled={loading} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 text-lg">
                  <Send size={20} /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
