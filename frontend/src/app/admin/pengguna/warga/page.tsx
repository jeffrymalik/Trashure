'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AdminHeader from '@/components/layout/header';
import { apiFetch } from '@/lib/api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface Warga {
  warga_id: number;
  user_id: number;
  nik: string;
  nama_warga: string;
  jenis_kelamin: string;
  alamat: string;
  no_telepon: string | null;
  user: User;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const emptyForm = {
  username: '',
  email: '',
  password: '',
  nik: '',
  nama_warga: '',
  jenis_kelamin: 'Laki-laki',
  alamat: '',
  no_telepon: '',
  status: 'aktif',
};

// Terjemahkan sisa pesan error berbahasa Inggris ke bahasa Indonesia
function terjemahkanError(pesan?: string, fallback = 'Terjadi kesalahan. Silakan periksa kembali data yang dimasukkan.'): string {
  if (!pesan) return fallback;
  const p = pesan.trim();
  if (/the given data was invalid/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  if (/failed to fetch|networkerror|network request failed/i.test(p)) return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  if (/unauthenticated/i.test(p)) return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  if (/no query results for model/i.test(p)) return 'Data tidak ditemukan.';
  if (!/[а-яa-zA-Z]/.test(p)) return fallback;
  // Jika masih berbahasa Inggris ala Laravel ("The ... field ..."), ganti dengan pesan umum
  if (/^the .* (field|must|is|has|should)/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  return p;
}

function ambilPesanError(data: { message?: string; errors?: Record<string, string[]> }): string {
  const dariErrors = data.errors ? Object.values(data.errors).flat().filter(Boolean).join(' ') : '';
  return terjemahkanError(dariErrors || data.message);
}

export default function WargaPage() {
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [deletingWarga, setDeletingWarga] = useState<Warga | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Kembali ke atas modal agar notifikasi terlihat
  const scrollModalTop = () => {
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pesan peringatan sesuai field yang belum diisi / tidak valid
  const validasiForm = (): string | null => {
    if (!form.username.trim()) return 'Username wajib diisi.';
    if (!form.email.trim()) return 'Email wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Format email tidak valid.';
    if (!editingWarga) {
      if (!form.password) return 'Password wajib diisi.';
    }
    if (form.password && form.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }
    if (!form.nik.trim()) return 'NIK wajib diisi.';
    if (form.nik.trim().length !== 16) return 'NIK harus terdiri dari 16 digit.';
    if (!form.no_telepon.trim()) return 'Nomor telepon wajib diisi.';
    if (form.no_telepon.trim().length !== 12) return 'Nomor telepon harus terdiri dari 12 digit.';
    if (!form.nama_warga.trim()) return 'Nama warga wajib diisi.';
    if (!form.alamat.trim()) return 'Alamat wajib diisi.';
    return null;
  };

  const fetchWarga = useCallback(async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchQuery) params.append('search', searchQuery);

      const res = await apiFetch(`/admin/warga?${params}`);
      const data = await res.json();
      setWargaList(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data warga.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarga(1, search);
  }, [fetchWarga, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchWarga(1, value);
  };

  const openAddModal = () => {
    setEditingWarga(null);
    setForm(emptyForm);
    setShowModal(true);
    setModalError(null);
  };

  const openEditModal = (warga: Warga) => {
    setEditingWarga(warga);
    setForm({
      username: warga.user.username,
      email: warga.user.email,
      password: '',
      nik: warga.nik,
      nama_warga: warga.nama_warga,
      jenis_kelamin: warga.jenis_kelamin,
      alamat: warga.alamat,
      no_telepon: warga.no_telepon || '',
      status: warga.user?.status || 'aktif',
    });
    setShowModal(true);
    setModalError(null);
  };

  const openDeleteModal = (warga: Warga) => {
    setDeletingWarga(warga);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    // Validasi tiap field dengan pesan spesifik, lalu kembali ke atas modal
    const pesanError = validasiForm();
    if (pesanError) {
      setModalError(pesanError);
      setIsSubmitting(false);
      scrollModalTop();
      return;
    }

    try {
      const url = editingWarga
        ? `/admin/warga/${editingWarga.warga_id}`
        : `/admin/warga`;

      const method = editingWarga ? 'PUT' : 'POST';

      const body: Record<string, string> = { ...form };
      if (editingWarga && !body.password) delete body.password;

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(ambilPesanError(data));
      }

      setMessage({ type: 'success', text: editingWarga ? 'Warga berhasil diperbarui.' : 'Warga berhasil ditambahkan.' });
      setShowModal(false);
      setModalError(null);
      fetchWarga(pagination.current_page, search);
    } catch (err: any) {
      // Tampilkan notif salah di dalam modal, bukan di halaman belakang
      setModalError(terjemahkanError(err.message));
      scrollModalTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarga) return;
    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/admin/warga/${deletingWarga.warga_id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(terjemahkanError(data.message, 'Gagal menghapus warga.'));

      setMessage({ type: 'success', text: 'Warga berhasil dihapus.' });
      setShowDeleteModal(false);
      setDeletingWarga(null);
      fetchWarga(pagination.current_page, search);
    } catch (err: any) {
      setMessage({ type: 'error', text: terjemahkanError(err.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AdminHeader
        title="Data Warga"
        subtitle="Kelola data warga bank sampah."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Master Data' },
          { label: 'Warga' },
        ]}
      />

      {message && (
        <div className={`mb-4 p-3.5 rounded-lg sm:rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, atau telepon..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah Warga
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table & Mobile Cards */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Alamat</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No. Telepon</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-300" />
                    Memuat data...
                  </td>
                </tr>
              ) : wargaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                    Tidak ada data warga ditemukan.
                  </td>
                </tr>
              ) : (
                wargaList.map((warga) => (
                  <tr key={warga.warga_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-700">{warga.nik}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{warga.nama_warga}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{warga.jenis_kelamin}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-[200px] truncate">{warga.alamat}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{warga.no_telepon || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${warga.user?.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {warga.user?.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(warga)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(warga)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">
            Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} warga
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchWarga(pagination.current_page - 1, search)}
              disabled={pagination.current_page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchWarga(page, search)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                  pagination.current_page === page
                    ? 'bg-[#16a34a] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => fetchWarga(pagination.current_page + 1, search)}
              disabled={pagination.current_page >= pagination.last_page}
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">
                  {editingWarga ? 'Edit Warga' : 'Tambah Warga'}
                </h3>
                <p className="text-xs text-gray-400">
                  {editingWarga ? 'Perbarui data warga.' : 'Tambahkan data warga baru.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 text-[13.5px] max-h-[70vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 rounded-lg sm:rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-medium">{modalError}</span>
                  <button type="button" onClick={() => setModalError(null)} className="ml-auto flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password {editingWarga ? <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span> : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingWarga ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  required={!editingWarga}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">NIK (16 digit)</label>
                <input
                  type="text"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/[^0-9]/g, '').slice(0, 16) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  maxLength={16}
                  inputMode="numeric"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama_warga}
                  onChange={(e) => setForm({ ...form, nama_warga: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={form.jenis_kelamin}
                    onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">No. Telepon (12 digit)</label>
                  <input
                    type="text"
                    value={form.no_telepon}
                    onChange={(e) => setForm({ ...form, no_telepon: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="contoh: 081234567890"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                    required
                    minLength={12}
                    maxLength={12}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 resize-none"
                  rows={3}
                  required
                />
              </div>
              {editingWarga && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status Akun</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white cursor-pointer"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              )}
            </form>
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl disabled:opacity-60 transition-colors"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingWarga ? 'Simpan Perubahan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingWarga && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">Hapus Warga?</h3>
              <p className="text-xs text-gray-500">
                Data <span className="font-semibold">{deletingWarga.nama_warga}</span> akan dihapus secara permanen.
              </p>
            </div>
            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeletingWarga(null); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg sm:rounded-xl disabled:opacity-60 transition-colors"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
