'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminHeader from '@/components/layout/header';
import WasteIcon from '@/components/common/WasteIcon';
import {
  Search,
  RotateCcw,
  Eye,
  Check,
  X,
  Scale,
  Coins,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Detail {
  detail_setoran_id: number;
  berat_aktual: number | string;
  harga_satuan?: number | string;
  nilai_poin_per_satuan?: number;
  poin: number;
  jenis_sampah: {
    jenis_sampah_id?: number;
    nama_jenis_sampah: string;
    satuan?: string;
    keterangan?: string;
  };
}

interface Setoran {
  setoran_id: number;
  pengajuan_id?: number;
  jadwal_id?: number;
  warga_id: number;
  petugas_id?: number;
  total_berat_aktual: number | string;
  total_poin: number;
  status_validasi: 'menunggu' | 'disetujui' | 'ditolak' | string;
  tanggal_setoran: string;
  tanggal_validasi?: string;
  catatan_validasi?: string;
  catatan_penolakan?: string;
  konfirmasi_pengambilan?: string;
  warga: {
    warga_id?: number;
    nama_warga: string;
    no_telepon?: string;
    alamat?: string;
  };
  petugas?: {
    nama_petugas: string;
    no_telepon?: string;
  };
  detail_setoran: Detail[];
  validator_admin?: {
    nama_admin: string;
  };
  pengajuan_penjemputan?: {
    pengajuan_id?: number;
    alamat_penjemputan?: string;
    catatan?: string;
    tanggal_pengajuan?: string;
  };
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const token = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('trashure_token') || localStorage.getItem('token') || ''
    : '';

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}, ${d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })} WIB`;
  } catch {
    return dateStr;
  }
}

export default function AdminValidasiSetoranPage() {
  const [list, setList] = useState<Setoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Menunggu Validasi');

  // Modal State
  const [selected, setSelected] = useState<Setoran | null>(null);
  const [actionType, setActionType] = useState<'setujui' | 'ditolak' | 'detail' | null>(null);
  const [catatanValidasi, setCatatanValidasi] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const t = token();
      const h: HeadersInit = { Accept: 'application/json' };
      if (t) h['Authorization'] = `Bearer ${t}`;
      const r = await fetch(`${API}/admin/setoran`, { headers: h });
      const j = await r.json();
      if (j?.data) setList(j.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return list.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const namaWarga = s.warga?.nama_warga?.toLowerCase() || '';
        const idStr = String(s.setoran_id);
        const codeStr = `stn-${idStr.padStart(4, '0')}`.toLowerCase();
        if (!namaWarga.includes(q) && !idStr.includes(q) && !codeStr.includes(q)) {
          return false;
        }
      }
      const map: Record<string, string> = {
        'Menunggu Validasi': 'menunggu',
        'Terverifikasi': 'disetujui',
        'Ditolak': 'ditolak',
        'Semua Status': 'semua',
      };
      const target = map[statusFilter] || 'menunggu';
      if (target !== 'semua' && s.status_validasi !== target) return false;
      return true;
    });
  }, [list, search, statusFilter]);

  const stats = useMemo(
    () => ({
      menunggu: list.filter((s) => s.status_validasi === 'menunggu').length,
      terverifikasi: list.filter((s) => s.status_validasi === 'disetujui').length,
      ditolak: list.filter((s) => s.status_validasi === 'ditolak').length,
      total: list.length,
    }),
    [list]
  );

  const openActionModal = (s: Setoran, type: 'setujui' | 'ditolak' | 'detail') => {
    setSelected(s);
    setActionType(type);
    setCatatanValidasi(type === 'detail' ? (s.catatan_validasi || '') : '');
    setValidationError(null);
  };

  const closeModal = () => {
    setSelected(null);
    setActionType(null);
    setCatatanValidasi('');
    setValidationError(null);
  };

  const handleConfirmValidasi = async () => {
    if (!selected || !actionType || actionType === 'detail') return;

    if (actionType === 'ditolak' && !catatanValidasi.trim()) {
      setValidationError('Alasan penolakan setoran wajib diisi.');
      return;
    }

    setValidating(true);
    setValidationError(null);

    try {
      const t = token();
      const h: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (t) h['Authorization'] = `Bearer ${t}`;

      const targetStatus = actionType === 'setujui' ? 'disetujui' : 'ditolak';

      const r = await fetch(`${API}/admin/setoran/${selected.setoran_id}/validasi`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({
          status_validasi: targetStatus,
          catatan_validasi: catatanValidasi.trim() || undefined,
        }),
      });

      const resJson = await r.json();

      if (r.ok) {
        const isSetuju = actionType === 'setujui';
        closeModal();
        setMessage({
          type: 'success',
          text: isSetuju
            ? `Setoran STN-${String(selected.setoran_id).padStart(4, '0')} berhasil disetujui! +${selected.total_poin} poin telah ditambahkan ke warga.`
            : `Setoran STN-${String(selected.setoran_id).padStart(4, '0')} telah ditolak.`,
        });
        fetchData();
      } else {
        const msg = resJson.message || 'Gagal memproses validasi.';
        setValidationError(msg);
        setMessage({ type: 'error', text: msg });
      }
    } catch {
      const msg = 'Terjadi kendala jaringan saat menghubungi server.';
      setValidationError(msg);
      setMessage({ type: 'error', text: msg });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans">
      <AdminHeader
        title="Validasi Setoran"
        subtitle="Verifikasi hasil penjemputan sampah petugas — saat disetujui, poin warga & stok sampah gudang langsung bertambah otomatis."
      />

      {/* Notifikasi seperti tambah warga */}
      {message && (
        <div className={`mb-4 p-3.5 rounded-lg sm:rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600">Menunggu Validasi</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 mt-1">{stats.menunggu}</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600">Terverifikasi</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 mt-1">{stats.terverifikasi}</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-600">Ditolak</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 mt-1">{stats.ditolak}</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Transaksi</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama warga, STN-0001, atau ID setoran..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm font-medium text-gray-700 shadow-xs focus:outline-none focus:border-[#16a34a]"
            >
              <option>Menunggu Validasi</option>
              <option>Terverifikasi</option>
              <option>Ditolak</option>
              <option>Semua Status</option>
            </select>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('Menunggu Validasi');
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl text-sm font-medium text-gray-600 transition shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-[#fafafa] text-xs font-bold text-gray-600">
                <th className="px-5 py-4">No. Transaksi</th>
                <th className="px-5 py-4">Warga</th>
                <th className="px-5 py-4">Petugas</th>
                <th className="px-5 py-4">Jenis & Berat Sampah</th>
                <th className="px-5 py-4">Total Berat</th>
                <th className="px-5 py-4">Total Poin</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                      <span>Memuat data setoran...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    Tidak ada data setoran yang cocok dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const code = `STN-${String(s.setoran_id).padStart(4, '0')}`;
                  const isMenunggu = s.status_validasi === 'menunggu';
                  const isDisetujui = s.status_validasi === 'disetujui';
                  const isDitolak = s.status_validasi === 'ditolak';

                  return (
                    <tr key={s.setoran_id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-4 text-xs font-mono font-bold text-gray-800">
                        {code}
                        <p className="text-[10px] text-gray-400 font-sans font-normal mt-0.5">
                          {formatDateTime(s.tanggal_setoran)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <p className="font-semibold text-gray-900">{s.warga?.nama_warga || '-'}</p>
                        {s.warga?.no_telepon && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{s.warga.no_telepon}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-700">
                        <span className="font-medium">
                          {s.petugas?.nama_petugas || 'Petugas Trashure'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="space-y-1">
                          {s.detail_setoran && s.detail_setoran.length > 0 ? (
                            s.detail_setoran.slice(0, 2).map((d) => (
                              <div
                                key={d.detail_setoran_id}
                                className="flex items-center gap-1.5 text-gray-700"
                              >
                                <WasteIcon
                                  type={d.jenis_sampah?.nama_jenis_sampah || 'Sampah'}
                                  size={14}
                                />
                                <span className="font-medium truncate max-w-[130px]">
                                  {d.jenis_sampah?.nama_jenis_sampah || 'Sampah'}
                                </span>
                                <span className="text-gray-400">—</span>
                                <span className="font-semibold text-gray-900">
                                  {Number(d.berat_aktual).toFixed(2)} kg
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada detail</span>
                          )}
                          {s.detail_setoran && s.detail_setoran.length > 2 && (
                            <p className="text-[10px] text-emerald-600 font-medium">
                              +{s.detail_setoran.length - 2} jenis lainnya
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-900">
                        {Number(s.total_berat_aktual).toFixed(2)} kg
                      </td>
                      <td className="px-5 py-4 text-xs font-bold">
                        {isDitolak ? (
                          <span className="text-rose-600">0 poin</span>
                        ) : (
                          <span className="text-emerald-700 font-extrabold">
                            +{s.total_poin} poin
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {isMenunggu && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                            <Clock className="h-3 w-3" />
                            Menunggu
                          </span>
                        )}
                        {isDisetujui && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Disetujui
                          </span>
                        )}
                        {isDitolak && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                            <XCircle className="h-3 w-3" />
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {isMenunggu ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openActionModal(s, 'setujui')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Setujui Setoran"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Setuju</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal(s, 'ditolak')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Tolak Setoran"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Ditolak</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openActionModal(s, 'detail')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition shadow-2xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                            <span>Detail</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REKAP DAN KONFIRMASI (SETUJU / DITOLAK / DETAIL) */}
      {selected && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">
                  {actionType === 'setujui'
                    ? 'Konfirmasi Persetujuan Setoran'
                    : actionType === 'ditolak'
                      ? 'Konfirmasi Penolakan Setoran'
                      : 'Detail Rekap Setoran Sampah'}
                </h3>
                <p className="text-xs text-gray-400">
                  ID Setoran: #{selected.setoran_id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={validating}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-5 flex-1 text-[13.5px]">
              {/* Summary Metadata Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Nama Warga</p>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">
                    {selected.warga?.nama_warga || '-'}
                  </p>
                  <p className="text-[10px] text-gray-500">{selected.warga?.no_telepon || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Petugas Pengambil</p>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">
                    {selected.petugas?.nama_petugas || 'Petugas Trashure'}
                  </p>
                  <p className="text-[10px] text-gray-500">{selected.petugas?.no_telepon || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Waktu Pengambilan</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {formatDateTime(selected.tanggal_setoran)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Status Saat Ini</p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${selected.status_validasi === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selected.status_validasi === 'ditolak'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                  >
                    {selected.status_validasi}
                  </span>
                </div>
              </div>

              {/* Catatan dari Pengajuan / Petugas (Jika ada) */}
              {(selected.pengajuan_penjemputan?.catatan || selected.catatan_penolakan) && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${selected.catatan_penolakan
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                    }`}
                >
                  <FileText
                    className={`h-4 w-4 flex-shrink-0 mt-0.5 ${selected.catatan_penolakan ? 'text-rose-600' : 'text-amber-700'
                      }`}
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {selected.catatan_penolakan
                        ? 'Catatan Pengambilan dari Petugas:'
                        : 'Catatan Pengajuan dari Warga:'}
                    </p>
                    <p className="leading-relaxed font-normal">
                      {selected.catatan_penolakan || selected.pengajuan_penjemputan?.catatan}
                    </p>
                  </div>
                </div>
              )}

              {/* Rincian Rekap Sampah Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Rekap Rincian Sampah & Berat
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {selected.detail_setoran?.length || 0} Jenis Sampah
                  </span>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3.5">Jenis Sampah</th>
                        <th className="py-2.5 px-3.5 text-right">Berat Aktual</th>
                        <th className="py-2.5 px-3.5 text-right">Nilai Poin / Satuan</th>
                        <th className="py-2.5 px-3.5 text-right">Subtotal Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.detail_setoran && selected.detail_setoran.length > 0 ? (
                        selected.detail_setoran.map((d) => (
                          <tr key={d.detail_setoran_id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2">
                                <WasteIcon
                                  type={d.jenis_sampah?.nama_jenis_sampah || 'Sampah'}
                                  size={15}
                                />
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {d.jenis_sampah?.nama_jenis_sampah || 'Sampah Terpilah'}
                                  </p>
                                  {d.jenis_sampah?.keterangan && (
                                    <p className="text-[10px] text-gray-400 line-clamp-1">
                                      {d.jenis_sampah.keterangan}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-right font-bold text-gray-900">
                              {Number(d.berat_aktual).toFixed(2)} kg
                            </td>
                            <td className="py-3 px-3.5 text-right text-gray-500 font-medium">
                              {d.nilai_poin_per_satuan ? `${d.nilai_poin_per_satuan} poin/kg` : '-'}
                            </td>
                            <td className="py-3 px-3.5 text-right font-extrabold text-emerald-700">
                              +{d.poin} poin
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">
                            Tidak ada rincian sampah tersedia
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HIGHLIGHT REKAP TOTAL (BERAT & POIN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* Total Berat */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Total Berat Sampah
                    </p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {Number(selected.total_berat_aktual).toFixed(2)}{' '}
                      <span className="text-sm font-semibold text-gray-500">kg</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-2xs">
                    <Scale className="h-5 w-5 text-gray-600" />
                  </div>
                </div>

                {/* Total Poin yang Didapatkan Warga */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${actionType === 'ditolak'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-emerald-50/80 border-emerald-200'
                    }`}
                >
                  <div className="space-y-0.5">
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wide ${actionType === 'ditolak' ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                    >
                      {actionType === 'ditolak'
                        ? 'Total Poin (Dibatalkan)'
                        : 'Total Poin yang Diterima Warga'}
                    </p>
                    <p
                      className={`text-xl font-black ${actionType === 'ditolak' ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                    >
                      {actionType === 'ditolak' ? (
                        '0 Poin'
                      ) : (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-4 w-4 inline text-emerald-600" />
                          +{selected.total_poin} Poin
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-2xs border ${actionType === 'ditolak'
                        ? 'bg-rose-100/80 text-rose-700 border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                  >
                    <Coins className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Form Input Catatan Validasi / Alasan Penolakan */}
              {actionType === 'setujui' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Catatan Validasi Admin <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    value={catatanValidasi}
                    onChange={(e) => setCatatanValidasi(e.target.value)}
                    placeholder="Contoh: Sampah bersih, terpilah sangat baik, dan sesuai dengan ketentuan."
                    rows={2}
                    maxLength={500}
                    className="w-full text-xs rounded-xl border border-gray-200 p-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                  />
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Poin sebesar <strong>+{selected.total_poin} poin</strong> akan langsung ditambahkan ke saldo warga dan stok gudang otomatis bertambah.
                    </span>
                  </div>
                </div>
              )}

              {actionType === 'ditolak' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Alasan Penolakan Setoran <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <textarea
                    value={catatanValidasi}
                    onChange={(e) => {
                      setCatatanValidasi(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Tuliskan alasan penolakan (contoh: Sampah basah, tercampur kotoran/residu, atau tidak memenuhi standar)."
                    rows={3}
                    maxLength={500}
                    className={`w-full text-xs rounded-xl border p-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition resize-none ${validationError
                        ? 'border-rose-300 ring-2 ring-rose-500/20 focus:border-rose-500'
                        : 'border-gray-200 focus:ring-rose-500/20 focus:border-rose-500'
                      }`}
                  />
                  {validationError && (
                    <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{validationError}</span>
                    </p>
                  )}
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>
                      Setoran ini akan ditandai <strong>ditolak</strong>. Warga tidak akan memperoleh poin dari transaksi ini.
                    </span>
                  </div>
                </div>
              )}

              {actionType === 'detail' && selected.catatan_validasi && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-bold text-gray-700">Catatan Validasi Admin:</p>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed">
                    {selected.catatan_validasi}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Action Buttons: Konfirmasi / Batal) */}
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                disabled={validating}
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
              >
                {actionType === 'detail' ? 'Tutup' : 'Batal'}
              </button>

              {actionType === 'setujui' && (
                <button
                  type="button"
                  disabled={validating}
                  onClick={handleConfirmValidasi}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>Konfirmasi Setujui</span>
                    </>
                  )}
                </button>
              )}

              {actionType === 'ditolak' && (
                <button
                  type="button"
                  disabled={validating || !catatanValidasi.trim()}
                  onClick={handleConfirmValidasi}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 stroke-[2.5]" />
                      <span>Konfirmasi Tolak</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
