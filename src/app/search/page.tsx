'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter, Search as SearchIcon, SlidersHorizontal, Package, ChevronRight, Check } from 'lucide-react';
import MiniWishlistButton from '../../components/MiniWishlistButton';

const API = 'http://localhost:5000';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const isDeals = searchParams.get('deals') === 'true';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('createdAt_desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // Update local state if URL changes externally
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/api/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = searchParams.get('q') || '';
      const cat = searchParams.get('category') || '';
      const brand = searchParams.get('brand') || '';
      const pMin = searchParams.get('minPrice') || '';
      const pMax = searchParams.get('maxPrice') || '';
      const s = searchParams.get('sort') || 'createdAt_desc';

      let url = `${API}/api/products?`;
      if (q) url += `search=${encodeURIComponent(q)}&`;
      if (cat) url += `category=${encodeURIComponent(cat)}&`;
      if (brand) url += `brand=${encodeURIComponent(brand)}&`;
      if (pMin) url += `minPrice=${pMin}&`;
      if (pMax) url += `maxPrice=${pMax}&`;
      if (isDeals) url += `isDeal=true&`;

      // Handling sort logic
      if (s === 'price_asc') url += `sort=basePrice&order=asc&`;
      else if (s === 'price_desc') url += `sort=basePrice&order=desc&`;
      else url += `sort=createdAt&order=desc&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (priceMin) params.set('minPrice', priceMin);
    if (priceMax) params.set('maxPrice', priceMax);
    if (sort) params.set('sort', sort);
    if (isDeals) params.set('deals', 'true');
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ── Sidebar Filters ── */}
      <div className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <Filter size={18} className="text-blue-600" /> Filters
            </h3>
            {showFilters && (
              <button onClick={() => setShowFilters(false)} className="md:hidden text-sm text-slate-500 underline">Close</button>
            )}
          </div>

          <form onSubmit={applyFilters} className="space-y-6">
            
            {/* Category Filter */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider">Category</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="cat" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="peer sr-only" />
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:border-[6px] transition-all" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 peer-checked:text-blue-600 peer-checked:font-bold">All Categories</span>
                </label>
                {categories.map((c: any) => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="cat" checked={selectedCategory === c.slug} onChange={() => setSelectedCategory(c.slug)} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:border-[6px] transition-all" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 peer-checked:text-blue-600 peer-checked:font-bold line-clamp-1">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider">Price Range</h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <span className="text-slate-400">-</span>
                <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
              Apply Filters
            </button>
            {(selectedCategory || selectedBrand || priceMin || priceMax || query) && (
              <button type="button" onClick={() => {
                setQuery(''); setSelectedCategory(''); setSelectedBrand(''); setPriceMin(''); setPriceMax(''); setSort('createdAt_desc');
                router.push('/search');
              }} className="w-full mt-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors py-2 text-center">
                Clear All Filters
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ── Results Area ── */}
      <div className="flex-1">
        
        {/* Search & Sort Header */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={applyFilters} className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
            />
          </form>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 bg-slate-100 px-4 py-3 rounded-xl font-bold text-sm text-slate-700">
              <SlidersHorizontal size={18} /> Filters
            </button>
            
            <div className="flex-1 md:flex-none">
              <select value={sort} onChange={e => { setSort(e.target.value); applyFilters(); }} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer">
                <option value="createdAt_desc">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                <div className="w-full aspect-square bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded mb-2 w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-6" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div>
            <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Showing {products.length} results</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((prod: any) => {
                const discount = prod.mrp && prod.basePrice && prod.mrp > prod.basePrice
                  ? Math.round(((prod.mrp - prod.basePrice) / prod.mrp) * 100) : 0;
                const imgUrl = prod.images?.[0]?.url;
                return (
                  <div key={prod.id} className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                    <Link href={`/products/${prod.slug}`} className="block relative">
                      <div className="aspect-[4/3] bg-slate-50 rounded-xl mb-4 w-full flex items-center justify-center overflow-hidden relative">
                        {imgUrl ? <img src={imgUrl.startsWith('http') ? imgUrl : `${API}${imgUrl}`} alt={prod.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                          : <Package className="text-slate-300" size={48} />}
                        
                        {discount >= 10 && <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">-{discount}%</span>}
                        
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MiniWishlistButton productId={prod.id} />
                        </div>
                      </div>
                    </Link>
                    
                    {prod.brand && <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1.5 truncate">{prod.brand}</p>}
                    <Link href={`/products/${prod.slug}`} className="flex-1">
                      <h3 className="text-sm text-slate-900 font-bold line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors leading-relaxed">{prod.name}</h3>
                    </Link>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-end justify-between mb-4">
                        <div className="flex flex-col">
                          {prod.mrp && prod.mrp > prod.basePrice && <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">₹{Number(prod.mrp).toLocaleString('en-IN')}</span>}
                          <span className="text-lg font-black text-slate-900 leading-none">₹{Number(prod.basePrice).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <button className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-orange-500 hover:border-orange-500 hover:text-white text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
            <SearchIcon size={64} className="text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500 max-w-md">We couldn't find any products matching your search criteria. Try adjusting your filters or searching for something else.</p>
            <button onClick={() => {
              setQuery(''); setSelectedCategory(''); setSelectedBrand(''); setPriceMin(''); setPriceMax(''); applyFilters();
            }} className="mt-8 bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 py-4 mb-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900">Search Products</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="p-20 text-center text-slate-500">Loading search...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
