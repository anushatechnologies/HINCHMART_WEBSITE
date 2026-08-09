"use client";

import { useEffect, useState } from 'react';
import { useWizard } from '../WizardContext';
import { Layers, FolderTree, Tag, Check, PlusCircle, ExternalLink, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Step1Category() {
  const { formData, updateFormData } = useWizard();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedMainCat, setSelectedMainCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [catSearch, setCatSearch] = useState('');

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
    fetch(`${API}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const rootCats = data.data.filter((c: any) => !c.parentId);
          setCategories(rootCats);
          if (rootCats.length > 0) {
            setSelectedMainCat(rootCats[0]);
            updateFormData({
              categoryId: rootCats[0].id,
              categoryName: rootCats[0].name
            });
          }
        }
      })
      .catch(err => console.error('Failed to fetch categories from API:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectMainCategory = (cat: any) => {
    setSelectedMainCat(cat);
    updateFormData({
      categoryId: cat.id,
      categoryName: cat.name,
      subcategoryId: '',
      subcategoryName: ''
    });
  };

  const handleSelectSubcategory = (sub: any) => {
    updateFormData({
      subcategoryId: sub.id,
      subcategoryName: sub.name
    });
  };

  const filteredCategories = categories.filter(c =>
    (c.name || '').toLowerCase().includes(catSearch.toLowerCase())
  );

  const subcategories = selectedMainCat?.children || [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Category & Subcategory</h2>
        <p className="text-slate-500 text-sm mt-0.5">Categorize your product accurately via live database API.</p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 size={32} className="animate-spin text-[#FF5722]" />
          <p className="text-xs font-bold text-slate-400">Fetching live categories from API...</p>
        </div>
      ) : (
        <>
          {/* Step 1: Main Category Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Primary Master Category <span className="text-red-500">*</span>
              </label>
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={e => setCatSearch(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
              {filteredCategories.map(cat => {
                const isSelected = selectedMainCat?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectMainCategory(cat)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5722] bg-orange-50/60 shadow-xs ring-1 ring-[#FF5722]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#FF5722]' : 'text-slate-700'}`}>
                      {cat.name}
                    </span>
                    {isSelected && <Check size={14} className="text-[#FF5722] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Subcategory Selection from API */}
          {selectedMainCat && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Subcategory for "{selectedMainCat.name}" <span className="text-red-500">*</span>
              </label>

              {subcategories.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-xs font-bold text-slate-500">No subcategories listed under {selectedMainCat.name} in API database.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub: any) => {
                    const isSelected = formData.subcategoryId === sub.id || formData.subcategoryName === sub.name;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectSubcategory(sub)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#0F2537] text-white border-[#0F2537] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#FF5722] hover:text-[#FF5722]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                        {sub.name}
                        {isSelected && <Check size={12} className="text-[#FF5722]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Request New Category Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-[#0F2537]">Can't find your category or subcategory?</h4>
          <p className="text-[11px] text-slate-500">Submit a category approval request directly to the admin panel.</p>
        </div>
        <Link
          href="/seller/dashboard/categories"
          target="_blank"
          className="px-4 py-2 bg-[#0F2537] hover:bg-[#FF5722] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <PlusCircle size={14} /> Request Category <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
