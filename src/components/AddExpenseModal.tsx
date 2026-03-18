"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { Plus, Wallet, Tag, AlignLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget } from "@/lib/firestore";

interface AddExpenseModalProps {
  budgets: Budget[];
  onAddExpense: (
    amount: number,
    budgetId: string,
    description: string,
    date: Date
  ) => Promise<void>;
}

export function AddExpenseModal({ budgets, onAddExpense }: AddExpenseModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [budgetId, setBudgetId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !budgetId || !dateStr) return;

    setIsLoading(true);
    try {
      await onAddExpense(
        Number(amount.replace(/[^0-9]/g, "")),
        budgetId,
        description,
        new Date(dateStr)
      );
      setOpen(false);
      
      // Reset form
      setAmount("");
      setBudgetId("");
      setDescription("");
      setDateStr(format(new Date(), "yyyy-MM-dd"));
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (value: string) => {
    const rawValue = value.replace(/[^0-9]/g, "");
    if (!rawValue) return "";
    return `Rp ${new Intl.NumberFormat("id-ID").format(Number(rawValue))}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button
            size="icon"
            className="fixed bottom-[104px] right-6 w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-poros-600 hover:bg-poros-700 text-white transition-all transform hover:-translate-y-1 z-40"
          />
        }
      >
        <Plus className="w-6 h-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tambah Pengeluaran</DialogTitle>
          <DialogDescription>
            Catat detail pengeluaran barumu di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-neutral-100 p-2 rounded-lg">
                <Wallet className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <Input
                  id="amount"
                  placeholder="Rp 0"
                  className="text-lg font-medium h-12 border-neutral-200 focus-visible:ring-poros-500"
                  value={amount}
                  onChange={(e) => setAmount(formatRupiah(e.target.value))}
                  type="text"
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-neutral-100 p-2 rounded-lg">
                <Tag className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <Select value={budgetId} onValueChange={(val) => setBudgetId(val || "")} required>
                  <SelectTrigger className="h-12 border-neutral-200 focus:ring-poros-500 bg-white">
                    <SelectValue placeholder="Pilih Kategori">
                      {budgetId ? budgets.find(b => b.id === budgetId)?.category : "Pilih Kategori"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-neutral-100 p-2 rounded-lg mt-1">
                <AlignLeft className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <Input
                  id="description"
                  placeholder="Catatan (Opsional)"
                  className="h-12 border-neutral-200 focus-visible:ring-poros-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-neutral-100 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <Input
                  id="date"
                  type="date"
                  className="h-12 border-neutral-200 focus-visible:ring-poros-500"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-poros-600 hover:bg-poros-700 text-white rounded-xl text-base font-medium"
            disabled={isLoading || !amount || !budgetId || !dateStr}
          >
            {isLoading ? "Menyimpan..." : "Simpan Pengeluaran"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
