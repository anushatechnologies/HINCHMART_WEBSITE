"use client";
import { useWizard } from '../WizardContext';
import { Calendar, Info } from 'lucide-react';

export default function Step7AvailabilityCalendar() {
  // In a real app, this would be a full React Calendar component like react-big-calendar or react-datepicker
  // For this UI phase, we provide a structured placeholder that captures the required data arrays.
  
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Availability Calendar</h2>
      <p className="text-slate-500 text-sm">Manage when this equipment is available for rent and block out maintenance dates.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
          <Info size={20} className="shrink-0" />
          <p className="text-sm">The system automatically blocks dates when customers book this equipment. Use this calendar to manually block dates for maintenance or offline use.</p>
        </div>

        <div className="h-96 border border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center text-slate-400">
          <Calendar size={48} className="mb-4 text-slate-300" />
          <p className="font-medium text-slate-600">Interactive Calendar Component</p>
          <p className="text-sm mt-1">Select date ranges to mark as [Maintenance] or [Blocked]</p>
          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300"></div> <span className="text-xs">Available</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div> <span className="text-xs">Booked</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div> <span className="text-xs">Maintenance</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200 border border-slate-400"></div> <span className="text-xs">Blocked</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
