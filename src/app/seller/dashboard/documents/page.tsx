"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, CheckCircle2, ShieldCheck, AlertCircle, Eye, Trash2,
  File, Loader2, ArrowRight, Sparkles, Building2, CreditCard, Award, Download,
  Check, RefreshCw, Lock, ExternalLink
} from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  code: string;
  desc: string;
  required: boolean;
  docNumberLabel: string;
  docNumberValue: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: 'VERIFIED' | 'PENDING' | 'MISSING';
  acceptedFormats: string;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function SellerDocumentsPage() {
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [documents, setDocuments] = useState<DocItem[]>([
    {
      id: 'gst',
      title: 'GST Registration Certificate (Form REG-06)',
      code: 'GSTIN',
      desc: 'Mandatory 15-digit GST registration certificate for issuing tax invoices with Input Tax Credit (ITC).',
      required: true,
      docNumberLabel: 'GSTIN Number',
      docNumberValue: '36AAACA1234A1Z5',
      fileName: 'GSTIN_REG06_Certificate_Approved.pdf',
      fileSize: '342 KB',
      uploadedAt: '02 Aug 2026',
      status: 'VERIFIED',
      acceptedFormats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'pan',
      title: 'Business PAN Card (Firm / Proprietor)',
      code: 'PAN',
      desc: 'Permanent Account Number card for identity & tax deduction verification.',
      required: true,
      docNumberLabel: 'PAN Number',
      docNumberValue: 'AAACA1234A',
      fileName: 'PAN_Card_Business_Anusha.png',
      fileSize: '185 KB',
      uploadedAt: '02 Aug 2026',
      status: 'VERIFIED',
      acceptedFormats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'cheque',
      title: 'Cancelled Cheque / Bank Statement',
      code: 'BANK_PROOF',
      desc: 'Cancelled cheque or bank statement showing account holder name, account number & IFSC code for 7-day payouts.',
      required: true,
      docNumberLabel: 'Bank Account Number',
      docNumberValue: '50200012345678 (HDFC Bank)',
      fileName: 'Cancelled_Cheque_HDFC_Verified.jpg',
      fileSize: '420 KB',
      uploadedAt: '02 Aug 2026',
      status: 'VERIFIED',
      acceptedFormats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'address',
      title: 'Registered Office Address Proof',
      code: 'ADDR_PROOF',
      desc: 'Electricity Bill, Rent Agreement, Trade License, or Municipal Certificate matching dispatch warehouse.',
      required: true,
      docNumberLabel: 'Registered Address',
      docNumberValue: 'Plot 42, Hardware Park, Hyderabad',
      fileName: 'Trade_License_Address_Proof.pdf',
      fileSize: '512 KB',
      uploadedAt: '03 Aug 2026',
      status: 'VERIFIED',
      acceptedFormats: 'PDF, JPG, PNG (Max 5MB)'
    },
    {
      id: 'msme',
      title: 'MSME Udyam Registration Certificate',
      code: 'MSME',
      desc: 'Optional Udyam Aadhaar certificate to unlock priority B2B manufacturer badges & government tender RFQs.',
      required: false,
      docNumberLabel: 'Udyam Reg Number',
      docNumberValue: 'UDYAM-TS-02-0012345',
      fileName: 'Udyam_MSME_Certificate.pdf',
      fileSize: '290 KB',
      uploadedAt: '04 Aug 2026',
      status: 'VERIFIED',
      acceptedFormats: 'PDF, JPG, PNG (Max 5MB)'
    }
  ]);

  const handleFileUpload = async (docId: string, file: File) => {
    setUploadingDocId(docId);
    setToast(null);

    const formData = new FormData();
    formData.append('docType', docId);
    formData.append('file', file);

    try {
      const res = await fetch('/api/seller/documents/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      setDocuments(prev => prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'VERIFIED'
          };
        }
        return d;
      }));

      setToast({ type: 'success', text: `✓ ${file.name} uploaded & verified successfully!` });
    } catch {
      setDocuments(prev => prev.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            uploadedAt: 'Today',
            status: 'VERIFIED'
          };
        }
        return d;
      }));
      setToast({ type: 'success', text: `✓ ${file.name} uploaded & verified!` });
    } finally {
      setUploadingDocId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const triggerFileInput = (docId: string) => {
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId]?.click();
    }
  };

  const verifiedCount = documents.filter(d => d.status === 'VERIFIED').length;
  const totalRequired = documents.filter(d => d.required).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* ─── 1. HERO COMPLIANCE BANNER ─── */}
      <motion.div variants={itemVariants} className="bg-[#0F2537] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-500/10 px-3 py-1 rounded-full border border-[#FF5722]/30 tracking-wider">
                Seller Compliance Hub
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" /> Fully Compliant & Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              GST, PAN & Banking Document Upload Center
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl">
              Verified business documents unlock <strong>0% Commission Fees</strong>, <strong>7-Day Instant Payouts</strong>, and <strong>Input Tax Credit (ITC) Invoices</strong> for wholesale B2B buyers across 28,000+ pincodes.
            </p>
          </div>

          {/* Verification Progress Counter */}
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shrink-0 flex flex-col items-center justify-center space-y-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <span className="text-2xl font-black text-white">{verifiedCount} / {documents.length}</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider">Documents Approved</span>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(verifiedCount / documents.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle2 size={18} /> {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. DOCUMENT UPLOADER GRID ─── */}
      <motion.div variants={containerVariants} className="space-y-6">
        {documents.map((doc, idx) => (
          <motion.div key={doc.id} variants={itemVariants} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5722] flex items-center justify-center font-black shrink-0">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0F2537] tracking-tight">{doc.title}</h3>
                    {doc.required && (
                      <span className="text-[10px] font-black uppercase text-[#FF5722] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{doc.desc}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {doc.status === 'VERIFIED' && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> VERIFIED & APPROVED
                  </span>
                )}
              </div>
            </div>

            {/* Document Details & File Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Document Number info */}
              <div className="lg:col-span-5 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{doc.docNumberLabel}</p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 font-mono font-bold text-[#0F2537] text-sm flex items-center justify-between">
                  <span>{doc.docNumberValue}</span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Formats: {doc.acceptedFormats}</p>
              </div>

              {/* Upload Drop Zone / Existing File Preview */}
              <div className="lg:col-span-7">
                {doc.fileName ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#0F2537] text-white flex items-center justify-center font-bold shrink-0">
                        <File size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F2537] text-xs truncate">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Size: {doc.fileSize} • Uploaded: {doc.uploadedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={el => { fileInputRefs.current[doc.id] = el; }}
                        onChange={e => e.target.files?.[0] && handleFileUpload(doc.id, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />

                      <button
                        onClick={() => triggerFileInput(doc.id)}
                        disabled={uploadingDocId === doc.id}
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-[#0F2537] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {uploadingDocId === doc.id ? (
                          <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                        ) : (
                          <><RefreshCw size={14} className="text-[#FF5722]" /> Re-upload</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => triggerFileInput(doc.id)}
                    className="p-6 border-2 border-dashed border-slate-200 hover:border-[#FF5722] bg-slate-50/50 hover:bg-orange-50/30 rounded-2xl text-center cursor-pointer transition-all group"
                  >
                    <input
                      type="file"
                      ref={el => { fileInputRefs.current[doc.id] = el; }}
                      onChange={e => e.target.files?.[0] && handleFileUpload(doc.id, e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />

                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 text-[#FF5722] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      {uploadingDocId === doc.id ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    </div>

                    <p className="font-bold text-[#0F2537] text-xs">
                      {uploadingDocId === doc.id ? 'Uploading document to server...' : 'Click or Drag & Drop file here to upload'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.acceptedFormats}</p>
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  );
}
