'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Eye, X, Send, Circle } from 'lucide-react';

const API = 'http://localhost:5000';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/support/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStatusChange = async (id: number, status: string, priority: string) => {
    setStatusUpdating(true);
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/support/admin/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, priority })
    });
    fetchTickets();
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status, priority });
    }
    setStatusUpdating(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    const token = localStorage.getItem('token');
    
    // Optimistic UI update for the reply
    const newMsg = { senderType: 'AGENT', senderName: 'Admin', body: reply, createdAt: new Date() };
    setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMsg] });
    setReply('');

    await fetch(`${API}/api/support/admin/${selectedTicket.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: newMsg.body, agentName: 'Admin Support' })
    });
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'text-rose-500 bg-rose-50 border-rose-200';
      case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'RESOLVED': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'URGENT': return <Circle size={10} className="fill-rose-500 text-rose-500" />;
      case 'HIGH': return <Circle size={10} className="fill-orange-500 text-orange-500" />;
      case 'MEDIUM': return <Circle size={10} className="fill-amber-400 text-amber-400" />;
      default: return <Circle size={10} className="fill-blue-400 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3"><MessageSquare className="text-blue-600" size={28} /> Support Desk</h1>
            <p className="text-slate-500 mt-1">Manage and resolve customer support tickets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Ticket List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-extrabold text-slate-900">All Tickets ({tickets.length})</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading tickets...</div>
              ) : tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <button 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(ticket.priority)}
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">#{ticket.id}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                      <p className="text-xs text-slate-500 font-medium">{ticket.name} • {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 font-bold">No tickets found.</div>
              )}
            </div>
          </div>

          {/* Ticket Detail & Reply */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-slate-100 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-extrabold text-slate-900">#{selectedTicket.id} - {selectedTicket.subject}</h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500">From: <span className="font-bold text-slate-700">{selectedTicket.name}</span> ({selectedTicket.email})</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Category: {selectedTicket.category}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <select 
                      value={selectedTicket.status} 
                      onChange={e => handleStatusChange(selectedTicket.id, e.target.value, selectedTicket.priority)}
                      disabled={statusUpdating}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <select 
                      value={selectedTicket.priority} 
                      onChange={e => handleStatusChange(selectedTicket.id, selectedTicket.status, e.target.value)}
                      disabled={statusUpdating}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                  {selectedTicket.messages?.map((msg: any, idx: number) => {
                    const isCustomer = msg.senderType === 'CUSTOMER';
                    return (
                      <div key={idx} className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-slate-500">{msg.senderName} {isCustomer ? '(Customer)' : '(Agent)'}</span>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium whitespace-pre-wrap shadow-sm border ${isCustomer ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none' : 'bg-blue-600 border-blue-700 text-white rounded-tr-none'}`}>
                          {msg.body}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                  <form onSubmit={handleReply} className="flex items-end gap-3">
                    <textarea 
                      value={reply} onChange={e => setReply(e.target.value)}
                      placeholder="Type your reply here..." 
                      rows={3}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm resize-none"
                    />
                    <button type="submit" disabled={!reply.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold h-12 px-6 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0">
                      <Send size={18} /> Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                <MessageSquare size={64} className="mb-4 opacity-20" />
                <p className="font-bold text-lg text-slate-500">Select a ticket to view details</p>
                <p className="text-sm">Click on any ticket from the list to read messages and reply.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
