"use client";
import { useWizard } from '../WizardContext';
import { UploadCloud, FileText, Image as ImageIcon, Video } from 'lucide-react';

export default function Step4Images() {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Images & Media</h2>
      <p className="text-slate-500 text-sm">Upload high-quality images and documents to showcase your product.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Main Product Image <span className="text-red-500">*</span></label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm font-medium text-slate-700">Click to upload main image</p>
            <p className="text-xs text-slate-500 mt-1">Recommended: 1500x1500px, clean white background.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Images</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <ImageIcon className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm font-medium text-slate-700">Click to upload up to 10 images</p>
            <p className="text-xs text-slate-500 mt-1">Include front, side, back, and packaging views.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Video</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <Video className="mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-sm font-medium text-slate-700">Upload Video</p>
              <p className="text-xs text-slate-500 mt-1">MP4 or WebM format</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Documents & Manuals</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <FileText className="mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-sm font-medium text-slate-700">Upload PDF</p>
              <p className="text-xs text-slate-500 mt-1">User Manual, Safety Sheet, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
