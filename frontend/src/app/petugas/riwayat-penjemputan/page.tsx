'use client';
import { useState, useEffect, useMemo } from 'react';
import PetugasHeader from '@/components/layout/header';

import { Search, RotateCcw, CheckCircle2, Clock, XCircle, Minus, Calendar, Eye, Loader2, FileText, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface DetailAktual { detail_setoran_id?: number; jenis_sampah_id: number; berat_aktual: number; jenis_sampah: { jenis_sampah_id: number; nama_jenis_sampah: string; }; }
interface Jadwal { jadwal_id: number; pengajuan_id: number; tanggal_penjemputan: string; waktu_penjemputan: string; status_jadwal: string; transaksi_setoran?: { setoran_id: number; total_berat_aktual?: number; detail_setoran?: DetailAktual[]; } | null; transaksiSetoran?: { setoran_id: number; total_berat_aktual?: number; detail_setoran?: DetailAktual[]; } | null; pengajuan_penjemputan: { pengajuan_id: number; alamat_penjemputan: string; perkiraan_total_berat: number; status_pengajuan: string; warga: { warga_id: number; nama_warga: string; no_telepon: string; alamat: string; }; detail_pengajuan_sampah: { detail_pengajuan_id: number; jenis_sampah_id: number; perkiraan_berat: number; jenis_sampah: { jenis_sampah_id: number; nama_jenis_sampah: string; }; }[]; }; }

function getTransaksiAktual(j: Jadwal) {
  return j.transaksi_setoran || (j as unknown as { transaksiSetoran?: Jadwal['transaksi_setoran'] }).transaksiSetoran || null;
}

function getSampahDisplay(j: Jadwal): Array<{ nama: string; berat: number; isAktual: boolean }> {
  const aktual = getTransaksiAktual(j);
  if (aktual?.detail_setoran && aktual.detail_setoran.length > 0) {
    return aktual.detail_setoran.map((d) => ({
      nama: d.jenis_sampah?.nama_jenis_sampah || 'Sampah',
      berat: Number(d.berat_aktual),
      isAktual: true,
    }));
  }
  return (j.pengajuan_penjemputan?.detail_pengajuan_sampah || []).map((d) => ({
    nama: d.jenis_sampah?.nama_jenis_sampah || 'Sampah',
    berat: Number(d.perkiraan_berat),
    isAktual: false,
  }));
}

function getBeratDisplay(j: Jadwal): number {
  const aktual = getTransaksiAktual(j);
  if (aktual?.detail_setoran && aktual.detail_setoran.length > 0) {
    if (aktual.total_berat_aktual != null) return Number(aktual.total_berat_aktual);
    return aktual.detail_setoran.reduce((s, d) => s + Number(d.berat_aktual || 0), 0);
  }
  return Number(j.pengajuan_penjemputan?.perkiraan_total_berat || 0);
}

function formatTanggal(tanggal?: string): string {
  if (!tanggal) return '-';
  const m = tanggal.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }
  const d = new Date(tanggal);
  if (isNaN(d.getTime())) return tanggal;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function formatWaktu(waktu?: string): string {
  if (!waktu) return '-';
  const m = waktu.match(/^(\d{2}):(\d{2})/);
  if (m) return `${m[1]}.${m[2]} WIB`;
  return waktu;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const getToken = () => { if (typeof window === 'undefined') return ''; return localStorage.getItem('trashure_token') || localStorage.getItem('token') || ''; };

export default function RiwayatPenjemputanPage() {
  const [list, setList] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [selected, setSelected] = useState<Jadwal | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { setLoading(true); const token = getToken(); const h: HeadersInit = { Accept: 'application/json' }; if (token) h['Authorization'] = `Bearer ${token}`; const r = await fetch(`${API_BASE_URL}/petugas/jadwal`, { headers: h }); const j = await r.json(); if (j?.data && Array.isArray(j.data)) setList(j.data); else setList([]); } catch { setList([]); } finally { setLoading(false); }
  };
  const stats = useMemo(() => {
    const selesai = list.filter(x => x.status_jadwal === 'selesai').length;
    const proses = list.filter(x => x.status_jadwal === 'diproses').length;
    const batal = list.filter(x => ['dibatalkan', 'batal'].includes(x.status_jadwal)).length;
    return { selesai, proses, batal, total: list.length };
  }, [list]);

  const filtered = useMemo(() => {
    const toTime = (x: Jadwal) => {
      const tgl = String(x.tanggal_penjemputan || '').slice(0, 10);
      const jam = String(x.waktu_penjemputan || '00:00').slice(0, 5);
      const t = new Date(`${tgl}T${jam}`).getTime();
      return isNaN(t) ? 0 : t;
    };
    return list.filter(x => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const warga = x.pengajuan_penjemputan?.warga?.nama_warga?.toLowerCase() || '';
        const alamat = x.pengajuan_penjemputan?.alamat_penjemputan?.toLowerCase() || '';
        const jenis = getSampahDisplay(x).map(d => d.nama?.toLowerCase()).join(' ');
        if (!warga.includes(q) && !alamat.includes(q) && !jenis.includes(q)) return false;
      }
      if (statusFilter !== 'Semua Status') {
        const s = x.status_jadwal.toLowerCase();
        if (statusFilter === 'Selesai' && s !== 'selesai') return false;
        if (statusFilter === 'Dalam Proses' && s !== 'diproses') return false;
        if (statusFilter === 'Dibatalkan' && !['dibatalkan', 'batal'].includes(s)) return false;
      }
      if (tanggalDari || tanggalSampai) {
        const d = x.tanggal_penjemputan?.slice(0, 10);
        if (!d) return false;
        if (tanggalDari && d < tanggalDari) return false;
        if (tanggalSampai && d > tanggalSampai) return false;
      }
      return true;
    })
    // Data terbaru paling atas
    .sort((a, b) => toTime(b) - toTime(a));
  }, [list, search, statusFilter, tanggalDari, tanggalSampai]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const resetFilter = () => { setSearch(''); setStatusFilter('Semua Status'); setTanggalDari(''); setTanggalSampai(''); setCurrentPage(1); };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <PetugasHeader title="Riwayat Penjemputan" subtitle="Riwayat penjemputan sampah yang telah selesai atau dibatalkan." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0"><CheckCircle2 className="h-6 w-6" /></div>
          <div><p className="text-[12px] font-medium text-gray-500">Selesai</p><div className="flex items-baseline gap-1.5"><span className="text-[22px] font-extrabold text-gray-900 leading-none">{stats.selesai}</span><span className="text-[11px] text-gray-400">Penjemputan</span></div></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0"><Clock className="h-6 w-6" /></div>
          <div><p className="text-[12px] font-medium text-gray-500">Dalam Proses</p><div className="flex items-baseline gap-1.5"><span className="text-[22px] font-extrabold text-gray-900 leading-none">{stats.proses}</span><span className="text-[11px] text-gray-400">Penjemputan</span></div></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626] flex-shrink-0"><XCircle className="h-6 w-6" /></div>
          <div><p className="text-[12px] font-medium text-gray-500">Dibatalkan</p><div className="flex items-baseline gap-1.5"><span className="text-[22px] font-extrabold text-gray-900 leading-none">{stats.batal}</span><span className="text-[11px] text-gray-400">Penjemputan</span></div></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"><Minus className="h-6 w-6" /></div>
          <div><p className="text-[12px] font-medium text-gray-500">Total</p><div className="flex items-baseline gap-1.5"><span className="text-[22px] font-extrabold text-gray-900 leading-none">{stats.total}</span><span className="text-[11px] text-gray-400">Penjemputan</span></div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Cari nama warga, alamat, atau jenis sampah..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm text-[13px]"><span className="text-gray-400 mr-2 text-xs">Status</span><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer"><option>Semua Status</option><option>Selesai</option><option>Dalam Proses</option><option>Dibatalkan</option></select></div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs font-medium text-gray-500">Dari Tanggal</span>
              <input type="date" value={tanggalDari} max={tanggalSampai || undefined} onChange={e => { setTanggalDari(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <span className="text-xs font-medium text-gray-500">Sampai Tanggal</span>
              <input type="date" value={tanggalSampai} min={tanggalDari || undefined} onChange={e => { setTanggalSampai(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button onClick={resetFilter} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl text-[13px] font-medium text-gray-700 shadow-sm hover:bg-gray-50"><RotateCcw className="h-3.5 w-3.5" />Reset Filter</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-14 text-center shadow-sm flex flex-col items-center justify-center mb-5 min-h-[380px] animate-in fade-in duration-200">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a] border border-emerald-100 mb-4 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Memuat Riwayat Penjemputan...
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-1 max-w-sm">
            Menyiapkan riwayat penjemputan sampah yang telah Anda lakukan.
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden mb-5">
        {/* Desktop Table - hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-100 bg-[#fafafa]/80 text-[12px] font-bold text-gray-600"><th className="px-5 py-4">Tanggal & Waktu</th><th className="px-5 py-4">Warga</th><th className="px-5 py-4">Alamat</th><th className="px-5 py-4">Jenis Sampah</th><th className="px-5 py-4">Total Berat</th><th className="px-5 py-4">Status Penjemputan</th><th className="px-5 py-4">Aksi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">Tidak ada riwayat penjemputan</td></tr> : paginated.map(j => {
                const isSelesai = j.status_jadwal === 'selesai';
                const isBatal = ['dibatalkan', 'batal'].includes(j.status_jadwal);
                return (
                  <tr key={j.jadwal_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSelesai ? 'bg-[#f0fdf4] text-[#16a34a]' : isBatal ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-[#eff6ff] text-[#2563eb]'}`}><Calendar size={14} /></div><div><p className="text-[13px] font-semibold text-gray-900">{new Date(j.tanggal_penjemputan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p><p className="text-[11px] text-gray-500">{j.waktu_penjemputan?.slice(0, 5)}</p></div></div></td>
                    <td className="px-5 py-4"><p className="text-[13px] font-semibold text-gray-900">{j.pengajuan_penjemputan?.warga?.nama_warga}</p><p className="text-[11px] text-gray-500">{j.pengajuan_penjemputan?.warga?.no_telepon}</p></td>
                    <td className="px-5 py-4 text-[12px] text-gray-700 max-w-[160px] truncate">{j.pengajuan_penjemputan?.alamat_penjemputan}</td>
                    <td className="px-5 py-4"><div className="space-y-1">{getSampahDisplay(j).map((d, i) => <div key={i} className="flex items-center gap-2 text-[12px] text-gray-700">{d.nama}{d.isAktual && <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-px">aktual</span>}</div>)}</div></td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-900">{Number(getBeratDisplay(j) || 0).toFixed(1).replace('.', ',')} kg</td>
                    <td className="px-5 py-4">{isSelesai ? <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] text-[11px] font-semibold border border-green-100">Selesai</span> : isBatal ? <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold border border-red-100">Dibatalkan</span> : <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#eff6ff] text-[#1d4ed8] text-[11px] font-semibold border border-blue-100">Dalam Proses</span>}</td>
                    <td className="px-5 py-4"><button onClick={() => { setSelected(j); setShowDetail(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl border border-green-200 text-[#16a34a] bg-white hover:bg-green-50 text-[12px] font-medium"><Eye size={14} />Lihat Detail</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="lg:hidden">
          {paginated.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Tidak ada riwayat penjemputan</div>
          ) : (
            <div className="space-y-4 p-4">
              {paginated.map(j => {
                const isSelesai = j.status_jadwal === 'selesai';
                const isBatal = ['dibatalkan', 'batal'].includes(j.status_jadwal);
                return (
                  <div key={j.jadwal_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSelesai ? 'bg-[#f0fdf4] text-[#16a34a]' : isBatal ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-[#eff6ff] text-[#2563eb]'}`}>
                          <Calendar size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{new Date(j.tanggal_penjemputan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500">{j.waktu_penjemputan?.slice(0, 5)} WIB</p>
                        </div>
                      </div>
                      {isSelesai ? (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] text-xs font-semibold border border-green-100 flex-shrink-0 ml-2">Selesai</span>
                      ) : isBatal ? (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fef2f2] text-[#b91c1c] text-xs font-semibold border border-red-100 flex-shrink-0 ml-2">Dibatalkan</span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#eff6ff] text-[#1d4ed8] text-xs font-semibold border border-blue-100 flex-shrink-0 ml-2">Dalam Proses</span>
                      )}
                    </div>
                    
                    <div className="space-y-2.5 text-xs mb-3">
                      <div>
                        <span className="text-gray-500 block mb-1">Warga:</span>
                        <p className="text-gray-900 font-semibold">{j.pengajuan_penjemputan?.warga?.nama_warga}</p>
                        <p className="text-gray-600">{j.pengajuan_penjemputan?.warga?.no_telepon}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Alamat:</span>
                        <p className="text-gray-700 leading-relaxed">{j.pengajuan_penjemputan?.alamat_penjemputan}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Total Berat:</span>
                        <p className="text-gray-900 font-semibold">{Number(getBeratDisplay(j) || 0).toFixed(1).replace('.', ',')} kg</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Jenis Sampah:</span>
                        <div className="space-y-1">
                          {getSampahDisplay(j).map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                              <span>{d.nama}</span>
                              {d.isAktual && (
                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-px">aktual</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <button 
                        onClick={() => { setSelected(j); setShowDetail(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#16a34a] bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        <Eye size={12} />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-[12px] text-gray-500">
          <span>Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} riwayat penjemputan</span>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(n => <button key={n} onClick={() => setCurrentPage(n)} className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold ${currentPage === n ? 'bg-[#16a34a] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{n}</button>)}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
      )}

      <div className="flex gap-3 bg-[#f8faf7] border border-green-50 rounded-2xl p-4 text-[12px] text-gray-600">
        <div className="h-6 w-6 rounded-full bg-white border border-green-100 flex items-center justify-center text-green-600 flex-shrink-0">ⓘ</div>
        <p>Klik "Lihat Detail" untuk melihat informasi lengkap penjemputan dan hasil setoran.</p>
      </div>

      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Penjemputan</h3>
                <p className="text-xs text-gray-400">
                  ID Jadwal: #{selected.jadwal_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-[13.5px]">
              {/* Jadwal Info Card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Tanggal Penjemputan</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatTanggal(selected.tanggal_penjemputan)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Waktu Penjemputan</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {formatWaktu(selected.waktu_penjemputan)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Status Tugas</span>
                  {renderStatusBadge(selected.status_jadwal)}
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
                      {selected.pengajuan_penjemputan?.warga?.nama_warga}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nomor Telepon:</span>
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selected.pengajuan_penjemputan?.warga?.no_telepon}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Alamat Lengkap:</span>
                  <p className="font-medium text-gray-700 text-xs mt-0.5 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{selected.pengajuan_penjemputan?.alamat_penjemputan}</span>
                  </p>
                </div>
              </div>

              {/* Detail Sampah */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#16a34a]" />
                    <span>
                      {getTransaksiAktual(selected)?.detail_setoran?.length
                        ? 'Jenis Sampah Aktual (termasuk tambahan)'
                        : 'Estimasi Jenis Sampah'}
                    </span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Est. Total: {selected.pengajuan_penjemputan?.perkiraan_total_berat || 0} kg
                    {getTransaksiAktual(selected)?.total_berat_aktual != null &&
                      ` • Aktual: ${getTransaksiAktual(selected)?.total_berat_aktual} kg`}
                  </span>
                </div>
                <div className="space-y-2">
                  {getSampahDisplay(selected).map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{d.nama}</span>
                        {d.isAktual && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                            aktual
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">{d.berat} kg</span>
                    </div>
                  ))}
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

function renderStatusBadge(status?: string) {
  const s = (status || '').toLowerCase();

  if (s === 'terjadwal' || s === 'dijadwalkan') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe]">
        Dijadwalkan
      </span>
    );
  }
  if (s === 'diproses' || s === 'dalam proses') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#d97706] bg-[#fef3c7] border border-[#fde68a]">
        Dalam Proses
      </span>
    );
  }
  if (s === 'selesai') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
        Selesai
      </span>
    );
  }
  if (s === 'dibatalkan' || s === 'batal') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca]">
        Dibatalkan
      </span>
    );
  }

  return (
    <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-gray-600 bg-gray-100">
      {status || 'Unknown'}
    </span>
  );
}
