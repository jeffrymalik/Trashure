'use client';

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { HargaPoinItem } from '@/types/harga-poin';

interface HargaPoinDeleteModalProps {
  isOpen: boolean;
  item: HargaPoinItem | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (item: HargaPoinItem) => void;
}

export default function HargaPoinDeleteModal({
  isOpen,
  item,
  isLoading = false,
  onClose,
  onConfirm,
}: HargaPoinDeleteModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 text-center">
            Hapus Data Harga & Poin?
          </h3>
          <p className="text-xs text-gray-500 mt-1 text-center leading-relaxed">
            Apakah Anda yakin ingin menghapus data tarif untuk{' '}
            <strong className="text-gray-800">{item.namaJenisSampah}</strong> (
            {item.kategori})? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item)}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}