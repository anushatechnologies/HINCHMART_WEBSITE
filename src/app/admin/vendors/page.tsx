'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Users, Building2, Phone, Mail, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVendors(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vendors/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setVendors(vendors.map(v => v.id === id ? { ...v, status } : v));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 w-fit">
            <ChevronLeft size={16} /> Back to Admin Panel
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Manage Vendors</h1>
              <p className="text-slate-500 font-medium">Review, approve, and manage seller accounts on your platform.</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search vendors..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm font-bold text-slate-600">
              Total Vendors: {vendors.length}
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No vendors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-slate-200">Company Name</th>
                    <th className="p-4 font-bold border-b border-slate-200">Owner</th>
                    <th className="p-4 font-bold border-b border-slate-200">Contact</th>
                    <th className="p-4 font-bold border-b border-slate-200">Status</th>
                    <th className="p-4 font-bold border-b border-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{vendor.companyName}</div>
                            <div className="text-xs text-slate-500">{vendor.businessType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-700 font-medium">
                        {vendor.ownerName || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {vendor.contactPhone}</div>
                          <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400"/> {vendor.contactEmail}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {vendor.status === 'APPROVED' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={12} /> Approved</span>}
                        {vendor.status === 'PENDING' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200"><Clock size={12} /> Pending</span>}
                        {vendor.status === 'REJECTED' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200"><XCircle size={12} /> Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vendor.status !== 'APPROVED' && (
                            <button onClick={() => updateStatus(vendor.id, 'APPROVED')} className="text-xs font-bold px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-md transition-colors">
                              Approve
                            </button>
                          )}
                          {vendor.status !== 'REJECTED' && (
                            <button onClick={() => updateStatus(vendor.id, 'REJECTED')} className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors">
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
