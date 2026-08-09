import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Zap, Droplets, ShieldCheck, Paintbrush, Wrench, Shield, 
  Sun, ChevronRight, CheckCircle2, Truck, Percent, Sparkles, FileText, Smartphone, Star, ArrowRight, Package, Award
} from 'lucide-react';
import HeroSlider from '../components/layout/HeroSlider';
import Phase2DealsSection from '../components/banners/Phase2DealsSection';
import Phase3AdvancedSection from '../components/banners/Phase3AdvancedSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

type Category = {
  id: number | string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount?: number;
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
      banners: (banners || []).filter((b: any) => (b.position === 'HOMEPAGE_TOP' || b.position === 'HERO' || b.bannerType === 'HERO_SLIDER') && b.isActive !== false),
      products: products || [],
      brands: brands || [],
    };
  } catch {
    return { categories: [], banners: [], products: [], brands: [] };
  }
}

// ─── B2B CATEGORY CARDS SEED ───
const MASTER_CATEGORIES = [
  { name: 'Cement & Concrete', count: '120+ Products', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop', slug: 'cement-concrete' },
  { name: 'Steel Rods & Rebars', count: '250+ Products', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop', slug: 'steel-rebars' },
  { name: 'Pipes & Fittings', count: '180+ Products', img: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600&auto=format&fit=crop', slug: 'pipes-fittings' },
  { name: 'Power Tools & Machinery', count: '340+ Products', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600&auto=format&fit=crop', slug: 'power-tools' },
  { name: 'Electrical & Cables', count: '410+ Products', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop', slug: 'electrical-cables' },
  { name: 'Tiles & Flooring', count: '150+ Products', img: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=600&auto=format&fit=crop', slug: 'tiles-flooring' },
  { name: 'Paints & Waterproofing', count: '210+ Products', img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=600&auto=format&fit=crop', slug: 'paints-waterproofing' },
  { name: 'Safety & Protective Equipment', count: '95+ Products', img: 'https://images.unsplash.com/photo-1618090584126-129cd1f3fabb?q=80&w=600&auto=format&fit=crop', slug: 'safety-equipment' },
];

const DEFAULT_FEATURED_BRANDS = [
  { name: 'UltraTech', logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=200&auto=format&fit=crop' },
  { name: 'ACC Cement', logo: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=200&auto=format&fit=crop' },
  { name: 'TATA Steel', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop' },
  { name: 'JSW Steel', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&auto=format&fit=crop' },
  { name: 'Bosch Tools', logo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=200&auto=format&fit=crop' },
  { name: 'Havells Electrical', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop' },
  { name: 'Schneider Electric', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop' },
  { name: 'Finolex Pipes', logo: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=200&auto=format&fit=crop' },
];

export default async function Home() {
  const { categories, banners, products, brands } = await fetchData();

  const resolveImage = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';
    return url.startsWith('http') ? url : `${API}${url}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans pb-16 text-[#172033]">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HOMEPAGE HERO SECTION (MASTER SPEC COMPLIANT)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#0B1F3A] text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF1EA]/10 border border-[#FF6B2C]/30 rounded-full text-xs font-bold text-[#FF6B2C]">
                <Sparkles size={14} /> Official Indian B2B Marketplace
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                India&apos;s B2B Marketplace for <br />
                <span className="text-[#FF6B2C]">Construction & Industrial Supplies</span>
              </h1>

              <p className="text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
                Buy directly from manufacturers and trusted suppliers at competitive wholesale prices with 100% GST tax invoice credit.
              </p>

              {/* Action Buttons (Orange Primary CTA + White Secondary CTA) */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="btn-primary px-8 py-3.5 text-sm font-semibold shadow-md"
                >
                  Shop Products <ArrowRight size={16} />
                </Link>

                <Link
                  href="/seller"
                  className="btn-secondary px-8 py-3.5 text-sm font-semibold shadow-xs"
                >
                  Become a Supplier
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium border-t border-white/10">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#16A34A]" /> Verified Manufacturers</span>
                <span className="flex items-center gap-2"><Truck size={16} className="text-[#2563EB]" /> 28,000+ Pincode Delivery</span>
                <span className="flex items-center gap-2"><Award size={16} className="text-[#F59E0B]" /> Bulk Price Guarantee</span>
              </div>
            </div>

            {/* Right B2B Composition Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#102A43]">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop"
                  alt="Construction Materials & Steel"
                  className="w-full h-[360px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent p-6 flex flex-col justify-end">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white space-y-1">
                    <p className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wider">Bulk Procurement Hub</p>
                    <p className="text-sm font-bold">Cement, Steel, Cables & Power Tools</p>
                    <p className="text-[11px] text-slate-300">Direct factory dispatch with GST invoice credit</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-12 mt-10">

        {/* ─────────────────────────────────────────────────────────────
            2. CATEGORY CARDS SECTION (12px RADIUS MASTER SPEC)
           ───────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wider">Industrial Divisions</span>
              <h2 className="text-2xl font-bold text-[#172033] mt-0.5">Category Marketplace</h2>
            </div>
            <Link href="/categories" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              View All Categories <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {MASTER_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="card-b2b overflow-hidden group flex flex-col"
              >
                <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#0B1F3A]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {cat.count}
                  </div>
                </div>
                <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-[#172033] group-hover:text-[#FF6B2C] transition-colors">{cat.name}</h3>
                  <span className="text-xs text-[#2563EB] font-semibold flex items-center gap-1 mt-2">
                    Browse Catalog <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. FEATURED BRANDS (VERIFIED MANUFACTURERS)
           ───────────────────────────────────────────────────────────── */}
        <section className="card-b2b p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wider">Authorized Network</span>
              <h2 className="text-xl font-bold text-[#172033] mt-0.5">Featured B2B Manufacturers</h2>
            </div>
            <Link href="/brands" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              View All Brands <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {(brands.length > 0 ? brands.slice(0, 8) : DEFAULT_FEATURED_BRANDS).map((b: any, i) => (
              <Link
                key={i}
                href={`/products?brand=${encodeURIComponent(b.name)}`}
                className="p-4 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#FF6B2C] hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] p-2 border border-[#E4E7EC] flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                  <Image src={b.logoUrl || b.logo || DEFAULT_FEATURED_BRANDS[0].logo} alt={b.name} width={48} height={48} className="object-contain w-full h-full" />
                </div>
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#FF6B2C] line-clamp-1">{b.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <Phase2DealsSection />

        {/* ─────────────────────────────────────────────────────────────
            4. TRENDING PRODUCTS (12px CARD SPECIFICATION)
           ───────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#FF6B2C] uppercase tracking-wider">Wholesale In Stock</span>
              <h2 className="text-2xl font-bold text-[#172033] mt-0.5">Trending Products</h2>
            </div>
            <Link href="/products" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              Explore All Products <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((p: any) => {
              const primaryImg = p.images?.[0]?.url ? resolveImage(p.images[0].url) : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';
              const price = parseFloat(p.basePrice || p.price || 0);

              return (
                <div key={p.id} className="card-b2b p-4 flex flex-col justify-between group">
                  <div>
                    <div className="relative w-full aspect-square bg-[#F8FAFC] rounded-lg overflow-hidden mb-3 border border-[#E4E7EC]">
                      <Image src={primaryImg} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    
                    <p className="text-[10px] font-bold uppercase text-[#FF6B2C] tracking-wider mb-1">{p.brand || 'UltraTech'}</p>
                    <Link href={`/products/${p.slug}`} className="font-bold text-[#172033] text-sm hover:text-[#FF6B2C] line-clamp-2 transition-colors">
                      {p.name}
                    </Link>
                    
                    <p className="text-xs text-[#667085] mt-1 font-mono">
                      SKU: {p.sku || `HINCH-${p.id}`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EAECF0] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-[#172033]">₹{price > 0 ? price.toLocaleString() : '385'} <span className="text-xs font-normal text-[#667085]">/ Unit</span></span>
                      <span className="text-xs text-[#667085] font-semibold">MOQ: {p.moq || 50}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#16A34A] font-semibold">
                      <span>● In Stock ({p.stock || '1,250'})</span>
                      <span className="text-[#2563EB]">100% GST Credit</span>
                    </div>

                    <Link
                      href={`/products/${p.slug}`}
                      className="btn-primary w-full h-10 text-xs"
                    >
                      View Details & Quote
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Advanced Section */}
        <Phase3AdvancedSection />

        {/* Supplier CTA Banner */}
        <section className="bg-[#0B1F3A] text-white rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B2C] bg-[#FFF1EA]/10 px-3 py-1 rounded">
              Sell on HinchMart
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Become a Supplier • 0% Platform Commission
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Join 10 Lakh+ verified suppliers selling industrial materials, steel, cement & tools directly to B2B buyers pan-India.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/seller"
              className="btn-primary px-7 py-3 text-xs"
            >
              Start Selling Free
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}
