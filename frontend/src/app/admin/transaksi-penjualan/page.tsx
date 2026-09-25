'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminHeader from '@/components/layout/header';
import { Search, RotateCcw, Plus, Trash2, Eye, X, DollarSign, Scale, ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Pengepul {
  pengepul_id: number;
  nama_pengepul: string;
  no_telepon?: string;
}

interface JenisSampah {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  satuan?: string;
  harga_jual?: number;
  stok_tersedia?: number;
}

interface DetailPenjualan {
  detail_penjualan_id: number;
  jenis_sampah_id: number;
  jumlah_terjual: number;
  harga_satuan: number;
  subtotal: number;
  jenis_sampah: JenisSampah;
}

interface TransaksiPenjualan {
  penjualan_id: number;
  pengepul_id: number;
  admin_id: number;
  tanggal_transaksi: string;
  total_penjualan: number;
  status_transaksi: string;
  media_konfirmasi?: string;
  metode_transaksi?: string;
  catatan?: string;
  pengepul: Pengepul;
  admin: { nama_admin: string };
  detail_penjualan: DetailPenjualan[];
}

interface FormDetail {
  jenis_sampah_id: number;
  jumlah_terjual: number;
  harga_satuan: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

export default function TransaksiPenjualanPage() {
  const [list, setList] = useState<TransaksiPenjualan[]>([]);
  const [pengepulList, setPengepulList] = useState<Pengepul[]>([]);
  const [jenisSampahList, setJenisSampahList] = useState<JenisSampah[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<TransaksiPenjualan | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Form state
  const [formPengepulId, setFormPengepulId] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [formMediaKonfirmasi, setFormMediaKonfirmasi] = useState('');
  const [formMetodeTransaksi, setFormMetodeTransaksi] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formDetail, setFormDetail] = useState<FormDetail[]>([
    { jenis_sampah_id: 0, jumlah_terjual: 0, harga_satuan: 0 }
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Toast
  const [pageAlert, setPageAlert] = useState({ type: 'success' as 'success' | 'error', message: '' });
  const [modalAlert, setModalAlert] = useState({ type: 'error' as 'success' | 'error', message: '' });

  useEffect(() => {
    fetchData();
    fetchPengepul();
    fetchJenisSampah();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/penjualan`, { headers });
      const result = await response.json();
      setList(result?.data && Array.isArray(result.data) ? result.data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPengepul = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/pengepul`, { headers });
      const result = await response.json();
      if (result?.data && Array.isArray(result.data)) {
        setPengepulList(result.data);
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

      const response = await fetch(`${API_BASE_URL}/admin/penjualan/jenis-sampah`, { headers });
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
    const totalBerat = list.reduce((sum, x) =>
      sum + x.detail_penjualan.reduce((s, d) => s + Number(d.jumlah_terjual || 0), 0), 0
    );
    const totalPendapatan = list.reduce((sum, x) => sum + Number(x.total_penjualan || 0), 0);
    return { total, totalBerat, totalPendapatan };
  }, [list]);

  // Filter
  const filtered = useMemo(() => {
    return list.filter(s => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const pengepul = s.pengepul?.nama_pengepul?.toLowerCase() || '';
        const no = `PJL-${s.penjualan_id}`.toLowerCase();
        if (!pengepul.includes(q) && !no.includes(q)) return false;
      }
      if (dariTanggal) {
        const tgl = new Date(s.tanggal_transaksi).toISOString().slice(0, 10);
        if (tgl < dariTanggal) return false;
      }
      if (sampaiTanggal) {
        const tgl = new Date(s.tanggal_transaksi).toISOString().slice(0, 10);
        if (tgl > sampaiTanggal) return false;
      }
      return true;
    });
  }, [list, search, dariTanggal, sampaiTanggal]);

  // Pagination
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const resetFilter = () => {
    setSearch('');
    setDariTanggal('');
    setSampaiTanggal('');
    setCurrentPage(1);
  };

  // Form helpers
  const addDetailRow = () => {
    setFormDetail([...formDetail, { jenis_sampah_id: 0, jumlah_terjual: 0, harga_satuan: 0 }]);
  };

  const removeDetailRow = (index: number) => {
    if (formDetail.length > 1) {
      setFormDetail(formDetail.filter((_, i) => i !== index));
    }
  };

  const updateDetailRow = (index: number, field: keyof FormDetail, value: number) => {
    const updated = formDetail.map((item, i) => {
      if (i !== index) return item;
      const updatedItem = { ...item, [field]: value };
      // Auto-fill harga saat pilih jenis sampah
      if (field === 'jenis_sampah_id') {
        const jenis = jenisSampahList.find(j => j.jenis_sampah_id === value);
        if (jenis && jenis.harga_jual) {
          updatedItem.harga_satuan = jenis.harga_jual;
        }
      }
      return updatedItem;
    });
    setFormDetail(updated);
  };

  const formTotal = useMemo(() => {
    return formDetail.reduce((sum, d) => sum + (d.jumlah_terjual * d.harga_satuan), 0);
  }, [formDetail]);

  const formTotalBerat = useMemo(() => {
    return formDetail.reduce((sum, d) => sum + d.jumlah_terjual, 0);
  }, [formDetail]);

  const handleSubmit = async () => {
    if (!formPengepulId) {
      setModalAlert({ type: 'error', message: 'Pilih pengepul terlebih dahulu' });
      return;
    }
    if (!formMediaKonfirmasi) {
      setModalAlert({ type: 'error', message: 'Pilih media konfirmasi' });
      return;
    }
    if (!formMetodeTransaksi) {
      setModalAlert({ type: 'error', message: 'Pilih metode transaksi' });
      return;
    }
    if (formDetail.some(d => d.jenis_sampah_id === 0 || d.jumlah_terjual <= 0)) {
      setModalAlert({ type: 'error', message: 'Lengkapi semua jenis sampah dan berat' });
      return;
    }

    // Validasi stok
    for (const item of formDetail) {
      const jenis = jenisSampahList.find(j => j.jenis_sampah_id === item.jenis_sampah_id);
      if (jenis && item.jumlah_terjual > (jenis.stok_tersedia || 0)) {
        setModalAlert({ type: 'error', message: `Stok ${jenis.nama_jenis_sampah} tidak mencukupi. Stok tersedia: ${jenis.stok_tersedia} kg` });
        return;
      }
    }

    setModalAlert({ type: 'error', message: '' });
    try {
      setLoadingSubmit(true);
      const token = getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/penjualan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pengepul_id: Number(formPengepulId),
          tanggal_transaksi: formTanggal,
          media_konfirmasi: formMediaKonfirmasi,
          metode_transaksi: formMetodeTransaksi,
          catatan: formCatatan || null,
          detail: formDetail.map(d => ({
            jenis_sampah_id: d.jenis_sampah_id,
            jumlah_terjual: d.jumlah_terjual,
          })),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setModalAlert({ type: 'error', message: '' });
        resetForm();
        fetchData();
        setPageAlert({ type: 'success', message: 'Transaksi penjualan berhasil dibuat!' });
        setTimeout(() => setPageAlert({ type: 'success', message: '' }), 3500);
      } else {
        const data = await response.json();
        setModalAlert({ type: 'error', message: data.message || 'Gagal membuat transaksi' });
      }
    } catch {
      setModalAlert({ type: 'error', message: 'Terjadi kesalahan' });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setFormPengepulId('');
    setFormTanggal(new Date().toISOString().slice(0, 10));
    setFormMediaKonfirmasi('');
    setFormMetodeTransaksi('');
    setFormCatatan('');
    setFormDetail([{ jenis_sampah_id: 0, jumlah_terjual: 0, harga_satuan: 0 }]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus transaksi ini? Stok akan dikembalikan.')) return;

    try {
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/admin/penjualan/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        fetchData();
        setPageAlert({ type: 'success', message: 'Transaksi berhasil dihapus' });
        setTimeout(() => setPageAlert({ type: 'success', message: '' }), 3500);
      } else {
        const data = await response.json();
        setPageAlert({ type: 'error', message: data.message || 'Gagal menghapus transaksi' });
        setTimeout(() => setPageAlert({ type: 'error', message: '' }), 3500);
      }
    } catch {
      setPageAlert({ type: 'error', message: 'Terjadi kesalahan' });
      setTimeout(() => setPageAlert({ type: 'error', message: '' }), 3500);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
      <AdminHeader
        title="Transaksi Penjualan Sampah"
        subtitle="Catat transaksi penjualan sampah dari bank sampah ke pengepul."
      />

      {pageAlert.message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium mb-4 ${pageAlert.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {pageAlert.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {pageAlert.message}
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Penjualan</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.total}</p>
            <p className="text-[11px] text-gray-400">Transaksi</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Berat Terjual</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{stats.totalBerat.toFixed(1).replace('.', ',')} kg</p>
            <p className="text-[11px] text-gray-400">Keseluruhan</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fffbeb] text-[#d97706] flex-shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Pendapatan</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">{formatRupiah(stats.totalPendapatan)}</p>
            <p className="text-[11px] text-gray-400">Rupiah</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari nama pengepul atau no. transaksi..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={dariTanggal}
              onChange={e => { setDariTanggal(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a]"
            />
            <input
              type="date"
              value={sampaiTanggal}
              onChange={e => { setSampaiTanggal(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-[#16a34a]"
            />
            <button
              onClick={resetFilter}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 bg-[#16a34a] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#15803d]"
            >
              <Plus className="h-4 w-4" />
              Transaksi Baru
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
                <th className="px-5 py-4">Pengepul</th>
                <th className="px-5 py-4">Jenis Sampah</th>
                <th className="px-5 py-4">Total Berat</th>
                <th className="px-5 py-4">Total Harga</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Memuat data...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Tidak ada data transaksi</td></tr>
              ) : (
                paginated.map(s => (
                  <tr key={s.penjualan_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-bold text-gray-900">PJL-{String(s.penjualan_id).padStart(4, '0')}</p>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-gray-700">
                      {new Date(s.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-semibold text-gray-900">{s.pengepul?.nama_pengepul || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.detail_penjualan?.map(d => (
                          <span key={d.detail_penjualan_id} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md">
                            {d.jenis_sampah?.nama_jenis_sampah}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-900">
                      {s.detail_penjualan?.reduce((sum, d) => sum + Number(d.jumlah_terjual), 0).toFixed(1).replace('.', ',')} kg
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-900">
                      {formatRupiah(Number(s.total_penjualan))}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${s.status_transaksi === 'selesai'
                          ? 'bg-[#f0fdf4] text-[#15803d] border border-green-100'
                          : s.status_transaksi === 'dibatalkan'
                            ? 'bg-[#fef2f2] text-[#b91c1c] border border-red-100'
                            : 'bg-[#fffbeb] text-[#92400e] border border-amber-100'
                        }`}>
                        {s.status_transaksi === 'selesai' ? 'Selesai' : s.status_transaksi === 'dibatalkan' ? 'Dibatalkan' : 'Diajukan'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setSelected(s); setShowDetail(true); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-[12px] font-medium"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(s.penjualan_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 text-[12px] font-medium"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-semibold ${currentPage === n ? 'bg-[#16a34a] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
              >{n}</button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >›</button>
          </div>
        </div>
      </div>

      {/* Modal Form Transaksi Baru */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Transaksi Penjualan Baru</h3>
                <p className="text-xs text-gray-400">Isi data penjualan sampah ke pengepul</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1 text-[13.5px]">
              {modalAlert.message && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${modalAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {modalAlert.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {modalAlert.message}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pengepul <span className="text-red-500">*</span></label>
                  <select
                    value={formPengepulId}
                    onChange={e => setFormPengepulId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                  >
                    <option value="">Pilih Pengepul</option>
                    {pengepulList.map(p => (
                      <option key={p.pengepul_id} value={p.pengepul_id}>{p.nama_pengepul}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={e => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Media Konfirmasi <span className="text-red-500">*</span></label>
                  <select
                    value={formMediaKonfirmasi}
                    onChange={e => setFormMediaKonfirmasi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                  >
                    <option value="">Pilih Media</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Telepon">Telepon</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="Datang Langsung">Datang Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Metode Transaksi <span className="text-red-500">*</span></label>
                  <select
                    value={formMetodeTransaksi}
                    onChange={e => setFormMetodeTransaksi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                  >
                    <option value="">Pilih Metode</option>
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  placeholder="Catatan transaksi..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a] resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">Detail Sampah <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] hover:text-[#15803d]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {formDetail.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={item.jenis_sampah_id}
                        onChange={e => updateDetailRow(index, 'jenis_sampah_id', Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                      >
                        <option value={0}>Pilih Jenis Sampah</option>
                        {jenisSampahList.map(j => (
                          <option key={j.jenis_sampah_id} value={j.jenis_sampah_id}>
                            {j.nama_jenis_sampah} (Stok: {j.stok_tersedia || 0} kg)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Berat (kg)"
                        value={item.jumlah_terjual || ''}
                        onChange={e => updateDetailRow(index, 'jumlah_terjual', Number(e.target.value))}
                        className="w-28 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#16a34a]"
                        min="0.01"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Harga/kg"
                        value={item.harga_satuan || ''}
                        readOnly
                        className="w-32 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      {formDetail.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-[11px] text-gray-500">Total Berat</p>
                  <p className="text-lg font-extrabold text-gray-900">{formTotalBerat.toFixed(1).replace('.', ',')} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-[#f0fdf4] border border-green-200">
                  <p className="text-[11px] text-[#15803d]">Total Harga</p>
                  <p className="text-lg font-extrabold text-[#15803d]">{formatRupiah(formTotal)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingSubmit ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Transaksi Penjualan</h3>
                <p className="text-xs text-gray-400">
                  ID Penjualan: #{selected.penjualan_id}
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

            <div className="overflow-y-auto p-6 space-y-5 flex-1 text-[13.5px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Pengepul</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selected.pengepul?.nama_pengepul || '-'}</p>
                  <p className="text-[10px] text-gray-500">{selected.pengepul?.no_telepon || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Admin</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selected.admin?.nama_admin || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Tanggal</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {new Date(selected.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Status</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${selected.status_transaksi === 'selesai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {selected.status_transaksi}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Media Konfirmasi</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selected.media_konfirmasi || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Metode Transaksi</p>
                  <p className="font-bold text-gray-900 mt-0.5">{selected.metode_transaksi || '-'}</p>
                </div>
              </div>

              {selected.catatan && (
                <div className="p-3.5 rounded-2xl border bg-amber-50/70 border-amber-200/80 text-amber-900">
                  <p className="font-bold mb-1">Catatan:</p>
                  <p>{selected.catatan}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Detail Penjualan</h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="py-2.5 px-3.5">Jenis Sampah</th>
                        <th className="py-2.5 px-3.5 text-right">Berat (kg)</th>
                        <th className="py-2.5 px-3.5 text-right">Harga/kg</th>
                        <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.detail_penjualan?.map(d => (
                        <tr key={d.detail_penjualan_id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3.5 font-bold text-gray-800">{d.jenis_sampah?.nama_jenis_sampah || '-'}</td>
                          <td className="py-3 px-3.5 text-right font-bold text-gray-900">{Number(d.jumlah_terjual).toFixed(2)}</td>
                          <td className="py-3 px-3.5 text-right text-gray-500">{formatRupiah(Number(d.harga_satuan))}</td>
                          <td className="py-3 px-3.5 text-right font-extrabold text-[#15803d]">{formatRupiah(Number(d.subtotal))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-green-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#15803d] uppercase tracking-wide">Total Penjualan</p>
                  <p className="text-xl font-black text-[#15803d]">{formatRupiah(Number(selected.total_penjualan))}</p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-[#15803d] flex items-center justify-center border border-green-200">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </div>

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
