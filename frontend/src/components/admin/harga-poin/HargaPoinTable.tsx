'use client';

import React from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { HargaPoinItem, StatusHarga } from '@/types/harga-poin';

interface HargaPoinTableProps {
  items: HargaPoinItem[];
  totalData: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onView: (item: HargaPoinItem) => void;
  onEdit: (item: HargaPoinItem) => void;
  onDelete: (item: HargaPoinItem) => void;
}

function StatusBadge({ status }: { status: StatusHarga }) {
  if (status === 'Aktif') {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700">
        Aktif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600">
      Nonaktif
    </span>
  );
}

export default function HargaPoinTable({
  items,
  totalData,
  currentPage,
  itemsPerPage,
  isLoading = false,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: HargaPoinTableProps) {
  const totalPages = Math.ceil(totalData / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + items.length, totalData);
  const lastPage = Math.max(totalPages, 1);

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10 sm:w-12 lg:w-14">
                No
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Jenis Sampah
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Satuan
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Poin
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Berlaku Mulai
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-center text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 sm:px-4 lg:px-5 py-8 sm:py-12 text-center text-xs sm:text-sm text-gray-400"
                >
                  <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin mx-auto mb-2 text-gray-300" />
                  Memuat data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 sm:px-4 lg:px-5 py-8 sm:py-12 text-center text-xs sm:text-sm text-gray-400"
                >
                  Tidak ada data harga & poin ditemukan.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const rowNumber = startIndex + idx + 1;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm text-gray-500">
                      {rowNumber}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3">
                      <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 truncate">
                        {item.namaJenisSampah}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{item.kategori}</p>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                      {item.satuan}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-bold text-green-700 whitespace-nowrap">
                      {formatRupiah(item.hargaPerSatuan)}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 whitespace-nowrap">
                      {item.nilaiPoinPerSatuan}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                      {item.berlakuMulai}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => onView(item)}
                          className="p-1 sm:p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Detail"
                        >
                          <Eye className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 sm:p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1 sm:p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3 border-t border-gray-100">
        <p className="text-[9px] sm:text-[10px] lg:text-[11px] text-gray-400">
          Menampilkan {totalData > 0 ? startIndex + 1 : 0} - {endIndex} dari{' '}
          {totalData} data
        </p>
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <ChevronLeft className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-md text-xs font-bold transition-colors flex-shrink-0 ${
                currentPage === page
                  ? 'bg-[#16a34a] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}