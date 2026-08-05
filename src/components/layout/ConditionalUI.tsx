"use client";

import { usePathname } from 'next/navigation';
import React from 'react';

export default function ConditionalUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide customer website headers and footers on Seller, Admin, and Sell portal routes
  const isHidden = pathname?.startsWith('/seller') || pathname?.startsWith('/admin') || pathname?.startsWith('/sell');
  
  if (isHidden) {
    return null;
  }
  
  return <>{children}</>;
}
