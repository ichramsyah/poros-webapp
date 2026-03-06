"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { LogOut, Wallet, TrendingDown, Receipt, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/firebase";
import {
  getUserProfile,
  initializeMonthBudgets,
  getBudgets,
  getRecentExpenses,
  addExpense,
  updateBudgetAllocation,
  Budget,
  Expense,
} from "@/lib/firestore";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { EditBudgetModal } from "@/components/EditBudgetModal";
import { AddCategoryModal } from "@/components/AddCategoryModal";
import { DeleteCategoryModal } from "@/components/DeleteCategoryModal";
import { ResetMonthModal } from "@/components/ResetMonthModal";
import { SetIncomeModal } from "@/components/SetIncomeModal";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<(Expense & {id: string})[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const currentMonthYear = format(new Date(), "yyyy-MM");
  const monthName = format(new Date(), "MMMM yyyy", { locale: id });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setIsLoadingData(true);
        // Ensure user profile exists
        await getUserProfile(user.uid, user.email || "", user.displayName || "");
        
        // Initialize and fetch budgets
        await initializeMonthBudgets(user.uid, currentMonthYear);
        const userBudgets = await getBudgets(user.uid, currentMonthYear);
        setBudgets(userBudgets);
        
        // Fetch recent expenses
        const recentExpenses = await getRecentExpenses(user.uid, currentMonthYear, 5);
        setExpenses(recentExpenses);
        
        // Fetch monthly income
        const { getMonthlyIncome } = await import("@/lib/firestore");
        const income = await getMonthlyIncome(user.uid, currentMonthYear);
        setMonthlyIncome(income);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
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
    const [updatedBudgets, updatedExpenses] = await Promise.all([
      getBudgets(user.uid, currentMonthYear),
      getRecentExpenses(user.uid, currentMonthYear, 5)
    ]);
    
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
    const { addCategory } = await import("@/lib/firestore");
    await addCategory(user.uid, currentMonthYear, categoryName, initialAmount);
    
    // Refresh budgets
    const updatedBudgets = await getBudgets(user.uid, currentMonthYear);
    setBudgets(updatedBudgets);
  };

  const handleDeleteCategory = async (budgetId: string) => {
    if (!user) return;
    const { deleteCategory } = await import("@/lib/firestore");
    await deleteCategory(budgetId);
    
    // Refresh budgets
    const updatedBudgets = await getBudgets(user.uid, currentMonthYear);
    setBudgets(updatedBudgets);
  };

  const handleResetMonth = async () => {
    if (!user) return;
    const { resetMonthData } = await import("@/lib/firestore");
    await resetMonthData(user.uid, currentMonthYear);
    
    // Refresh both budgets and expenses
    const [updatedBudgets, updatedExpenses] = await Promise.all([
      getBudgets(user.uid, currentMonthYear),
      getRecentExpenses(user.uid, currentMonthYear, 5)
    ]);
    
    setBudgets(updatedBudgets);
    setExpenses(updatedExpenses);
  };

  const handleSetIncome = async (amount: number) => {
    if (!user) return;
    const { setMonthlyIncome: updateDbIncome } = await import("@/lib/firestore");
    await updateDbIncome(user.uid, currentMonthYear, amount);
    setMonthlyIncome(amount);
  };

  if (loading || !user || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate Summaries
  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-28">
      {/* Header */}
      <header className="bg-white px-6 pt-10 pb-6 rounded-b-[2rem] shadow-sm mb-6 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Halo, {user.displayName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm font-medium text-neutral-500 mt-1 capitalize">
            {monthName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
            onClick={() => router.push("/history")}
            title="Riwayat Bulanan"
          >
            <History className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-neutral-400 hover:text-neutral-900 bg-neutral-100/50 hover:bg-neutral-100"
            onClick={() => auth.signOut()}
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-5 space-y-8 max-w-md mx-auto">
        {/* Summary Cards */}
        <section className="flex flex-col gap-4">
          {/* Main Balance Card */}
          <Card className="rounded-[2rem] border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 p-4 opacity-10">
              <Wallet className="w-40 h-40" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-emerald-100 text-xs font-medium tracking-wide uppercase">Total Sisa Uang</p>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">{formatRupiah(Math.max(0, monthlyIncome - totalSpent))}</h2>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <div className="flex items-center text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Pendapatan
                    <SetIncomeModal 
                      currentIncome={monthlyIncome} 
                      monthName={monthName} 
                      onSetIncome={handleSetIncome} 
                    />
                  </div>
                  <p className="text-sm font-semibold">{formatRupiah(monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">Sisa Alokasi</p>
                  <p className="text-sm font-semibold">{formatRupiah(Math.max(0, monthlyIncome - totalAllocated))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5">
                <p className="text-neutral-500 text-xs font-medium mb-1">Terpakai Bulan Ini</p>
                <h2 className="text-lg font-bold tracking-tight text-rose-600">
                  {formatRupiah(totalSpent)}
                </h2>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5">
                <p className="text-neutral-500 text-xs font-medium mb-1">Total Alokasi Budget</p>
                <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                  {formatRupiah(totalAllocated)}
                </h2>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Budget Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-neutral-900">Alokasi Budget</h3>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {budgets.length} Kategori
              </span>
            </div>
            <AddCategoryModal onAddCategory={handleAddCategory} />
          </div>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = budget.spentAmount;
              const allocated = budget.allocatedAmount;
              const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
              const remaining = allocated - spent;
              
              // Progress bar coloring logic
              let progressColor = "bg-emerald-500";
              if (percent > 85) progressColor = "bg-rose-500";
              else if (percent > 65) progressColor = "bg-amber-400";

              return (
                <div key={budget.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900 text-sm">{budget.category}</h4>
                        <div className="flex items-center gap-1">
                          <EditBudgetModal budget={budget} onUpdateBudget={handleUpdateBudget} />
                          <DeleteCategoryModal budget={budget} onDeleteCategory={handleDeleteCategory} />
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Sisa {formatRupiah(remaining)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">{formatRupiah(spent)}</p>
                      <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                        dari {formatRupiah(allocated)}
                      </p>
                    </div>
                  </div>
                  {/* Native shadcn progress doesn't easily support dynamic indicator color injection via classname without !important or inline styles, so we build a custom visual track if needed, or just use inline styles */}
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900">Riwayat Terakhir</h3>
            {expenses.length > 0 && (
              <ResetMonthModal monthName={monthName} onReset={handleResetMonth} />
            )}
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden relative">
            {expenses.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-neutral-400">
                <Receipt className="w-10 h-10 text-neutral-200 mb-3" />
                <p className="text-sm font-medium text-neutral-500">Belum ada pengeluaran</p>
                <p className="text-xs mt-1 text-neutral-400">Catat transaksi pertamamu bulan ini!</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {expenses.map((expense) => {
                  const budget = budgets.find(b => b.id === expense.budgetId);
                  const expDate = expense.date && 'toDate' in expense.date 
                    ? expense.date.toDate() 
                    : new Date(); // Fallback
                    
                  return (
                    <div key={expense.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 line-clamp-1">
                            {expense.description || budget?.category || "Pengeluaran"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                              {budget?.category}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-neutral-200" />
                            <p className="text-[11px] text-neutral-400 font-medium">
                              {format(expDate, "d MMM", { locale: id })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-neutral-900 tracking-tight">
                        -{formatRupiah(expense.amount).replace("Rp", "").trim()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <AddExpenseModal budgets={budgets} onAddExpense={handleAddExpense} />
    </div>
  );
}
