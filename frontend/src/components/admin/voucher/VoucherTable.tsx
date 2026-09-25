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
import { VoucherItem, StatusVoucher } from '@/types/voucher';
import { formatPoin, labelStatus } from '@/services/voucherService';

interface VoucherTableProps {
  items: VoucherItem[];
  totalData: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onView: (item: VoucherItem) => void;
  onEdit: (item: VoucherItem) => void;
  onDelete: (item: VoucherItem) => void;
}

function StatusBadge({ status }: { status: StatusVoucher }) {
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

export default function VoucherTable({
  items,
  totalData,
  currentPage,
  itemsPerPage,
  isLoading = false,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: VoucherTableProps) {
  const totalPages = Math.ceil(totalData / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + items.length, totalData);
  const lastPage = Math.max(totalPages, 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-14">
                No
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Nama Voucher
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Poin Ditukar
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Tersedia
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Ditukar
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-gray-400"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-300" />
                  Memuat data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-gray-400"
                >
                  Tidak ada data voucher ditemukan.
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
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {rowNumber}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-700">
                        {item.namaVoucher}
                      </p>
                      {item.deskripsi && (
                        <p className="text-xs text-gray-400 max-w-[220px] truncate">
                          {item.deskripsi}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-amber-600">
                      {formatPoin(item.poinDibutuhkan)} poin
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {item.jumlahTersedia.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {(item.totalDitukar ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Menampilkan {totalData > 0 ? startIndex + 1 : 0} - {endIndex} dari{' '}
          {totalData} voucher
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors ${
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
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}