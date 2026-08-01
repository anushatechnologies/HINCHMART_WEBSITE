import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, MapPin } from 'lucide-react';
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
    const [categoriesRes, bannersRes] = await Promise.allSettled([
      fetch(`${API}/api/categories`, { cache: 'no-store' }),
      fetch(`${API}/api/banners`, { cache: 'no-store' }),
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

    const [categories, banners] = await Promise.all([
      parse<Category[]>(categoriesRes),
      parse<Banner[]>(bannersRes),
    ]);

    return {
      categories: categories || [],
      banners: (banners || []).filter((b) => b.position === 'HERO' && b.isActive !== false),
    };
  } catch {
    return { categories: [], banners: [] };
  }
}

const CAT_EMOJIS: Record<string, string> = {
  construction: '🏗️',
  steel: '🔩',
  electricals: '⚡',
  electrical: '⚡',
  plumbing: '🚿',
  paints: '🎨',
  paint: '🎨',
  hardware: '🔧',
  safety: '⛑️',
  'power tools': '🔨',
  power: '🔨',
  home: '🏠',
  bathroom: '🛁',
  industrial: '🏭',
  cleaning: '🧹',
  rentals: '🔑',
  default: '📦',
};

function getCatEmoji(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CAT_EMOJIS)) {
    if (key.includes(k)) return v;
  }
  return CAT_EMOJIS.default;
}

export default async function Home() {
  const { categories, banners } = await fetchData();

  const resolveImage = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API}${url}`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.95)_0%,rgba(30,41,59,0.92)_55%,rgba(249,115,22,0.12)_100%)]" />
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative max-w-[1440px] mx-auto px-4 py-6 lg:py-8">
          <div className="grid gap-6">
            <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-orange-600">
                    <MapPin size={13} />
                    Currently Serving Hyderabad Only
                  </div>
                  <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                    Backend banners only
                  </h1>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  {banners.length > 0 ? 'Live' : 'No active banner'}
                </div>
              </div>
              <div className="min-h-[380px]">
                {banners.length > 0 ? (
                  <HeroSlider banners={banners} API={API} />
                ) : (
                  <div className="flex h-full min-h-[380px] items-center justify-center bg-slate-50 px-8 text-center text-sm text-slate-500">
                    Add active HERO banners in the admin panel to show them here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 py-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Shop by category</div>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Categories from the backend</h2>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
              View all categories
              <ChevronRight size={14} />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {categories.slice(0, 8).map((cat) => {
                const imgUrl = cat.imageUrl ? resolveImage(cat.imageUrl) : null;
                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={cat.name} fill className="object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">{getCatEmoji(cat.name)}</div>
                      )}
                    </div>
                    <div className="mt-3 text-center text-sm font-bold text-slate-800 group-hover:text-orange-600">{cat.name}</div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No categories are available from the backend yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
