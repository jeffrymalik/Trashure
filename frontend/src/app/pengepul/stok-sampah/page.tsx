'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Weight,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import WasteIcon from '@/components/common/WasteIcon';

interface StokItem {
  stok_id: number;
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  jumlah_stok: number;
  satuan: string;
  harga_per_kg: number;
  total_nilai: number;
  terakhir_diperbarui?: string | null;
}

interface StokRow {
  stok_id: number;
  jenis_sampah_id: number;
  jumlah_stok: number;
  satuan: string;
  harga_per_kg?: number;
  total_nilai?: number;
  terakhir_diperbarui?: string | null;
  jenis_sampah?: {
    nama_jenis_sampah?: string;
    satuan?: string;
  };
}

function formatRupiah(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function formatKg(value: number): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' kg';
}

const ADMIN_WHATSAPP = '6288213448685'; // Nomor WhatsApp admin

function hubungiAdmin(jenisSampah?: string, stok?: number) {
  let pesan = 'Halo Admin Trashure, saya pengepul.';
  if (jenisSampah) {
    pesan += `\n\nSaya tertarik dengan sampah "${jenisSampah}"`;
    if (stok) {
      pesan += ` (stok tersedia: ${stok} kg)`;
    }
    pesan += '.\nMohon info lebih lanjut. Terima kasih.';
  } else {
    pesan += '\n\nSaya ingin menanyakan ketersediaan stok sampah.\nTerima kasih.';
  }
  const encoded = encodeURIComponent(pesan);
  window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encoded}`, '_blank');
}

export default function StokSampahPage() {
  const [data, setData] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  };

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('trashure_token') : null;
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/pengepul/stok`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: StokItem[] = json.data.map((row: StokRow) => {
            const jenis = row.jenis_sampah || {};
            const nama = jenis.nama_jenis_sampah || 'Sampah';
            const jumlah = Number(row.jumlah_stok) || 0;
            const satuan = row.satuan || jenis.satuan || 'kg';
            const hargaPerKg = Number(row.harga_per_kg) || 0;
            const totalNilai = Number(row.total_nilai) || (hargaPerKg * jumlah);
            return {
              stok_id: row.stok_id,
              jenis_sampah_id: row.jenis_sampah_id,
              nama_jenis_sampah: nama,
              jumlah_stok: jumlah,
              satuan,
              harga_per_kg: hargaPerKg,
              total_nilai: totalNilai,
              terakhir_diperbarui: row.terakhir_diperbarui || null,
            };
          });
          setData(mapped);
          setError(false);
          return;
        }
      }
      setError(true);
    } catch (err) {
      console.warn('Could not connect to backend:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        searchQuery &&
        !item.nama_jenis_sampah.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data, searchQuery]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const totalBerat = data.reduce((acc, d) => acc + d.jumlah_stok, 0);
    const stokTerbanyak = data.reduce((max, d) => d.jumlah_stok > max.jumlah_stok ? d : max, data[0]);
    return { totalBerat, stokTerbanyak, totalJenis: data.length };
  }, [data]);

  return (
    <div className="w-full pb-10">
      <AdminHeader
        title="Stok Sampah"
        subtitle="Pantau jumlah stok sampah yang tersedia beserta harga per jenis sampah."
        breadcrumbs={[
          { label: 'Dashboard', href: '/pengepul/dashboard' },
          { label: 'Stok Sampah' },
        ]}
      />

      {error && !loading && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">
            Tidak dapat terhubung ke server, silakan coba lagi nanti.
          </span>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Muat Ulang
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Stok Tersedia</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Weight className="h-4.5 w-4.5 text-[#16a34a]" strokeWidth={1.8} />
            </span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{formatKg(stats.totalBerat)}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Stok Terbanyak</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Package className="h-4.5 w-4.5 text-[#16a34a]" strokeWidth={1.8} />
            </span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {loading ? '...' : (stats.stokTerbanyak?.nama_jenis_sampah || '-')}
          </p>
          <p className="text-[11px] text-gray-400">
            {loading ? '' : formatKg(stats.stokTerbanyak?.jumlah_stok || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Jenis Sampah</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Package className="h-4.5 w-4.5 text-[#16a34a]" strokeWidth={1.8} />
            </span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalJenis} jenis</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari jenis sampah..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => hubungiAdmin()}
              className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi Admin
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          Total {totalItems} jenis stok sampah
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg sm:rounded-xl bg-white border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-5 text-center w-12">No</th>
                <th className="py-3 px-5 min-w-[220px]">Jenis Sampah</th>
                <th className="py-3 px-5 text-right w-36">Stok</th>
                <th className="py-3 px-5 text-right w-36">Harga / kg</th>
                <th className="py-3 px-5 text-right w-40">Total Nilai</th>
                <th className="py-3 px-5 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-300" />
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-medium">Tidak ada data stok sampah yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const itemIndex = startIndex + idx + 1;
                  return (
                    <tr key={item.stok_id || item.jenis_sampah_id || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 text-center text-xs font-medium text-gray-500">
                        {itemIndex}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <WasteIcon type={item.nama_jenis_sampah} size={20} />
                          <div>
                            <span className="font-semibold text-gray-800 text-sm block">
                              {item.nama_jenis_sampah}
                            </span>
                            <span className="text-[11px] text-gray-400">Satuan {item.satuan}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right font-semibold text-gray-800">
                        {formatKg(item.jumlah_stok)}
                      </td>
                      <td className="py-3 px-5 text-right font-medium text-gray-600">
                        {item.harga_per_kg > 0 ? formatRupiah(item.harga_per_kg) : (
                          <span className="text-gray-300 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-[#16a34a]">
                        {formatRupiah(item.total_nilai)}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => hubungiAdmin(item.nama_jenis_sampah, item.jumlah_stok)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0fdf4] text-[#16a34a] border border-green-200 text-[11px] font-semibold hover:bg-green-100 transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Tanya
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Menampilkan {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} dari {totalItems} jenis stok sampah
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition ${isActive ? 'bg-[#16a34a] text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}