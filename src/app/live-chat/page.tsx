'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Bot, X } from 'lucide-react';

const API = 'http://localhost:5000';

export default function LiveChatPage() {
  const [session, setSession] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  useEffect(() => {
    // Poll for new messages if active session
    if (!session || session.status === 'CLOSED') return;
    const int = setInterval(() => {
      fetch(`${API}/api/chat/${session.id}`)
        .then(r => r.json())
        .then(d => { if (d.success) setSession(d.data); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(int);
  }, [session]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const visitorId = localStorage.getItem('visitorId') || Math.random().toString(36).substring(7);
      localStorage.setItem('visitorId', visitorId);
      const res = await fetch(`${API}/api/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, visitorId })
      });
      const data = await res.json();
      if (data.success) setSession(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session) return;
    
    // Optimistic UI update
    const newMsg = { role: 'CUSTOMER', content: message, ts: new Date() };
    setSession({ ...session, messages: [...session.messages, newMsg] });
    setMessage('');

    try {
      const res = await fetch(`${API}/api/chat/${session.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'CUSTOMER', content: newMsg.content })
      });
      const data = await res.json();
      if (data.success) setSession(data.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {!session ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-90" />
              <h1 className="text-3xl font-black mb-2">Live Support</h1>
              <p className="font-medium text-blue-100">Please provide your details to start chatting.</p>
            </div>
            <div className="p-8 sm:p-10">
              <form onSubmit={startChat} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Your email address" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-sm disabled:opacity-60 text-lg">
                  {loading ? 'Connecting...' : 'Start Chat'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-[700px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                </div>
                <div>
                  <h2 className="font-black text-xl leading-tight">HinchMart Support</h2>
                  <p className="text-sm font-medium text-blue-100 flex items-center gap-1">
                    {session.status === 'WAITING' ? 'Waiting for an agent...' : session.status === 'ACTIVE' ? 'Agent connected' : 'Chat closed'}
                  </p>
                </div>
              </div>
              <button onClick={() => { if(confirm('End this chat session?')) setSession(null); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
              {session.messages?.map((msg: any, i: number) => {
                const isCustomer = msg.role === 'CUSTOMER';
                const isSystem = msg.role === 'SYSTEM';
                if (isSystem) {
                  return (
                    <div key={i} className="flex justify-center my-4">
                      <span className="bg-slate-200/50 text-slate-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={i} className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isCustomer ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      {isCustomer ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl p-4 font-medium ${isCustomer ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {msg.content}
                      <p className={`text-[10px] mt-2 font-bold ${isCustomer ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            {session.status !== 'CLOSED' ? (
              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
                <input 
                  type="text" value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
                <button type="submit" disabled={!message.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white w-14 h-14 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm">
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            ) : (
              <div className="p-5 bg-slate-100 border-t border-slate-200 text-center font-bold text-slate-500">
                This chat session has ended.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
