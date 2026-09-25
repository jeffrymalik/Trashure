'use client';

import React from 'react';
import { X } from 'lucide-react';
import { StatusVoucher, VoucherItem } from '@/types/voucher';
import { formatPoin, labelStatus } from '@/services/voucherService';

interface VoucherDetailModalProps {
  isOpen: boolean;
  item: VoucherItem | null;
  onClose: () => void;
  onEdit: (item: VoucherItem) => void;
}

function StatusPill({ status }: { status: StatusVoucher }) {
  const map: Record<StatusVoucher, string> = {
    tersedia: 'bg-green-100 text-green-700',
    habis: 'bg-red-100 text-red-700',
    tidak_aktif: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status]}`}
    >
      {labelStatus(status)}
    </span>
  );
}

export default function VoucherDetailModal({
  isOpen,
  item,
  onClose,
  onEdit,
}: VoucherDetailModalProps) {
  if (!isOpen || !item) return null;

  const rows = [
    { label: 'Nama Voucher', value: item.namaVoucher },
    { label: 'Poin Ditukar', value: `${formatPoin(item.poinDibutuhkan)} poin` },
    {
      label: 'Jumlah Tersedia',
      value: `${item.jumlahTersedia.toLocaleString('id-ID')} voucher`,
    },
    {
      label: 'Total Ditukar',
      value: `${(item.totalDitukar ?? 0).toLocaleString('id-ID')} voucher`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Detail Voucher</h3>
            <p className="text-xs text-gray-400">
              Informasi lengkap voucher penukaran poin.
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
          <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <div>
              <p className="text-sm font-bold text-gray-900">{item.namaVoucher}</p>
              <p className="text-[11px] text-gray-500">Voucher penukaran poin warga</p>
            </div>
            <StatusPill status={item.status} />
          </div>

          <dl className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4"
              >
                <dt className="text-[11px] font-semibold text-gray-400 uppercase">
                  {row.label}
                </dt>
                <dd className="text-sm font-medium text-gray-700 text-right break-words max-w-[60%]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {item.deskripsi && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                Deskripsi Voucher
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.deskripsi}
              </p>
            </div>
          )}
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
            type="button"
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors"
          >
            Ubah Data
          </button>
        </div>
      </div>
    </div>
  );
}