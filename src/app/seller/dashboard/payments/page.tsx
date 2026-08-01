"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, List, Receipt, Landmark, FileText, CheckCircle, Clock,
  ArrowUpRight, AlertCircle, RefreshCw, Loader2, Play
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Overview & Payouts', icon: Wallet },
  { key: 'settlements', label: 'Settlements Ledger', icon: List },
  { key: 'transactions', label: 'Transactions', icon: Receipt },
  { key: 'bank', label: 'Bank & Razorpay Details', icon: Landmark },
  { key: 'invoices', label: 'Invoices & Tax', icon: FileText },
];

export default function PaymentsHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data
  const [overview, setOverview] = useState<any>({});
  const [settlements, setSettlements] = useState<any[]>([]);

  // Forms
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadOverview = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/payments/overview?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
        if (data.data.bankDetails?.account) {
          setBankAccount(data.data.bankDetails.account);
          setIfsc(data.data.bankDetails.ifsc);
          setBankName(data.data.bankDetails.bank);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  const loadSettlements = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/payments/settlements?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) setSettlements(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    if (tab === 'overview' || tab === 'bank') loadOverview();
    if (tab === 'settlements') loadSettlements();
  }, [tab, loadOverview, loadSettlements]);

  const handleLinkRazorpay = async () => {
    if (!vendorId || !bankAccount || !ifsc || !bankName) return alert('Fill all bank details');
    setIsLinking(true);
    try {
      const res = await fetch(`${API}/vendors/${vendorId}/payments/bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccountNumber: bankAccount, ifscCode: ifsc, bankName })
      });
      const data = await res.json();
      if (data.success) {
        alert('Razorpay Account Linked Successfully!');
        loadOverview();
      } else alert(data.message);
    } catch (e) { console.error(e); }
    setIsLinking(false);
  };

  const handleRequestPayout = async () => {
    if (!vendorId) return;
    if (!overview.razorpayAccountId) return alert('Please link a Razorpay account first via Bank Details tab.');
    if (overview.nextPayout <= 0) return alert('No pending funds available for payout.');

    setIsLinking(true);
    try {
      const res = await fetch(`${API}/vendors/${vendorId}/payments/payout`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadOverview();
      } else alert(data.message);
    } catch (e) { console.error(e); }
    setIsLinking(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments & Settlements</h1>
          <p className="text-slate-500 mt-1">Manage Razorpay payouts, track earnings, and view invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-red-600 text-red-700 bg-red-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Overview & Payouts */}
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="absolute right-0 top-0 opacity-10"><Wallet size={120} className="-mr-10 -mt-10" /></div>
                      <p className="text-slate-300 text-sm font-medium">Pending Settlement</p>
                      <h2 className="text-4xl font-extrabold mt-1">₹{(overview.nextPayout || 0).toLocaleString('en-IN')}</h2>
                      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1"><Clock size={12}/> Ready for withdrawal</p>
                      
                      <button onClick={handleRequestPayout} disabled={isLinking || overview.nextPayout <= 0}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                        {isLinking ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />} 
                        Withdraw to Bank
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center">
                      <p className="text-slate-500 text-sm font-medium">Total Settled via Razorpay</p>
                      <h2 className="text-3xl font-extrabold text-slate-900 mt-1">₹{(overview.totalSettled || 0).toLocaleString('en-IN')}</h2>
                      
                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Razorpay Account</p>
                          {overview.razorpayAccountId ? (
                            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-1"><CheckCircle size={14}/> Linked ({overview.razorpayAccountId})</p>
                          ) : (
                            <p className="text-sm font-bold text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14}/> Not Linked</p>
                          )}
                        </div>
                        <button onClick={() => setTab('bank')} className="text-sm font-semibold text-blue-600 hover:underline">Manage</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Settlements Ledger */}
              {tab === 'settlements' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Order Ref</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Gross</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Fees (Comm + TDS)</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 text-right">Net Payout</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {settlements.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-900">{item.order.orderNumber}</td>
                            <td className="px-4 py-3 text-slate-600">₹{item.grossAmount}</td>
                            <td className="px-4 py-3 text-red-500">-₹{(Number(item.commissionAmount) + Number(item.tdsAmount)).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">₹{item.netAmount}</td>
                            <td className="px-4 py-3 text-center">
                              {item.status === 'PAID' ? (
                                <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">PAID</span>
                              ) : (
                                <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">PENDING</span>
                              )}
                              {item.payoutId && <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.payoutId}</p>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {settlements.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No settlements found.</div>}
                  </div>
                </div>
              )}

              {/* 4. Bank Details */}
              {tab === 'bank' && (
                <div className="max-w-xl">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Razorpay Linked Account</h3>
                      <p className="text-sm text-slate-500 mt-1">Connect your bank account to receive automated payouts via Razorpay Route.</p>
                    </div>

                    {overview.razorpayAccountId ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex gap-3">
                        <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Account Verified & Linked</p>
                          <p className="text-xs text-emerald-600 mt-1 font-mono">ID: {overview.razorpayAccountId}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-bold text-amber-800">Account Not Linked</p>
                          <p className="text-xs text-amber-700 mt-1">Submit your details below to activate payouts.</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name</label>
                        <input value={bankName} onChange={e => setBankName(e.target.value)} disabled={!!overview.razorpayAccountId}
                          placeholder="e.g. HDFC Bank" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number</label>
                        <input value={bankAccount} onChange={e => setBankAccount(e.target.value)} disabled={!!overview.razorpayAccountId}
                          type="password" placeholder="••••••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code</label>
                        <input value={ifsc} onChange={e => setIfsc(e.target.value)} disabled={!!overview.razorpayAccountId}
                          placeholder="e.g. HDFC0001234" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 uppercase" />
                      </div>
                      {!overview.razorpayAccountId && (
                        <button onClick={handleLinkRazorpay} disabled={isLinking}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                          {isLinking ? <Loader2 size={16} className="animate-spin" /> : <Landmark size={16} />}
                          Create Linked Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholders for 3, 5 to demonstrate the UI layout */}
              {(tab === 'transactions' || tab === 'invoices') && (
                <div className="text-center py-20 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Loader2 size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Coming Soon</h3>
                  <p className="text-sm max-w-md mx-auto">The {TABS.find(t=>t.key===tab)?.label} section is currently under development for Phase 2.</p>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
