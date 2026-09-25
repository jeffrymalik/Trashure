'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/layout/header';
import { fetchWargaDashboard, DashboardData, DEFAULT_DASHBOARD_DATA, PengajuanTerbaru } from '@/services/wargaDashboardService';
import { Star, ClipboardList, Clock, Package, Plus, Gift, History, Leaf, ArrowRight, CheckCircle2, Truck, Calendar, CircleCheck } from 'lucide-react';
import Link from 'next/link';

interface UserInfo {
  name?: string;
  nama_lengkap?: string;
  email?: string;
}

export default function WargaDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Warga');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      const data = await fetchWargaDashboard();
      setDashboard(data);
      setIsLoading(false);
    };

    const loadUserInfo = () => {
      try {
        const userStr = localStorage.getItem('trashure_user');
        if (userStr) {
          const user: UserInfo = JSON.parse(userStr);
          setUserName(user.name || user.nama_lengkap || 'Warga');
        }
      } catch {
        // ignore
      }
    };

    loadDashboard();
    loadUserInfo();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string, statusValidasi?: string | null) => {
    // If there's a setoran with status_validasi, use that for the final status
    if (status === 'selesai' && statusValidasi) {
      if (statusValidasi === 'disetujui') {
        return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400', label: 'Poin Sudah Masuk' };
      }
      if (statusValidasi === 'ditolak') {
        return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Ditolak' };
      }
      return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Menunggu Validasi' };
    }

    const statusMap: { [key: string]: { bg: string; text: string; dot: string; label: string } } = {
      diajukan: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400', label: 'Diajukan' },
      dijadwalkan: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Dijadwalkan' },
      diproses: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Di Proses' },
      selesai: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Menunggu Validasi' },
      dibatalkan: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Dibatalkan' },
      ditolak: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Ditolak' },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400', label: status };
  };

  const getTimelineSteps = (status: string, statusValidasi: string | null | undefined, jadwal: PengajuanTerbaru['jadwal'], createdAt: string) => {
    const steps = [
      { key: 'diajukan', label: 'Diajukan', sub: 'Menunggu penjadwalan', icon: ClipboardList, date: formatDate(createdAt), time: formatTime(createdAt) },
      { key: 'dijadwalkan', label: 'Dijadwalkan', sub: 'Menunggu petugas', icon: Calendar, date: jadwal?.tanggal_penjemputan ? formatDate(jadwal.tanggal_penjemputan) : '', time: jadwal?.waktu_penjemputan || '' },
      { key: 'diproses', label: 'Di Proses', sub: 'Sedang diambil', icon: Truck, date: '', time: '' },
      { key: 'selesai', label: 'Menunggu Validasi', sub: 'Oleh admin', icon: CircleCheck, date: '', time: '' },
      { key: 'disetujui', label: 'Poin Masuk', sub: 'Selesai', icon: CheckCircle2, date: '', time: '' },
    ];

    // Handle final statuses
    let currentIdx: number;
    let isRejected = false;
    let isCancelled = false;

    if (status === 'dibatalkan') {
      isCancelled = true;
      currentIdx = -1;
    } else if (status === 'selesai' && statusValidasi === 'ditolak') {
      isRejected = true;
      currentIdx = 3;
    } else if (status === 'selesai' && statusValidasi === 'disetujui') {
      currentIdx = 4;
    } else if (status === 'selesai' && !statusValidasi) {
      currentIdx = 3;
    } else {
      const statusOrder: { [key: string]: number } = {
        diajukan: 0,
        dijadwalkan: 1,
        diproses: 2,
      };
      currentIdx = statusOrder[status] ?? -1;
    }

    return steps.map((step, idx) => ({
      ...step,
      isActive: isCancelled ? false : isRejected ? idx <= 3 : idx <= currentIdx,
      isCurrent: isCancelled ? false : isRejected ? idx === 3 : idx === currentIdx,
      isRejected: isRejected && idx === 3,
      isCancelled: isCancelled,
    }));
  };

  const latestPengajuan = dashboard.pengajuan_terbaru[0];
  const timelineSteps = latestPengajuan ? getTimelineSteps(latestPengajuan.status_pengajuan, latestPengajuan.status_validasi, latestPengajuan.jadwal, latestPengajuan.created_at) : [];

  return (
    <div className="w-full">
      <AdminHeader
        title="Dashboard Warga"
        subtitle="Ringkasan aktivitas pengelolaan sampah Anda."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16a34a]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Saldo Poin Resmi</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoading ? '-' : dashboard.total_poin_aktif.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">poin</p>
          <Link href="/warga/poin-saya" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline mt-2">
            Lihat Detail <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Setoran Selesai</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoading ? '-' : dashboard.total_setoran}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">setoran</p>
          <Link href="/warga/riwayat-setoran" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline mt-2">
            Lihat Riwayat <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Menunggu Validasi</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoading ? '-' : dashboard.setoran_menunggu_validasi}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">setoran</p>
          <Link href="/warga/riwayat-setoran" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline mt-2">
            Lihat Detail <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Setoran</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {isLoading ? '-' : `${dashboard.total_berat_sampah.toLocaleString('id-ID', { maximumFractionDigits: 1 })}`}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">kg</p>
          <Link href="/warga/riwayat-setoran" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline mt-2">
            Lihat Statistik <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Status Penjemputan Terbaru */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200/80 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Status Penjemputan Terbaru</h3>
              <Link href="/warga/riwayat-setoran" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 sm:p-5">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !latestPengajuan ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  Belum ada pengajuan penjemputan.
                </div>
              ) : (
                <>
                  {/* Timeline */}
                  <div className="relative flex items-start justify-between mb-6 overflow-x-auto pb-2">
                    {timelineSteps.map((step, idx) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1 min-w-[80px] relative">
                          {/* Connector line */}
                          {idx < timelineSteps.length - 1 && (
                            <div className="absolute top-5 sm:top-6 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 z-0">
                              <div className={`h-full ${step.isActive && timelineSteps[idx + 1]?.isActive ? 'bg-[#16a34a]' : 'bg-gray-200'}`} />
                            </div>
                          )}
                          <div className="relative z-10">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                              step.isActive
                                ? step.isRejected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-[#16a34a] text-white'
                                : 'bg-gray-100 text-gray-400'
                            } ${step.isCurrent ? `ring-4 ${step.isRejected ? 'ring-red-500/20' : 'ring-[#16a34a]/20'}` : ''}`}>
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>
                          <p className={`text-xs font-medium mt-2 text-center ${step.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {step.sub && (
                            <p className="text-[10px] text-gray-400 text-center">{step.sub}</p>
                          )}
                          {step.date && (
                            <p className="text-[10px] text-gray-400 text-center">{step.date}</p>
                          )}
                          {step.time && (
                            <p className="text-[10px] text-gray-400 text-center">{step.time}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Banner */}
                  {latestPengajuan.status_pengajuan === 'diajukan' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Menunggu Penjadwalan</p>
                        <p className="text-xs text-gray-500 mt-0.5">Admin akan menjadwalkan waktu penjemputan sampah Anda.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'dijadwalkan' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Menunggu Petugas</p>
                        <p className="text-xs text-gray-500 mt-0.5">Petugas akan datang sesuai jadwal yang ditentukan.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'diproses' && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Truck className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sedang Diambil</p>
                        <p className="text-xs text-gray-500 mt-0.5">Petugas sedang dalam perjalanan menjemput sampah Anda.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'selesai' && !latestPengajuan.status_validasi && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Menunggu Validasi</p>
                        <p className="text-xs text-gray-500 mt-0.5">Admin sedang mereview setoran Anda. Poin akan masuk jika disetujui.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'selesai' && latestPengajuan.status_validasi === 'disetujui' && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Poin Sudah Masuk</p>
                        <p className="text-xs text-gray-500 mt-0.5">Setoran Anda telah disetujui. Poin sudah ditambahkan ke saldo.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'selesai' && latestPengajuan.status_validasi === 'ditolak' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Setoran Ditolak</p>
                        <p className="text-xs text-gray-500 mt-0.5">Setoran Anda tidak disetujui oleh admin.</p>
                      </div>
                    </div>
                  )}
                  {latestPengajuan.status_pengajuan === 'dibatalkan' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pengajuan Dibatalkan</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pengajuan ini telah Anda batalkan.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Riwayat Setoran Terbaru */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200/80 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Riwayat Setoran Terbaru</h3>
              <Link href="/warga/riwayat-setoran" className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                    <th className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis Sampah</th>
                    <th className="px-4 sm:px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Berat</th>
                    <th className="px-4 sm:px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <div className="w-6 h-6 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : dashboard.pengajuan_terbaru.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                        Belum ada riwayat setoran.
                      </td>
                    </tr>
                  ) : (
                    dashboard.pengajuan_terbaru.slice(0, 5).map((pengajuan) => {
                      const statusConfig = getStatusConfig(pengajuan.status_pengajuan, pengajuan.status_validasi);
                      return (
                        <tr key={pengajuan.pengajuan_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 sm:px-5 py-3">
                            <p className="text-sm text-gray-900">{formatDate(pengajuan.created_at)}</p>
                            <p className="text-xs text-gray-400">{formatTime(pengajuan.created_at)}</p>
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-sm text-gray-700 max-w-[150px] truncate" title={pengajuan.alamat_penjemputan}>
                            {pengajuan.alamat_penjemputan}
                          </td>
                          <td className="px-4 sm:px-5 py-3">
                            {pengajuan.detail_sampah.map((s, i) => (
                              <p key={i} className="text-sm text-gray-700">{s.jenis_sampah}</p>
                            ))}
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-right text-sm font-medium text-gray-900">
                            {pengajuan.perkiraan_total_berat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              {statusConfig.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-4 sm:space-y-6">
          {/* Aksi Cepat */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200/80">
              <h3 className="text-base font-semibold text-gray-900">Aksi Cepat</h3>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              <Link
                href="/warga/ajukan-penjemputan"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#16a34a]/5 border border-transparent hover:border-[#16a34a]/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center group-hover:bg-[#16a34a]/20 transition-colors">
                  <Plus className="w-5 h-5 text-[#16a34a]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Ajukan Penjemputan Baru</p>
                  <p className="text-xs text-gray-500">Jadwalkan penjemputan sampah</p>
                </div>
              </Link>
              <Link
                href="/warga/poin-saya"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200/70 transition-colors">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Tukar Poin Sekarang</p>
                  <p className="text-xs text-gray-500">Gunakan poin Anda</p>
                </div>
              </Link>
              <Link
                href="/warga/riwayat-setoran"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200/70 transition-colors">
                  <History className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lihat Riwayat Setoran</p>
                  <p className="text-xs text-gray-500">Cek semua setoran Anda</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tahukah Kamu? */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200/80">
              <h3 className="text-base font-semibold text-gray-900">Tahukah Kamu?</h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#16a34a]/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-[#16a34a]" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Memilah sampah dengan benar membantu lingkungan dan menambah nilai poinmu!
                </p>
              </div>
              <Link
                href="/warga/tata-cara-pemilahan"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline mt-4"
              >
                Pelajari Tata Cara Pemilahan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
