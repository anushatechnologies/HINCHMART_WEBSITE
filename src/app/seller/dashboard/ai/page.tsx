"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, FileText, TrendingUp, BarChart3, Image as ImageIcon, MessageSquare, Send, Loader2, Play
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api`;

const TABS = [
  { key: 'content', label: 'Content & SEO Generator', icon: FileText, desc: 'Auto-write product descriptions and SEO tags.' },
  { key: 'pricing', label: 'Pricing Optimizer', icon: TrendingUp, desc: 'Analyze competitors to find the sweet spot.' },
  { key: 'forecast', label: 'Sales Forecaster', icon: BarChart3, desc: 'Predict next month\'s sales and stock needs.' },
  { key: 'image', label: 'Image Studio', icon: ImageIcon, desc: 'Enhance product photos automatically.' },
  { key: 'chat', label: 'Vendor Copilot', icon: MessageSquare, desc: 'Chat with your AI assistant.' },
];

export default function AIStudio() {
  const [tab, setTab] = useState('content');
  const [vendorId, setVendorId] = useState<number | null>(null);
  
  // Generic Loading State
  const [loading, setLoading] = useState(false);

  // Content Gen State
  const [prompt, setPrompt] = useState('');
  const [contentResult, setContentResult] = useState<any>(null);

  // Pricing State
  const [category, setCategory] = useState('');
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Forecast State
  const [forecastResult, setForecastResult] = useState<any>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'AI', text: "Welcome to the AI Studio! I'm your dedicated Vendor Copilot. How can I help optimize your store today?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Actions
  const handleGenerateContent = async (type: 'desc' | 'seo') => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type })
      });
      const json = await res.json();
      if (json.success) setContentResult({ type, data: json.data });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAnalyzePricing = async () => {
    if (!vendorId || !category) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/ai/analyze-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, category })
      });
      const json = await res.json();
      if (json.success) setPricingResult(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleRunForecast = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/ai/forecast?vendorId=${vendorId}`);
      const json = await res.json();
      if (json.success) setForecastResult(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { sender: 'VENDOR', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/vendors/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => [...prev, { sender: 'AI', text: json.data.reply }]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3"><Sparkles className="text-fuchsia-400"/> AI Studio</h1>
          <p className="text-indigo-200 max-w-xl text-sm leading-relaxed">Supercharge your workflow. Let artificial intelligence write your product descriptions, optimize your pricing, predict your inventory needs, and act as your 24/7 business copilot.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[600px] overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col p-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hidden md:block px-2 mt-2">Tools Menu</div>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${tab === t.key ? 'bg-white shadow-sm border border-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200/50 border border-transparent'}`}>
                <div className={`p-2 rounded-lg shrink-0 ${tab === t.key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100'}`}><Icon size={18} /></div>
                <div className="hidden md:block">
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Workspace Area */}
        <div className="flex-1 p-6 md:p-8 bg-slate-50/30">
          
          {/* 1. Content & SEO */}
          {tab === 'content' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Content & SEO Generator</h2>
                <p className="text-sm text-slate-500">Provide a brief name or keyword, and the AI will write a highly-converting description and SEO meta tags.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name or Keywords</label>
                <div className="flex gap-3">
                  <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Wireless Noise-Cancelling Headphones..." className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleGenerateContent('desc')} disabled={loading || !prompt} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Generate Description
                  </button>
                  <button onClick={() => handleGenerateContent('seo')} disabled={loading || !prompt} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-sm hover:bg-indigo-100 disabled:opacity-50">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16}/>} Generate SEO Tags
                  </button>
                </div>
              </div>

              {contentResult && (
                <div className="bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4">AI Output</h3>
                  
                  {contentResult.type === 'desc' && (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm text-slate-800 text-sm leading-relaxed border border-indigo-100">
                        {contentResult.data.description}
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                        <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Key Features</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {contentResult.data.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                  {contentResult.type === 'seo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Meta Title</label>
                        <div className="bg-white p-3 rounded-lg shadow-sm text-slate-800 text-sm font-semibold border border-indigo-100 mt-1">{contentResult.data.title}</div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Meta Description</label>
                        <div className="bg-white p-3 rounded-lg shadow-sm text-slate-700 text-sm border border-indigo-100 mt-1">{contentResult.data.description}</div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Search Keywords</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {contentResult.data.keywords.map((k: string, i: number) => <span key={i} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs font-bold">{k}</span>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Pricing Optimizer */}
          {tab === 'pricing' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Pricing Optimizer</h2>
                <p className="text-sm text-slate-500">Let AI analyze market trends and competitors to suggest the most profitable price for a category.</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Product Category</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Electronics, Men's Shoes" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <button onClick={handleAnalyzePricing} disabled={loading || !category} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 h-[42px]">
                  {loading ? <Loader2 size={16} className="animate-spin"/> : <TrendingUp size={16}/>} Analyze Market
                </button>
              </div>

              {pricingResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <p className="text-emerald-800 font-semibold mb-2">AI Suggested Price</p>
                    <h3 className="text-5xl font-black text-emerald-900">₹{pricingResult.suggestedPrice}</h3>
                    <p className="text-xs text-emerald-600 font-bold mt-4 uppercase tracking-wider">Confidence Score: {pricingResult.confidenceScore}%</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Market Insights</h3>
                    <ul className="space-y-3">
                      {pricingResult.insights.map((ins: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> {ins}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Current Market Average: <span className="font-bold text-slate-800">₹{pricingResult.marketAverage}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Sales Forecaster */}
          {tab === 'forecast' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Sales & Inventory Forecaster</h2>
                  <p className="text-sm text-slate-500">Predict future demand and get automated stock replenishment recommendations.</p>
                </div>
                <button onClick={handleRunForecast} disabled={loading} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} Run AI Prediction Model
                </button>
              </div>

              {forecastResult && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-2xl shadow-lg text-white">
                      <p className="text-blue-200 font-semibold mb-2">Predicted Sales (Next 30 Days)</p>
                      <h3 className="text-5xl font-black">{forecastResult.predictedSales} Units</h3>
                      <p className="text-sm text-emerald-400 font-bold mt-4 flex items-center gap-1"><TrendingUp size={16}/> {forecastResult.growthRate} Projected Growth</p>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Business Insights</h3>
                      <ul className="space-y-3">
                        {forecastResult.businessInsights.map((ins: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5"><Sparkles size={14}/></span> {ins}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                      <h3 className="font-bold text-slate-900">Inventory Replenishment Recommendations</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-500">Product</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Current Stock</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Action Required</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">AI Reasoning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {forecastResult.inventoryRecommendations.map((rec: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-4 font-bold text-slate-900">{rec.product}</td>
                            <td className="px-4 py-4 text-slate-500">{rec.currentStock}</td>
                            <td className="px-4 py-4"><span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">Order {rec.recommendedOrder} units</span></td>
                            <td className="px-4 py-4 text-slate-600 text-xs">{rec.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!forecastResult && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <BarChart3 size={48} className="text-slate-300 mb-4"/>
                  <p className="text-slate-500 text-center max-w-sm">Click the button above to run the AI prediction model against your store's historical data.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Image Studio (Mock) */}
          {tab === 'image' && (
            <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Image Enhancement Studio</h2>
                <p className="text-sm text-slate-500">Automatically remove backgrounds, correct lighting, and upscale product photos.</p>
              </div>
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-fuchsia-100 transition-colors">
                  <ImageIcon size={32} className="text-slate-400 group-hover:text-fuchsia-500"/>
                </div>
                <p className="font-bold text-slate-700 group-hover:text-fuchsia-700 mb-1">Drag & Drop Image Here</p>
                <p className="text-xs text-slate-400">AI processing requires a valid JPG or PNG</p>
              </div>
            </div>
          )}

          {/* 5. Chat Copilot */}
          {tab === 'chat' && (
            <div className="max-w-2xl h-full flex flex-col animate-in fade-in duration-300" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
              <div className="bg-slate-900 rounded-t-2xl p-4 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white"><Sparkles size={20}/></div>
                <div>
                  <h3 className="font-bold text-white text-sm">Vendor Copilot</h3>
                  <p className="text-xs text-slate-400">Always online &bull; Powered by AI</p>
                </div>
              </div>
              
              <div className="flex-1 bg-white border-l border-r border-slate-200 p-4 overflow-y-auto space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'VENDOR' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${m.sender === 'VENDOR' ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-none border border-slate-200 px-5 py-3 text-sm flex gap-1 items-center h-[46px]">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="bg-slate-50 border border-slate-200 rounded-b-2xl p-3 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about your sales, inventory, or pricing..." 
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  disabled={loading}
                />
                <button type="submit" disabled={!chatInput.trim() || loading} className="w-12 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
