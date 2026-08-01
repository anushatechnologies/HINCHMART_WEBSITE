"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Camera, Barcode, Clock, TrendingUp, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  products: any[];
  brands: string[];
  categories: any[];
}

interface PopularItem {
  label: string;
  type: string;
  slug?: string;
}

const RECENT_KEY = 'hinchi_recent_searches';
const MAX_RECENT = 6;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}

function saveRecentSearch(term: string) {
  const existing = getRecentSearches().filter(s => s !== term);
  const updated = [term, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export default function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories for dropdown
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); })
      .catch(() => {});
  }, []);

  // Load popular searches on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/search/popular')
      .then(r => r.json())
      .then(d => { if (d.success) setPopular(d.data); })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setIsLoading(true);
    try {
      const url = `http://localhost:5000/api/search?q=${encodeURIComponent(q)}&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch { } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 280);
  };

  const handleFocus = () => {
    setRecent(getRecentSearches());
    setIsOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent, overrideQ?: string) => {
    e?.preventDefault();
    const term = overrideQ || query;
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    const params = new URLSearchParams({ search: term.trim() });
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
    setQuery(term);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser. Please use Chrome.');
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsOpen(true);
      doSearch(transcript);
      // Auto-submit after voice
      setTimeout(() => handleSubmit(undefined, transcript), 500);
    };

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOpen(true);
    setIsScanning(true);

    // Simulate AI Image processing time
    setTimeout(() => {
      setIsScanning(false);
      // Simulate extracted keywords based on a random industrial supply
      const mockKeywords = ["Drill Machine", "Safety Helmet", "Steel Pipe", "Wrench Set", "LED Bulb"];
      const extractedKeyword = mockKeywords[Math.floor(Math.random() * mockKeywords.length)];
      
      setQuery(extractedKeyword);
      doSearch(extractedKeyword);
      // Auto-submit after voice/image
      setTimeout(() => handleSubmit(undefined, extractedKeyword), 500);
    }, 2500);
  };

  const handleBarcodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOpen(true);
    setIsScanningBarcode(true);

    // Simulate Barcode decoding time
    setTimeout(() => {
      setIsScanningBarcode(false);
      // Simulate extracted SKU from barcode
      const mockSKUs = ["SKU-84729", "EAN-0938", "BOSCH-DRILL-800", "PIPE-50MM", "HELMET-YEL"];
      const extractedSKU = mockSKUs[Math.floor(Math.random() * mockSKUs.length)];
      
      setQuery(extractedSKU);
      doSearch(extractedSKU);
      // Auto-submit after scanning
      setTimeout(() => handleSubmit(undefined, extractedSKU), 500);
    }, 2000);
  };

  const clearQuery = () => { setQuery(''); setResults(null); inputRef.current?.focus(); };

  const showDropdown = isOpen && (query.length >= 2 ? true : true);

  return (
    <div ref={containerRef} className="flex-1 w-full max-w-2xl mx-auto hidden lg:block relative">
      <form onSubmit={handleSubmit} className="flex items-stretch w-full h-[40px] border-2 border-orange-500 rounded-md bg-white hover:border-orange-600 focus-within:border-orange-600 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] transition-all duration-200 overflow-hidden">

        {/* Category Filter */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-slate-50 border-r border-slate-200 text-slate-600 text-xs px-2 outline-none cursor-pointer font-medium w-[108px] shrink-0"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={handleFocus}
            placeholder="Search products, brands, SKU..."
            className="w-full h-full px-3 text-sm outline-none bg-transparent"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={clearQuery} className="absolute right-2 text-slate-400 hover:text-slate-700 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center border-l border-slate-200">
          <button type="button" onClick={handleVoiceSearch} title="Voice Search"
            className={`flex items-center justify-center px-2 h-full transition-all duration-300 relative ${
              isListening ? 'text-orange-600' : 'text-slate-400 hover:text-orange-500'
            }`}>
            {isListening && (
              <span className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75 scale-150"></span>
            )}
            <Mic size={16} className="relative z-10" />
          </button>

          {/* Hidden File Input for Image Search */}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Visual Search"
            className="flex items-center justify-center px-2 h-full text-slate-400 hover:text-orange-500 transition-colors">
            <Camera size={16} />
          </button>

          {/* Hidden File Input for Barcode Search */}
          <input type="file" ref={barcodeInputRef} onChange={handleBarcodeUpload} accept="image/*" capture="environment" className="hidden" />
          <button type="button" onClick={() => barcodeInputRef.current?.click()} title="Barcode Search"
            className="flex items-center justify-center px-2 h-full text-slate-400 hover:text-orange-500 transition-colors">
            <Barcode size={16} />
          </button>
        </div>

        <button type="submit"
          className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-6 font-black text-sm tracking-wide transition-colors shrink-0">
          <Search size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">SEARCH</span>
        </button>
      </form>


      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[520px] overflow-y-auto">

          {/* AI Scanning State */}
          {isScanning && (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-lg"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 animate-[scan_2s_ease-in-out_infinite]"></div>
                <Camera className="absolute inset-0 m-auto text-slate-400" size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">AI Visual Search</h3>
              <p className="text-xs text-slate-500">Scanning image and extracting product keywords...</p>
            </div>
          )}

          {/* Barcode Scanning State */}
          {isScanningBarcode && (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-lg"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-[scan_1s_ease-in-out_infinite]"></div>
                <Barcode className="absolute inset-0 m-auto text-slate-400" size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Barcode Scanner</h3>
              <p className="text-xs text-slate-500">Decoding SKU/EAN from barcode...</p>
            </div>
          )}

          {/* Loading state */}
          {!isScanning && !isScanningBarcode && isLoading && (
            <div className="p-4 text-center text-sm text-slate-500">
              <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching...
            </div>
          )}

          {/* Query results */}
          {!isScanning && !isScanningBarcode && !isLoading && results && query.length >= 2 && (
            <div>
              {/* Product Results */}
              {results.products.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Products</p>
                  {results.products.map((p, i) => (
                    <Link key={i} href={`/products/${p.slug}`}
                      onClick={() => { saveRecentSearch(query); setIsOpen(false); }}
                      className="flex items-center gap-3 px-2 py-2.5 hover:bg-slate-50 rounded-lg group transition-colors">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-lg">
                        {p.images?.[0] ? (
                          <img src={p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`} alt="" className="w-full h-full object-cover" />
                        ) : '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 truncate transition-colors">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.category?.name} {p.brand ? `• ${p.brand}` : ''}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900 shrink-0">₹{Number(p.basePrice).toLocaleString('en-IN')}</p>
                    </Link>
                  ))}
                  <button onClick={() => handleSubmit(undefined, query)}
                    className="w-full mt-2 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
                    View all results for "{query}" <ChevronRight size={14}/>
                  </button>
                </div>
              )}

              {/* Brand + Category Results */}
              {(results.brands.length > 0 || results.categories.length > 0) && (
                <div className="border-t border-slate-100 p-3 grid grid-cols-2 gap-4">
                  {results.brands.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Brands</p>
                      {results.brands.map((b, i) => (
                        <button key={i} onClick={() => handleSubmit(undefined, b)}
                          className="block w-full text-left px-2 py-1.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors font-medium">
                          🏷️ {b}
                        </button>
                      ))}
                    </div>
                  )}
                  {results.categories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Categories</p>
                      {results.categories.map((c, i) => (
                        <Link key={i} href={`/products?category=${c.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-2 py-1.5 text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors font-medium">
                          📂 {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {results.products.length === 0 && results.brands.length === 0 && results.categories.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No results found for "<span className="font-bold">{query}</span>"
                  <br /><span className="text-xs mt-1 block">Try a different keyword or browse categories.</span>
                </div>
              )}
            </div>
          )}

          {/* Default state: Recent + Popular */}
          {!isLoading && (!results || query.length < 2) && (
            <div className="p-4 grid grid-cols-2 gap-6">
              {/* Recent Searches */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Clock size={12}/> Recent Searches
                </p>
                {recent.length > 0 ? recent.map((term, i) => (
                  <button key={i} onClick={() => handleSubmit(undefined, term)}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors group">
                    <Clock size={13} className="text-slate-400 group-hover:text-blue-400 shrink-0"/>
                    {term}
                  </button>
                )) : (
                  <p className="text-xs text-slate-400 italic px-2">No recent searches</p>
                )}
              </div>

              {/* Popular Searches */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <TrendingUp size={12}/> Popular Searches
                </p>
                {popular.slice(0, 6).map((item, i) => (
                  <button key={i} onClick={() => handleSubmit(undefined, item.label)}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg hover:text-blue-600 transition-colors group">
                    <TrendingUp size={13} className="text-slate-400 group-hover:text-blue-400 shrink-0"/>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
