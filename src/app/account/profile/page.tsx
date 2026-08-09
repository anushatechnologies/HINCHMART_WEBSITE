"use client";

import { useState, useEffect } from 'react';
import AccountSidebar from '../AccountSidebar';
import { ArrowLeft, Save, KeyRound, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/account/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUser(d.data);
          setForm({ name: d.data.name || '', email: d.data.email || '' });
        }
      });
  }, []);

  const saveProfile = async () => {
    setSaving(true); setMsg('');
    const token = localStorage.getItem('token')!;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/account/me`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(r => r.json());
    setSaving(false);
    setMsg(res.success ? '✅ Profile updated successfully!' : `❌ ${res.message}`);
    if (res.success) setUser(res.data);
  };

  const changePassword = async () => {
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdMsg('❌ Passwords do not match'); return; }
    setPwdSaving(true); setPwdMsg('');
    const token = localStorage.getItem('token')!;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/account/change-password`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
    }).then(r => r.json());
    setPwdSaving(false);
    setPwdMsg(res.success ? '✅ Password changed successfully!' : `❌ ${res.message}`);
    if (res.success) setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/account" className="text-slate-500 hover:text-red-600 transition-colors"><ArrowLeft size={18}/></Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Profile Settings</h1>
            <p className="text-sm text-slate-500">Manage your personal information</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <AccountSidebar user={user} />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <CheckCircle size={18} className="text-emerald-500"/> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
                <input value={user?.phone || ''} disabled
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 text-slate-500 cursor-not-allowed"/>
                <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Account Type</label>
                <input value={user?.role || 'CUSTOMER'} disabled
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 text-slate-500 cursor-not-allowed capitalize"/>
              </div>
            </div>
            {msg && <p className={`mt-4 text-sm font-bold ${msg.startsWith('✅') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60">
                <Save size={16}/> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setForm({ name: user?.name || '', email: user?.email || '' })}
                className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <KeyRound size={18} className="text-orange-500"/> Change Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-xl">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <input type="password" value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"/>
              </div>
            </div>
            {pwdMsg && <p className={`mt-4 text-sm font-bold ${pwdMsg.startsWith('✅') ? 'text-emerald-600' : 'text-red-600'}`}>{pwdMsg}</p>}
            <div className="mt-6">
              <button onClick={changePassword} disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword}
                className="flex items-center gap-2 bg-slate-900 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60">
                <KeyRound size={16}/> {pwdSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-black text-slate-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Member Since</p>
                <p className="font-bold text-slate-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
                <p className="font-bold text-slate-900">{user?._count?.orders || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Account Status</p>
                <p className="font-bold text-emerald-600">{user?.status || 'ACTIVE'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
