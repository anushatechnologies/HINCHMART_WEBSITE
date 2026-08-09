"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Shield, Activity, UserPlus, Key, RefreshCw, Loader2, CheckCircle2, XCircle
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const TABS = [
  { key: 'staff', label: 'Staff Directory', icon: Users },
  { key: 'roles', label: 'Roles & Permissions', icon: Shield },
  { key: 'logs', label: 'Audit Logs', icon: Activity },
];

export default function TeamHub() {
  const [tab, setTab] = useState('staff');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [team, setTeam] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // Form States (Staff)
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPass, setSPass] = useState('');
  const [sRole, setSRole] = useState('');

  // Form States (Roles)
  const [rName, setRName] = useState('');
  const [rPerms, setRPerms] = useState<string[]>([]);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'staff' || tab === 'roles') {
        const res = await fetch(`${API}/vendors/team?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) {
          setTeam(data.data.team);
          setRoles(data.data.roles);
        }
      }
      if (tab === 'logs') {
        const res = await fetch(`${API}/vendors/team/logs?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) {
          setActivityLogs(data.data.activityLogs);
          setLoginHistory(data.data.loginHistory);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, name: sName, email: sEmail, password: sPass, roleId: sRole })
      });
      if ((await res.json()).success) {
        setSName(''); setSEmail(''); setSPass(''); setSRole(''); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/team/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, name: rName, permissions: rPerms })
      });
      if ((await res.json()).success) {
        setRName(''); setRPerms([]); loadData();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const togglePermission = (perm: string) => {
    setRPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const PERMISSION_LIST = [
    'READ_ORDERS', 'WRITE_ORDERS', 'REFUND_ORDERS',
    'READ_PRODUCTS', 'WRITE_PRODUCTS', 'DELETE_PRODUCTS',
    'READ_FINANCE', 'WITHDRAW_FUNDS', 'MANAGE_MARKETING'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team & Security</h1>
          <p className="text-slate-500 mt-1">Manage staff access, custom roles, and monitor account activity.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
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
          {loading && team.length === 0 && activityLogs.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Staff Directory */}
              {tab === 'staff' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddStaff} className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input value={sName} onChange={e => setSName(e.target.value)} required placeholder="John Doe" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <input type="email" value={sEmail} onChange={e => setSEmail(e.target.value)} required placeholder="john@company.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Temporary Password</label>
                      <input type="password" value={sPass} onChange={e => setSPass(e.target.value)} required placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Role</label>
                      <select value={sRole} onChange={e => setSRole(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option value="">Select Role...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors h-[38px] flex items-center justify-center gap-2">
                      <UserPlus size={16}/> Invite Staff
                    </button>
                  </form>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Staff Member</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Assigned Role</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {team.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex flex-col items-center justify-center text-xs">{m.name.charAt(0)}</div>
                              {m.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{m.email}</td>
                            <td className="px-4 py-3"><span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">{m.role?.name || 'No Role'}</span></td>
                            <td className="px-4 py-3">
                              {m.isActive ? <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={12}/> Active</span> : <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><XCircle size={12}/> Inactive</span>}
                            </td>
                          </tr>
                        ))}
                        {team.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-slate-500 text-sm">No staff members found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Roles & Permissions */}
              {tab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 border-r border-slate-200 pr-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Key size={18}/> Existing Roles</h3>
                    <div className="space-y-3">
                      {roles.map(r => (
                        <div key={r.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                          <h4 className="font-bold text-slate-900 text-sm">{r.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {r.permissions.slice(0,3).map((p:string) => <span key={p} className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1 py-0.5 rounded">{p}</span>)}
                            {r.permissions.length > 3 && <span className="text-[9px] text-slate-400">+{r.permissions.length - 3} more</span>}
                          </div>
                        </div>
                      ))}
                      {roles.length === 0 && <p className="text-sm text-slate-500">No custom roles created yet.</p>}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <form onSubmit={handleCreateRole} className="space-y-4">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield size={18}/> Create Custom Role</h3>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Name</label>
                        <input value={rName} onChange={e => setRName(e.target.value)} required placeholder="e.g. Finance Manager" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Permissions</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {PERMISSION_LIST.map(p => (
                            <label key={p} className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${rPerms.includes(p) ? 'border-purple-600 bg-purple-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={rPerms.includes(p)} onChange={() => togglePermission(p)} className="mt-0.5 text-purple-600 focus:ring-purple-500 rounded border-slate-300" />
                              <span className="text-xs font-semibold text-slate-700">{p.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                          Save Role
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 3. Audit Logs */}
              {tab === 'logs' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Logs */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity size={16}/> Platform Activity Log</h3>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[500px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white sticky top-0 border-b border-slate-100 shadow-sm">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-slate-500">Time</th>
                            <th className="px-4 py-2 font-semibold text-slate-500">User</th>
                            <th className="px-4 py-2 font-semibold text-slate-500">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activityLogs.map(l => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(l.createdAt).toLocaleTimeString()}</td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{l.vendorUser?.name || 'Owner'}</td>
                              <td className="px-4 py-3 text-slate-900">{l.action.replace(/_/g, ' ')}</td>
                            </tr>
                          ))}
                          {activityLogs.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-500">No activity logged yet.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2"><Shield size={16}/> Security & Login History</h3>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[500px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white sticky top-0 border-b border-slate-100 shadow-sm">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-slate-500">Time</th>
                            <th className="px-4 py-2 font-semibold text-slate-500">User</th>
                            <th className="px-4 py-2 font-semibold text-slate-500">IP / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loginHistory.map(l => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString()}</td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{l.vendorUser?.name || 'Owner'}</td>
                              <td className="px-4 py-3">
                                <div>{l.ipAddress || 'Unknown IP'}</div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${l.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-600'}`}>{l.status}</span>
                              </td>
                            </tr>
                          ))}
                          {loginHistory.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-500">No login records found.</td></tr>}
                        </tbody>
                      </table>
                    </div>
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
