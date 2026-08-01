"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Package, Box, Activity, AlertTriangle, ArrowRightLeft,
  Printer, QrCode, FileClock, Search, Download, Loader2, Save
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { key: 'overview', label: 'Stock Overview', icon: Package },
  { key: 'warehouses', label: 'Warehouses & Transfers', icon: Box },
  { key: 'batches', label: 'Batches', icon: Activity },
  { key: 'history', label: 'History Ledger', icon: FileClock },
  { key: 'labels', label: 'Print Labels', icon: Printer },
];

export default function InventoryHub() {
  const [tab, setTab] = useState('overview');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Data
  const [overview, setOverview] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [overviewFilter, setOverviewFilter] = useState('ALL');

  // Load Vendor ID
  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const loadOverview = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/inventory?vendorId=${vendorId}&filter=${overviewFilter}`);
      const data = await res.json();
      if (data.success) setOverview(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId, overviewFilter]);

  const loadHistory = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/vendors/inventory/history?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    if (tab === 'overview') loadOverview();
    if (tab === 'history') loadHistory();
  }, [tab, loadOverview, loadHistory]);

  const handleStockUpdate = async (variantId: number, currentQty: number) => {
    const newQtyStr = prompt('Enter new stock quantity:', currentQty.toString());
    if (newQtyStr === null) return;
    const newQty = parseInt(newQtyStr, 10);
    if (isNaN(newQty) || newQty < 0) return alert('Invalid quantity');
    
    const changeQty = newQty - currentQty;
    if (changeQty === 0) return;

    try {
      const res = await fetch(`${API}/vendors/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId, variantId, changeQty, reason: 'ADJUSTMENT', reference: 'Manual Edit'
        })
      });
      const data = await res.json();
      if (data.success) loadOverview();
      else alert(data.message);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track stock levels, manage warehouses, and view history ledgers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${tab === t.key ? 'border-red-600 text-red-700 bg-red-50/30' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
          ) : (
            <>
              {/* 1. Stock Overview */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      {['ALL', 'LOW_STOCK', 'OUT_OF_STOCK'].map(f => (
                        <button key={f} onClick={() => setOverviewFilter(f)}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${overviewFilter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                          {f.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">SKU</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Stock Qty</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                          <th className="px-4 py-3 font-semibold text-slate-600 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{item.product.name}</td>
                            <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.stockQty}</td>
                            <td className="px-4 py-3">
                              {item.stockQty === 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">OUT OF STOCK</span>
                              ) : item.stockQty <= 10 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">LOW STOCK</span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">IN STOCK</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => handleStockUpdate(item.id, item.stockQty)}
                                className="text-red-600 font-semibold text-xs hover:underline">Update</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {overview.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No inventory found for this filter.</div>}
                  </div>
                </div>
              )}

              {/* 4. History Ledger */}
              {tab === 'history' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-600">Date & Time</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Product / SKU</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Qty Chg</th>
                          <th className="px-4 py-3 font-semibold text-slate-600">Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {new Date(item.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{item.variant.product.name}</p>
                              <p className="text-xs text-slate-400">{item.variant.sku}</p>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-600">{item.reason.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3 font-mono font-bold">
                              <span className={item.changeQty > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {item.changeQty > 0 ? '+' : ''}{item.changeQty}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{item.reference || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {history.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No history found.</div>}
                  </div>
                </div>
              )}

              {/* Placeholders for 2, 3, 5 to demonstrate the UI layout */}
              {(tab === 'warehouses' || tab === 'batches' || tab === 'labels') && (
                <div className="text-center py-20 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Loader2 size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Coming Soon</h3>
                  <p className="text-sm max-w-md mx-auto">The {TABS.find(t=>t.key===tab)?.label} interface is currently under construction for the next phase.</p>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
