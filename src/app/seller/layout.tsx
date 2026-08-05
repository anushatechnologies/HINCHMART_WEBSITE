"use client";

import { usePathname } from 'next/navigation';

const PUBLIC_SELLER_ROUTES = [
  '/seller',
  '/seller/login',
  '/seller/register',
  '/seller/forgot-password',
  '/seller/verify-otp',
  '/seller/reset-password'
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // For public seller routes (landing page, login, register, etc.), render children cleanly
  const isPublic = PUBLIC_SELLER_ROUTES.includes(pathname);
  if (isPublic) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
