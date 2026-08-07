"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight } from "lucide-react";

type AnnouncementBanner = {
  id?: number | string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
  isActive?: boolean | null;
};

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<AnnouncementBanner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
    fetch(`${apiUrl}/api/banners?bannerType=ANNOUNCEMENT&isActive=true`)
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAnnouncement(json.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  if (dismissed) return null;

  const titleText = announcement?.title || "🚚 Free Delivery Above ₹999 • 100% Genuine Industrial Materials • Direct GST Invoicing";
  const link = announcement?.linkUrl || "/products";

  return (
    <div className="bg-gradient-to-r from-[#FF5722] via-[#e64a19] to-[#0F2537] text-white text-xs font-bold py-2.5 px-4 shadow-md flex items-center justify-between z-50 relative">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-3 text-center flex-1">
        <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider text-amber-200">
          <Sparkles size={12} /> Notice
        </span>
        <span className="truncate">{titleText}</span>
        {announcement?.ctaText && (
          <Link
            href={link}
            className="underline underline-offset-2 hover:text-amber-200 transition-colors flex items-center gap-0.5 ml-1 shrink-0"
          >
            {announcement.ctaText} <ChevronRight size={12} />
          </Link>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
        title="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
