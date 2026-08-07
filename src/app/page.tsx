import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Zap, Droplets, ShieldCheck, Paintbrush, Wrench, Shield, 
  Sun, ChevronRight, CheckCircle2, Truck, Percent, Sparkles, FileText, Smartphone, Star
} from 'lucide-react';
import HeroSlider from '../components/layout/HeroSlider';

const API = 'http://localhost:5000';

type Category = {
  id: number | string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

type Banner = {
  id?: number | string;
  position?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  title?: string | null;
  isActive?: boolean | null;
};

async function fetchData() {
  try {
    const [categoriesRes, bannersRes, productsRes, brandsRes] = await Promise.allSettled([
      fetch(`${API}/api/categories`, { cache: 'no-store' }),
      fetch(`${API}/api/banners`, { cache: 'no-store' }),
      fetch(`${API}/api/products?limit=8`, { cache: 'no-store' }),
      fetch(`${API}/api/brands`, { cache: 'no-store' }),
    ]);

    const parse = async <T,>(res: PromiseSettledResult<Response>): Promise<T | null> => {
      if (res.status !== 'fulfilled') return null;
      try {
        const json = (await res.value.json()) as { success?: boolean; data?: T };
        return json.success ? (json.data ?? null) : null;
      } catch {
        return null;
      }
    };

    const [categories, banners, products, brands] = await Promise.all([
      parse<Category[]>(categoriesRes),
      parse<Banner[]>(bannersRes),
      parse<any[]>(productsRes),
      parse<any[]>(brandsRes),
    ]);

    return {
      categories: categories || [],
      banners: (banners || []).filter((b) => b.position === 'HERO' && b.isActive !== false),
      products: products || [],
      brands: brands || [],
    };
  } catch {
    return { categories: [], banners: [], products: [], brands: [] };
  }
}

// ─── SHOP BY INDUSTRY ICONS ───
const INDUSTRIES = [
  { name: 'Construction', icon: Building2, color: 'bg-orange-500/10 text-orange-600 border-orange-200', slug: 'construction' },
  { name: 'Electrical', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', slug: 'electrical' },
  { name: 'Plumbing', icon: Droplets, color: 'bg-blue-500/10 text-blue-600 border-blue-200', slug: 'plumbing' },
  { name: 'Steel', icon: ShieldCheck, color: 'bg-slate-500/10 text-slate-700 border-slate-200', slug: 'steel' },
  { name: 'Paints', icon: Paintbrush, color: 'bg-purple-500/10 text-purple-600 border-purple-200', slug: 'paints' },
  { name: 'Hardware', icon: Wrench, color: 'bg-red-500/10 text-red-600 border-red-200', slug: 'hardware' },
  { name: 'Safety', icon: Shield, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', slug: 'safety' },
  { name: 'Solar', icon: Sun, color: 'bg-amber-500/10 text-amber-600 border-amber-200', slug: 'solar' },
];

// ─── FEATURED BRANDS SEED DEFAULT ───
const DEFAULT_FEATURED_BRANDS = [
  { name: 'UltraTech', logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=200&auto=format&fit=crop' },
  { name: 'ACC', logo: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=200&auto=format&fit=crop' },
  { name: 'TATA Steel', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop' },
  { name: 'JSW Steel', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop' },
  { name: 'Bosch', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=200&auto=format&fit=crop' },
  { name: 'Havells', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop' },
  { name: 'Schneider', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop' },
  { name: 'Finolex', logo: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=200&auto=format&fit=crop' },
];

export default async function Home() {
  const { categories, banners, products, brands } = await fetchData();

  const resolveImage = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';
    return url.startsWith('http') ? url : `${API}${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* ─── 1. HERO SLIDER BANNER ─── */}
      <section className="relative bg-[#0F2537] text-white overflow-hidden py-4 sm:py-6">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
            
            {/* Main Hero Slider (3 Cols) */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-2xl border border-white/10 min-h-[340px] sm:min-h-[400px] bg-slate-900 relative">
              {banners.length > 0 ? (
                <HeroSlider banners={banners} API={API} />
              ) : (
                <div className="relative w-full h-full min-h-[380px] bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 p-8 sm:p-12 flex flex-col justify-center text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-orange-200 w-fit mb-4">
                    <Sparkles size={14} /> Mega Construction Sale
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-xl">
                    UP TO 60% OFF <br/>
                    <span className="text-amber-300">On Building Materials</span>
                  </h1>
                  <p className="text-sm text-orange-100 mt-3 max-w-md font-medium">
                    TMT Bars, Cement, Power Tools & Electrical Supplies at India&apos;s lowest bulk prices with direct GST invoicing.
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <Link href="/products" className="px-7 py-3.5 bg-white text-[#0F2537] font-black text-sm rounded-2xl shadow-xl hover:bg-orange-50 transition-all hover:scale-105">
                      Shop Now
                    </Link>
                    <Link href="/rfq" className="px-6 py-3.5 bg-black/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm rounded-2xl hover:bg-black/50 transition-all">
                      Request Bulk Quote
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Bulk Order Box (1 Col) */}
            <div className="bg-gradient-to-b from-[#1a3852] to-[#0F2537] rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between text-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5722] bg-orange-500/20 px-2.5 py-1 rounded-md border border-[#FF5722]/30">
                  Corporate Procurement
                </span>
                <h3 className="text-xl font-black mt-3 text-white">Have a BOQ or Bulk Requirement?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Upload your bill of quantities (BOQ) or material list to get custom bulk quotes from top verified suppliers.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 size={14} /> Direct Wholesale Rates
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 size={14} /> 100% GST Tax Credit
                </div>
                <Link
                  href="/rfq"
                  className="w-full py-3.5 bg-[#FF5722] hover:bg-[#e64a19] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <FileText size={15} /> Upload BOQ / Send RFQ
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 space-y-10 mt-8">

        {/* ─── 2. SHOP BY INDUSTRY ─── */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Industrial Divisions</span>
              <h2 className="text-2xl font-black text-[#0F2537] mt-0.5">Shop by Industry</h2>
            </div>
            <Link href="/categories" className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <Link
                  key={ind.name}
                  href={`/products?search=${ind.slug}`}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col items-center text-center group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${ind.color} group-hover:scale-110 transition-transform mb-2`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-orange-600">{ind.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 3. TOP CATEGORIES ─── */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Essential Supplies</span>
              <h2 className="text-2xl font-black text-[#0F2537] mt-0.5">Top Categories</h2>
            </div>
            <Link href="/categories" className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1">
              View All Categories <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.slice(0, 8).map((cat) => {
              const img = resolveImage(cat.imageUrl);
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:bg-white hover:border-orange-300 hover:shadow-lg transition-all text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden relative mb-2 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <Image src={img} alt={cat.name} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <span className="text-xs font-black text-slate-800 group-hover:text-orange-600 line-clamp-1">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 4. FEATURED BRANDS ─── */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Verified Manufacturers</span>
              <h2 className="text-2xl font-black text-[#0F2537] mt-0.5">Featured Brands</h2>
            </div>
            <Link href="/brands" className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1">
              View All Brands <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {(brands.length > 0 ? brands.slice(0, 8) : DEFAULT_FEATURED_BRANDS).map((b: any, i) => (
              <Link
                key={i}
                href={`/products?brand=${encodeURIComponent(b.name)}`}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-white p-2 border border-slate-200 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                  <Image src={b.logoUrl || b.logo || DEFAULT_FEATURED_BRANDS[0].logo} alt={b.name} width={50} height={50} className="object-contain w-full h-full" />
                </div>
                <span className="text-xs font-black text-slate-800 group-hover:text-orange-600 line-clamp-1">{b.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 5. TRENDING PRODUCTS (Live from DB) ─── */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Hot In Stock</span>
              <h2 className="text-2xl font-black text-[#0F2537] mt-0.5">Trending Products</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1">
              Explore All Products <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((p: any) => {
              const primaryImg = p.images?.[0]?.url ? resolveImage(p.images[0].url) : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';
              const price = parseFloat(p.basePrice || p.price || 0);
              const mrp = p.mrp ? parseFloat(p.mrp) : price;

              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-3xl p-4 hover:shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-3">
                      <Image src={primaryImg} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {mrp > price && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-md shadow-sm">
                          15% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase text-orange-600 tracking-wider mb-1">{p.brand || 'HinchMart Verified'}</p>
                    <Link href={`/products/${p.slug}`} className="font-bold text-slate-900 text-sm hover:text-orange-600 line-clamp-2 transition-colors">
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                      <Star size={12} fill="currentColor" /> <span className="font-bold text-slate-700">4.5</span> <span className="text-slate-400 text-[10px]">(128)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900">₹{price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-medium">MOQ: {p.moq || 1} Units</div>
                    </div>
                    <Link
                      href={`/products/${p.slug}`}
                      className="px-4 py-2 bg-[#0F2537] hover:bg-[#FF5722] text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 6. WHY HINCHMART? ─── */}
        <section className="bg-gradient-to-r from-[#0F2537] via-[#1a3852] to-[#0F2537] text-white rounded-3xl p-8 shadow-xl border border-white/10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5722] bg-orange-500/10 px-3 py-1 rounded-full border border-[#FF5722]/30">
              India&apos;s Preferred B2B Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Why Choose HinchMart?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#FF5722] border border-[#FF5722]/30 flex items-center justify-center mx-auto mb-4 font-black">
                <Percent size={24} />
              </div>
              <h4 className="font-bold text-white text-base">Lowest Prices Guaranteed</h4>
              <p className="text-xs text-slate-300 mt-2">Direct wholesale rates from manufacturers and master distributors.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 font-black">
                <FileText size={24} />
              </div>
              <h4 className="font-bold text-white text-base">GST Invoice Provided</h4>
              <p className="text-xs text-slate-300 mt-2">100% tax compliant billing for full input tax credit (ITC) claim.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 font-black">
                <Truck size={24} />
              </div>
              <h4 className="font-bold text-white text-base">Same Day Delivery</h4>
              <p className="text-xs text-slate-300 mt-2">Priority express dispatch direct to your construction site or workshop.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 font-black">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-white text-base">100% Genuine Products</h4>
              <p className="text-xs text-slate-300 mt-2">All materials BIS / ISO certified from authorized OEM suppliers.</p>
            </div>
          </div>
        </section>

        {/* ─── 7. APP DOWNLOAD BANNER ─── */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full text-white">
              Mobile App Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Download HinchMart App</h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              Order materials on the go, track deliveries in real time, and manage bulk quotes right from your mobile device.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
            <div className="w-20 h-20 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
              <Smartphone size={48} className="text-[#0F2537]" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-white">Available for Android & iOS</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer">
                  Google Play
                </span>
                <span className="px-3 py-1.5 bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer">
                  App Store
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
