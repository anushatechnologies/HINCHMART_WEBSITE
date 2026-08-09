import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import RentalClient from './RentalClient';

export default async function RentalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = null;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com'}/api/products/${slug}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data.isRentable) product = json.data;
  } catch (error) {
    console.error('Failed to fetch rental product');
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 text-center max-w-lg">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-extrabold mb-4 text-slate-900">Equipment Not Found</h1>
        <p className="text-slate-500 mb-8 text-lg">
          We couldn't find the rental equipment you're looking for. It may have been removed or is no longer available for rent.
        </p>
        <Link href="/rentals" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition inline-block shadow-sm">
          Browse Rentals
        </Link>
      </div>
    );
  }

  const breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Rentals', href: '/rentals' },
    { label: product.name, href: '#' },
  ];

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
          <RentalClient product={product} />
        </div>
      </div>
    </div>
  );
}
