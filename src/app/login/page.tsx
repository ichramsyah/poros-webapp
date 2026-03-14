'use client';

import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error logging in:', error);
      setIsLoggingIn(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-neutral-50 p-4">
      {/* Subtle decorative blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-200 rounded-full opacity-40 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-200 rounded-full opacity-30 blur-[80px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-xl shadow-neutral-200/60 border border-neutral-100">
          {/* Logo */}
          <div className="mb-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-emerald-100">
              <Image src="/logo.png" alt="Tabung Menabung Logo" width={80} height={80} className="w-full h-full object-cover" priority />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">Tabung Menabung</h1>
          <p className="text-neutral-500 text-sm font-medium mb-7 leading-relaxed">
            Catat pengeluaran harianmu dengan
            <br />
            cepat, simpel, dan terorganisir.
          </p>

          {/* Feature pills */}
          {/* Feature cards with images */}
          <div className="flex justify-center gap-3 mb-7 w-full">
            {[
              { src: '/pill_budget.png', label: 'Budget Fleksibel' },
              { src: '/pill_laporan.png', label: 'Laporan Bulanan' },
              { src: '/pill_cepat.png', label: 'Cepat & Mudah' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-2 py-2.5 flex-1">
                <div className="w-9 h-9 rounded-xl overflow-hidden">
                  <Image src={f.src} alt={f.label} width={100} height={100} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 leading-tight text-center">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 active:scale-[0.98] text-neutral-800 font-semibold rounded-2xl px-5 py-3.5 transition-all duration-200 shadow-sm border border-neutral-200 hover:border-neutral-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                <span className="text-sm">Masuk...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm">Masuk dengan Google</span>
              </>
            )}
          </button>

          <p className="text-neutral-400 text-[11px] mt-5 leading-relaxed">
            Dengan masuk, kamu menyetujui penggunaan
            <br />
            data akun Google untuk autentikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
