'use client';

import React from 'react';
import { X, Pencil, Calendar, Coins, DollarSign, Info } from 'lucide-react';
import { HargaPoinItem, StatusHarga } from '@/types/harga-poin';

interface HargaPoinDetailModalProps {
  isOpen: boolean;
  item: HargaPoinItem | null;
  onClose: () => void;
  onEdit: (item: HargaPoinItem) => void;
}

export default function HargaPoinDetailModal({
  isOpen,
  item,
  onClose,
  onEdit,
}: HargaPoinDetailModalProps) {
  if (!isOpen || !item) return null;

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const statusStyle: Record<StatusHarga, string> = {
    Aktif: 'bg-green-100 text-green-700',
    Nonaktif: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-gray-900">
                {item.namaJenisSampah}
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Detail tarif harga dan reward poin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-[13.5px]">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Harga Beli Bank
                </span>
              </div>
              <p className="text-xl font-bold text-green-700">
                {formatRupiah(item.hargaPerSatuan)}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  /{item.satuan}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Reward Poin
                </span>
              </div>
              <p className="text-xl font-bold text-amber-600">
                {item.nilaiPoinPerSatuan}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  Poin/{item.satuan}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Mulai Berlaku
              </span>
              <span className="font-semibold text-gray-800">
                {item.berlakuMulai}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-gray-400" />
                Kategori
              </span>
              <span className="font-semibold text-gray-800">{item.kategori}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Satuan</span>
              <span className="font-semibold text-gray-800">{item.satuan}</span>
            </div>

            {item.keterangan && (
              <div className="pt-2 border-t border-gray-200/60">
                <span className="text-gray-500 flex items-center gap-1.5 mb-1">
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                  Keterangan Kondisi
                </span>
                <p className="text-gray-700 leading-relaxed">
                  {item.keterangan}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Ubah Data
          </button>
        </div>
      </div>
    </div>
  );
}