'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PengepulItem, StatusUser } from '@/types/pengepul';

interface PengepulDetailModalProps {
  isOpen: boolean;
  item: PengepulItem | null;
  onClose: () => void;
  onEdit: (item: PengepulItem) => void;
}

function StatusPill({ status }: { status: StatusUser }) {
  if (status === 'aktif') {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700">
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700">
      Nonaktif
    </span>
  );
}

export default function PengepulDetailModal({
  isOpen,
  item,
  onClose,
  onEdit,
}: PengepulDetailModalProps) {
  if (!isOpen || !item) return null;

  const rows = [
    { label: 'Nama Pengepul', value: item.namaPengepul },
    { label: 'Username', value: item.user?.username || '-' },
    { label: 'Email', value: item.user?.email || '-' },
    { label: 'No. Telepon', value: item.noTelepon || '-' },
    { label: 'Alamat', value: item.alamat || '-' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Detail Pengepul</h3>
            <p className="text-xs text-gray-400">
              Informasi lengkap data pengepul.
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
              <p className="text-sm font-bold text-gray-900">{item.namaPengepul}</p>
              <p className="text-[11px] text-gray-500">{item.user?.email || '-'}</p>
            </div>
            <StatusPill status={item.user?.status ?? 'aktif'} />
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
            onClick={() => onEdit(item)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors"
          >
            Ubah Data
          </button>
        </div>
      </div>
    </div>
  );
}