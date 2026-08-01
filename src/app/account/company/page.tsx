"use client";

import { useState, useEffect } from 'react';
import { Building2, CreditCard, Users, Plus, FileText, UploadCloud } from 'lucide-react';
import api from '@/utils/api';

export default function MyCompanyPage() {
  const [company, setCompany] = useState<any>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetEmail, setTargetEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('BUYER');
  
  // Registration States
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regGstin, setRegGstin] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  
  // PO States
  const [pos, setPos] = useState<any[]>([]);
  const [poNumber, setPoNumber] = useState('');
  const [poAmount, setPoAmount] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMyCompany();
    fetchPOs();
  }, []);

  const fetchMyCompany = async () => {
    try {
      const res = await api.get('/companies/my-company');
      if (res.data.success) {
        setCompany(res.data.data);
        setRole(res.data.role);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPOs = async () => {
    try {
      const res = await api.get('/b2b/po');
      if (res.data.success) {
        setPos(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName) return alert('Company Name is required');
    setRegLoading(true);
    try {
      const res = await api.post('/companies/my-company/register', {
        name: regCompanyName,
        gstin: regGstin
      });
      if (res.data.success) {
        alert('Company registered successfully!');
        fetchMyCompany();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register company.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleUploadPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poFile || !poNumber || !poAmount) return alert('All fields are required');
    
    const formData = new FormData();
    formData.append('document', poFile);
    formData.append('poNumber', poNumber);
    formData.append('amount', poAmount);

    try {
      await api.post('/b2b/po', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Purchase Order uploaded successfully!');
      setPoNumber('');
      setPoAmount('');
      setPoFile(null);
      fetchPOs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload PO.');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/companies/my-company/users', { targetUserEmail: targetEmail, role: inviteRole });
      alert('User successfully added to company.');
      setTargetEmail('');
      fetchMyCompany();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add user.');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!company) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200">
        <div className="text-center mb-8">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Register Your Corporate Account</h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            You are not associated with any B2B corporate account. Register your company below to unlock corporate credit, volume pricing, and Purchase Order management.
          </p>
        </div>

        <form onSubmit={handleRegisterCompany} className="max-w-md mx-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={regCompanyName}
              onChange={(e) => setRegCompanyName(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2 border"
              placeholder="e.g. Acme Corp Ltd."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              value={regGstin}
              onChange={(e) => setRegGstin(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2 border uppercase"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>
          <button
            type="submit"
            disabled={regLoading}
            className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {regLoading ? 'Registering...' : 'Register Company'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
            <p className="text-sm text-slate-500">GSTIN: {company.gstin}</p>
            <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
              My Role: {role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Available Credit</p>
              <p className="text-xl font-black text-emerald-600">₹{Number(company.availableCredit).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Employees</p>
              <p className="text-xl font-black text-slate-800">{company.users?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Company Employees</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 rounded-r-lg">Role</th>
              </tr>
            </thead>
            <tbody>
              {company.users?.map((u: any) => (
                <tr key={u.id} className="border-b last:border-0 border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded">
                      {u.b2bRole}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(role === 'MANAGER' || role === 'ADMIN') && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Invite Employee</h2>
          <p className="text-sm text-slate-500 mb-4">Add a registered user to your corporate account.</p>
          <form onSubmit={handleInviteUser} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">User Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm" 
                placeholder="employee@company.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
              <select 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="BUYER">BUYER</option>
                <option value="MANAGER">MANAGER</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 text-sm transition">
              <Plus size={16} /> Add User
            </button>
          </form>
        </div>
      )}

      {/* Purchase Orders Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Purchase Orders</h2>
        <p className="text-sm text-slate-500 mb-6">Upload official POs to process bulk orders on credit.</p>
        
        <form onSubmit={handleUploadPO} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">PO Number</label>
            <input type="text" required value={poNumber} onChange={e => setPoNumber(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm" placeholder="e.g. PO-2023-001" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">PO Amount (₹)</label>
            <input type="number" required value={poAmount} onChange={e => setPoAmount(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm" placeholder="150000" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">PO Document (PDF/Image)</label>
            <input type="file" required onChange={e => setPoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 text-sm w-full md:w-auto h-10">
            <UploadCloud size={16} /> Upload PO
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">PO Number</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg">Document</th>
              </tr>
            </thead>
            <tbody>
              {pos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No POs uploaded yet.</td></tr>
              ) : pos.map((po: any) => (
                <tr key={po.id} className="border-b last:border-0 border-slate-100">
                  <td className="px-4 py-3 font-bold text-slate-900">{po.poNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">₹{po.amount}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                      po.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      po.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`http://localhost:5000/${po.documentUrl.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1">
                      <FileText size={14} /> View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
