'use client';

import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#1A0524] selection:bg-poros-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Glowing Orbs */}
      <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-poros-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#61227D]/40 rounded-full blur-[100px] mix-blend-screen" />

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden group">
          {/* Subtle Inner Shine */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Logo Box */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-poros-400 blur-2xl opacity-50 rounded-full" />
            <div className="relative w-24 h-24 rounded-[1.5rem] overflow-hidden shadow-2xl ring-1 ring-white/20 bg-white/10 p-1 backdrop-blur-md">
              <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-[#1A0524] flex items-center justify-center">
                <Image src="/logo.png" alt="Poros Logo" width={96} height={96} className="w-full h-full object-cover scale-110" priority />
              </div>
            </div>
            {/* Sparkle subtle decoration */}
            <Sparkles className="absolute -top-2 -right-3 w-6 h-6 text-white/80 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          {/* Title & Tagline */}
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Poros</h1>
          <p className="text-poros-200/80 text-sm font-medium mb-10 leading-relaxed max-w-[240px]">
            Personal Life OS & Financial Manager.
            <br /> <span className="opacity-50">Powered by AI.</span>
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="group/btn relative w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 active:scale-[0.98] text-neutral-900 font-bold rounded-2xl px-5 py-4 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-neutral-300 border-t-poros-600 rounded-full animate-spin" />
                <span className="text-sm">Menghubungkan...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform group-hover/btn:scale-110 duration-300">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm relative z-10">Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          {/* Footer Text */}
          <p className="text-poros-300/50 text-[11px] mt-6 leading-relaxed font-medium">
            Dengan melanjutkan, Anda menyetujui
            <br />
            Verifikasi Akun Otomatis via Firebase.
          </p>
        </div>
      </div>
    </div>
  );
}
