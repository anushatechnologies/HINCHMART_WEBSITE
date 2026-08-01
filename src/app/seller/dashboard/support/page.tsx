"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  LifeBuoy, RotateCcw, MessageCircle, Send, CheckCircle, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { key: 'tickets', label: 'Support Tickets', icon: AlertCircle },
  { key: 'chat', label: 'Live Chat', icon: MessageCircle },
];

export default function SupportHub() {
  const [tab, setTab] = useState('returns');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [returns, setReturns] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Form States
  const [chatInput, setChatInput] = useState('');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      if (tab === 'returns') {
        const res = await fetch(`${API}/vendors/support/returns?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setReturns(data.data);
      }
      if (tab === 'tickets') {
        const res = await fetch(`${API}/vendors/support/tickets?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setTickets(data.data);
      }
      if (tab === 'chat') {
        const res = await fetch(`${API}/vendors/support/chat?vendorId=${vendorId}`);
        const data = await res.json();
        if (data.success) setMessages(data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleUpdateReturn = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/vendors/support/returns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if ((await res.json()).success) loadData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateTicket = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API}/vendors/support/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if ((await res.json()).success) loadData();
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !chatInput.trim()) return;
    try {
      const res = await fetch(`${API}/vendors/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, content: chatInput })
      });
      if ((await res.json()).success) {
        setChatInput('');
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
          <p className="text-slate-500 mt-1">Manage returns, resolve tickets, and chat with customers.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar shrink-0">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-sky-600 text-sky-700 bg-sky-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {loading && returns.length === 0 && tickets.length === 0 && messages.length === 0 ? (
            <div className="flex justify-center items-center flex-1"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Returns & Refunds */}
              {tab === 'returns' && (
                <div className="space-y-4">
                  {returns.map(r => (
                    <div key={r.id} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900">{r.customerName}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            Order #{r.order?.orderNumber || r.orderId}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'APPROVED' ? 'bg-sky-100 text-sky-700' : r.status === 'REFUNDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">Reason: {r.reason}</p>
                        <p className="text-sm font-semibold text-slate-800">Refund Amount: ₹{r.amount}</p>
                      </div>
                      
                      {r.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateReturn(r.id, 'REJECTED')} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">Reject</button>
                          <button onClick={() => handleUpdateReturn(r.id, 'APPROVED')} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">Approve</button>
                        </div>
                      )}
                      {r.status === 'APPROVED' && (
                        <button onClick={() => handleUpdateReturn(r.id, 'REFUNDED')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                          <CheckCircle size={16}/> Mark as Refunded
                        </button>
                      )}
                    </div>
                  ))}
                  {returns.length === 0 && <div className="text-slate-500 text-center py-10">No return requests found.</div>}
                </div>
              )}

              {/* 2. Support Tickets */}
              {tab === 'tickets' && (
                <div className="space-y-4">
                  {tickets.map(t => (
                    <div key={t.id} className="border border-slate-200 p-5 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: t.priority === 'URGENT' ? '#ef4444' : t.priority === 'HIGH' ? '#f97316' : '#3b82f6' }}>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900">{t.subject}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            {t.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{t.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Priority: <strong className="text-slate-700">{t.priority}</strong></span>
                          <span>Opened on {new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <select 
                          value={t.status} 
                          onChange={(e) => handleUpdateTicket(t.id, e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:outline-none ${t.status === 'OPEN' ? 'border-amber-300 text-amber-700 bg-amber-50' : t.status === 'RESOLVED' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-700 bg-slate-50'}`}
                        >
                          <option value="OPEN">● Open</option>
                          <option value="IN_PROGRESS">● In Progress</option>
                          <option value="RESOLVED">● Resolved</option>
                          <option value="CLOSED">● Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && <div className="text-slate-500 text-center py-10">No support tickets found.</div>}
                </div>
              )}

              {/* 3. Live Chat */}
              {tab === 'chat' && (
                <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 min-h-[400px]">
                  <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600"><LifeBuoy size={16}/></div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Customer Chat</h3>
                        <p className="text-xs text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map(m => (
                      <div key={m.id} className={`flex ${m.senderType === 'VENDOR' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.senderType === 'VENDOR' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                          {m.content}
                          <div className={`text-[10px] mt-1 text-right ${m.senderType === 'VENDOR' ? 'text-sky-200' : 'text-slate-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && <div className="text-slate-500 text-center py-10 text-sm">No messages yet.</div>}
                  </div>

                  <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type your message..." 
                      className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <button type="submit" disabled={!chatInput.trim()} className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:hover:bg-sky-600">
                      <Send size={16} className="ml-1" />
                    </button>
                  </form>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
