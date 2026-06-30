'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

interface ResetMonthModalProps {
  monthName: string;
  onReset: () => Promise<void>;
}

export function ResetMonthModal({ monthName, onReset }: ResetMonthModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await onReset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to reset month data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-7 text-xs font-semibold text-poros-500 bg-poros-100/10 border border-poros-100/20 hover:bg-poros-100/20 rounded-full px-3 cursor-pointer" />}>
        <RotateCcw className="w-3 h-3 mr-1.5" /> Reset Data
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[400px] p-5 sm:p-6 rounded-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto border border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-rose-500 flex items-center gap-2">Reset Data {monthName}</DialogTitle>
          <DialogDescription className="text-base pt-2 text-zinc-400">
            Apakah kamu yakin ingin <strong>menghapus semua riwayat pengeluaran</strong> di bulan ini?
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-rose-300 bg-rose-950/10 p-3 rounded-xl border border-rose-900/20">
            <strong>Perhatian:</strong> Kategori budget kamu akan tetap ada (tidak terhapus) dan jatah/alokasinya tidak berubah. Hanya &quot;Bulan Ini Terpakai&quot; yang akan kembali menjadi Rp 0.
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:flex-1 rounded-xl h-11 border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 cursor-pointer" disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleReset} className="w-full sm:flex-1 rounded-xl h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer" disabled={isLoading}>
            {isLoading ? 'Mereset...' : 'Ya, Reset Permanen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
