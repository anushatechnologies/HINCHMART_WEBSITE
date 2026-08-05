"use client";
import { useWizard } from '../WizardContext';

export default function Step6RentalDetails() {
  const { formData, updateFormData } = useWizard();
  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Rental Duration & Details</h2>
      <p className="text-slate-500 text-sm">Set constraints on how long this equipment can be rented and its current condition.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 border-b pb-2">Duration Constraints</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Minimum Rental Duration (Days)</label>
            <input type="number" value={formData.minDuration || ''} onChange={e => set('minDuration', e.target.value)} placeholder="e.g. 1"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maximum Rental Duration (Days)</label>
            <input type="number" value={formData.maxDuration || ''} onChange={e => set('maxDuration', e.target.value)} placeholder="e.g. 30"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input type="checkbox" checked={formData.extensionAllowed || false} onChange={e => updateFormData({ extensionAllowed: e.target.checked })} className="text-red-600 focus:ring-red-500" />
              Extensions Allowed
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input type="checkbox" checked={formData.extensionApprovalRequired || false} onChange={e => updateFormData({ extensionApprovalRequired: e.target.checked })} className="text-red-600 focus:ring-red-500" />
              Requires My Approval for Extension
            </label>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 border-b pb-2 mt-6 pt-2">Equipment Condition</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Condition</label>
            <select value={formData.equipmentCondition || ''} onChange={e => set('equipmentCondition', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="">Select Condition</option>
              <option value="NEW">New</option>
              <option value="EXCELLENT">Excellent (Lightly used)</option>
              <option value="GOOD">Good (Visible wear but fully functional)</option>
              <option value="FAIR">Fair (Heavy wear, works fine)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manufacturing Year</label>
            <input type="number" value={formData.manufacturingYear || ''} onChange={e => set('manufacturingYear', e.target.value)} placeholder="e.g. 2022"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 border-b pb-2 mt-6 pt-2">Rules & Usage Limits</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fuel / Consumables Included?</label>
            <select value={formData.fuelIncluded || ''} onChange={e => set('fuelIncluded', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="">Select Option</option>
              <option value="YES">Yes, included</option>
              <option value="NO">No, customer provides</option>
              <option value="CHARGED_SEPARATELY">Charged separately</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Usage Hours Per Day</label>
            <input type="number" value={formData.maxUsageHoursPerDay || ''} onChange={e => set('maxUsageHoursPerDay', e.target.value)} placeholder="e.g. 8"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
