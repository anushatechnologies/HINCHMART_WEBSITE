"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function ProfileButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Link href={isLoggedIn ? "/account" : "/login"} className="flex flex-col items-center justify-center group cursor-pointer w-[50px]">
      <User size={24} className="text-slate-600 group-hover:text-orange-500 transition-colors" strokeWidth={1.5}/>
      <span className="text-[11px] font-bold text-slate-500 mt-1 group-hover:text-orange-600 transition-colors whitespace-nowrap">
        {isLoggedIn ? "Account" : "Sign In"}
      </span>
    </Link>
  );
}
