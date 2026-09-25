'use client';

import { useEffect, useState } from 'react';
import { Truck, CheckCircle, Clock, Weight } from 'lucide-react';
import AdminHeader from '@/components/layout/header';
import { fetchPetugasDashboard, DashboardData, DEFAULT_DASHBOARD_DATA } from '@/services/petugasDashboardService';

export default function PetugasDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      const data = await fetchPetugasDashboard();
      setDashboard(data);
      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      dijadwalkan: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Dijadwalkan' },
      sedang_diproses: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Sedang Diproses' },
      selesai: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      dibatalkan: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' },
    };

    const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return statusConfig;
  };

  return (
    <div className="w-full">
      <AdminHeader
        title="Dashboard Petugas"
        subtitle="Ringkasan tugas penjemputan dan setoran hari ini."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 lg:mb-6 px-1 sm:px-0">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm text-gray-500">Penjemputan Hari Ini</p>
            <Truck className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLoading ? '-' : dashboard.penjemputan_hari_ini}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm text-gray-500">Selesai</p>
            <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#16a34a]">
            {isLoading ? '-' : dashboard.penjemputan_selesai}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm text-gray-500">Menunggu</p>
            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-500">
            {isLoading ? '-' : dashboard.penjemputan_menunggu}
          </p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm text-gray-500">Total Setoran</p>
            <Weight className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLoading ? '-' : `${dashboard.total_setoran_dikumpul.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200/80 bg-gray-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tugas Penjemputan Hari Ini</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Daftar jadwal penjemputan yang dijadwalkan untuk hari ini</p>
        </div>

        {/* Desktop Table - hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50">
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide">No</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide">Waktu</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">Nama Warga</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">Alamat</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">Telepon</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide">Sampah</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">Berat</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-[9px] sm:text-[10px] lg:text-xs font-semibold text-gray-700 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : dashboard.jadwal_hari_ini.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                    Tidak ada jadwal penjemputan terbaru hari ini.
                  </td>
                </tr>
              ) : (
                dashboard.jadwal_hari_ini.map((jadwal, idx) => {
                  const statusConfig = getStatusBadge(jadwal.status_jadwal);
                  return (
                    <tr key={jadwal.jadwal_id} className="border-b border-gray-200/80 hover:bg-gray-50/50 transition-colors">
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm font-medium text-gray-900 whitespace-nowrap">{formatTime(jadwal.waktu_penjemputan)}</td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm text-gray-700 truncate">{jadwal.nama_warga}</td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm text-gray-700 truncate">{jadwal.alamat_penjemputan}</td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm text-gray-700 truncate whitespace-nowrap">{jadwal.no_telepon}</td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm text-gray-700">
                        <div className="space-y-0.5 sm:space-y-1">
                          {jadwal.detail_sampah.map((sampah, sIdx) => (
                            <div key={sIdx} className="text-[9px] sm:text-xs truncate">
                              {sampah.jenis_sampah}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-[10px] sm:text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                        {jadwal.perkiraan_total_berat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-center">
                        <span className={`inline-block px-2 sm:px-3 py-1 text-[9px] sm:text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 sm:py-4 text-center">
                        <a
                          href={`/petugas/penjemputan`}
                          className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-[9px] sm:text-xs font-medium rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                        >
                          Lihat
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="lg:hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Memuat data...</p>
              </div>
            </div>
          ) : dashboard.jadwal_hari_ini.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Tidak ada jadwal penjemputan terbaru hari ini.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {dashboard.jadwal_hari_ini.map((jadwal, idx) => {
                const statusConfig = getStatusBadge(jadwal.status_jadwal);
                return (
                  <div key={jadwal.jadwal_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">Tugas #{idx + 1}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Penjemputan {formatTime(jadwal.waktu_penjemputan)} WIB</p>
                      </div>
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-3 ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500 block mb-1">Warga:</span>
                        <span className="text-gray-900 font-medium">{jadwal.nama_warga}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Alamat:</span>
                        <span className="text-gray-700 leading-relaxed">{jadwal.alamat_penjemputan}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 block mb-1">Telepon:</span>
                          <span className="text-gray-700">{jadwal.no_telepon}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Est. Berat:</span>
                          <span className="text-gray-900 font-semibold">
                            {jadwal.perkiraan_total_berat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Jenis Sampah:</span>
                        <div className="space-y-0.5">
                          {jadwal.detail_sampah.map((sampah, sIdx) => (
                            <div key={sIdx} className="text-gray-700 text-xs">
                              • {sampah.jenis_sampah}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <a
                        href={`/petugas/penjemputan`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Lihat Detail
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
