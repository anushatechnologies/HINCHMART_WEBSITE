"use client";

import { useState, useEffect } from 'react';
import AccountSidebar from '../AccountSidebar';
import { ArrowLeft, ClipboardList, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

const RFQ_STATUS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  QUOTED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function RFQsPage() {
  const [user, setUser] = useState<any>(null);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    Promise.all([
      fetch('http://localhost:5000/api/account/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/rfq/my', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([userRes, rfqRes]) => {
      if (userRes.success) setUser(userRes.data);
      if (rfqRes.success) setRfqs(rfqRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-slate-500 hover:text-red-600"><ArrowLeft size={18}/></Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">RFQ & Quotations</h1>
              <p className="text-sm text-slate-500">{rfqs.length} requests submitted</p>
            </div>
          </div>
          <Link href="/rfq" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus size={16}/> New RFQ
          </Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <AccountSidebar user={user} />
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : rfqs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
              <ClipboardList size={48} className="text-slate-200 mx-auto mb-4"/>
              <p className="text-slate-500 font-medium mb-2">No RFQ requests yet</p>
              <p className="text-xs text-slate-400 mb-6">Submit a Request for Quotation to get the best bulk prices from our verified vendors.</p>
              <Link href="/rfq" className="inline-block bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 text-sm">
                Submit Your First RFQ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq: any) => (
                <div key={rfq.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList size={22} className="text-blue-600"/>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">#{rfq.rfqNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{rfq.items?.length || 0} items • {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        {rfq.notes && <p className="text-xs text-slate-600 mt-2 bg-slate-50 px-3 py-1.5 rounded-lg">{rfq.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${RFQ_STATUS[rfq.status] || 'bg-slate-100 text-slate-700'}`}>
                        {rfq.status}
                      </span>
                      {rfq.quotes?.length > 0 && (
                        <p className="text-xs text-emerald-600 font-bold mt-2">{rfq.quotes.length} quote(s) received</p>
                      )}
                    </div>
                  </div>

                  {rfq.items?.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {rfq.items.map((item: any, i: number) => (
                        <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 text-xs">
                          <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                          <p className="text-slate-500 mt-0.5">Qty: {item.quantity}{item.targetPrice ? ` • Target: ₹${item.targetPrice}` : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    {rfq.quotes?.length > 0 ? (
                      <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                        <h4 className="font-bold text-blue-900 mb-2 text-sm">Quotation Received</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-blue-700">Total Amount</p>
                            <p className="font-black text-blue-900">₹{Number(rfq.quotes[0].totalAmount).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700">Valid Until</p>
                            <p className="font-bold text-blue-900">{new Date(rfq.quotes[0].validUntil).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-blue-700">Admin Notes</p>
                            <p className="font-medium text-blue-900 text-xs">{rfq.quotes[0].notes || 'None'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition-colors shadow-sm">
                            Accept Quote & Checkout
                          </button>
                          <button className="bg-white text-slate-600 font-bold px-4 py-2 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {rfq.status === 'PENDING' && (
                          <button className="text-xs font-bold text-red-600 hover:underline">Cancel RFQ</button>
                        )}
                        <span className="text-xs text-slate-500 italic">Waiting for admin to review and issue quote...</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
