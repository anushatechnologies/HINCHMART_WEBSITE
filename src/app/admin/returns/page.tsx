'use client';
import { useState, useEffect } from 'react';
import { RotateCcw, Package, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReturns(); }, []);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/returns/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setReturns(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/returns/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchReturns();
    } catch (e) { console.error(e); }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><RotateCcw className="text-rose-600" size={28} /> Returns & Refunds</h1>
            <p className="text-slate-500 mt-1">Review and manage customer return requests.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Req ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading returns...</td></tr>
                ) : returns.length > 0 ? (
                  returns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">#{ret.id}</td>
                      <td className="p-4 font-bold text-slate-900">{ret.customerName}</td>
                      <td className="p-4 font-bold text-blue-600"><a href="#">{ret.orderId}</a></td>
                      <td className="p-4 font-medium text-slate-600">{ret.vendor?.businessName || `Vendor ${ret.vendorId}`}</td>
                      <td className="p-4 font-bold text-emerald-600">₹{ret.amount}</td>
                      <td className="p-4 text-sm font-medium text-slate-500 max-w-[200px] truncate" title={ret.reason}>{ret.reason}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(ret.status)}`}>
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <select 
                          value={ret.status} 
                          onChange={(e) => updateStatus(ret.id, e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approve</option>
                          <option value="REJECTED">Reject</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <Package size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-bold text-slate-500 text-lg">No return requests found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
