'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, User, BarChart2 } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on login page
  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="bg-white max-w-[80%] mx-auto px-8 h-16 flex items-center justify-between pb-[env(safe-area-inset-bottom)] rounded-full mb-4">
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-poros-600' : 'text-neutral-400 hover:text-neutral-600'}`}>
          <Home className={`w-6 h-6 ${pathname === '/' ? 'fill-poros-600/20' : ''}`} />
        </Link>
        <Link href="/history" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/history' ? 'text-poros-600' : 'text-neutral-400 hover:text-neutral-600'}`}>
          <History className={`w-6 h-6 ${pathname === '/history' ? 'fill-poros-600/20' : ''}`} />
        </Link>
        <Link href="/metrics" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/metrics' ? 'text-poros-600' : 'text-neutral-400 hover:text-neutral-600'}`}>
          <BarChart2 className={`w-6 h-6 ${pathname === '/metrics' ? 'fill-poros-600/20' : ''}`} />
        </Link>
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/profile' ? 'text-poros-600' : 'text-neutral-400 hover:text-neutral-600'}`}>
          <User className={`w-6 h-6 ${pathname === '/profile' ? 'fill-poros-600/20' : ''}`} />
        </Link>
      </div>
    </div>
  );
}
