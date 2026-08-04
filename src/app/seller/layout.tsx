"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    // If it's the login page, we don't need to enforce auth
    if (pathname === '/seller/login') return;

    const token = localStorage.getItem('seller_token');
    const info = localStorage.getItem('seller_info');

    if (!token || !info) {
      router.push('/seller/login');
    } else {
      setVendor(JSON.parse(info));
    }
  }, [pathname, router]);

  // Don't render the sidebar on the login page
  if (pathname === '/seller/login') {
    return <>{children}</>;
  }

  // If not logged in yet (and not on login page/register etc), don't render content to avoid flash
  if (!vendor) return null;

  return <>{children}</>;
}
