'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminHeader from '@/components/layout/header';
import { Search, RotateCcw, FileText, Scale, Users, Eye, X } from 'lucide-react';

interface DetailSetoran {
  detail_setoran_id: number;
  jenis_sampah_id: number;
  berat_aktual: number;
  harga_satuan: number;
  nilai_poin_per_satuan: number;
  poin: number;
  jenis_sampah: { jenis_sampah_id: number; nama_jenis_sampah: string; };
}

interface TransaksiSetoran {
  setoran_id: number;
  pengajuan_id: number;
  tanggal_setoran: string;
  tanggal_validasi?: string | null;
  status_validasi: string;
  catatan_validasi?: string | null;
  catatan_penolakan?: string | null;
  total_berat_aktual: number;
  total_poin: number;
  warga: { warga_id: number; nama_warga: string; no_telepon?: string; alamat?: string; };
  petugas: { petugas_id: number; nama_petugas: string; };
  detail_setoran: DetailSetoran[];
  validator_admin?: { nama_admin: string; };
}

interface Petugas {
  petugas_id: number;
  nama_petugas: string;
}

interface JenisSampah {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

export default function SetoranSampahPage() {
  const [list, setList] = useState<TransaksiSetoran[]>([]);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [jenisSampahList, setJenisSampahList] = useState<JenisSampah[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [petugasFilter, setPetugasFilter] = useState('');
  const [jenisSampahFilter, setJenisSampahFilter] = useState('');

  // Modal state
  const [selected, setSelected] = useState<TransaksiSetoran | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
    fetchPetugas();
    fetchJenisSampah();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/setoran`, { headers });
      const result = await response.json();
      if (result?.data && Array.isArray(result.data)) {
        setList(result.data);
      } else {
        setList([]);
      }
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetugas = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/petugas`, { headers });
      const result = await response.json();
      if (result?.data && Array.isArray(result.data)) {
        setPetugasList(result.data);
      }
    } catch {
      // ignore
    }
  };

  const fetchJenisSampah = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/petugas/jenis-sampah`, { headers });
      const result = await response.json();
      if (result?.data && Array.isArray(result.data)) {
        setJenisSampahList(result.data);
      }
    } catch {
      // ignore
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = list.length;
    const totalBerat = list.reduce((sum, x) => sum + Number(x.total_berat_aktual || 0), 0);
    const petugasAktif = new Set(list.map(x => x.petugas?.petugas_id).filter(Boolean)).size;
    return { total, totalBerat, petugasAktif };
  }, [list]);

  // Filter
  const filtered = useMemo(() => {
    return list.filter(s => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const warga = s.warga?.nama_warga?.toLowerCase() || '';
        const petugas = s.petugas?.nama_petugas?.toLowerCase() || '';
        const no = `stn-${s.setoran_id}`.toLowerCase();
        if (!warga.includes(q) && !petugas.includes(q) && !no.includes(q)) return false;
      }

      // Status
      if (statusFilter !== 'semua' && s.status_validasi !== statusFilter) return false;

      // Tanggal
      if (dariTanggal) {
        const tgl = new Date(s.tanggal_setoran).toISOString().slice(0, 10);
        if (tgl < dariTanggal) return false;
      }
      if (sampaiTanggal) {
        const tgl = new Date(s.tanggal_setoran).toISOString().slice(0, 10);
        if (tgl > sampaiTanggal) return false;
      }

      // Petugas
      if (petugasFilter && String(s.petugas?.petugas_id) !== petugasFilter) return false;

      // Jenis Sampah
      if (jenisSampahFilter) {
        const hasJenis = s.detail_setoran?.some(d => String(d.jenis_sampah_id) === jenisSampahFilter);
        if (!hasJenis) return false;
      }

      return true;
    });
  }, [list, search, statusFilter, dariTanggal, sampaiTanggal, petugasFilter, jenisSampahFilter]);

  // Pagination
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const resetFilter = () => {
    setSearch('');
    setStatusFilter('semua');
    setDariTanggal('');
    setSampaiTanggal('');
    setPetugasFilter('');
    setJenisSampahFilter('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] text-[11px] font-semibold border border-green-100">Disetujui</span>;
      case 'menunggu':
        return <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fffbeb] text-[#92400e] text-[11px] font-semibold border border-amber-100">Menunggu</span>;
      case 'ditolak':
        return <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold border border-red-100">Ditolak</span>;
      default:
        return <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
      <AdminHeader
        title="Setoran Sampah"
        subtitle="Daftar semua transaksi setoran sampah dari petugas."
      />

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Setoran</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.total}</p>
            <p className="text-[11px] text-gray-400">Transaksi</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Berat Sampah</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.totalBerat.toFixed(1).replace('.', ',')} kg</p>
            <p className="text-[11px] text-gray-400">Keseluruhan</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f3ff] text-[#7c3aed] flex-shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Petugas Aktif</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.petugasAktif}</p>
            <p className="text-[11px] text-gray-400">Petugas</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nama warga, petugas, atau no. transaksi..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a] bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>

            <input
              type="date"
              value={dariTanggal}
              onChange={e => { setDariTanggal(e.target.value); setCurrentPage(1); }}
              placeholder="Dari tanggal"
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a]"
            />
            <input
              type="date"
              value={sampaiTanggal}
              onChange={e => { setSampaiTanggal(e.target.value); setCurrentPage(1); }}
              placeholder="Sampai tanggal"
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a]"
            />

            <select
              value={petugasFilter}
              onChange={e => { setPetugasFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a] bg-white"
            >
              <option value="">Semua Petugas</option>
              {petugasList.map(p => (
                <option key={p.petugas_id} value={p.petugas_id}>{p.nama_petugas}</option>
              ))}
            </select>

            <select
              value={jenisSampahFilter}
              onChange={e => { setJenisSampahFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a] bg-white"
            >
              <option value="">Semua Jenis Sampah</option>
              {jenisSampahList.map(j => (
                <option key={j.jenis_sampah_id} value={j.jenis_sampah_id}>{j.nama_jenis_sampah}</option>
              ))}
            </select>

            <button
              onClick={resetFilter}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa]/80 text-[12px] font-bold text-gray-600">
                <th className="px-5 py-4">No. Transaksi</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Warga</th>
                <th className="px-5 py-4">Petugas</th>
                <th className="px-5 py-4">Jenis Sampah</th>
                <th className="px-5 py-4">Total Berat</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Memuat data...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Tidak ada data setoran</td>
                </tr>
              ) : (
                paginated.map(s => (
                  <tr key={s.setoran_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-bold text-gray-900">STN-{String(s.setoran_id).padStart(4, '0')}</p>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-gray-700">
                      {new Date(s.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-gray-900">{s.warga?.nama_warga || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-gray-700">{s.petugas?.nama_petugas || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.detail_setoran?.map(d => (
                          <span key={d.detail_setoran_id} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md">
                            {d.jenis_sampah?.nama_jenis_sampah}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-900">
                      {Number(s.total_berat_aktual).toFixed(1).replace('.', ',')} kg
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(s.status_validasi)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setSelected(s); setShowDetail(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[12px] font-medium"
                      >
                        <Eye size={14} />
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-[12px] text-gray-500">
          <span>Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} transaksi</span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold ${currentPage === n ? 'bg-[#16a34a] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Rekap Setoran Sampah</h3>
                <p className="text-xs text-gray-400">
                  ID Setoran: #{selected.setoran_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-5 flex-1 text-[13.5px]">
              {/* Summary Metadata Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Nama Warga</p>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">{selected.warga?.nama_warga || '-'}</p>
                  <p className="text-[10px] text-gray-500">{selected.warga?.no_telepon || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Petugas Pengambil</p>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">{selected.petugas?.nama_petugas || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Waktu Pengambilan</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {new Date(selected.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <br />
                    <span className="text-[10px] text-gray-500">
                      {new Date(selected.tanggal_setoran).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Status Saat Ini</p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                      selected.status_validasi === 'disetujui'
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

              {/* Catatan Penolakan dari Petugas */}
              {selected.catatan_penolakan && (
                <div className="p-3.5 rounded-2xl border flex items-start gap-2.5 bg-rose-50/70 border-rose-200 text-rose-900">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Catatan Pengambilan dari Petugas:</p>
                    <p className="leading-relaxed font-normal">{selected.catatan_penolakan}</p>
                  </div>
                </div>
              )}

              {/* Catatan Validasi dari Admin */}
              {selected.catatan_validasi && (
                <div className="p-3.5 rounded-2xl border flex items-start gap-2.5 bg-amber-50/70 border-amber-200/80 text-amber-900">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Catatan Validasi dari Admin:</p>
                    <p className="leading-relaxed font-normal">{selected.catatan_validasi}</p>
                  </div>
                </div>
              )}

              {/* Rincian Rekap Sampah Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Rekap Rincian Sampah & Berat</h4>
                  <span className="text-[11px] text-gray-400 font-medium">{selected.detail_setoran?.length || 0} Jenis Sampah</span>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3.5">Jenis Sampah</th>
                        <th className="py-2.5 px-3.5 text-right">Berat Aktual</th>
                        <th className="py-2.5 px-3.5 text-right">Poin per Satuan</th>
                        <th className="py-2.5 px-3.5 text-right">Subtotal Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.detail_setoran && selected.detail_setoran.length > 0 ? (
                        selected.detail_setoran.map((d) => (
                          <tr key={d.detail_setoran_id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-3.5">
                              <p className="font-bold text-gray-800">{d.jenis_sampah?.nama_jenis_sampah || '-'}</p>
                            </td>
                            <td className="py-3 px-3.5 text-right font-bold text-gray-900">{Number(d.berat_aktual).toFixed(2)} kg</td>
                            <td className="py-3 px-3.5 text-right text-gray-500 font-medium">{d.nilai_poin_per_satuan ? `${d.nilai_poin_per_satuan} poin/kg` : '-'}</td>
                            <td className="py-3 px-3.5 text-right font-extrabold text-emerald-700">+{d.poin} poin</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400">Tidak ada rincian sampah (Pengambilan gagal)</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Highlight Rekap Total */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Berat Sampah</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {Number(selected.total_berat_aktual).toFixed(2)} <span className="text-sm font-semibold text-gray-500">kg</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs">
                    <Scale className="h-5 w-5 text-gray-600" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Total Poin yang Diterima Warga</p>
                    <p className="text-xl font-black text-emerald-700">+{selected.total_poin} Poin</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs border border-emerald-200">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowDetail(false)}
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
