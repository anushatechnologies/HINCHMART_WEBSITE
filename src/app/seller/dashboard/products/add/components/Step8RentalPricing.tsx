"use client";
import { useWizard } from '../WizardContext';

export default function Step8RentalPricing() {
  const { formData, updateFormData } = useWizard();
  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Rental Pricing</h2>
      <p className="text-slate-500 text-sm">Define how much you charge for different rental durations.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 border-b pb-2">Base Rates</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Per Hour (₹)</label>
            <input type="number" value={formData.pricePerHour || ''} onChange={e => set('pricePerHour', e.target.value)} placeholder="e.g. 500"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Per Day (₹)</label>
            <input type="number" value={formData.pricePerDay || ''} onChange={e => set('pricePerDay', e.target.value)} placeholder="e.g. 3000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Per Week (₹)</label>
            <input type="number" value={formData.pricePerWeek || ''} onChange={e => set('pricePerWeek', e.target.value)} placeholder="e.g. 18000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Per Month (₹)</label>
            <input type="number" value={formData.pricePerMonth || ''} onChange={e => set('pricePerMonth', e.target.value)} placeholder="e.g. 60000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 border-b pb-2 mt-6 pt-2">Additional Charges</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weekend Price (₹)</label>
            <input type="number" value={formData.weekendPrice || ''} onChange={e => set('weekendPrice', e.target.value)} placeholder="e.g. 4000 per day"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Minimum Rental Charge (₹)</label>
            <input type="number" value={formData.minRentalCharge || ''} onChange={e => set('minRentalCharge', e.target.value)} placeholder="e.g. 3000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Overtime Charge (₹/hr)</label>
            <input type="number" value={formData.overtimeCharge || ''} onChange={e => set('overtimeCharge', e.target.value)} placeholder="e.g. 750"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Late Return Fee (₹/hr)</label>
            <input type="number" value={formData.lateReturnCharge || ''} onChange={e => set('lateReturnCharge', e.target.value)} placeholder="e.g. 1000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
