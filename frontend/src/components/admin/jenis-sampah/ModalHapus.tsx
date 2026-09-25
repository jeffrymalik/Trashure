'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { JenisSampahItem } from './ModalTambahEdit';

interface ModalHapusProps {
  isOpen: boolean;
  item: JenisSampahItem | null;
  onClose: () => void;
  onConfirm: (item: JenisSampahItem) => Promise<void>;
}

export default function ModalHapus({
  isOpen,
  item,
  onClose,
  onConfirm,
}: ModalHapusProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm(item);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 text-center">
            Hapus Jenis Sampah?
          </h3>
          <p className="text-xs text-gray-500 mt-1 text-center leading-relaxed">
            Apakah Anda yakin ingin menghapus data{' '}
            <strong className="text-gray-800">&ldquo;{item.nama_jenis_sampah}&rdquo;</strong>{' '}
            ? Tindakan ini tidak dapat dibatalkan.
          </p>

          {error && (
            <div className="mt-4 p-2.5 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}