"use client";
import { useWizard } from '../WizardContext';

export default function Step9DepositPenalties() {
  const { formData, updateFormData } = useWizard();
  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Security Deposit & Policies</h2>
      <p className="text-slate-500 text-sm">Configure how much deposit is required and your refund policies.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 border-b pb-2">Security Deposit</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deposit Amount (₹)</label>
            <input type="number" value={formData.securityDeposit || ''} onChange={e => set('securityDeposit', e.target.value)} placeholder="e.g. 5000"
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Damage Waiver Available?</label>
            <select value={formData.damageWaiverAvailable || ''} onChange={e => set('damageWaiverAvailable', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="">Select Option</option>
              <option value="YES">Yes, optional</option>
              <option value="NO">No</option>
              <option value="MANDATORY">Yes, mandatory</option>
            </select>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 border-b pb-2 mt-6 pt-2">Policies</h3>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cancellation Policy</label>
            <textarea value={formData.cancellationPolicy || ''} onChange={e => set('cancellationPolicy', e.target.value)} rows={3}
              placeholder="e.g. Free cancellation up to 48 hours before rental. 50% charge within 48 hours."
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rental Agreement Terms</label>
            <textarea value={formData.rentalAgreementText || ''} onChange={e => set('rentalAgreementText', e.target.value)} rows={4}
              placeholder="Paste your specific rental agreement or terms and conditions here."
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
