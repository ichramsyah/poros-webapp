"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowLeft, History, Receipt, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserProfile,
  getBudgets,
  getRecentExpenses,
  getAvailableMonths,
  getMonthlyIncome,
  Budget,
  Expense,
} from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<(Expense & {id: string})[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load available months once on mount
  useEffect(() => {
    async function loadMonths() {
      if (!user) return;
      try {
        await getUserProfile(user.uid, user.email || "", user.displayName || "");
        
        const months = await getAvailableMonths(user.uid);
        setAvailableMonths(months);
        
        if (months.length > 0) {
          // Default to the most recent month if available
          setSelectedMonth(months[0]);
        } else {
          // If no history, default to current month
          setSelectedMonth(format(new Date(), "yyyy-MM"));
        }
      } catch (error) {
        console.error("Failed to load available months:", error);
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
      try {
        const [userBudgets, monthExpenses, income] = await Promise.all([
          getBudgets(user.uid, selectedMonth),
          getRecentExpenses(user.uid, selectedMonth, 100), // fetch up to 100 expenses for history viewing
          getMonthlyIncome(user.uid, selectedMonth)
        ]);
        
        setBudgets(userBudgets);
        setExpenses(monthExpenses);
        setMonthlyIncome(income);
      } catch (error) {
        console.error("Failed to load history data:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    
    fetchMonthData();
  }, [user, selectedMonth]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthDisplay = (monthYearStr: string) => {
    if (!monthYearStr) return "";
    const date = parse(monthYearStr, "yyyy-MM", new Date());
    return format(date, "MMMM yyyy", { locale: id });
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white px-5 pt-8 pb-5 sticky top-0 z-40 border-b border-neutral-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full -ml-2 text-neutral-500 hover:text-neutral-900"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Riwayat Bulanan
          </h1>
        </div>

        {/* Month Selector */}
        {availableMonths.length > 0 ? (
          <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || "")}>
            <SelectTrigger className="w-full h-12 bg-neutral-50 border-neutral-200 rounded-xl font-medium focus:ring-emerald-500 text-base">
              <SelectValue placeholder="Pilih Bulan">
                {formatMonthDisplay(selectedMonth)}
              </SelectValue>
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
          <div className="h-12 bg-neutral-100 rounded-xl flex items-center px-4 text-neutral-400 font-medium text-sm border border-neutral-200">
            Belum ada riwayat tercatat
          </div>
        )}
      </header>

      <main className="px-5 mt-6 space-y-6 max-w-md mx-auto">
        {isLoadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
            {/* Quick Summary Row */}
            <Card className="rounded-[2xl] border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden mb-3">
              <CardContent className="p-5">
                <p className="text-emerald-100 text-[11px] uppercase tracking-wider font-bold mb-1">Total Sisa Uang</p>
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  {formatRupiah(Math.max(0, monthlyIncome - totalSpent))}
                </h2>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">Pendapatan</p>
                    <p className="font-medium">{formatRupiah(monthlyIncome)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider mb-0.5">Sisa Alokasi</p>
                    <p className="font-medium">{formatRupiah(Math.max(0, monthlyIncome - totalAllocated))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 mb-6">
               <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold mb-1">Total Alokasi</p>
                  <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                    {formatRupiah(totalAllocated)}
                  </h2>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                  <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold mb-1">Terpakai</p>
                  <h2 className="text-lg font-bold tracking-tight text-rose-600">
                    {formatRupiah(totalSpent)}
                  </h2>
                </CardContent>
              </Card>
            </div>

            {/* Expenses List */}
            <section>
              <h3 className="text-base font-bold text-neutral-900 mb-3 flex items-center justify-between">
                <span>Rincian Pengeluaran</span>
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  {expenses.length} Trx
                </span>
              </h3>
              
              <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden relative">
                {expenses.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-neutral-400">
                    <p className="text-sm font-medium text-neutral-500">Tidak ada pengeluaran</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {expenses.map((expense) => {
                      const budget = budgets.find(b => b.id === expense.budgetId);
                      const expDate = expense.date && 'toDate' in expense.date 
                        ? expense.date.toDate() 
                        : new Date();
                        
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
                                  {format(expDate, "d MMM, HH:mm", { locale: id })}
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
          </>
        )}
      </main>
    </div>
  );
}
