'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Trash2, Plus, ShoppingCart, CheckCircle, Package } from 'lucide-react';

export default function ComparePage() {
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('compareItems') || '[]');
    setCompareItems(items);
    if (items.length > 0) {
      fetchProducts(items);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async (ids: string[]) => {
    try {
      const promises = ids.map(id => fetch(`http://localhost:5000/api/products/${id}`).then(r => r.json()));
      const results = await Promise.all(promises);
      const validProducts = results.filter(r => r.success).map(r => r.data);
      setProducts(validProducts);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const removeFromCompare = (id: number) => {
    const updated = compareItems.filter(item => item !== id);
    localStorage.setItem('compareItems', JSON.stringify(updated));
    setCompareItems(updated);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 py-4 mb-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900">Compare Products</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compare Products</h1>
            <p className="text-slate-500">Compare specifications side-by-side to make the right choice.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Loading comparison data...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
            <Scale size={64} className="text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products to Compare</h3>
            <p className="text-slate-500 max-w-md">Add products to your comparison list from the product details page.</p>
            <Link href="/search" className="mt-8 bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 border-b border-r border-slate-100 bg-slate-50 w-64 sticky left-0 z-10">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Product</span>
                  </th>
                  {products.map(p => (
                    <th key={p.id} className="p-6 border-b border-r border-slate-100 min-w-[300px] bg-white relative">
                      <button onClick={() => removeFromCompare(p.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full p-2 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <div className="flex flex-col items-center text-center mt-4">
                        <div className="w-32 h-32 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-4">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`} alt={p.name} className="max-w-full max-h-full object-contain" />
                          ) : <Package className="text-slate-300" size={40} />}
                        </div>
                        <Link href={`/products/${p.slug}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {p.name}
                        </Link>
                        <div className="text-xl font-black text-slate-900 mb-4">
                          ₹{Number(p.basePrice).toLocaleString('en-IN')}
                        </div>
                        <Link href={`/products/${p.slug}`} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-sm">
                          <ShoppingCart size={16} /> View Details
                        </Link>
                      </div>
                    </th>
                  ))}
                  {products.length < 4 && (
                    <th className="p-6 border-b border-slate-100 bg-slate-50 min-w-[250px] align-middle">
                      <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <Link href="/search" className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Plus size={24} />
                        </Link>
                        <span className="mt-4 font-bold text-sm text-slate-500">Add Product</span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-bold text-slate-700 bg-slate-50 sticky left-0 z-10">Brand</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 border-b border-r border-slate-100 text-slate-900 font-medium">
                      {p.brand || '-'}
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-6 border-b border-slate-100 bg-slate-50"></td>}
                </tr>
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-bold text-slate-700 bg-slate-50 sticky left-0 z-10">Availability</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 border-b border-r border-slate-100">
                      {p.stockStatus === 'IN_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={14} /> In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      )}
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-6 border-b border-slate-100 bg-slate-50"></td>}
                </tr>
                <tr>
                  <td className="p-6 border-b border-r border-slate-100 font-bold text-slate-700 bg-slate-50 sticky left-0 z-10">Warranty</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 border-b border-r border-slate-100 text-slate-900 font-medium">
                      {p.warranty || '-'}
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-6 border-b border-slate-100 bg-slate-50"></td>}
                </tr>
                <tr>
                  <td className="p-6 border-r border-slate-100 font-bold text-slate-700 bg-slate-50 sticky left-0 z-10">Features</td>
                  {products.map(p => (
                    <td key={p.id} className="p-6 border-r border-slate-100 text-sm text-slate-600">
                      {p.features ? (
                        <ul className="list-disc pl-4 space-y-2">
                          {(p.features as string[]).slice(0, 5).map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </td>
                  ))}
                  {products.length < 4 && <td className="p-6 bg-slate-50"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
