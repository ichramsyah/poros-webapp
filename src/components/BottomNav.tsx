'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, User, BarChart2 } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on login page
  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-950/80 backdrop-blur-lg border border-zinc-900 max-w-[65%] mx-auto px-6 h-12 flex items-center justify-between rounded-full mb-6 shadow-2xl">
        <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-poros-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
          <Home className={`w-5 h-5 ${pathname === '/' ? 'fill-poros-500/10' : ''}`} />
        </Link>
        <Link href="/history" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/history' ? 'text-poros-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
          <History className={`w-5 h-5 ${pathname === '/history' ? 'fill-poros-500/10' : ''}`} />
        </Link>
        <Link href="/metrics" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/metrics' ? 'text-poros-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
          <BarChart2 className={`w-5 h-5 ${pathname === '/metrics' ? 'fill-poros-500/10' : ''}`} />
        </Link>
        <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/profile' ? 'text-poros-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
          <User className={`w-5 h-5 ${pathname === '/profile' ? 'fill-poros-500/10' : ''}`} />
        </Link>
      </div>
    </div>

  );
}
