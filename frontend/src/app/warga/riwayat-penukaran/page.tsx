'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import {
  ChevronDown,
  Calendar,
  Clock,
  Gift,
  Ticket,
  Smartphone,
  Leaf,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchRiwayatPenukaran,
  fetchSaldoPoin,
  RiwayatItem,
  PaginationData,
} from '@/services/wargaPenukaranPoinService';

// Format date to Indonesian localized date
function formatIndoDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// Format time from datetime string
function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// Get reward icon based on name
function getRewardIcon(name: string) {
  const value = name.toLowerCase();
  if (value.includes('pulsa') || value.includes('kuota') || value.includes('internet')) return Smartphone;
  if (value.includes('voucher') || value.includes('belanja')) return Ticket;
  if (value.includes('tas') || value.includes('tumbler') || value.includes('tanaman')) return Leaf;
  return Gift;
}

// Get reward icon style
function getRewardIconStyle(name: string) {
  const value = name.toLowerCase();
  if (value.includes('pulsa') || value.includes('kuota') || value.includes('internet')) {
    return { wrapper: 'bg-blue-50', icon: 'text-blue-500' };
  }
  if (value.includes('voucher') || value.includes('belanja')) {
    return { wrapper: 'bg-green-50', icon: 'text-green-600' };
  }
  if (value.includes('tas') || value.includes('tumbler') || value.includes('tanaman')) {
    return { wrapper: 'bg-emerald-50', icon: 'text-emerald-600' };
  }
  return { wrapper: 'bg-gray-50', icon: 'text-gray-500' };
}

export default function RiwayatPenukaranPage() {
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0,
  });

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchRiwayatPenukaran(currentPage, 10, sortOrder);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary stats
  const totalPoinDigunakan = data.reduce((sum, item) => sum + (item.poin_digunakan || 0), 0);

  return (
    <div className="w-full pb-16 font-sans">
      {/* Header */}
      <AdminHeader
        title="Riwayat Penukaran Poin"
        subtitle="Lihat riwayat penukaran poin Anda."
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Gift className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Penukaran</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {pagination.total} kali
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Gift className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Poin Digunakan</p>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                {totalPoinDigunakan.toLocaleString('id-ID')} poin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-end mb-4">
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'terbaru' | 'terlama')}
            className="bg-white border border-gray-200/90 rounded-lg sm:rounded-xl px-3.5 py-1.5 text-xs font-medium text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#16a34a] shadow-xs cursor-pointer appearance-none"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#16a34a] mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">Memuat riwayat penukaran...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 mx-auto mb-3">
            <Gift className="h-7 w-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900">
            Tidak Ada Riwayat Penukaran
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Belum ada riwayat penukaran poin.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Voucher</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Poin Digunakan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const RewardIcon = getRewardIcon(item.nama_voucher);
                  const iconStyle = getRewardIconStyle(item.nama_voucher);

                  return (
                    <tr key={item.penukaran_id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyle.wrapper}`}>
                            <RewardIcon className={`h-4.5 w-4.5 ${iconStyle.icon}`} strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.nama_voucher}</p>
                            <p className="text-[11px] text-gray-400">#{item.penukaran_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatIndoDate(item.tanggal_pengajuan)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatTime(item.tanggal_pengajuan) || '-'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-bold text-rose-600">
                          -{item.poin_digunakan.toLocaleString('id-ID')} poin
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-[#16a34a] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
            disabled={currentPage === pagination.last_page}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-gray-900">Informasi</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Penukaran poin dilakukan secara langsung. Setiap penukaran akan langsung mengurangi saldo poin Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
