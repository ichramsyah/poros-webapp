'use client';

import { useEffect, useState } from 'react';
import { Bot, Sparkles, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { getMonthlyAIAnalysis, saveMonthlyAIAnalysis, getBudgets, getMonthlyIncome, AIAnalysis, Budget } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parse, subMonths } from 'date-fns';

interface AiAnalysisCardProps {
  userId: string;
  monthYear: string;
  income: number;
  totalSpent: number;
  budgets: Budget[];
  age?: number;
  bio?: string;
  targetGoal?: string;
  userName?: string;
}

export function AiAnalysisCard({ userId, monthYear, income, totalSpent, budgets, age = 21, bio = '', targetGoal = '', userName = 'Pengguna' }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadingTexts = ['Membaca jejak keuanganmu...', 'Mendeteksi kebocoran budget...', 'Menghitung skor kesehatan...', 'Meramu saran paling manjur...', 'Menyiapkan kesimpulan akhir...'];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading || isRegenerating) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading, isRegenerating]);

  const currentMonthYear = format(new Date(), 'yyyy-MM');
  const isPastMonth = monthYear < currentMonthYear;

  async function fetchOrGenerateAnalysis(forceRegenerate = false) {
    if (forceRegenerate) setIsRegenerating(true);
    else setLoading(true);

    try {
      if (!forceRegenerate) {
        const existing = await getMonthlyAIAnalysis(userId, monthYear);
        if (existing) {
          setAnalysis(existing);
          setLoading(false);
          return;
        }

        if (!isPastMonth) {
          setLoading(false);
          return;
        }
      }

      // Prepare Trend Analysis
      const dateObj = parse(monthYear, 'yyyy-MM', new Date());
      const prevMonthObj = subMonths(dateObj, 1);
      const prevMonthYear = format(prevMonthObj, 'yyyy-MM');

      const prevBudgets = await getBudgets(userId, prevMonthYear);
      const prevIncome = await getMonthlyIncome(userId, prevMonthYear);
      const prevTotalSpent = prevBudgets.reduce((acc, b) => acc + b.spentAmount, 0);

      const previousMonth = { income: prevIncome, totalSpent: prevTotalSpent };

      // Generate Analysis
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthYear, income, totalExpenses: totalSpent, budgets, age, bio, targetGoal, previousMonth, userName }),
      });

      if (!res.ok) throw new Error('Failed to generate analysis');

      const data = await res.json();
      const newAnalysis: Omit<AIAnalysis, 'id' | 'createdAt'> = {
        userId,
        monthYear,
        savingRate: data.savingRate || 0,
        healthScore: data.healthScore || 0,
        topLeaks: data.topLeaks || [],
        summary: data.summary || '',
        praise: data.praise || '',
        advice: data.advice || '',
      };

      const id = await saveMonthlyAIAnalysis(newAnalysis);
      setAnalysis({ ...newAnalysis, id, createdAt: new Date() as any });
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat analisis AI.');
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  }

  useEffect(() => {
    if (userId && monthYear) {
      fetchOrGenerateAnalysis(false);
    }
  }, [userId, monthYear, income, totalSpent, budgets, isPastMonth]);

  if (loading) {
    return (
      <Card className="rounded-[2xl] border-poros-100 shadow-sm bg-gradient-to-br from-white to-poros-50/20 overflow-hidden mb-5">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-[1.25rem] bg-poros-100 flex items-center justify-center flex-shrink-0 animate-pulse mb-4 shadow-inner">
            <Bot className="w-8 h-8 text-poros-600 animate-bounce" />
          </div>
          <p className="text-base font-black text-neutral-800 animate-pulse">Poros AI Sedang Berpikir...</p>
          <p className="text-[11px] font-bold text-poros-600 mt-2 min-h-[16px] transition-all duration-300">{loadingTexts[loadingTextIndex]}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isPastMonth && !analysis) {
    return (
      <div className="bg-poros-50/50 border border-poros-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-poros-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-poros-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-poros-900">Analisis AI Belum Tersedia</p>
          <p className="text-[11px] font-medium text-poros-700 mt-0.5 leading-snug">Rangkuman analisis kecerdasan buatan baru akan tersedia tanggal 1 di bulan berikutnya.</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <Card className="rounded-[2xl] border-poros-200 shadow-md bg-white overflow-hidden mb-5 relative">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-poros-500/5 rounded-full blur-3xl" />
      <CardHeader className="pb-3 pt-5 border-b border-neutral-100 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <Bot className="w-5 h-5 text-poros-600" />
          Analisis AI Bulan Ini
        </CardTitle>
        <button
          onClick={() => fetchOrGenerateAnalysis(true)}
          disabled={isRegenerating}
          className="text-xs font-semibold text-neutral-400 hover:text-poros-600 transition-colors flex items-center gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-poros-600' : ''}`} />
          <span className="sr-only">Regenerate</span>
        </button>
      </CardHeader>
      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-x-0 bottom-0 top-[1px] z-50 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-b-[2xl] transition-all">
            <div className="w-16 h-16 rounded-[1.25rem] bg-poros-100 flex items-center justify-center animate-pulse mb-3 shadow-lg border border-poros-200">
              <Bot className="w-8 h-8 text-poros-600 animate-bounce" />
            </div>
            <p className="text-sm font-black text-poros-900 animate-pulse">Menyusun Ulang Analisis...</p>
            <p className="text-[10px] font-bold text-poros-600 mt-1 min-h-[16px] transition-all duration-300">{loadingTexts[loadingTextIndex]}</p>
          </div>
        )}

        {/* Nominal Summary Box */}
        <div className="bg-poros-100/30 rounded-2xl p-4 border border-poros-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm mb-4">
          <div className="flex-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-poros-500 mb-0.5">Pendapatan</p>
            <p className="text-lg font-bold text-neutral-900 leading-none">Rp {Number(income).toLocaleString('id-ID')}</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-poros-200" />
          <div className="flex-1 md:pl-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-poros-500 mb-0.5">Pengeluaran</p>
            <p className="text-lg font-bold text-neutral-900 leading-none">Rp {Number(totalSpent).toLocaleString('id-ID')}</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-poros-200" />
          <div className="flex-1 md:pl-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-poros-500 mb-0.5">Tersisa</p>
            <p className={`text-xl font-black leading-none ${Number(income) - Number(totalSpent) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Rp {(Number(income) - Number(totalSpent)).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Score & Saving Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-poros-500 to-poros-800 rounded-2xl p-4 text-white shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1">Health Score</p>
            <h3 className="text-3xl font-black">
              {analysis.healthScore}
              <span className="text-sm font-bold opacity-70">/100</span>
            </h3>
          </div>
          <div className="bg-poros-50 border border-poros-100 rounded-2xl p-4 text-poros-900">
            <p className="text-[10px] uppercase font-bold tracking-wider text-poros-500 mb-1">Saving Rate</p>
            <h3 className="text-3xl font-black">{analysis.savingRate.toFixed(1)}%</h3>
          </div>
        </div>

        {/* Top Leaks */}
        {analysis.topLeaks && analysis.topLeaks.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2.5">
              <AlertCircle className="w-4 h-4" /> Kebocoran Budget (Top Leaks)
            </h4>
            <div className="space-y-3">
              {analysis.topLeaks.map((leak, idx) => (
                <div key={idx} className="bg-white/60 p-2.5 rounded-xl border border-rose-100/50">
                  <p className="text-xs font-extrabold text-rose-900 mb-0.5">{leak.category}</p>
                  <p className="text-[11px] font-medium text-rose-700 leading-snug">{leak.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Praise */}
        {analysis.praise && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4" /> Pencapaian Keren
            </h4>
            <p className="text-[11px] font-medium text-emerald-700 leading-snug">{analysis.praise}</p>
          </div>
        )}

        {/* Advice */}
        {analysis.advice && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-4 h-4 text-poros-600" /> Saran Bulan Depan
            </h4>
            <p className="text-[11px] font-medium text-neutral-600 leading-snug">{analysis.advice}</p>
          </div>
        )}

        {/* AI Summary Conversation */}
        {analysis.summary && (
          <div className="bg-poros-100/50 border border-poros-200 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 blur-2xl rounded-full translate-x-10 -translate-y-10" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Bot className="w-4 h-4 text-poros-700" />
              <h4 className="text-xs font-bold text-poros-900 uppercase tracking-wider">Kesimpulan Poros</h4>
            </div>
            <p className="text-sm text-poros-900 leading-relaxed font-semibold relative z-10 italic">"{analysis.summary}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
