'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function RfqChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rfqId } = use(params);
  const router = useRouter();

  const [rfq, setRfq] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dummy logic: We assume current user is the buyer. 
  // In a real app, this comes from auth context.
  const currentUserId = 1; 
  const currentUserRole = 'BUYER'; // VENDOR would use this same component ideally

  useEffect(() => {
    // 1. Fetch RFQ Details
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rfq/${rfqId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setRfq(data.data);
        }
      } catch (err) {
        console.error('Error fetching RFQ:', err);
      }
    };

    // 2. Fetch past messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rfq/${rfqId}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    fetchMessages();

    // 3. Setup Socket.io
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      socketRef.current?.emit('join_rfq_room', rfqId);
    });

    socketRef.current.on('receive_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [rfqId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const payload = {
      rfqId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      message: newMessage
    };

    socketRef.current.emit('send_message', payload);
    setNewMessage('');
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Loading Negotiation Room...</div>;
  if (!rfq) return <div className="p-10 text-center text-red-500 font-bold">RFQ Not Found</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6 h-[80vh]">
        
        {/* Left Side: RFQ Details */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
          <h2 className="text-xl font-black text-slate-900 mb-2">RFQ #{rfq.rfqNumber}</h2>
          <p className="text-sm text-slate-500 mb-6">Status: <span className="font-bold text-blue-600 uppercase">{rfq.status}</span></p>
          
          <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">Requested Items</h3>
          <ul className="space-y-4 mb-6">
            {rfq.items?.map((item: any, i: number) => (
              <li key={i} className="text-sm">
                <p className="font-semibold text-slate-800">{item.productName}</p>
                <div className="flex justify-between text-slate-500 mt-1">
                  <span>Qty: {item.quantity}</span>
                  {item.targetPrice && <span>Target: ₹{item.targetPrice}</span>}
                </div>
              </li>
            ))}
          </ul>
          
          {rfq.notes && (
            <>
              <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">Notes</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{rfq.notes}</p>
            </>
          )}
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-900 text-white rounded-t-2xl">
            <h2 className="font-bold">Live Negotiation Room</h2>
            <p className="text-xs text-slate-300">Chat directly with the vendor to finalize quotes.</p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-10">
                <p>No messages yet. Start the negotiation!</p>
              </div>
            ) : (
              messages.map((msg: any, i: number) => {
                const isMe = msg.senderRole === currentUserRole;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe ? 'bg-red-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <span className={`text-[10px] mt-1 block ${isMe ? 'text-red-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
