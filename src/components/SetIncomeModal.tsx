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
import { Label } from "@/components/ui/label";

interface SetIncomeModalProps {
  currentIncome: number;
  monthName: string;
  onSetIncome: (amount: number) => Promise<void>;
}

export function SetIncomeModal({ currentIncome, monthName, onSetIncome }: SetIncomeModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when opened or prop changes
  useEffect(() => {
    if (open) {
      setAmount(formatRupiah(currentIncome.toString()));
    }
  }, [open, currentIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsLoading(true);
    try {
      await onSetIncome(Number(amount.replace(/[^0-9]/g, "")));
      setOpen(false);
    } catch (error) {
      console.error("Failed to set income:", error);
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
            variant="ghost" 
            size="sm" 
            className="h-5 px-1.5 text-[9px] font-bold text-zinc-400 hover:text-white border border-zinc-800 rounded-md hover:bg-zinc-800 ml-2 transition-all cursor-pointer shadow-sm"
          />
        }
      >
        <Edit2 className="w-3 h-3 mr-1" /> Edit
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] p-5 sm:p-6 rounded-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-white">Cair Gajian? 💸</DialogTitle>
          <DialogDescription className="text-sm pt-1.5 text-zinc-400">
            Atur total pendapatan untuk <strong className="text-zinc-200">{monthName}</strong> agar kamu bisa mantau persentase alokasi dana dan sisa uang bersih.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          <div className="space-y-3">
            <Label htmlFor="income" className="text-sm font-semibold text-zinc-300">Total Pendapatan</Label>
            <div className="flex items-center space-x-3">
              <div className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700">
                <Wallet className="w-5 h-5 text-poros-500" />
              </div>
              <div className="flex-1">
                <Input
                  id="income"
                  placeholder="Rp 0"
                  className="text-lg font-semibold h-12 border-zinc-800 bg-zinc-950 text-white focus-visible:ring-poros-500 rounded-xl"
                  value={amount}
                  onChange={(e) => setAmount(formatRupiah(e.target.value))}
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                />
              </div>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-poros-500 hover:bg-poros-600 text-black rounded-xl text-base font-bold cursor-pointer"
            disabled={isLoading || !amount}
          >
            {isLoading ? "Menyimpan..." : "Simpan Pendapatan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
