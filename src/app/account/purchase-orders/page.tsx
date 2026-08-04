'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, XCircle, Clock, Search, Filter, Eye } from 'lucide-react';
import Link from 'next/link';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  amount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  vendorName: string;
}

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Mock fetching POs
    setTimeout(() => {
      setPos([
        { id: 'po-1', poNumber: 'PO-2023-9912', amount: 154000, status: 'APPROVED', createdAt: new Date().toISOString(), vendorName: 'Tata Steel Corp' },
        { id: 'po-2', poNumber: 'PO-2023-9915', amount: 89000, status: 'PENDING_APPROVAL', createdAt: new Date().toISOString(), vendorName: 'Bosch Power Tools' },
        { id: 'po-3', poNumber: 'PO-2023-9890', amount: 45000, status: 'REJECTED', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), vendorName: 'L&T Heavy Machinery' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      setPos(prev => [{
        id: Math.random().toString(),
        poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        amount: 0, // Pending parsing
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        vendorName: 'Unknown (Parsing PDF)'
      }, ...prev]);
      setIsUploading(false);
      alert('PO uploaded successfully and sent for approval.');
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Approved</span>;
      case 'PENDING_APPROVAL': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FileText size={32} className="text-blue-600" />
            Purchase Orders (POs)
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Manage your 30-day net terms orders and upload official PO documents.</p>
        </div>

        {/* Upload PO Button */}
        <div>
          <input type="file" id="po-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />
          <label htmlFor="po-upload" className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md">
            {isUploading ? <Clock className="animate-spin" size={18}/> : <Upload size={18} />}
            {isUploading ? 'Uploading...' : 'Upload Official PO'}
          </label>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">Available Credit Line</p>
          <h2 className="text-3xl font-black text-slate-900">₹2,50,000</h2>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">45% utilized</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">Pending POs</p>
          <h2 className="text-3xl font-black text-amber-600">
            {pos.filter(p => p.status === 'PENDING_APPROVAL').length}
          </h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">Total PO Value (Approved)</p>
          <h2 className="text-3xl font-black text-emerald-600">
            ₹{pos.filter(p => p.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search PO Number..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          </div>
          <button className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Loading Purchase Orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 tracking-wider">
                  <th className="p-4 font-bold">PO Number</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Vendor</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pos.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-blue-600 text-sm">{po.poNumber}</td>
                    <td className="p-4 text-slate-500 text-sm">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-800 text-sm font-medium">{po.vendorName}</td>
                    <td className="p-4 text-slate-900 font-bold text-sm">
                      {po.amount > 0 ? `₹${po.amount.toLocaleString('en-IN')}` : 'Calculating...'}
                    </td>
                    <td className="p-4">{getStatusBadge(po.status)}</td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                        <Eye size={18} />
                      </button>
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
