"use client";
import { useWizard } from '../WizardContext';
import { Package, Wrench, Settings, Hammer } from 'lucide-react';

export default function Step2ProductType() {
  const { productType, setProductType } = useWizard();

  const types = [
    { id: 'PHYSICAL', name: 'Physical Product', desc: 'Normal products sold permanently (e.g. Drill machine, Cement).', icon: <Package className="text-blue-500" /> },
    { id: 'RENTAL', name: 'Rental Equipment', desc: 'Products rented for a period (e.g. Concrete mixer, Excavator).', icon: <Wrench className="text-purple-500" /> },
    { id: 'SERVICE', name: 'Service', desc: 'Services instead of physical goods (e.g. Electrical installation).', icon: <Settings className="text-emerald-500" /> },
    { id: 'SPARE_PART', name: 'Spare Part', desc: 'Replacement components (e.g. Drill chuck, Motor).', icon: <Hammer className="text-orange-500" /> }
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Select Product Type</h2>
      <p className="text-slate-500 text-sm">Choose how this product will be listed and sold.</p>

      <div className="grid grid-cols-2 gap-4">
        {types.map(t => (
          <button 
            key={t.id}
            onClick={() => setProductType(t.id)}
            className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
              productType === t.id 
                ? 'border-red-600 bg-red-50 ring-1 ring-red-600' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
              {t.icon}
            </div>
            <div>
              <h3 className={`font-bold ${productType === t.id ? 'text-red-900' : 'text-slate-900'}`}>{t.name}</h3>
              <p className={`text-xs mt-1 leading-relaxed ${productType === t.id ? 'text-red-700/80' : 'text-slate-500'}`}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
