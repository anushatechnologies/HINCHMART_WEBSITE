"use client";
import { useWizard } from '../WizardContext';

export default function Step5Specifications() {
  const { formData, updateFormData } = useWizard();

  // In a real app, these would come from an API based on categoryId
  const specs = [
    { name: 'Power', required: true, example: '650W' },
    { name: 'Voltage', required: true, example: '220-240V' },
    { name: 'Chuck Size', required: true, example: '13 mm' },
    { name: 'Weight', required: false, example: '1.8 kg' },
    { name: 'Color', required: false, example: 'Blue' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Product Specifications</h2>
      <p className="text-slate-500 text-sm">Provide technical details based on the selected category.</p>

      <div className="grid grid-cols-2 gap-5">
        {specs.map(spec => (
          <div key={spec.name}>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {spec.name} {spec.required && <span className="text-red-500">*</span>}
            </label>
            <input 
              placeholder={`e.g. ${spec.example}`}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
