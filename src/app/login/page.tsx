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
    <div className="relative flex items-center justify-center min-h-screen bg-black selection:bg-poros-500 selection:text-black">
      {/* Card Container */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-zinc-900/10 border border-zinc-900 rounded-[2rem] p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
          {/* Logo Box */}
          <div className="mb-6 relative">
            <div className="relative w-20 h-20 rounded-[1.2rem] overflow-hidden border border-zinc-800 bg-zinc-900/50 p-1">
              <div className="w-full h-full rounded-[1rem] overflow-hidden bg-black flex items-center justify-center">
                <Image src="/logo.png" alt="Poros Logo" width={80} height={80} className="w-full h-full object-cover" priority />
              </div>
            </div>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Poros</h1>
          <p className="text-zinc-500 text-xs font-medium mb-12 leading-relaxed">
            Personal Life OS & Financial Manager.
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="group/btn relative w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] text-white border border-zinc-800 font-semibold rounded-xl px-5 py-3.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-poros-500 rounded-full animate-spin" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover/btn:scale-105 duration-200">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          {/* Footer Text */}
          <p className="text-zinc-600 text-[10px] mt-8 leading-relaxed font-medium">
            Verifikasi Akun Otomatis via Firebase.
          </p>
        </div>
      </div>
    </div>
  );
}
