"use client";

import { useState, useEffect } from "react";
import { Edit2, Wallet } from "lucide-react";
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
import { Budget } from "@/lib/firestore";

interface EditBudgetModalProps {
  budget: Budget;
  onUpdateBudget: (budgetId: string, amount: number) => Promise<void>;
}

export function EditBudgetModal({ budget, onUpdateBudget }: EditBudgetModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(formatRupiah(budget.allocatedAmount.toString()));
    }
  }, [open, budget.allocatedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsLoading(true);
    try {
      await onUpdateBudget(budget.id, Number(amount.replace(/[^0-9]/g, "")));
      setOpen(false);
    } catch (error) {
      console.error("Failed to update budget:", error);
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
        render={<button className="text-neutral-400 hover:text-poros-600 transition-colors p-1 cursor-pointer" />}
      >
        <Edit2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Atur Jatah {budget.category}</DialogTitle>
          <DialogDescription>
            Masukkan nominal budget bulanan untuk kategori ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="flex items-center space-x-3">
            <div className="bg-poros-100 p-2 rounded-lg">
              <Wallet className="w-4 h-4 text-poros-600" />
            </div>
            <div className="flex-1">
              <Input
                id="budgetAmount"
                placeholder="Rp 0"
                className="text-lg font-medium h-12 border-neutral-200 focus-visible:ring-poros-500"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                type="text"
                inputMode="numeric"
                autoFocus
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-poros-600 hover:bg-poros-700 text-white rounded-xl text-base font-medium"
            disabled={isLoading || !amount}
          >
            {isLoading ? "Menyimpan..." : "Simpan Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
