import Link from 'next/link';
import { Suspense } from 'react';
import { Search, LayoutGrid, List, Star, Heart, ChevronRight } from 'lucide-react';
import FilterSidebar from '../../components/filters/FilterSidebar';
import SortSelect from '../../components/filters/SortSelect';

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    stockStatus?: string;
    minRating?: string;
    minDiscount?: string;
    country?: string | string[];
    delivery?: string;
    gst?: string;
    freeShipping?: string;
    bulkAvailable?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { search, category, stockStatus, minPrice, maxPrice, page = '1', sort, view = 'grid' } = resolvedSearchParams as any;

  // Handle multi-value params
  const brands = Array.isArray(resolvedSearchParams.brand) ? resolvedSearchParams.brand : resolvedSearchParams.brand ? [resolvedSearchParams.brand] : [];
  const countries = Array.isArray(resolvedSearchParams.country) ? resolvedSearchParams.country : resolvedSearchParams.country ? [resolvedSearchParams.country] : [];
  const minDiscount = resolvedSearchParams.minDiscount;
  const bulkAvailable = resolvedSearchParams.bulkAvailable === '1';

  let products: any[] = [];
  let total = 0;
  let categories: any[] = [];

  // Build query params
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  brands.forEach(b => params.append('brand', b));
  if (stockStatus) params.set('stockStatus', stockStatus);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  params.set('page', page);
  params.set('limit', '24');

  try {
    const [productRes, catRes] = await Promise.all([
      fetch(`http://localhost:5000/api/products?${params.toString()}`, { cache: 'no-store' }),
      fetch('http://localhost:5000/api/categories', { cache: 'no-store' }),
    ]);
    const [productJson, catJson] = await Promise.all([productRes.json(), catRes.json()]);
    if (productJson.success) {
      products = productJson.data;
      total = productJson.total || products.length;
    }
    if (catJson.success) categories = catJson.data;
  } catch (error) {
    console.error('Failed to fetch products');
  }

  // Client-side discount filter (since backend doesn't handle it yet)
  if (minDiscount) {
    const pct = parseInt(minDiscount);
    products = products.filter((p: any) => {
      if (!p.mrp || !p.basePrice) return false;
      const discount = ((p.mrp - p.basePrice) / p.mrp) * 100;
      return discount >= pct;
    });
    total = products.length;
  }

  // Client-side bulk price filter
  if (bulkAvailable) {
    products = products.filter((p: any) => p.bulkPrice != null);
    total = products.length;
  }

  // Client-side country filter
  if (countries.length > 0) {
    products = products.filter((p: any) => p.countryOfOrigin && countries.includes(p.countryOfOrigin));
    total = products.length;
  }

  // Client-side sort
  if (sort === 'price_asc') products.sort((a, b) => a.basePrice - b.basePrice);
  else if (sort === 'price_desc') products.sort((a, b) => b.basePrice - a.basePrice);

  const pageTitle = search
    ? `Search: "${search}"`
    : category
    ? (categories.find((c: any) => c.slug === category)?.name || 'Products')
    : 'All Products';

  const currentPage = parseInt(page);
  const totalPages = Math.ceil(total / 24);

  // Build URL helper preserving all active filters
  const buildUrl = (overrides: Record<string, string | string[]>) => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (category) p.set('category', category);
    brands.forEach(b => p.append('brand', b));
    countries.forEach(c => p.append('country', c));
    if (stockStatus) p.set('stockStatus', stockStatus);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    if (minDiscount) p.set('minDiscount', minDiscount);
    if (bulkAvailable) p.set('bulkAvailable', '1');
    Object.entries(overrides).forEach(([k, v]) => {
      if (Array.isArray(v)) { p.delete(k); v.forEach(vi => p.append(k, vi)); }
      else p.set(k, v);
    });
    return `/products?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-sm overflow-x-auto">
          <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight size={14} className="text-slate-400 shrink-0"/>
          <Link href="/products" className="text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap">Products</Link>
          {(search || category) && (
            <><ChevronRight size={14} className="text-slate-400 shrink-0"/>
            <span className="text-slate-900 font-semibold truncate">{pageTitle}</span></>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ─── Dynamic Filter Sidebar ─── */}
          <Suspense fallback={<div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-4 hidden lg:block">Loading filters...</div>}>
            <FilterSidebar category={category} />
          </Suspense>

          {/* ─── Right: Product Grid ─── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-black text-slate-900 truncate">{pageTitle}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {total} products found
                  {brands.length > 0 && ` • ${brands.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Suspense fallback={<div className="h-9 w-32 bg-slate-100 rounded-lg animate-pulse"></div>}>
                  <SortSelect sort={sort || ''} />
                </Suspense>
                <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                  <Link href={buildUrl({ view: 'grid' })} className={`p-2 transition-colors ${view === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`} title="Grid View"><LayoutGrid size={16}/></Link>
                  <Link href={buildUrl({ view: 'list' })} className={`p-2 transition-colors ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`} title="List View"><List size={16}/></Link>
                </div>
              </div>
            </div>

            {/* Active filter chips summary */}
            {(brands.length > 0 || countries.length > 0 || stockStatus || minDiscount || minPrice || maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500 py-1">Active Filters:</span>
                {brands.map(b => (
                  <Link key={b} href={buildUrl({ brand: brands.filter(x => x !== b) })}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200 transition-colors">
                    Brand: {b} ×
                  </Link>
                ))}
                {stockStatus && (
                  <Link href={buildUrl({ stockStatus: '' })}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200">
                    {stockStatus.replace('_', ' ')} ×
                  </Link>
                )}
                {minDiscount && (
                  <Link href={buildUrl({ minDiscount: '' })}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full hover:bg-blue-200">
                    {minDiscount}% off+ ×
                  </Link>
                )}
              </div>
            )}

            {/* Product Grid / List */}
            {products.length > 0 ? (
              <div className={view === 'list' ? 'flex flex-col gap-4' : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'}>
                {products.map((product: any) => {
                  const discount = product.mrp && product.basePrice && product.mrp > product.basePrice
                    ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100) : 0;

                  return (
                    <Link href={`/products/${product.slug}`} key={product.id} className={`group bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all flex ${view === 'list' ? 'flex-row gap-6 items-center' : 'flex-col'}`}>
                      <div className={`${view === 'list' ? 'w-48 shrink-0' : 'w-full aspect-square'} bg-slate-50 rounded-lg mb-3 relative overflow-hidden`}>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0].url}`}
                            alt={product.name}
                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl py-10">📦</div>
                        )}
                        {discount >= 10 && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">-{discount}%</span>
                        )}
                        {product.stockStatus === 'OUT_OF_STOCK' && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">Out of Stock</span>
                          </div>
                        )}
                        {product.moq > 1 && (
                          <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">MOQ: {product.moq}</span>
                        )}
                        {product.productType === 'RENTAL' && (
                          <span className="absolute bottom-2 right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase shadow-sm">🔑 Rent</span>
                        )}
                        <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Heart size={13}/>
                        </button>

                      </div>

                      <div className={`flex-1 flex flex-col ${view === 'list' ? 'h-full justify-center' : ''}`}>
                        {product.brand && (
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 truncate">{product.brand}</p>
                        )}
                        <h2 className={`text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors flex-1 leading-snug ${view === 'list' ? 'text-base mb-1' : ''}`}>{product.name}</h2>
                        
                        {view === 'list' && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 max-w-lg">{product.description || 'No description available for this product. See details page.'}</p>
                        )}

                        <div className="flex items-center gap-0.5 mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}/>)}
                          <span className="text-[10px] text-slate-500 ml-1">(24)</span>
                        </div>
                      </div>
                      
                      <div className={`flex flex-col ${view === 'list' ? 'w-48 shrink-0 items-end border-l border-slate-100 pl-6 h-full justify-center' : ''}`}>
                        {product.isContractPrice && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded uppercase w-max mb-1">Contract Price</span>
                        )}
                        <div className={`flex items-baseline gap-1.5 ${view === 'list' ? 'mb-2' : ''}`}>
                          <span className="text-xl font-black text-slate-900">₹{Number(product.basePrice).toLocaleString('en-IN')}</span>
                          {(discount > 0 && !product.isContractPrice) && <span className="text-xs text-slate-400 line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</span>}
                        </div>

                        {product.bulkPrice && !product.isContractPrice && (
                          <p className="text-[10px] text-blue-600 font-bold mb-2 bg-blue-50 px-2 py-0.5 rounded mt-2">
                            Bulk: ₹{Number(product.bulkPrice).toLocaleString('en-IN')}
                          </p>
                        )}

                        {product.isSameDayDelivery && (
                          <p className="text-[10px] text-emerald-700 font-bold mb-2 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 mt-2">
                            ⚡ Same-Day Delivery
                          </p>
                        )}

                        {product.productType === 'RENTAL' ? (
                          <>
                            <p className="text-[10px] text-amber-700 font-bold mb-2 bg-amber-50 px-2 py-0.5 rounded mt-2">
                              🔑 Rent from ₹{Number(product.rentalDetails?.pricePerDay || 0).toLocaleString('en-IN')}/day
                            </p>
                            <button className={`border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-bold py-2 rounded-lg transition-all uppercase tracking-wider mt-auto ${view === 'list' ? 'w-full' : 'w-full mt-3'}`}>
                              Book Rental
                            </button>
                          </>
                        ) : (
                          <button className={`border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white text-xs font-bold py-2 rounded-lg transition-all uppercase tracking-wider mt-auto ${view === 'list' ? 'w-full' : 'w-full mt-3'}`}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 py-24 text-center">
                <Search size={64} className="text-slate-200 mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Products Found</h3>
                <p className="text-slate-500 mb-6 text-sm">
                  {search ? `No results for "${search}". Try different keywords or remove some filters.` : 'No products match the selected filters.'}
                </p>
                <Link href="/products" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm inline-block">
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={buildUrl({ page: String(currentPage - 1) })}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    ← Previous
                  </Link>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <Link key={p} href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'border border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600'}`}>
                      {p}
                    </Link>
                  );
                })}
                {currentPage < totalPages && (
                  <Link href={buildUrl({ page: String(currentPage + 1) })}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
