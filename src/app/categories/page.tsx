import Link from 'next/link';
import { ChevronRight, Grid, Package } from 'lucide-react';

const API = 'http://localhost:5000';

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/api/categories`, { cache: 'no-store' });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900">All Categories</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Browse Categories</h1>
          <p className="text-slate-500 text-lg">Explore our massive catalog of premium materials, equipment, and tools sorted by category.</p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((cat: any) => (
              <Link href={`/search?category=${cat.slug}`} key={cat.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center group hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl.startsWith('http') ? cat.imageUrl : `${API}${cat.imageUrl}`} alt={cat.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <Grid size={32} className="text-blue-400" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                {cat.children && cat.children.length > 0 && (
                  <p className="text-xs text-slate-500">{cat.children.length} sub-categories</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
            <Package size={64} className="text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Categories Found</h3>
            <p className="text-slate-500">Categories haven't been added to the marketplace yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
