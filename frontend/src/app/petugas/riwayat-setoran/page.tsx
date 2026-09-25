'use client';
import { useState, useEffect, useMemo } from 'react';
import PetugasHeader from '@/components/layout/header';

import { Search, RotateCcw, FileText, Scale, Star, CheckCircle2, XCircle, Eye, Loader2, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface DetailSetoran { detail_setoran_id: number; jenis_sampah_id: number; berat_aktual: number; harga_satuan: number; nilai_poin_per_satuan: number; poin: number; poin_sementara?: number; jenis_sampah: { jenis_sampah_id: number; nama_jenis_sampah: string; }; }
interface TransaksiSetoran { setoran_id: number; pengajuan_id: number; tanggal_setoran: string; tanggal_validasi?: string | null; status_validasi: string; catatan_validasi?: string | null; catatan_penolakan?: string | null; total_berat_aktual: number; total_poin: number; total_poin_sementara?: number; poin?: number; warga: { warga_id: number; nama_warga: string; no_telepon?: string; alamat?: string; }; detail_setoran: DetailSetoran[]; validator_admin?: { nama_admin: string; }; validatorAdmin?: { nama_admin: string; }; }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const getToken = () => { if (typeof window === 'undefined') return ''; return localStorage.getItem('trashure_token') || localStorage.getItem('token') || ''; };

export default function RiwayatSetoranPage() {
  const [list, setList] = useState<TransaksiSetoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [selected, setSelected] = useState<TransaksiSetoran | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { setLoading(true); const token = getToken(); const h: HeadersInit = { Accept: 'application/json' }; if (token) h['Authorization'] = `Bearer ${token}`; const r = await fetch(`${API_BASE_URL}/petugas/setoran`, { headers: h }); const j = await r.json(); if (j?.data && Array.isArray(j.data)) setList(j.data); else setList([]); } catch { setList([]); } finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const total = list.length;
    const totalBerat = list.reduce((s, x) => s + Number(x.total_berat_aktual || 0), 0);
    const valid = list.filter(x => x.status_validasi === 'disetujui').length;
    const tidakValid = list.filter(x => x.status_validasi === 'ditolak').length;
    const menunggu = list.filter(x => x.status_validasi === 'menunggu').length;
    return { total, totalBerat, valid, tidakValid, menunggu };
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter(s => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const warga = s.warga?.nama_warga?.toLowerCase() || '';
        const jenis = (s.detail_setoran || []).map(d => d.jenis_sampah?.nama_jenis_sampah?.toLowerCase()).join(' ');
        const no = `stn-${s.setoran_id}`.toLowerCase();
        if (!warga.includes(q) && !jenis.includes(q) && !no.includes(q)) return false;
      }
      if (statusFilter !== 'Semua Status') {
        const map: Record<string, string> = { 'Diajukan': 'diajukan', 'Terverifikasi': 'disetujui', 'Menunggu Validasi': 'menunggu', 'Ditolak': 'ditolak' };
        if (statusFilter === 'Diajukan') {
          const sp = (s as any).status_pengajuan?.toLowerCase();
          if (sp !== 'diajukan') return false;
        } else {
          if (s.status_validasi !== map[statusFilter]) return false;
        }
      }
      if (tanggalDari || tanggalSampai) {
        const d = String(s.tanggal_setoran || '').slice(0, 10);
        if (!d) return false;
        if (tanggalDari && d < tanggalDari) return false;
        if (tanggalSampai && d > tanggalSampai) return false;
      }
      return true;
    })
    // Data terbaru paling atas
    .sort((a, b) => {
      const t = String(b.tanggal_setoran || '').localeCompare(String(a.tanggal_setoran || ''));
      return t !== 0 ? t : b.setoran_id - a.setoran_id;
    });
  }, [list, search, statusFilter, tanggalDari, tanggalSampai]);

  const paginated = useMemo(() => { const s = (currentPage - 1) * pageSize; return filtered.slice(s, s + pageSize); }, [filtered, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const resetFilter = () => { setSearch(''); setStatusFilter('Semua Status'); setTanggalDari(''); setTanggalSampai(''); setCurrentPage(1); };

  return (
    <div className="max-w-[1400px] mx-auto pb-12">
      <PetugasHeader title="Riwayat Setoran" subtitle="Riwayat transaksi setoran sampah yang telah Anda lakukan." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0"><FileText className="h-6 w-6" /></div>
          <div><p className="text-[11px] font-medium text-gray-500">Total Setoran</p><p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.total}</p><p className="text-[11px] text-gray-400">Transaksi</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0"><Scale className="h-6 w-6" /></div>
          <div><p className="text-[11px] font-medium text-gray-500">Total Berat Sampah</p><p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.totalBerat.toFixed(1).replace('.', ',')} kg</p><p className="text-[11px] text-gray-400">Keseluruhan</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fffbeb] text-[#d97706] flex-shrink-0"><Star className="h-6 w-6" /></div>
          <div><p className="text-[11px] font-medium text-gray-500">Menunggu Validasi</p><p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.menunggu}</p><p className="text-[11px] text-gray-400">Transaksi</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f3ff] text-[#7c3aed] flex-shrink-0"><CheckCircle2 className="h-6 w-6" /></div>
          <div><p className="text-[11px] font-medium text-gray-500">Disetujui</p><p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.valid}</p><p className="text-[11px] text-gray-400">Transaksi</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626] flex-shrink-0"><XCircle className="h-6 w-6" /></div>
          <div><p className="text-[11px] font-medium text-gray-500">Ditolak</p><p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.tidakValid}</p><p className="text-[11px] text-gray-400">Transaksi</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Cari nama warga, jenis sampah, atau no. transaksi..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm text-[13px]"><span className="text-gray-400 mr-2 text-xs">Status Validasi</span><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer"><option>Semua Status</option><option>Diajukan</option><option>Terverifikasi</option><option>Menunggu Validasi</option><option>Ditolak</option></select></div>
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
            Memuat Riwayat Setoran...
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-1 max-w-sm">
            Menyiapkan riwayat transaksi setoran sampah yang telah Anda lakukan.
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden mb-5">
        {/* Desktop Table - hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-gray-100 bg-[#fafafa]/80 text-[12px] font-bold text-gray-600"><th className="px-5 py-4">No. Transaksi</th><th className="px-5 py-4">Warga</th><th className="px-5 py-4">Tanggal Setoran</th><th className="px-5 py-4">Jenis Sampah & Berat</th><th className="px-5 py-4">Total Berat</th><th className="px-5 py-4">Poin</th><th className="px-5 py-4">Status Validasi</th><th className="px-5 py-4">Aksi</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Tidak ada riwayat setoran</td></tr> : paginated.map(s => (
                <tr key={s.setoran_id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 align-top"><p className="text-[13px] font-bold text-gray-900">STN-2024-0822-{String(s.setoran_id).padStart(3, '0')}</p><p className="text-[11px] text-gray-400 mt-1">Dari Pengajuan</p><p className="text-[11px] font-semibold text-[#16a34a]">PGJ-2024-0822-{String(s.pengajuan_id).padStart(3, '0')}</p></td>
                  <td className="px-5 py-4 align-top"><p className="text-[13px] font-semibold text-gray-900">{s.warga.nama_warga}</p><p className="text-[11px] text-gray-500">{s.warga.no_telepon || '-'}</p><p className="text-[11px] text-gray-400">{s.warga.alamat?.split('/')[0]?.trim()}</p></td>
                  <td className="px-5 py-4 align-top text-[12px] text-gray-700">{new Date(s.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}<br /><span className="text-gray-400">{new Date(s.tanggal_setoran).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></td>
                  <td className="px-5 py-4 align-top"><div className="space-y-1.5">{(s.detail_setoran || []).map(d => <div key={d.detail_setoran_id} className="flex items-center justify-between gap-3 text-[12px]"><span className="flex items-center gap-2">{d.jenis_sampah.nama_jenis_sampah}</span><span className="font-medium text-gray-700">{Number(d.berat_aktual).toFixed(1).replace('.', ',')} kg</span></div>)}</div></td>
                  <td className="px-5 py-4 align-top text-[13px] font-semibold text-gray-900">{Number(s.total_berat_aktual).toFixed(1).replace('.', ',')} kg</td>
                  <td className="px-5 py-4 align-top text-center"><p className="text-[14px] font-bold text-gray-900">{s.status_validasi === 'menunggu' ? s.total_poin_sementara : (s as any).total_poin ?? s.total_poin_sementara}</p></td>
                  <td className="px-5 py-4 align-top">
                    {s.status_validasi === 'disetujui' && <><span className="inline-flex px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] text-[11px] font-semibold border border-green-100">Terverifikasi</span><p className="text-[10px] text-gray-400 mt-1">Oleh Admin<br />{s.tanggal_validasi ? new Date(s.tanggal_validasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(s.tanggal_validasi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p></>}
                    {s.status_validasi === 'menunggu' && <><span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fffbeb] text-[#92400e] text-[11px] font-semibold border border-amber-100">Menunggu Validasi</span><p className="text-[10px] text-gray-400 mt-1">Menunggu Admin<br />{new Date(s.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p></>}
                    {s.status_validasi === 'ditolak' && <><span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold border border-red-100">Ditolak</span><p className="text-[10px] text-gray-400 mt-1">Oleh Petugas<br />{new Date(s.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>{s.catatan_penolakan && <p className="text-[10px] text-red-500 mt-1 italic">"{s.catatan_penolakan}"</p>}</>}
                  </td>
                  <td className="px-5 py-4 align-top"><button onClick={() => { setSelected(s); setShowDetail(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[12px] font-medium"><Eye size={14} />Lihat Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="lg:hidden">
          {paginated.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Tidak ada riwayat setoran</div>
          ) : (
            <div className="space-y-4 p-4">
              {paginated.map(s => (
                <div key={s.setoran_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-900">STN-2024-0822-{String(s.setoran_id).padStart(3, '0')}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Dari PGJ-2024-0822-{String(s.pengajuan_id).padStart(3, '0')}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {s.status_validasi === 'disetujui' && (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#15803d] text-xs font-semibold border border-green-100">Terverifikasi</span>
                      )}
                      {s.status_validasi === 'menunggu' && (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fffbeb] text-[#92400e] text-xs font-semibold border border-amber-100">Menunggu Validasi</span>
                      )}
                      {s.status_validasi === 'ditolak' && (
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#fef2f2] text-[#b91c1c] text-xs font-semibold border border-red-100">Ditolak</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 text-xs mb-3">
                    <div>
                      <span className="text-gray-500 block mb-1">Warga:</span>
                      <p className="text-gray-900 font-semibold">{s.warga.nama_warga}</p>
                      <p className="text-gray-600">{s.warga.no_telepon || '-'}</p>
                      {s.warga.alamat && (
                        <p className="text-gray-600 text-xs">{s.warga.alamat?.split('/')[0]?.trim()}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block mb-1">Tanggal Setoran:</span>
                        <p className="text-gray-900 font-medium">{new Date(s.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-gray-500 text-xs">{new Date(s.tanggal_setoran).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Total Berat:</span>
                        <p className="text-gray-900 font-bold">{Number(s.total_berat_aktual).toFixed(1).replace('.', ',')} kg</p>
                        <p className="text-blue-600 font-semibold text-xs">{s.status_validasi === 'menunggu' ? `${s.total_poin_sementara} poin sementara` : `${(s as any).total_poin ?? s.total_poin_sementara} poin`}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Jenis Sampah & Berat:</span>
                      <div className="space-y-1">
                        {(s.detail_setoran || []).map(d => (
                          <div key={d.detail_setoran_id} className="flex items-center justify-between gap-2 text-xs bg-white rounded-md p-2 border">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-gray-700 truncate">{d.jenis_sampah.nama_jenis_sampah}</span>
                            </div>
                            <span className="font-medium text-gray-900 flex-shrink-0">{Number(d.berat_aktual).toFixed(1).replace('.', ',')} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {s.status_validasi === 'ditolak' && s.catatan_penolakan && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-2">
                        <span className="text-red-700 font-medium text-xs block mb-1">Catatan Penolakan:</span>
                        <p className="text-red-600 text-xs italic">"{s.catatan_penolakan}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => { setSelected(s); setShowDetail(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Eye size={12} />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-[12px] text-gray-500">
          <span>Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} transaksi</span>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => <button key={n} onClick={() => setCurrentPage(n)} className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold ${currentPage === n ? 'bg-[#16a34a] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{n}</button>)}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
      )}

      <div className="flex gap-3 bg-[#f8faf7] border border-green-50 rounded-2xl p-4 text-[12px] text-gray-600">
        <div className="h-6 w-6 rounded-full bg-white border border-green-100 flex items-center justify-center text-green-600 flex-shrink-0">ⓘ</div>
        <p>Setoran yang sudah Anda validasi akan masuk ke proses validasi poin dan stok oleh admin.<br />Poin dan stok resmi akan muncul setelah disetujui oleh admin.</p>
      </div>

      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Setoran</h3>
                <p className="text-xs text-gray-400">
                  ID Setoran: #{selected.setoran_id}
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
              {/* Setoran Info Card */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Tanggal Setoran</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {new Date(selected.tanggal_setoran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Total Berat Aktual</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {Number(selected.total_berat_aktual).toFixed(1).replace('.', ',')} kg
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Status Validasi</span>
                  {renderValidasiBadge(selected.status_validasi)}
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
                      {selected.warga?.nama_warga}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nomor Telepon:</span>
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selected.warga?.no_telepon || '-'}
                    </p>
                  </div>
                </div>
                {selected.warga?.alamat && (
                  <div className="pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Alamat Lengkap:</span>
                    <p className="font-medium text-gray-700 text-xs mt-0.5 flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{selected.warga.alamat}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Catatan Penolakan */}
              {selected.status_validasi === 'ditolak' && selected.catatan_penolakan && (
                <div className="p-3 bg-red-50/70 border border-red-100 rounded-lg sm:rounded-xl text-xs text-red-900">
                  <span className="font-bold block mb-0.5">Catatan Penolakan:</span>
                  <p className="italic">"{selected.catatan_penolakan}"</p>
                </div>
              )}

              {/* Detail Sampah */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#16a34a]" />
                    <span>Rincian Jenis Sampah</span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Total Poin: {selected.status_validasi === 'menunggu' ? `${selected.total_poin_sementara ?? 0} poin sementara` : `${(selected as any).total_poin ?? selected.total_poin_sementara ?? 0} poin`}
                  </span>
                </div>
                <div className="space-y-2">
                  {(selected.detail_setoran || []).map((d) => (
                    <div
                      key={d.detail_setoran_id}
                      className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{d.jenis_sampah?.nama_jenis_sampah}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {Number(d.berat_aktual).toFixed(1).replace('.', ',')} kg • {selected.status_validasi === 'menunggu' ? `${d.poin_sementara ?? 0} poin sementara` : `${(d as any).poin ?? d.poin_sementara ?? 0} poin`}
                      </span>
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

function renderValidasiBadge(status?: string) {
  const s = (status || '').toLowerCase();

  if (s === 'disetujui') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
        Terverifikasi
      </span>
    );
  }
  if (s === 'menunggu') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#d97706] bg-[#fef3c7] border border-[#fde68a]">
        Menunggu Validasi
      </span>
    );
  }
  if (s === 'ditolak') {
    return (
      <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca]">
        Ditolak
      </span>
    );
  }

  return (
    <span className="inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold text-gray-600 bg-gray-100">
      {status || 'Unknown'}
    </span>
  );
}
