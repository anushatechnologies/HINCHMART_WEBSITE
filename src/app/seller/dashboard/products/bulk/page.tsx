"use client";

import { useState, useEffect } from 'react';
import {
  UploadCloud, Download, FileText, CheckCircle,
  AlertCircle, Loader2, ArrowRight, RefreshCw
} from 'lucide-react';

const API = 'http://localhost:5000/api/vendors';

export default function BulkTools() {
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [activeSection, setActiveSection] = useState<'import' | 'export'>('import');

  useEffect(() => {
    const info = localStorage.getItem('seller_info');
    if (info) setVendorId(JSON.parse(info).id);
  }, []);

  const downloadTemplate = () => {
    window.open(`${API}/products/template`, '_blank');
  };

  const exportProducts = () => {
    if (!vendorId) return;
    window.open(`${API}/products/export?vendorId=${vendorId}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const runImport = async () => {
    if (!csvText || !vendorId) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch(`${API}/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, csvData: csvText })
      });
      const data = await res.json();
      if (data.success) setImportResult(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulk Product Tools</h1>
        <p className="text-slate-500 mt-1">Import, export, and manage your entire catalog at once.</p>
      </div>

      {/* Section Toggle */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 w-fit shadow-sm">
        <button onClick={() => setActiveSection('import')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === 'import' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          Import Products
        </button>
        <button onClick={() => setActiveSection('export')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeSection === 'export' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          Export Products
        </button>
      </div>

      {/* ─── Import Section ─────────────── */}
      {activeSection === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Download Template */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Download size={24} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-base font-bold text-slate-900">Download Template</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">Download our CSV template to ensure your data is correctly formatted before uploading.</p>
            <button onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-300 rounded-lg text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors">
              <Download size={16} /> Download Template
            </button>
          </div>

          {/* Step 2: Upload CSV */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <UploadCloud size={24} className="text-amber-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-slate-900">Upload CSV File</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">Fill in the template and upload it here. Products will be created in "Pending Approval" status.</p>
            <label className="w-full block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${csvText ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-red-400 hover:bg-red-50/30'}`}>
                {csvText ? (
                  <div className="text-emerald-700">
                    <CheckCircle size={28} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold">File loaded!</p>
                    <p className="text-xs mt-1">{csvText.split('\n').length - 1} rows detected</p>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    <UploadCloud size={28} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Click or drag CSV here</p>
                    <p className="text-xs mt-1">Max 500 products per upload</p>
                  </div>
                )}
              </div>
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
            {csvText && (
              <button onClick={() => setCsvText('')} className="mt-2 text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                <RefreshCw size={10} /> Clear file
              </button>
            )}
          </div>

          {/* Step 3: Run Import */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <ArrowRight size={24} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="text-base font-bold text-slate-900">Run Import</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">Preview the row count and start the import. You can review products afterward.</p>
            <button onClick={runImport} disabled={!csvText || importing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {importing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {importing ? 'Importing...' : 'Start Import'}
            </button>

            {importResult && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <CheckCircle size={16} /> {importResult.created} products created
                </div>
                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1"><AlertCircle size={12} /> {importResult.errors.length} Errors</p>
                    <ul className="space-y-1">
                      {importResult.errors.slice(0, 5).map((e, i) => (
                        <li key={i} className="text-xs text-red-600">{e}</li>
                      ))}
                      {importResult.errors.length > 5 && <li className="text-xs text-red-400">...and {importResult.errors.length - 5} more</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Export Section ─────────────── */}
      {activeSection === 'export' && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <FileText size={28} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Export Product Catalog</h2>
                <p className="text-slate-500 text-sm mt-1">Download all your active products as a CSV file. Useful for bulk editing, reporting, or migrating to other systems.</p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Format', value: 'CSV (UTF-8)' },
                    { label: 'Includes', value: 'All active products' },
                    { label: 'Columns', value: '17 fields' },
                    { label: 'Images', value: 'Primary URL only' },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500 font-medium">{f.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>

                <button onClick={exportProducts}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  <Download size={16} /> Download Export
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold flex items-center gap-2"><AlertCircle size={14} /> Note</p>
            <p className="mt-1">Deleted products are excluded from the export. To export deleted products, restore them first from the Product List's Trash tab.</p>
          </div>
        </div>
      )}
    </div>
  );
}
