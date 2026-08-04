"use client";

import { usePathname } from 'next/navigation';
import React from 'react';

export default function ConditionalUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide on Seller and Admin routes
  const isHidden = pathname?.startsWith('/seller') || pathname?.startsWith('/admin');
  
  if (isHidden) {
    return null;
  }
  
  return <>{children}</>;
}
