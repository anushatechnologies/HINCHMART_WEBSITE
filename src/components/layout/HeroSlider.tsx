"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Banner = {
  id?: number | string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  desktopImageUrl?: string | null;
  tabletImageUrl?: string | null;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
};

export default function HeroSlider({ banners, API }: { banners: Banner[]; API: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrentIndex((prev) => (prev + 1) % banners.length);

  if (!banners || banners.length === 0) {
    return null;
  }

  const resolveUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API}${url}`;
  };

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden group">
      <div
        className="flex h-full items-stretch transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const desktopImg = resolveUrl(banner.desktopImageUrl || banner.imageUrl);
          const mobileImg = resolveUrl(banner.mobileImageUrl || banner.desktopImageUrl || banner.imageUrl);

          return (
            <div key={banner.id || index} className="relative flex w-full shrink-0 items-center justify-center min-h-[380px]">
              <Link href={banner.linkUrl || "/products"} className="block h-full w-full bg-slate-900 relative">
                {/* Desktop Image */}
                {desktopImg && (
                  <div className="relative hidden md:block h-full min-h-[380px] w-full">
                    <Image
                      src={desktopImg}
                      alt={banner.title || "Promo Banner"}
                      fill
                      className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      priority={index === 0}
                    />
                  </div>
                )}

                {/* Mobile Image */}
                {mobileImg && (
                  <div className="relative block md:hidden h-full min-h-[340px] w-full">
                    <Image
                      src={mobileImg}
                      alt={banner.title || "Promo Banner"}
                      fill
                      className="object-cover opacity-90 transition-transform duration-700"
                      priority={index === 0}
                    />
                  </div>
                )}

                {/* Text Overlay */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 sm:p-10 flex flex-col justify-end text-white">
                    {banner.title && <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">{banner.title}</h2>}
                    {banner.subtitle && <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg font-medium">{banner.subtitle}</p>}
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-black rounded-xl shadow-lg transition-all">
                        {banner.ctaText || "Shop Now"} <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-slate-900 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-slate-900 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  index === currentIndex ? "w-6 bg-[#FF5722]" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
