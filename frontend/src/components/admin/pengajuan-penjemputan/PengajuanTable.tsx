'use client';

import React from 'react';
import { Eye, Calendar, Loader2 } from 'lucide-react';
import { PengajuanPenjemputan } from '@/services/adminPengajuanService';

interface PengajuanTableProps {
  items: PengajuanPenjemputan[];
  totalData: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onView: (item: PengajuanPenjemputan) => void;
  onSchedule: (item: PengajuanPenjemputan) => void;
}

const statusBadgeClass: Record<string, string> = {
  diajukan: 'bg-blue-100 text-blue-800',
  dijadwalkan: 'bg-yellow-100 text-yellow-800',
  diproses: 'bg-purple-100 text-purple-800',
  selesai: 'bg-green-100 text-green-800',
  dibatalkan: 'bg-red-100 text-red-800',
  ditolak: 'bg-red-100 text-red-800',
};

export default function PengajuanTable({
  items,
  totalData,
  currentPage,
  itemsPerPage,
  isLoading,
  onPageChange,
  onView,
  onSchedule,
}: PengajuanTableProps) {
  const totalPages = Math.ceil(totalData / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tanggal Pengajuan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama Warga</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Alamat</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Est. Berat</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      Tidak ada data pengajuan penjemputan
                    </p>
                    <p className="text-xs text-gray-400">
                      Belum ada pengajuan yang cocok dengan filter saat ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
              <tr key={item.pengajuan_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex flex-col">
                    <span>{formatDate(item.tanggal_pengajuan)}</span>
                    <span className="text-xs text-gray-500">
                      {formatTime(item.tanggal_pengajuan)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.warga?.nama_warga || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                  {item.alamat_penjemputan}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.perkiraan_total_berat} kg
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusBadgeClass[item.status_pengajuan] ||
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status_pengajuan}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    {item.status_pengajuan === 'diajukan' && (
                      <button
                        onClick={() => onSchedule(item)}
                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Jadwalkan Penjemputan"
                      >
                        <Calendar className="w-4 h-4 text-yellow-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan {items.length} dari {totalData} data
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
