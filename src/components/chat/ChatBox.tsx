'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, X, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id?: number;
  rfqId: number;
  senderId: number;
  senderRole: string;
  message: string;
  createdAt?: string;
}

interface ChatBoxProps {
  rfqId: number;
  currentUserId: number;
  currentUserRole: 'buyer' | 'seller' | 'admin';
  apiBaseUrl?: string;
}

export default function ChatBox({ rfqId, currentUserId, currentUserRole, apiBaseUrl }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use Vercel env var or fallback
  const socketUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

  useEffect(() => {
    if (!isOpen) return;

    // Initialize socket connection
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'] // Try websocket first
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      // Join specific RFQ room
      newSocket.emit('join_rfq_room', rfqId.toString());
    });

    newSocket.on('receive_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, rfqId, socketUrl]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    const messageData: ChatMessage = {
      rfqId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      message: inputValue.trim(),
    };

    // Emit to server
    socket.emit('send_message', messageData);

    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
          aria-label="Open Chat"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            !
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 w-80 sm:w-96 h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-lg">Negotiation Chat</h3>
              <p className="text-blue-100 text-xs">RFQ #{rfqId}</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white p-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-slate-950 flex flex-col gap-3 scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm h-full">
                <MessageCircle size={32} className="mb-2 opacity-50" />
                <p>Start negotiating terms and pricing.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === currentUserId && msg.senderRole === currentUserRole;
                return (
                  <div 
                    key={msg.id || index} 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white self-end rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 self-start border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-xs font-semibold block mb-1 opacity-70 uppercase tracking-wider">
                        {msg.senderRole}
                      </span>
                    )}
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors flex-shrink-0"
              >
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
