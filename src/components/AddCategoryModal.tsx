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
          <Button variant="outline" size="sm" className="h-7 text-xs font-medium text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100 rounded-full px-3" />
        }
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Kategori Baru
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Kategori Baru</DialogTitle>
          <DialogDescription>
            Buat kategori budget baru untuk bulan ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="flex items-center space-x-3">
            <div className="bg-neutral-100 p-2 rounded-lg">
              <Tag className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex-1">
              <Input
                id="categoryName"
                placeholder="Nama Kategori (Contoh: Baju)"
                className="h-12 border-neutral-200 focus-visible:ring-emerald-500"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-neutral-100 p-2 rounded-lg">
              <Wallet className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex-1">
              <Input
                id="budgetAmount"
                placeholder="Jatah Budget (Opsional)"
                className="text-lg font-medium h-12 border-neutral-200 focus-visible:ring-emerald-500"
                value={amount}
                onChange={(e) => setAmount(formatRupiah(e.target.value))}
                type="text"
                inputMode="numeric"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-medium"
            disabled={isLoading || !categoryName}
          >
            {isLoading ? "Menyimpan..." : "Tambah Kategori"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
