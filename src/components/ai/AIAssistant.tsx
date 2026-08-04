'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am Hinchmart AI. I can help you find products, bulk deals, or check your orders. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      // Backend API call to the AI module
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply, products: data.data.products }]);
      } else {
        // Fallback mock if backend isn't connected yet
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I found some great B2B hardware supplies based on your request! Check these out:",
            products: [
              { id: 1, name: 'Industrial Drill Pro', price: '4500', image: 'https://via.placeholder.com/150' },
              { id: 2, name: 'Steel Bolts (Box of 1000)', price: '850', image: 'https://via.placeholder.com/150' }
            ]
          }]);
          setIsLoading(false);
        }, 1500);
        return;
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my brain right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center justify-center border-2 border-slate-700 hover:border-blue-500 group relative"
          aria-label="Open AI Assistant"
        >
          <Bot size={24} className="group-hover:text-blue-400 transition-colors" />
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <Sparkles size={10} /> AI
          </div>
        </button>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] sm:w-[400px] h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white flex justify-between items-center shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Bot size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-1">Hinchmart AI <Sparkles size={14} className="text-amber-400" /></h3>
                <p className="text-slate-300 text-[11px]">Your B2B Shopping Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors relative z-10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-4 scroll-smooth">
            {messages.map((msg, index) => {
              const isAi = msg.role === 'assistant';
              return (
                <div key={index} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 border border-blue-200">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isAi 
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm' 
                      : 'bg-blue-600 text-white rounded-tr-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    
                    {/* Render Product Cards if AI suggests them */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p, i) => (
                          <Link href={`/products/${p.id}`} key={i} className="flex gap-3 bg-slate-50 border border-slate-100 p-2 rounded-xl hover:border-blue-300 transition-colors group">
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                              <ShoppingBag size={16} className="text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                              <p className="text-xs text-blue-600 font-bold mt-0.5">₹{p.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start items-center gap-2 text-slate-400 text-sm py-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <Bot size={16} className="text-slate-500" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts (Optional) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 bg-[#F8FAFC] flex gap-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => setInput("Show me bulk wire offers")} className="whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors">
                Bulk Wire Offers
              </button>
              <button onClick={() => setInput("Where is my order?")} className="whitespace-nowrap bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors">
                Track Order
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-100 text-slate-900 rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 border border-transparent focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white w-9 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
              </button>
            </div>
          </form>
          
        </div>
      )}
    </div>
  );
}
