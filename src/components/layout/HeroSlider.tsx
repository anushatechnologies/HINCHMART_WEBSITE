"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id?: number | string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  title?: string | null;
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

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <div
        className="flex h-full items-center transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id || index} className="relative flex w-full shrink-0 items-center justify-center">
            <Link href={banner.linkUrl || "/products"} className="block h-full w-full bg-slate-900">
              <div className="relative h-[400px] w-full lg:h-[600px]">
                <Image
                  src={banner.imageUrl?.startsWith("http") ? banner.imageUrl : `${API}${banner.imageUrl || ""}`}
                  alt={banner.title || "Promo Banner"}
                  fill
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  priority={index === 0}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/50 text-slate-800 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/50 text-slate-800 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
