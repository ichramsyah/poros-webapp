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
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-rose-600 flex items-center gap-2">
            Hapus Kategori
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Apakah kamu yakin ingin menghapus kategori <strong className="text-neutral-900">{budget.category}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-neutral-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
            <strong>Peringatan:</strong> Menghapus kategori ini tidak akan menghapus riwayat transaksinya, tetapi kategori ini akan hilang dari laporan bulan ini.
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-start pt-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl h-11"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex-1 rounded-xl h-11 bg-rose-600 hover:bg-rose-700"
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
