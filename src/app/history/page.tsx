'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, History, Receipt, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserProfile, getBudgets, getRecentExpenses, getAvailableMonths, getMonthlyIncome, Budget, Expense } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
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
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white px-5 pt-8 pb-5 sticky top-0 z-40 border-b border-neutral-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">Riwayat Bulanan</h1>
        </div>

        {/* Month Selector */}
        {availableMonths.length > 0 ? (
          <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || '')}>
            <SelectTrigger className="w-full h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:ring-poros-500 text-base">
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
          <div className="h-12 bg-neutral-100 rounded-xl flex items-center px-4 text-neutral-400 font-medium text-sm border border-neutral-200">Belum ada riwayat tercatat</div>
        )}
      </header>

      <main className="px-5 mt-6 space-y-6 max-w-md mx-auto">
        {isLoadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-3 border-poros-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 && expenses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-1">Data Kosong</h3>
            <p className="text-neutral-500 text-sm">Tidak ada catatan budget atau pengeluaran di {formatMonthDisplay(selectedMonth)}.</p>
          </div>
        ) : (
          <>
            {/* AI Analysis Card */}
            {user && <AiAnalysisCard userId={user.uid} monthYear={selectedMonth} income={monthlyIncome} totalSpent={totalSpent} budgets={budgets} age={userAge} bio={userBio} targetGoal={userTargetGoal} userName={userName} />}

            {/* Quick Summary Row */}
            <Card className="rounded-[2xl] border-none shadow-sm bg-gradient-to-br from-poros-500 to-poros-700 text-white overflow-hidden mb-3">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-poros-100 text-[11px] uppercase tracking-wider font-bold">Total Sisa Uang</p>
                  <button
                    onClick={toggleShowAmounts}
                    className="text-poros-100 hover:text-white p-1 rounded-full transition-colors focus:outline-none"
                    aria-label={showAmounts ? "Sembunyikan nominal" : "Tampilkan nominal"}
                  >
                    {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  {showAmounts ? formatRupiah(Math.max(0, monthlyIncome - totalSpent)) : 'Rp ••••••••'}
                </h2>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-poros-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">Pendapatan</p>
                    <p className="font-medium">
                      {showAmounts ? formatRupiah(monthlyIncome) : 'Rp ••••••••'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-poros-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">Sisa Alokasi</p>
                    <p className="font-medium">
                      {showAmounts ? formatRupiah(Math.max(0, monthlyIncome - totalAllocated)) : 'Rp ••••••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold mb-1">Total Alokasi</p>
                  <h2 className="text-lg font-bold tracking-tight text-neutral-900">{formatRupiah(totalAllocated)}</h2>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold mb-1">Terpakai</p>
                  <h2 className="text-lg font-bold tracking-tight text-poros-600">{formatRupiah(totalSpent)}</h2>
                </CardContent>
              </Card>
            </div>

            {/* Per-Category Budget Breakdown */}
            {budgets.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-neutral-900 mb-3 flex items-center justify-between">
                  <span>Rincian Per Kategori</span>
                  <span className="text-xs font-medium text-poros-600 bg-poros-50 px-2.5 py-0.5 rounded-full">{budgets.length} Kategori</span>
                </h3>
                <div className="space-y-3">
                  {budgets.map((budget) => {
                    const spent = budget.spentAmount;
                    const allocated = budget.allocatedAmount;
                    const remaining = allocated - spent;
                    const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;

                    let progressColor = 'bg-poros-300';
                    if (percent > 85) progressColor = 'bg-poros-500';
                    else if (percent > 65) progressColor = 'bg-poros-400';

                    return (
                      <div key={budget.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                        <div className="flex justify-between items-start mb-2.5">
                          <div>
                            <h4 className="font-semibold text-neutral-900 text-sm">{budget.category}</h4>
                            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                              Sisa <span className={remaining < 0 ? 'text-poros-600 font-bold' : 'text-poros-600 font-bold'}>{formatRupiah(remaining)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-poros-600">{formatRupiah(spent)}</p>
                            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">dari {formatRupiah(allocated)}</p>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`} style={{ width: `${percent}%` }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-neutral-100">
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Alokasi</p>
                            <p className="text-xs font-bold text-neutral-700">{formatRupiah(allocated)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Terpakai</p>
                            <p className="text-xs font-bold text-poros-600">{formatRupiah(spent)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Sisa</p>
                            <p className={`text-xs font-bold ${remaining < 0 ? 'text-poros-600' : 'text-poros-600'}`}>{formatRupiah(remaining)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Expenses List */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-neutral-900">Rincian Pengeluaran</h3>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">{expenses.length} Trx</span>
              </div>

              {/* Category Filter Chips */}
              {expenses.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                  {['Semua', ...budgets.map((b) => b.category)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                        selectedCategoryFilter === cat ? 'bg-poros-500 text-white shadow-sm' : 'bg-white text-neutral-500 border border-neutral-200 hover:border-poros-300 hover:text-poros-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden relative">
                {expenses.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-neutral-400">
                    <p className="text-sm font-medium text-neutral-500">Tidak ada pengeluaran</p>
                  </div>
                ) : (
                  (() => {
                    const filtered = selectedCategoryFilter === 'Semua' ? expenses : expenses.filter((e) => budgets.find((b) => b.id === e.budgetId)?.category === selectedCategoryFilter);
                    return filtered.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-neutral-400">Tidak ada pengeluaran di kategori ini</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filtered.map((expense) => {
                          const budget = budgets.find((b) => b.id === expense.budgetId);
                          const expDate = expense.date && 'toDate' in expense.date ? expense.date.toDate() : new Date();

                          return (
                            <div key={expense.id} className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-poros-50 flex items-center justify-center flex-shrink-0">
                                  <TrendingDown className="w-4 h-4 text-poros-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-neutral-900 line-clamp-1">{expense.description || budget?.category || 'Pengeluaran'}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{budget?.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                    <p className="text-[11px] text-neutral-400 font-medium">{format(expDate, 'd MMM, HH:mm', { locale: id })}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-neutral-900 tracking-tight">-{formatRupiah(expense.amount).replace('Rp', '').trim()}</p>
                            </div>
                          );
                        })}
                      </div>
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
