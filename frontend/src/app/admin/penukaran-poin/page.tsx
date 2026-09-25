'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/layout/header';
import { Search, Eye, X, Gift, Coins, Ticket, Phone, User as UserIcon, FileText } from 'lucide-react';

interface PenukaranItem {
  penukaran_id: number;
  nama_warga: string;
  no_telepon: string;
  nama_voucher: string;
  deskripsi_voucher: string;
  poin_voucher: number;
  poin_digunakan: number;
  saldo_sebelum: number;
  saldo_sesudah: number;
  tanggal_pengajuan: string;
}

interface Summary {
  total_penukaran: number;
  total_poin: number;
  ketersediaan_voucher: number;
}

interface Pagination {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

export default function PenukaranPoinPage() {
  const [list, setList] = useState<PenukaranItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_penukaran: 0, total_poin: 0, ketersediaan_voucher: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selected, setSelected] = useState<PenukaranItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, search, dariTanggal, sampaiTanggal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '10');
      if (search) params.set('search', search);
      if (dariTanggal) params.set('dari', dariTanggal);
      if (sampaiTanggal) params.set('sampai', sampaiTanggal);

      const res = await fetch(`${API_BASE_URL}/admin/penukaran-poin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memuat data');

      const json = await res.json();
      setList(json.data || []);
      setSummary(json.summary || { total_penukaran: 0, total_poin: 0, ketersediaan_voucher: 0 });
      setPagination(json.pagination || null);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDariTanggal = (val: string) => {
    setDariTanggal(val);
    setCurrentPage(1);
  };

  const handleSampaiTanggal = (val: string) => {
    setSampaiTanggal(val);
    setCurrentPage(1);
  };

  const totalPages = pagination ? pagination.last_page : 1;

  return (
    <div className="max-w-[1440px] mx-auto pb-16 font-sans">
      <AdminHeader
        title="Penukaran Poin"
        subtitle="Daftar seluruh penukaran poin yang dilakukan oleh warga."
        breadcrumbs={[
          { label: 'Beranda', href: '/admin/dashboard' },
          { label: 'Penukaran Poin' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#16a34a]">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Penukaran</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_penukaran}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Poin Ditukar</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_poin.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ketersediaan Voucher</p>
            <p className="text-2xl font-bold text-gray-900">{summary.ketersediaan_voucher.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => handleDariTanggal(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#16a34a] focus:ring-green-100"
            />
            <span className="text-gray-400 text-sm">-</span>
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => handleSampaiTanggal(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#16a34a] focus:ring-green-100"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">No</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama Warga</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Voucher</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Poin</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Tanggal</th>
                <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                    Tidak ada data penukaran poin.
                  </td>
                </tr>
              ) : (
                list.map((item, idx) => (
                  <tr
                    key={item.penukaran_id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-gray-700">
                      {(pagination?.from ?? 0) + idx}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{item.nama_warga}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{item.nama_voucher}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        {item.poin_digunakan.toLocaleString('id-ID')} poin
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">
                      {formatDate(item.tanggal_pengajuan)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelected(item); setShowDetail(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#16a34a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan {pagination.from}-{pagination.to} dari {pagination.total} data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    currentPage === page
                      ? 'bg-[#16a34a] text-white border-[#16a34a]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Penukaran</h3>
                <p className="text-xs text-gray-400">
                  Rincian penukaran poin warga
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowDetail(false); setSelected(null); }}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-5 text-[13.5px]">
              {/* Penukaran Info Card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Tanggal Penukaran</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatDateTime(selected.tanggal_pengajuan)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Poin Digunakan</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      -{selected.poin_digunakan.toLocaleString('id-ID')} poin
                    </p>
                  </div>
                </div>
              </div>

              {/* Warga Info */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                  <UserIcon className="h-4 w-4 text-[#16a34a]" />
                  <span>Informasi Warga</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Nama Warga:</span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {selected.nama_warga}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nomor Telepon:</span>
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selected.no_telepon}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voucher Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#16a34a]" />
                    <span>Voucher Ditukar</span>
                  </h4>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <p className="font-semibold text-gray-800 text-sm">{selected.nama_voucher}</p>
                  {selected.deskripsi_voucher && (
                    <p className="text-xs text-gray-500 leading-relaxed">{selected.deskripsi_voucher}</p>
                  )}
                </div>
              </div>

              {/* Rincian Poin */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-sm">Rincian Poin</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">Sebelum</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{selected.saldo_sebelum.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-amber-600 font-medium">Digunakan</p>
                    <p className="text-sm font-bold text-amber-700 mt-0.5">-{selected.poin_digunakan.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 font-medium">Sesudah</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">{selected.saldo_sesudah.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => { setShowDetail(false); setSelected(null); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
