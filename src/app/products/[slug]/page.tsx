import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PDPClient from './PDPClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/products/${slug}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) product = json.data;
  } catch (error) {
    console.error('Failed to fetch product');
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 text-center max-w-lg">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-extrabold mb-4 text-slate-900">Product Not Found</h1>
        <p className="text-slate-500 mb-8 text-lg">
          We couldn't find the product you're looking for. It may have been removed or the URL is incorrect.
        </p>
        <Link href="/search" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition inline-block shadow-sm">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/search' },
    product.category?.parent?.name ? { label: product.category.parent.name, href: `/search?category=${product.category.parent.slug}` } : null,
    { label: product.category?.name, href: `/search?category=${product.category?.slug}` },
    { label: product.name, href: '#' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-sm overflow-x-auto">
          {breadcrumb.map((crumb: any, idx: number) => (
            <span key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
              {idx > 0 && <ChevronRight size={14} className="text-slate-400"/>}
              {crumb.href !== '#' ? (
                <Link href={crumb.href} className="text-slate-500 hover:text-blue-600 transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[200px]">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 shadow-sm">
          <PDPClient product={product} />
        </div>
      </div>
    </div>
  );
}
