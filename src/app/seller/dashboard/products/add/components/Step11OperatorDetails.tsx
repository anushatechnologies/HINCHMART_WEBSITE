"use client";
import { useWizard } from '../WizardContext';

export default function Step11OperatorDetails() {
  const { formData, updateFormData } = useWizard();
  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Operator Details</h2>
      <p className="text-slate-500 text-sm">Specify if an operator is included or required to use this equipment.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operator Policy</label>
            <select value={formData.operatorRequired || ''} onChange={e => set('operatorRequired', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="">Select Policy</option>
              <option value="NOT_REQUIRED">Operator not required (Self-drive)</option>
              <option value="OPTIONAL">Operator available as an add-on</option>
              <option value="MANDATORY_INCLUDED">Operator required and included in base price</option>
              <option value="MANDATORY_EXTRA">Operator required and charged extra</option>
            </select>
          </div>

          {(formData.operatorRequired === 'OPTIONAL' || formData.operatorRequired === 'MANDATORY_EXTRA') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operator Charge Per Day (₹)</label>
                <input type="number" value={formData.operatorChargePerDay || ''} onChange={e => set('operatorChargePerDay', e.target.value)} placeholder="e.g. 1000"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operator Working Hours</label>
                <input value={formData.operatorWorkingHours || ''} onChange={e => set('operatorWorkingHours', e.target.value)} placeholder="e.g. 9 AM - 6 PM (8 hours)"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Food Provided By</label>
                <select value={formData.operatorFoodProvidedBy || ''} onChange={e => set('operatorFoodProvidedBy', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">Select Option</option>
                  <option value="CUSTOMER">Customer must provide food</option>
                  <option value="OPERATOR">Operator handles their own food</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Accommodation Provided By</label>
                <select value={formData.operatorAccommodationBy || ''} onChange={e => set('operatorAccommodationBy', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">Select Option</option>
                  <option value="CUSTOMER">Customer must provide accommodation</option>
                  <option value="NOT_REQUIRED">Not required (Local operator)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
