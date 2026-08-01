import Link from 'next/link';
import { Award, PackageSearch } from 'lucide-react';

const API = 'http://localhost:5000';

async function fetchBrands() {
  try {
    // Since we don't have a dedicated brands model, we extract unique brands from products
    const res = await fetch(`${API}/api/products?limit=1000`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) return [];
    
    const products = json.data;
    const brandsSet = new Set<string>();
    products.forEach((p: any) => {
      if (p.brand && p.brand.trim() !== '') {
        brandsSet.add(p.brand.trim());
      }
    });
    
    return Array.from(brandsSet).sort();
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await fetchBrands();

  // Group brands by first letter
  const groupedBrands: Record<string, string[]> = {};
  brands.forEach(brand => {
    const firstLetter = brand.charAt(0).toUpperCase();
    if (!groupedBrands[firstLetter]) {
      groupedBrands[firstLetter] = [];
    }
    groupedBrands[firstLetter].push(brand);
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900">All Brands</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Award className="text-orange-500" size={36} /> Shop by Brand
          </h1>
          <p className="text-slate-500 text-lg">Find authentic products from your favorite manufacturers and trusted partners.</p>
        </div>

        {brands.length > 0 ? (
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-slate-100 justify-center">
              {Object.keys(groupedBrands).sort().map(letter => (
                <a key={letter} href={`#letter-${letter}`} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  {letter}
                </a>
              ))}
            </div>

            <div className="space-y-12">
              {Object.keys(groupedBrands).sort().map(letter => (
                <div key={letter} id={`letter-${letter}`} className="flex flex-col md:flex-row gap-6 md:gap-12">
                  <div className="w-16 h-16 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm">
                    {letter}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupedBrands[letter].map(brand => (
                      <Link href={`/search?brand=${encodeURIComponent(brand)}`} key={brand}
                        className="py-3 px-4 rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm transition-all flex items-center justify-between group">
                        <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-wider text-sm">{brand}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
            <PackageSearch size={64} className="text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Brands Found</h3>
            <p className="text-slate-500">Brands haven't been added to any products yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
