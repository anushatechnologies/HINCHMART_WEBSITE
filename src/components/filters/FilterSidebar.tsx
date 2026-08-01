"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, ChevronUp, Star, X, RefreshCw } from 'lucide-react';

interface FilterData {
  brands: string[];
  priceRange: { min: number; max: number };
  countries: string[];
  stockStatuses: string[];
  attributes: { id: number; name: string; type: string; values: { id: number; value: string }[] }[];
  ratings: number[];
  discountBrackets: string[];
  deliveryOptions: string[];
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ category }: { category?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterData | null>(null);
  const [localMin, setLocalMin] = useState(searchParams.get('minPrice') || '');
  const [localMax, setLocalMax] = useState(searchParams.get('maxPrice') || '');

  // Read active filters from URL
  const activeBrands = searchParams.getAll('brand');
  const activeCountries = searchParams.getAll('country');
  const activeStock = searchParams.get('stockStatus') || '';
  const activeRating = searchParams.get('minRating') || '';
  const activeDiscount = searchParams.get('minDiscount') || '';
  const activeDelivery = searchParams.get('delivery') || '';

  const totalActiveFilters = [
    activeBrands.length > 0,
    activeCountries.length > 0,
    !!activeStock,
    !!activeRating,
    !!activeDiscount,
    !!activeDelivery,
    !!searchParams.get('minPrice'),
    !!searchParams.get('maxPrice'),
  ].filter(Boolean).length;

  useEffect(() => {
    const url = `http://localhost:5000/api/filters${category ? `?category=${category}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { if (d.success) setFilters(d.data); })
      .catch(() => {});
  }, [category]);

  const updateParam = (key: string, value: string, multi = false) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // reset to page 1

    if (multi) {
      const existing = params.getAll(key);
      if (existing.includes(value)) {
        params.delete(key);
        existing.filter(v => v !== value).forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    if (searchParams.get('category')) params.set('category', searchParams.get('category')!);
    setLocalMin(''); setLocalMax('');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (localMin) params.set('minPrice', localMin); else params.delete('minPrice');
    if (localMax) params.set('maxPrice', localMax); else params.delete('maxPrice');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const pricePresets = [
    { label: 'Under ₹500', min: '', max: '500' },
    { label: '₹500 – ₹2,000', min: '500', max: '2000' },
    { label: '₹2,000 – ₹10,000', min: '2000', max: '10000' },
    { label: '₹10,000 – ₹50,000', min: '10000', max: '50000' },
    { label: '₹50,000+', min: '50000', max: '' },
  ];

  return (
    <aside className="w-72 shrink-0 hidden lg:block">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-blue-600" />
            <span className="font-black text-slate-900 text-sm uppercase tracking-wider">Filters</span>
            {totalActiveFilters > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </div>
          {totalActiveFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <RefreshCw size={12} /> Clear All
            </button>
          )}
        </div>

        <div className="p-5 space-y-0">
          {/* Active Filter Chips */}
          {totalActiveFilters > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-slate-100">
              {activeBrands.map(b => (
                <button key={b} onClick={() => updateParam('brand', b, true)}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors">
                  {b} <X size={10} />
                </button>
              ))}
              {activeStock && (
                <button onClick={() => updateParam('stockStatus', activeStock)}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors">
                  {activeStock.replace('_', ' ')} <X size={10} />
                </button>
              )}
              {activeRating && (
                <button onClick={() => updateParam('minRating', activeRating)}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors">
                  {activeRating}★ & above <X size={10} />
                </button>
              )}
              {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
                <button onClick={() => { setLocalMin(''); setLocalMax(''); const p = new URLSearchParams(searchParams.toString()); p.delete('minPrice'); p.delete('maxPrice'); router.push(`${pathname}?${p.toString()}`); }}
                  className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors">
                  ₹{searchParams.get('minPrice') || 0}–{searchParams.get('maxPrice') || '∞'} <X size={10} />
                </button>
              )}
            </div>
          )}

          {/* Brands */}
          {filters?.brands && filters.brands.length > 0 && (
            <FilterSection title="Brand">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filters.brands.map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeBrands.includes(brand)}
                      onChange={() => updateParam('brand', brand, true)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className={`text-sm transition-colors ${activeBrands.includes(brand) ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title="Price Range">
            {/* Presets */}
            <div className="space-y-1.5 mb-3">
              {pricePresets.map((p, i) => {
                const isActive = searchParams.get('minPrice') === p.min && searchParams.get('maxPrice') === p.max;
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="pricePreset"
                      checked={isActive}
                      onChange={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('page');
                        if (p.min) params.set('minPrice', p.min); else params.delete('minPrice');
                        if (p.max) params.set('maxPrice', p.max); else params.delete('maxPrice');
                        setLocalMin(p.min); setLocalMax(p.max);
                        startTransition(() => router.push(`${pathname}?${params.toString()}`));
                      }}
                      className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className={`text-sm ${isActive ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{p.label}</span>
                  </label>
                );
              })}
            </div>
            {/* Custom range */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2">Custom Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={`₹${filters?.priceRange.min || 0}`}
                  value={localMin}
                  onChange={e => setLocalMin(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-slate-400 shrink-0">–</span>
                <input
                  type="number"
                  placeholder={`₹${filters?.priceRange.max || 100000}`}
                  value={localMax}
                  onChange={e => setLocalMax(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={applyPriceRange}
                className="w-full mt-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Apply Range
              </button>
            </div>
          </FilterSection>

          {/* Customer Rating */}
          <FilterSection title="Customer Rating">
            <div className="space-y-2">
              {[4, 3, 2].map(rating => (
                <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={activeRating === String(rating)}
                    onChange={() => updateParam('minRating', String(rating))}
                    className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                    <span className={`text-sm ${activeRating === String(rating) ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>& above</span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Discount */}
          <FilterSection title="Discount">
            <div className="space-y-2">
              {['70', '50', '30', '20', '10'].map(disc => (
                <label key={disc} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="discount"
                    checked={activeDiscount === disc}
                    onChange={() => updateParam('minDiscount', disc)}
                    className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className={`text-sm ${activeDiscount === disc ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>
                    {disc}% or more
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Availability">
            <div className="space-y-2">
              {[
                { label: 'In Stock', value: 'IN_STOCK', color: 'bg-emerald-500' },
                { label: 'Low Stock', value: 'LOW_STOCK', color: 'bg-orange-500' },
                { label: 'Out of Stock', value: 'OUT_OF_STOCK', color: 'bg-blue-500' },
              ].map(s => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="stock"
                    checked={activeStock === s.value}
                    onChange={() => updateParam('stockStatus', s.value)}
                    className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
                    <span className={`text-sm ${activeStock === s.value ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{s.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Delivery Time */}
          <FilterSection title="Delivery Time" defaultOpen={false}>
            <div className="space-y-2">
              {['Same Day', 'Next Day', 'Within 3 Days', 'Within 7 Days'].map(d => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="delivery"
                    checked={activeDelivery === d}
                    onChange={() => updateParam('delivery', d)}
                    className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className={`text-sm ${activeDelivery === d ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>{d}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Country of Origin */}
          {filters?.countries && filters.countries.length > 0 && (
            <FilterSection title="Country of Origin" defaultOpen={false}>
              <div className="space-y-2">
                {filters.countries.map(country => (
                  <label key={country} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={activeCountries.includes(country!)}
                      onChange={() => updateParam('country', country!, true)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className={`text-sm ${activeCountries.includes(country!) ? 'text-blue-600 font-bold' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* GST Available */}
          <FilterSection title="Other Filters" defaultOpen={false}>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('gst') === '1'}
                  onChange={() => updateParam('gst', '1')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">GST Invoice Available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('freeShipping') === '1'}
                  onChange={() => updateParam('freeShipping', '1')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">Free Shipping</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('bulkAvailable') === '1'}
                  onChange={() => updateParam('bulkAvailable', '1')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">Bulk Price Available</span>
              </label>
            </div>
          </FilterSection>

          {/* Dynamic Attribute Filters (Category-specific: size, voltage, etc.) */}
          {filters?.attributes && filters.attributes.length > 0 && filters.attributes.map(attr => (
            <FilterSection key={attr.id} title={attr.name} defaultOpen={false}>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {attr.values.map(val => (
                  <label key={val.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={searchParams.getAll(`attr_${attr.id}`).includes(val.value)}
                      onChange={() => updateParam(`attr_${attr.id}`, val.value, true)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{val.value}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          ))}
        </div>

        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </aside>
  );
}
