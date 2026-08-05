"use client";
import { useWizard } from '../WizardContext';

export default function Step10DeliveryPickup() {
  const { formData, updateFormData } = useWizard();
  const set = (field: string, val: string) => updateFormData({ [field]: val });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Delivery & Pickup</h2>
      <p className="text-slate-500 text-sm">Specify how the equipment reaches the customer.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-bold text-slate-900 border-b pb-2">Logistics Options</h3>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <input type="checkbox" checked={formData.pickupAvailable || false} onChange={e => updateFormData({ pickupAvailable: e.target.checked })} className="w-4 h-4 text-red-600" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Customer Pickup Allowed</p>
              <p className="text-xs text-slate-500">Customer comes to your warehouse to pick up the equipment.</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <input type="checkbox" checked={formData.deliveryAvailable || false} onChange={e => updateFormData({ deliveryAvailable: e.target.checked })} className="w-4 h-4 text-red-600" />
            <div>
              <p className="font-medium text-slate-900 text-sm">Delivery Available</p>
              <p className="text-xs text-slate-500">You deliver the equipment to the customer's site.</p>
            </div>
          </label>
        </div>

        {formData.deliveryAvailable && (
          <>
            <h3 className="font-bold text-slate-900 border-b pb-2 mt-6 pt-2">Delivery Charges & Limits</h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Delivery Distance (km)</label>
                <input type="number" value={formData.maxDeliveryDistance || ''} onChange={e => set('maxDeliveryDistance', e.target.value)} placeholder="e.g. 50"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base Delivery Charge (₹)</label>
                <input type="number" value={formData.deliveryBaseCharge || ''} onChange={e => set('deliveryBaseCharge', e.target.value)} placeholder="e.g. 500"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Per KM Charge (after base distance) (₹)</label>
                <input type="number" value={formData.deliveryPerKmCharge || ''} onChange={e => set('deliveryPerKmCharge', e.target.value)} placeholder="e.g. 20"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Installation Required?</label>
                <select value={formData.installationRequired || ''} onChange={e => set('installationRequired', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">Select Option</option>
                  <option value="NO">No</option>
                  <option value="YES_FREE">Yes (Free)</option>
                  <option value="YES_PAID">Yes (Paid)</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
