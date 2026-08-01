"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SortSelect({ sort }: { sort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSort = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('sort', val);
    else params.delete('sort');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      defaultValue={sort || ''}
      onChange={(e) => handleSort(e.target.value)}
      className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none text-slate-700 bg-white cursor-pointer hover:border-red-400 transition-colors"
    >
      <option value="">Sort: Relevance</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
