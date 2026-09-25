'use client';

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PengepulItem } from '@/types/pengepul';

interface PengepulDeleteModalProps {
  isOpen: boolean;
  item: PengepulItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (item: PengepulItem) => void;
}

export default function PengepulDeleteModal({
  isOpen,
  item,
  isSubmitting = false,
  onClose,
  onConfirm,
}: PengepulDeleteModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">Hapus Pengepul?</h3>
          <p className="text-xs text-gray-500">
            Data <span className="font-semibold">{item.namaPengepul}</span> beserta
            akun penggunanya akan dihapus secara permanen.
          </p>
        </div>
        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl disabled:opacity-60 transition-colors"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}