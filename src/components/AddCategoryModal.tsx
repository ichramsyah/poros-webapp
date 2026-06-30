"use client";

import { useState } from "react";
import { Plus, Tag, Wallet } from "lucide-react";
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

interface AddCategoryModalProps {
  onAddCategory: (categoryName: string, initialAmount: number) => Promise<void>;
}

export function AddCategoryModal({ onAddCategory }: AddCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    setIsLoading(true);
    try {
      await onAddCategory(
        categoryName,
        amount ? Number(amount.replace(/[^0-9]/g, "")) : 0
      );
      setOpen(false);
      setCategoryName("");
      setAmount("");
    } catch (error) {
      console.error("Failed to add category:", error);
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
          <Button variant="outline" size="sm" className="h-7 text-xs font-semibold text-poros-500 bg-poros-100/10 border border-poros-100/20 hover:bg-poros-100/20 rounded-full px-3 cursor-pointer" />
        }
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Kategori Baru
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Kategori Baru</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Buat kategori budget baru untuk bulan ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-800 p-2.5 rounded-lg border border-zinc-700">
              <Tag className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1">
              <Input
                id="categoryName"
                placeholder="Nama Kategori (Contoh: Baju)"
                className="h-12 border-zinc-800 bg-zinc-950 text-white focus-visible:ring-poros-500 rounded-xl"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-zinc-800 p-2.5 rounded-lg border border-zinc-700">
              <Wallet className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1">
              <Input
                id="budgetAmount"
                placeholder="Jatah Budget"
                className="text-lg font-semibold h-12 border-zinc-800 bg-zinc-950 text-white focus-visible:ring-poros-500 rounded-xl"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                type="text"
                inputMode="numeric"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-poros-500 hover:bg-poros-600 text-black rounded-xl text-base font-bold cursor-pointer"
            disabled={isLoading || !categoryName}
          >
            {isLoading ? "Menyimpan..." : "Tambah Kategori"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
