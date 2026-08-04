'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';

export default function SellerSettlements() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSettlements([
        { id: 'SET-99120', date: new Date().toISOString(), type: 'PAYOUT', amount: 245000, status: 'COMPLETED', reference: 'UTR-891823901' },
        { id: 'SET-99125', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'PAYOUT', amount: 89000, status: 'PENDING', reference: 'Processing...' },
        { id: 'FEE-1102', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'DEDUCTION', amount: 2500, status: 'COMPLETED', reference: 'Platform Commission (Order #8812)' },
        { id: 'SET-98100', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'PAYOUT', amount: 410000, status: 'COMPLETED', reference: 'UTR-761523441' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Settlements & Payouts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your revenue, platform fees, and bank transfers.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50">
          <Download size={16} /> Download Tax Report (GSTR-8)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Next Scheduled Payout</p>
          <h2 className="text-4xl font-black mb-1">₹89,000</h2>
          <p className="text-emerald-400 text-xs font-bold mb-6 flex items-center gap-1">
            <Calendar size={12} /> Expected by Tomorrow, 10:00 AM
          </p>
          <button className="w-full bg-white text-slate-900 text-sm font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">
            Request Early Payout (-1% Fee)
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Earnings (This Month)</p>
          <h2 className="text-3xl font-black text-slate-900 mb-2">₹6,55,000</h2>
          <p className="text-slate-400 text-sm">After 2% platform commission</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Outstanding Receivables</p>
          <h2 className="text-3xl font-black text-amber-600 mb-2">₹1,45,000</h2>
          <p className="text-slate-400 text-sm">from Net 30/60 Purchase Orders</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <select className="border border-slate-300 rounded-lg text-sm px-3 py-1.5 bg-white outline-none">
            <option>All Transactions</option>
            <option>Payouts Only</option>
            <option>Deductions Only</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center font-bold text-slate-400">Loading Settlements...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="p-4 font-bold">Txn ID / Ref</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {settlements.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{s.id}</div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-wide mt-1">{s.reference}</div>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        {s.type === 'PAYOUT' ? <ArrowUpRight size={16} className="text-emerald-500"/> : <ArrowDownRight size={16} className="text-red-500"/>}
                        {s.type === 'PAYOUT' ? 'Bank Transfer' : 'Platform Fee'}
                      </div>
                    </td>
                    <td className={`p-4 font-black ${s.type === 'PAYOUT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {s.type === 'PAYOUT' ? '+' : '-'}₹{s.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {s.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 size={14}/> Completed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 font-bold text-xs"><Clock size={14}/> Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
