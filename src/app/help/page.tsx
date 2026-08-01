"use client";
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react';

const FAQS = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'How long does bulk delivery take?', a: 'Standard delivery takes 3-5 business days. Heavy machinery and bulk cement may require scheduled logistics (7-10 days).' },
      { q: 'Do you offer same-day delivery?', a: 'Yes, for selected hardware and tools in major metro areas, subject to availability.' },
    ]
  },
  {
    category: 'Payments & Invoicing',
    items: [
      { q: 'Can I get a GST invoice?', a: 'Yes, GST invoices are generated automatically for all orders and can be downloaded from your Account Dashboard.' },
      { q: 'What is Corporate Credit?', a: 'Verified B2B accounts can apply for a credit line, allowing you to procure materials and pay within 30 to 60 days.' },
    ]
  }
];

export default function HelpCenterPage() {
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white mb-6">How can we help?</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for answers (e.g. 'refunds', 'shipping')"
              className="w-full bg-white rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 shadow-lg text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Contact Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Phone className="mx-auto text-blue-600 mb-3" size={28}/>
            <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
            <p className="text-sm text-slate-500">1800-123-4567</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
            <Mail className="mx-auto text-blue-600 mb-3" size={28}/>
            <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
            <p className="text-sm text-slate-500">support@hinchmart.com</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
            <MessageCircle className="mx-auto text-blue-600 mb-3" size={28}/>
            <h3 className="font-bold text-slate-900 mb-1">Live Chat</h3>
            <p className="text-sm text-slate-500">Available 9 AM - 6 PM</p>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-8">
          {FAQS.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-bold text-slate-800 mb-4">{category.category}</h3>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {category.items.map((item, i) => {
                  const isOpen = openQ === item.q;
                  return (
                    <div key={i} className="border-b border-slate-100 last:border-0">
                      <button 
                        onClick={() => setOpenQ(isOpen ? null : item.q)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="font-bold text-slate-700">{item.q}</span>
                        {isOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed bg-slate-50/50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
