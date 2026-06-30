"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Budget } from "@/lib/firestore";

interface DeleteCategoryModalProps {
  budget: Budget;
  onDeleteCategory: (budgetId: string) => Promise<void>;
}

export function DeleteCategoryModal({ budget, onDeleteCategory }: DeleteCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDeleteCategory(budget.id);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<button className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer" />}
      >
        <Trash2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-rose-500 flex items-center gap-2">
            Hapus Kategori
          </DialogTitle>
          <DialogDescription className="text-base pt-2 text-zinc-400">
            Apakah kamu yakin ingin menghapus kategori <strong className="text-white">{budget.category}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-rose-300 bg-rose-950/10 p-3 rounded-xl border border-rose-900/20">
            <strong>Peringatan:</strong> Menghapus kategori ini tidak akan menghapus riwayat transaksinya, tetapi kategori ini akan hilang dari laporan bulan ini.
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-start pt-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl h-11 border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 cursor-pointer"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex-1 rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
