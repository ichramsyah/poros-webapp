'use client';

import { useEffect, useState } from 'react';
import { Bot, Sparkles, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { getMonthlyAIAnalysis, saveMonthlyAIAnalysis, getBudgets, getMonthlyIncome, AIAnalysis, Budget } from '@/lib/firestore';

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
      <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-5">
        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0 mb-3">
          <Bot className="w-6 h-6 text-poros-500 animate-bounce" />
        </div>
        <p className="text-sm font-bold text-zinc-300 animate-pulse">Poros AI Sedang Berpikir...</p>
        <p className="text-[10px] font-semibold text-zinc-500 mt-1.5 min-h-[14px] transition-all duration-300">{loadingTexts[loadingTextIndex]}</p>
      </div>
    );
  }

  if (!isPastMonth && !analysis) {
    return (
      <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-poros-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-200">Analisis AI Belum Tersedia</p>
          <p className="text-[10px] font-medium text-zinc-450 mt-0.5 leading-snug">Rangkuman analisis kecerdasan buatan baru akan tersedia tanggal 1 di bulan berikutnya.</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-5 mb-5 relative overflow-hidden">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-900 flex flex-row items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
          <Bot className="w-4 h-4 text-poros-500" />
          Analisis AI Bulan Ini
        </h3>
        <button
          onClick={() => fetchOrGenerateAnalysis(true)}
          disabled={isRegenerating}
          className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 bg-zinc-900 border border-zinc-800/80 px-2 py-1.5 rounded-lg cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-poros-500' : ''}`} />
          <span className="sr-only">Regenerate</span>
        </button>
      </div>

      <div className="pt-4 space-y-5 relative z-10">
        {/* Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-x-0 bottom-0 top-0 z-50 bg-black/90 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl transition-all">
            <Bot className="w-6 h-6 text-poros-500 animate-bounce mb-2" />
            <p className="text-xs font-bold text-zinc-300 animate-pulse">Menyusun Ulang Analisis...</p>
          </div>
        )}

        {/* Nominal Summary Box */}
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-900 text-xs">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5">Masuk</p>
            <p className="font-semibold text-zinc-300 font-mono">Rp {Number(income).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5">Keluar</p>
            <p className="font-semibold text-zinc-300 font-mono">Rp {Number(totalSpent).toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-0.5">Sisa</p>
            <p className={`font-bold font-mono ${Number(income) - Number(totalSpent) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>Rp {(Number(income) - Number(totalSpent)).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Score & Saving Rate */}
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-zinc-900">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Health Score</p>
            <h3 className="text-2xl font-bold text-white font-mono">
              {analysis.healthScore}
              <span className="text-xs font-semibold text-zinc-650">/100</span>
            </h3>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Saving Rate</p>
            <h3 className="text-2xl font-bold text-white font-mono">{analysis.savingRate.toFixed(1)}%</h3>
          </div>
        </div>

        {/* Top Leaks */}
        {analysis.topLeaks && analysis.topLeaks.length > 0 && (
          <div className="border-l border-rose-500/80 pl-4 py-0.5 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Kebocoran Budget
            </h4>
            <div className="space-y-2">
              {analysis.topLeaks.map((leak, idx) => (
                <div key={idx}>
                  <p className="text-[11px] font-bold text-zinc-200">{leak.category}</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{leak.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Praise */}
        {analysis.praise && (
          <div className="border-l border-emerald-500/80 pl-4 py-0.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Pencapaian Keren
            </h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">{analysis.praise}</p>
          </div>
        )}

        {/* Advice */}
        {analysis.advice && (
          <div className="border-l border-zinc-700 pl-4 py-0.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" /> Saran Bulan Depan
            </h4>
            <p className="text-[10px] text-zinc-450 leading-relaxed">{analysis.advice}</p>
          </div>
        )}

        {/* AI Summary Conversation */}
        {analysis.summary && (
          <div className="border-l border-poros-500/60 pl-4 py-0.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
              <Bot className="w-3.5 h-3.5 text-zinc-500" /> Kesimpulan Poros
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-medium italic">&ldquo;{analysis.summary}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
