"use client";
import { useWizard } from '../WizardContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Step16Review() {
  const { formData, productType, isSaving } = useWizard();

  const getValidation = () => {
    const checks = [
      { name: 'Product Name', valid: !!formData.name },
      { name: 'Category Selected', valid: !!formData.categoryId },
      { name: 'Pricing Entered', valid: formData.basePrice > 0 },
      { name: 'Inventory Set', valid: formData.availableQty >= 0 || productType === 'SERVICE' },
    ];
    return checks;
  };

  const checks = getValidation();
  const allValid = checks.every(c => c.valid);

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
      <p className="text-slate-500 text-sm">Review your product details before submitting for approval.</p>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 border-b pb-2">Validation Checklist</h3>
        
        <ul className="space-y-3">
          {checks.map(c => (
            <li key={c.name} className="flex items-center gap-3">
              {c.valid ? (
                <CheckCircle2 className="text-emerald-500" size={18} />
              ) : (
                <AlertTriangle className="text-amber-500" size={18} />
              )}
              <span className={`text-sm ${c.valid ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                {c.name} {c.valid ? 'Completed' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>

        {!allValid && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>You cannot submit this product for review until all required fields are filled. You can still save it as a draft.</p>
          </div>
        )}
        
        {allValid && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-sm rounded-lg border border-emerald-200 flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <p>Your product is ready to be submitted for quality review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
