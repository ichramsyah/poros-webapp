'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import { Receipt, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserProfile, getBudgets, getRecentExpenses, getAvailableMonths, getMonthlyIncome, Budget, Expense } from '@/lib/firestore';
import { AiAnalysisCard } from '@/components/AiAnalysisCard';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<(Expense & { id: string })[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [userAge, setUserAge] = useState<number>(21);
  const [userBio, setUserBio] = useState<string>('');
  const [userTargetGoal, setUserTargetGoal] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');
  const [showAmounts, setShowAmounts] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('showAmounts');
    if (saved !== null) {
      setShowAmounts(saved === 'true');
    }
  }, []);

  const toggleShowAmounts = () => {
    setShowAmounts((prev) => {
      const next = !prev;
      localStorage.setItem('showAmounts', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load available months once on mount
  useEffect(() => {
    async function loadMonths() {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.uid, user.email || '', user.displayName || '');
        if (profile.dateOfBirth) {
          const dob = new Date(profile.dateOfBirth);
          const diff_ms = Date.now() - dob.getTime();
          const age_dt = new Date(diff_ms);
          setUserAge(Math.abs(age_dt.getUTCFullYear() - 1970));
        }
        setUserBio(profile.bio || '');
        setUserTargetGoal(profile.targetGoal || '');
        setUserName(profile.displayName || user.displayName || 'Pengguna');

        const months = await getAvailableMonths(user.uid);
        setAvailableMonths(months);

        if (months.length > 0) {
          // Default to the most recent month if available
          setSelectedMonth(months[0]);
        } else {
          // If no history, default to current month
          setSelectedMonth(format(new Date(), 'yyyy-MM'));
        }
      } catch (error) {
        console.error('Failed to load available months:', error);
      }
    }
    if (user) {
      loadMonths();
    }
  }, [user]);

  // Load data whenever the selected month changes
  useEffect(() => {
    async function fetchMonthData() {
      if (!user || !selectedMonth) return;
      setIsLoadingData(true);
      setSelectedCategoryFilter('Semua'); // Reset filter on month change
      try {
        const [userBudgets, monthExpenses, income] = await Promise.all([
          getBudgets(user.uid, selectedMonth),
          getRecentExpenses(user.uid, selectedMonth, 100), // fetch up to 100 expenses for history viewing
          getMonthlyIncome(user.uid, selectedMonth),
        ]);

        setBudgets(userBudgets);
        setExpenses(monthExpenses);
        setMonthlyIncome(income);
      } catch (error) {
        console.error('Failed to load history data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchMonthData();
  }, [user, selectedMonth]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-poros-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthDisplay = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const date = parse(monthYearStr, 'yyyy-MM', new Date());
    return format(date, 'MMMM yyyy', { locale: id });
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-32">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-md px-6 pt-12 pb-5 sticky top-0 z-40 border-b border-zinc-900 flex flex-col gap-4 max-w-md mx-auto">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-wider">Riwayat Bulanan</h1>
        </div>

        {/* Month Selector */}
        {availableMonths.length > 0 ? (
          <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || '')}>
            <SelectTrigger className="w-full h-11 bg-zinc-950 border-zinc-900 rounded-xl font-medium focus:ring-poros-500 text-sm text-zinc-100 cursor-pointer">
              <SelectValue placeholder="Pilih Bulan">{formatMonthDisplay(selectedMonth)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month} className="font-medium cursor-pointer">
                  {formatMonthDisplay(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="h-11 bg-zinc-950 rounded-xl flex items-center px-4 text-zinc-500 font-medium text-xs border border-zinc-900">Belum ada riwayat tercatat</div>
        )}
      </header>

      <main className="px-6 mt-6 space-y-8 max-w-md mx-auto">
        {isLoadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-poros-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 && expenses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-900">
              <Receipt className="w-6 h-6 text-zinc-650" />
            </div>
            <h3 className="text-sm font-bold text-zinc-300 mb-1">Data Kosong</h3>
            <p className="text-zinc-550 text-xs">Tidak ada catatan budget atau pengeluaran di {formatMonthDisplay(selectedMonth)}.</p>
          </div>
        ) : (
          <>
            {/* AI Analysis Card */}
            {user && <AiAnalysisCard userId={user.uid} monthYear={selectedMonth} income={monthlyIncome} totalSpent={totalSpent} budgets={budgets} age={userAge} bio={userBio} targetGoal={userTargetGoal} userName={userName} />}

            {/* Clean Balance Widget */}
            <section className="py-6 border-b border-zinc-900 relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Sisa Uang</p>
                <button
                  onClick={toggleShowAmounts}
                  className="text-zinc-500 hover:text-white p-1 rounded-full transition-colors focus:outline-none cursor-pointer"
                  aria-label={showAmounts ? "Sembunyikan nominal" : "Tampilkan nominal"}
                >
                  {showAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h2 className="text-3xl font-light tracking-tight mb-6 text-white font-mono">
                {showAmounts ? formatRupiah(Math.max(0, monthlyIncome - totalSpent)) : 'Rp ••••••••'}
              </h2>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-950">
                <div>
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Pendapatan</p>
                  <p className="text-sm font-semibold text-zinc-300">
                    {showAmounts ? formatRupiah(monthlyIncome) : 'Rp ••••••••'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Sisa Alokasi</p>
                  <p className="text-sm font-semibold text-zinc-300">
                    {showAmounts ? formatRupiah(Math.max(0, monthlyIncome - totalAllocated)) : 'Rp ••••••••'}
                  </p>
                </div>
              </div>
            </section>

            {/* Flat Summary Row */}
            <section className="grid grid-cols-2 py-2 border-b border-zinc-900">
              <div className="pr-4 border-r border-zinc-900">
                <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Terpakai</p>
                <h2 className="text-xl font-semibold text-poros-500 font-mono">{formatRupiah(totalSpent)}</h2>
              </div>
              <div className="pl-4">
                <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">Alokasi</p>
                <h2 className="text-xl font-semibold text-white font-mono">{formatRupiah(totalAllocated)}</h2>
              </div>
            </section>

            {/* Per-Category Budget Breakdown */}
            {budgets.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Rincian Per Kategori</h3>
                  <span className="text-[10px] font-bold text-poros-500 bg-poros-100 border border-poros-200 px-2 py-0.5 rounded-md">{budgets.length}</span>
                </div>
                <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
                  {budgets.map((budget) => {
                    const spent = budget.spentAmount;
                    const allocated = budget.allocatedAmount;
                    const remaining = allocated - spent;
                    const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;

                    let progressColor = 'bg-zinc-800';
                    if (percent > 85) progressColor = 'bg-rose-500';
                    else if (percent > 65) progressColor = 'bg-amber-500';
                    else if (percent > 0) progressColor = 'bg-poros-500';

                    return (
                      <div key={budget.id} className="py-4 flex flex-col gap-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-zinc-200 text-sm">{budget.category}</h4>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Sisa <span className="text-poros-500 font-semibold">{formatRupiah(remaining)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white font-mono">{formatRupiah(spent)}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">dari {formatRupiah(allocated)}</p>
                          </div>
                        </div>
                        <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Expenses List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Rincian Pengeluaran</h3>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md">{expenses.length}</span>
              </div>

              {/* Category Filter Chips */}
              {expenses.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
                  {['Semua', ...budgets.map((b) => b.category)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        selectedCategoryFilter === cat
                          ? 'bg-poros-500/10 text-poros-500 border border-poros-500/20'
                          : 'bg-zinc-950 text-zinc-500 border border-zinc-900 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
                {expenses.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center text-zinc-650">
                    <p className="text-xs font-semibold text-zinc-400">Tidak ada pengeluaran</p>
                  </div>
                ) : (
                  (() => {
                    const filtered = selectedCategoryFilter === 'Semua' ? expenses : expenses.filter((e) => budgets.find((b) => b.id === e.budgetId)?.category === selectedCategoryFilter);
                    return filtered.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center justify-center">
                        <p className="text-xs font-semibold text-zinc-500">Tidak ada pengeluaran di kategori ini</p>
                      </div>
                    ) : (
                      filtered.map((expense) => {
                        const budget = budgets.find((b) => b.id === expense.budgetId);
                        const expDate = expense.date && 'toDate' in expense.date ? expense.date.toDate() : new Date();

                        return (
                          <div key={expense.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center flex-shrink-0">
                                <TrendingDown className="w-3.5 h-3.5 text-zinc-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{expense.description || budget?.category || 'Pengeluaran'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{budget?.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                  <p className="text-[10px] text-zinc-500 font-medium">{format(expDate, 'd MMM, HH:mm', { locale: id })}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-zinc-100 tracking-tight">-{formatRupiah(expense.amount).replace('Rp', '').trim()}</p>
                          </div>
                        );
                      })
                    );
                  })()
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
