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
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-7 text-xs font-medium text-poros-600 bg-poros-50 border-poros-100 hover:bg-poros-100 rounded-full px-3" />}>
        <RotateCcw className="w-3 h-3 mr-1.5" /> Reset Data
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[400px] p-5 sm:p-6 rounded-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-rose-600 flex items-center gap-2">Reset Data {monthName}</DialogTitle>
          <DialogDescription className="text-base pt-2 text-neutral-600">
            Apakah kamu yakin ingin <strong>menghapus semua riwayat pengeluaran</strong> di bulan ini?
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-neutral-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
            <strong>Perhatian:</strong> Kategori budget kamu akan tetap ada (tidak terhapus) dan jatah/alokasinya tidak berubah. Hanya "Bulan Ini Terpakai" yang akan kembali menjadi Rp 0.
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:flex-1 rounded-xl h-11" disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleReset} className="w-full sm:flex-1 rounded-xl h-11 bg-rose-600 hover:bg-rose-700 font-medium" disabled={isLoading}>
            {isLoading ? 'Mereset...' : 'Ya, Reset Permanen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
