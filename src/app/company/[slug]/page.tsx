'use client';

import React, { useState, useEffect, use } from 'react';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Star, Award, TrendingUp, Search, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Company {
  id: number;
  name: string;
  slug: string;
  bannerUrl?: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  verified: boolean;
  rating: number;
  establishedYear: number;
  gstin: string;
}

export default function CompanyStorefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching company details & products
    setTimeout(() => {
      setCompany({
        id: 1,
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Tata Steel Corp',
        slug: slug,
        bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop',
        logoUrl: 'https://ui-avatars.com/api/?name=TS&background=0D8ABC&color=fff&size=128',
        description: 'Leading manufacturer of industrial grade steel, TMT bars, and heavy duty construction hardware. ISO 9001 certified with pan-India delivery capabilities for bulk enterprise orders.',
        address: 'Industrial Estate, Phase II, Hyderabad, Telangana',
        verified: true,
        rating: 4.8,
        establishedYear: 1985,
        gstin: '36AAACTXXXXA1Z5'
      });

      setProducts([
        { id: 101, name: 'Premium TMT Bars 12mm', price: '450', unit: 'piece', moq: 100, image: 'https://via.placeholder.com/300?text=TMT+Bar' },
        { id: 102, name: 'Industrial Heavy Duty Drill', price: '12500', unit: 'piece', moq: 5, image: 'https://via.placeholder.com/300?text=Drill' },
        { id: 103, name: 'Steel Bolts Pack (1000x)', price: '850', unit: 'box', moq: 20, image: 'https://via.placeholder.com/300?text=Bolts' },
        { id: 104, name: 'Safety Harness Pro', price: '2100', unit: 'piece', moq: 10, image: 'https://via.placeholder.com/300?text=Safety+Harness' },
      ]);
      setLoading(false);
    }, 800);
  }, [slug]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center font-bold text-slate-400">Loading Storefront...</div>;
  }

  if (!company) {
    return <div className="min-h-[60vh] flex items-center justify-center font-bold text-red-500">Company Not Found</div>;
  }

  return (
    <div className="bg-[#F3F4F6] min-h-screen pb-16">
      
      {/* Banner Area */}
      <div className="relative h-64 md:h-80 w-full bg-slate-900">
        {company.bannerUrl ? (
          <Image src={company.bannerUrl} alt={company.name} layout="fill" objectFit="cover" className="opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
        
        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white shrink-0">
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-white mb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black">{company.name}</h1>
                {company.verified && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md">
                    <ShieldCheck size={14} /> Verified Supplier
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-orange-400"/> {company.address}</span>
                <span className="flex items-center gap-1 text-emerald-400"><Star size={14} className="fill-emerald-400"/> {company.rating} Rating</span>
                <span className="flex items-center gap-1"><Award size={14}/> Est. {company.establishedYear}</span>
              </div>
            </div>
            
            <div className="mb-2 shrink-0">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg">
                Contact Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: About & Trust factors */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-blue-600"/> About Company
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{company.description}</p>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-500">GSTIN</span>
                <span className="font-bold text-slate-900">{company.gstin}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-500">Response Rate</span>
                <span className="font-bold text-emerald-600">98% (Fast)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Min. Order (MOQ)</span>
                <span className="font-bold text-slate-900">Varies by product</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600"/> B2B Bulk Discounts
            </h3>
            <p className="text-xs text-slate-600 mb-4">This supplier offers special pricing for bulk orders.</p>
            <Link href="/rfq" className="block text-center border-2 border-dashed border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50 font-bold py-2 rounded-xl text-sm transition-all">
              Request a Bulk Quote
            </Link>
          </div>
        </div>

        {/* Right Content: Products Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 justify-between items-center shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              Company Products <span className="text-slate-400 font-normal text-sm">({products.length})</span>
            </div>
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search catalog..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 min-h-[40px] mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                    <span className="text-[10px] text-slate-500">/ {product.unit}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between text-xs mb-4">
                    <span className="text-slate-500">MOQ:</span>
                    <span className="font-bold text-slate-700">{product.moq} {product.unit}s</span>
                  </div>
                  <Link href={`/products/${product.id}`} className="block w-full bg-white border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white text-slate-700 text-center font-bold py-2 rounded-xl text-xs transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
