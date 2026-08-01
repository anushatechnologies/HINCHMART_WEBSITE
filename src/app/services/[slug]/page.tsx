import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ServiceClient from './ServiceClient';

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let service = null;
  
  try {
    const res = await fetch(`http://localhost:5000/api/services`);
    const json = await res.json();
    if (json.success) {
      service = json.data.find((s: any) => s.id === slug || s.name.toLowerCase().replace(/\s+/g, '-') === slug);
      if(!service && json.data.length > 0) {
        service = json.data[0]; // fallback for demo
      }
    }
  } catch (error) {
    console.error('Failed to fetch service');
  }

  if (!service) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-32 text-center max-w-lg">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-extrabold mb-4 text-slate-900">Service Not Found</h1>
        <p className="text-slate-500 mb-8 text-lg">
          We couldn't find the professional service you're looking for.
        </p>
        <Link href="/services" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition inline-block shadow-sm">
          Browse Services
        </Link>
      </div>
    );
  }

  const breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: service.name, href: '#' },
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
                <Link href={crumb.href} className="text-slate-500 hover:text-orange-600 transition-colors">{crumb.label}</Link>
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
          <ServiceClient service={service} />
        </div>
      </div>
    </div>
  );
}
