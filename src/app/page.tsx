'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { TrendingDown, Receipt, Eye, EyeOff } from 'lucide-react';
import { getUserProfile, initializeMonthBudgets, getBudgets, getRecentExpenses, addExpense, updateBudgetAllocation, Budget, Expense } from '@/lib/firestore';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { EditBudgetModal } from '@/components/EditBudgetModal';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { DeleteCategoryModal } from '@/components/DeleteCategoryModal';
import { ResetMonthModal } from '@/components/ResetMonthModal';
import { SetIncomeModal } from '@/components/SetIncomeModal';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<(Expense & { id: string })[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
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

  const currentMonthYear = format(new Date(), 'yyyy-MM');
  const monthName = format(new Date(), 'MMMM yyyy', { locale: id });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setIsLoadingData(true);
        // Ensure user profile exists
        await getUserProfile(user.uid, user.email || '', user.displayName || '');

        // Initialize and fetch budgets
        await initializeMonthBudgets(user.uid, currentMonthYear);
        const userBudgets = await getBudgets(user.uid, currentMonthYear);
        setBudgets(userBudgets);

        // Fetch recent expenses
        const recentExpenses = await getRecentExpenses(user.uid, currentMonthYear, 5);
        setExpenses(recentExpenses);

        // Fetch monthly income
        const { getMonthlyIncome } = await import('@/lib/firestore');
        const income = await getMonthlyIncome(user.uid, currentMonthYear);
        setMonthlyIncome(income);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadDashboardData();
  }, [user, currentMonthYear]);

  const handleAddExpense = async (amount: number, budgetId: string, description: string, date: Date) => {
    if (!user) return;

    // Optimistically calculate UI updates or just refetch (refetching is simpler and robust for now)
    await addExpense({
      userId: user.uid,
      budgetId,
      amount,
      description,
      date: date as any, // FireStore timestamp casting handled by client internally or we'll pass Date
    });

    // Refetch data to guarantee sync
    const [updatedBudgets, updatedExpenses] = await Promise.all([getBudgets(user.uid, currentMonthYear), getRecentExpenses(user.uid, currentMonthYear, 5)]);

    setBudgets(updatedBudgets);
    setExpenses(updatedExpenses);
  };

  const handleUpdateBudget = async (budgetId: string, amount: number) => {
    if (!user) return;
    await updateBudgetAllocation(budgetId, amount);
    const updatedBudgets = await getBudgets(user.uid, currentMonthYear);
    setBudgets(updatedBudgets);
  };

  const handleAddCategory = async (categoryName: string, initialAmount: number) => {
    if (!user) return;
    const { addCategory } = await import('@/lib/firestore');
    await addCategory(user.uid, currentMonthYear, categoryName, initialAmount);

    // Refresh budgets
    const updatedBudgets = await getBudgets(user.uid, currentMonthYear);
    setBudgets(updatedBudgets);
  };

  const handleDeleteCategory = async (budgetId: string) => {
    if (!user) return;
    const { deleteCategory } = await import('@/lib/firestore');
    await deleteCategory(budgetId);

    // Refresh budgets
    const updatedBudgets = await getBudgets(user.uid, currentMonthYear);
    setBudgets(updatedBudgets);
  };

  const handleResetMonth = async () => {
    if (!user) return;
    const { resetMonthData } = await import('@/lib/firestore');
    await resetMonthData(user.uid, currentMonthYear);

    // Refresh both budgets and expenses
    const [updatedBudgets, updatedExpenses] = await Promise.all([getBudgets(user.uid, currentMonthYear), getRecentExpenses(user.uid, currentMonthYear, 5)]);

    setBudgets(updatedBudgets);
    setExpenses(updatedExpenses);
  };

  const handleSetIncome = async (amount: number) => {
    if (!user) return;
    const { setMonthlyIncome: updateDbIncome } = await import('@/lib/firestore');
    await updateDbIncome(user.uid, currentMonthYear, amount);
    setMonthlyIncome(amount);
  };

  if (loading || !user || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-poros-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate Summaries
  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-32">
      <main className="px-6 pt-16 space-y-8 max-w-md mx-auto">
        {/* Minimal Header Balance Widget */}
        <section className="py-6 border-b border-zinc-900 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Total Sisa Uang</p>
            <button
              onClick={toggleShowAmounts}
              className="text-zinc-500 hover:text-white p-1 rounded-full transition-colors focus:outline-none cursor-pointer"
              aria-label={showAmounts ? "Sembunyikan nominal" : "Tampilkan nominal"}
            >
              {showAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <h2 className="text-4xl font-light tracking-tight mb-6 text-white font-mono">
            {showAmounts ? formatRupiah(Math.max(0, monthlyIncome - totalSpent)) : 'Rp ••••••••'}
          </h2>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-950">
            <div>
              <div className="flex items-center text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-1">
                Pendapatan
                <SetIncomeModal currentIncome={monthlyIncome} monthName={monthName} onSetIncome={handleSetIncome} />
              </div>
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

        {/* Budget Progress List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Jatah Budget</h3>
              <span className="text-[10px] font-bold text-poros-500 bg-poros-100 border border-poros-200 px-2 py-0.5 rounded-md">{budgets.length}</span>
            </div>
            <AddCategoryModal onAddCategory={handleAddCategory} />
          </div>
          <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
            {budgets.map((budget) => {
              const spent = budget.spentAmount;
              const allocated = budget.allocatedAmount;
              const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
              const remaining = allocated - spent;

              // Minimal Progress coloring
              let progressColor = 'bg-zinc-800';
              if (percent > 85) progressColor = 'bg-rose-500';
              else if (percent > 65) progressColor = 'bg-amber-500';
              else if (percent > 0) progressColor = 'bg-poros-500';

              return (
                <div key={budget.id} className="py-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="font-semibold text-zinc-200 text-sm">{budget.category}</h4>
                        <div className="flex items-center gap-0.5">
                          <EditBudgetModal budget={budget} onUpdateBudget={handleUpdateBudget} />
                          <DeleteCategoryModal budget={budget} onDeleteCategory={handleDeleteCategory} />
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500">Sisa {formatRupiah(remaining)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white font-mono">{formatRupiah(spent)}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">dari {formatRupiah(allocated)}</p>
                    </div>
                  </div>
                  {/* Ultra-thin progress indicator */}
                  <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Riwayat Terakhir</h3>
            {expenses.length > 0 && <ResetMonthModal monthName={monthName} onReset={handleResetMonth} />}
          </div>

          <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
            {expenses.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center text-zinc-600">
                <Receipt className="w-8 h-8 text-zinc-800 mb-2" />
                <p className="text-xs font-semibold text-zinc-400">Belum ada pengeluaran</p>
                <p className="text-[10px] mt-0.5 text-zinc-500">Catat transaksi pertamamu bulan ini!</p>
              </div>
            ) : (
              expenses.map((expense) => {
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
                          <p className="text-[10px] text-zinc-500 font-medium">{format(expDate, 'd MMM', { locale: id })}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100 tracking-tight">-{formatRupiah(expense.amount).replace('Rp', '').trim()}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <AddExpenseModal budgets={budgets} onAddExpense={handleAddExpense} />
    </div>
  );
}
