"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, FileText, CreditCard, PieChart, ArrowUpRight, ArrowDownRight,
  Download, RefreshCw, Loader2, CheckCircle, Clock, ShieldCheck
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Wallet & Profit', icon: PieChart },
  { key: 'ledger', label: 'Ledger & Settlements', icon: Wallet },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'credit-notes', label: 'Credit Notes', icon: CreditCard },
  { key: 'taxes', label: 'Tax & GST Reports', icon: ShieldCheck },
];

export default function FinanceHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [overview, setOverview] = useState<any>({});
  const [ledger, setLedger] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await fetch(`${API}/vendors/finance/overview?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setOverview(data.data);
      }
      if (tab === 'ledger') {
        const res = await fetch(`${API}/vendors/finance/wallet?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setLedger(data.data);
      }
      if (tab === 'invoices') {
        const res = await fetch(`${API}/vendors/finance/invoices?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setInvoices(data.data);
      }
      if (tab === 'credit-notes') {
        const res = await fetch(`${API}/vendors/finance/credit-notes?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setCreditNotes(data.data);
      }
      if (tab === 'taxes') {
        const res = await fetch(`${API}/vendors/finance/taxes?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setTaxes(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance & Accounting Hub</h1>
          <p className="text-slate-500 mt-1">Track wallet balances, download invoices, and manage tax reports.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Ledger
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-purple-600 text-purple-700 bg-purple-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading && !overview.totalRevenue ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Dashboard Overview */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
                      <p className="text-slate-400 text-sm font-semibold flex items-center gap-1"><Wallet size={16}/> Available Wallet Balance</p>
                      <p className="text-4xl font-extrabold mt-2">₹{(overview.walletBalance || 0).toLocaleString()}</p>
                      <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 rounded-lg transition-colors">Withdraw to Bank</button>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                      <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1"><ArrowUpRight size={16}/> Gross Revenue (Settled)</p>
                      <p className="text-3xl font-extrabold text-emerald-900 mt-2">₹{(overview.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                      <p className="text-red-600 text-sm font-semibold flex items-center gap-1"><ArrowDownRight size={16}/> Platform Fees Deducted</p>
                      <p className="text-3xl font-extrabold text-red-900 mt-2">-₹{(overview.platformFees || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                      <p className="text-amber-600 text-sm font-semibold flex items-center gap-1"><Clock size={16}/> Pending Settlements</p>
                      <p className="text-3xl font-extrabold text-amber-900 mt-2">₹{(overview.totalPending || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-purple-900 font-bold text-lg">Net Profit Realized</h3>
                      <p className="text-purple-700 text-sm mt-1">Total revenue minus platform commissions and taxes.</p>
                    </div>
                    <div className="text-4xl font-black text-purple-700">₹{(overview.netProfit || 0).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* 2. Wallet Ledger */}
              {tab === 'ledger' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Reference / Description</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledger.map((l: any) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{l.reference}</p>
                            <p className="text-xs text-slate-500">{l.description}</p>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${l.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {l.type === 'CREDIT' ? '+' : '-'}₹{l.amount}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">₹{l.balanceAfter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ledger.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No transactions found in wallet ledger.</div>}
                </div>
              )}

              {/* 3. Invoices */}
              {tab === 'invoices' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Invoice No.</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date Issued</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Order Ref</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Amount (inc. Tax)</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-slate-700">{inv.order?.orderNumber}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">₹{inv.amount} <span className="text-[10px] font-normal text-slate-400">(Tax: ₹{inv.taxAmount})</span></td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{inv.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-purple-600 hover:text-purple-800 flex items-center justify-end gap-1 w-full font-semibold text-xs">
                              <Download size={14}/> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No invoices generated yet.</div>}
                </div>
              )}

              {/* 4. Credit Notes */}
              {tab === 'credit-notes' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Credit Note No.</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date Issued</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Order Ref</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Refund Amount</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {creditNotes.map((cn: any) => (
                        <tr key={cn.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">{cn.noteNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(cn.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-slate-700">{cn.order?.orderNumber}</td>
                          <td className="px-4 py-3 font-bold text-red-600">-₹{cn.amount}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{cn.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {creditNotes.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No credit notes issued.</div>}
                </div>
              )}

              {/* 5. Tax & GST Reports */}
              {tab === 'taxes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <div>
                      <h3 className="font-bold text-slate-900">GST Monthly Filing Reports</h3>
                      <p className="text-sm text-slate-500 mt-1">Download your aggregated sales data for GSTR-1 and GSTR-3B filings.</p>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <Download size={16}/> Export All Reports
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {taxes.map((t: any, i: number) => (
                      <div key={i} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                          <h4 className="font-bold text-slate-900 text-lg">{t.month}</h4>
                          <button className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg"><Download size={18}/></button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Total Sales:</span> <span className="font-semibold text-slate-900">₹{t.totalSales.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">CGST Collected:</span> <span className="font-medium text-slate-700">₹{t.cgst.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">SGST Collected:</span> <span className="font-medium text-slate-700">₹{t.sgst.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">IGST Collected:</span> <span className="font-medium text-slate-700">₹{t.igst.toLocaleString()}</span></div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-900">Total Tax:</span>
                          <span className="font-black text-purple-700 text-lg">₹{(t.cgst + t.sgst + t.igst).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
