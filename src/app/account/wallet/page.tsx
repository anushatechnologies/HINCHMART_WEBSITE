'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, PlusCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

  useEffect(() => {
    // In a real app, this fetches from /api/wallet
    const fetchWallet = async () => {
      try {
        setLoading(true);
        // Mock API call for now if backend isn't fully ready
        // const res = await fetch(`${API_BASE}/wallet/balance`, { ... });
        
        // Mock data to demonstrate the UI
        setTimeout(() => {
          setBalance(4500.50);
          setTransactions([
            { id: '1', type: 'CREDIT', amount: 5000, description: 'Added via Credit Card', createdAt: new Date().toISOString() },
            { id: '2', type: 'DEBIT', amount: 499.50, description: 'Purchase #ORD-8821', createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: '3', type: 'CREDIT', amount: 150, description: 'Refund for #ORD-8112', createdAt: new Date(Date.now() - 172800000).toISOString() },
          ]);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWallet();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || isNaN(Number(fundAmount))) return;
    
    // Load Razorpay checkout.js dynamically
    const loadScript = () => new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const loaded = await loadScript();
    if (!loaded) {
      alert('Failed to load payment gateway. Please try again.');
      return;
    }

    // Since this is a demo, we will use mock razorpay credentials and immediately succeed.
    // In production, this calls /api/wallet/create-razorpay-order first.
    const rzp = new (window as any).Razorpay({
      key: 'rzp_test_mockkey123456789', // MOCK KEY
      amount: Number(fundAmount) * 100, // Amount in paise
      currency: 'INR',
      name: 'HinchMart B2B Wallet',
      description: `Wallet Top-up of ₹${fundAmount}`,
      theme: { color: '#2563EB' },
      handler: async function (response: any) {
        // Mock success verifying with backend
        setBalance(prev => prev + Number(fundAmount));
        setTransactions(prev => [
          {
            id: 'TXN-' + Math.floor(Math.random() * 1000000),
            type: 'CREDIT',
            amount: Number(fundAmount),
            description: 'Wallet Top-up via Razorpay',
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        setIsAddingFunds(false);
        setFundAmount('');
        alert('Funds added successfully!');
      }
    });
    rzp.open();
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading Wallet...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Wallet size={32} className="text-blue-600" />
          Hinchmart Wallet
        </h1>
        <p className="text-slate-500 mt-2">Manage your funds, add money, and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <p className="text-blue-200 font-medium tracking-wide uppercase text-sm mb-2">Available Balance</p>
          <h2 className="text-5xl font-black mb-8">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          
          <button 
            onClick={() => setIsAddingFunds(!isAddingFunds)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md"
          >
            <PlusCircle size={20} />
            {isAddingFunds ? 'Cancel' : 'Add Funds'}
          </button>
        </div>

        {/* Quick Stats or Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Spent</span>
              <span className="font-semibold text-slate-800">₹499.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Added</span>
              <span className="font-semibold text-green-600">₹5,150.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Form (Toggleable) */}
      {isAddingFunds && (
        <div className="bg-blue-50 rounded-2xl p-6 mb-10 border border-blue-100 animate-in slide-in-from-top-4 fade-in duration-300">
          <h3 className="font-bold text-slate-800 mb-4">Add Money to Wallet</h3>
          <form onSubmit={handleAddFunds} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors"
            >
              Proceed to Pay
            </button>
          </form>
          
          <div className="flex gap-2 mt-4">
            {[500, 1000, 2000, 5000].map(amt => (
              <button 
                key={amt}
                type="button"
                onClick={() => setFundAmount(amt.toString())}
                className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                +₹{amt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Transaction History</h3>
          <Clock size={20} className="text-slate-400" />
        </div>
        
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No transactions yet.</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{tx.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
