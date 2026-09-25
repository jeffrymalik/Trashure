'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AdminHeader from '@/components/layout/header';
import { apiFetch } from '@/lib/api';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Mail,
  Shield,
} from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

interface Petugas {
  petugas_id: number;
  user_id: number;
  nama_petugas: string;
  jenis_kelamin: string;
  alamat: string | null;
  no_telepon: string | null;
  created_at: string;
  updated_at: string;
  user?: UserData;
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
  nama_petugas: '',
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
  if (/^the .* (field|must|is|has|should)/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  return p;
}

function ambilPesanError(data: { message?: string; errors?: Record<string, string[]> }): string {
  const dariErrors = data.errors ? Object.values(data.errors).flat().filter(Boolean).join(' ') : '';
  return terjemahkanError(dariErrors || data.message);
}

// Component for rendering stylized avatar matching screenshot with green cap/uniform
function PetugasAvatar({ nama, jenisKelamin }: { nama: string; jenisKelamin?: string }) {
  const isFemale =
    jenisKelamin?.toLowerCase().includes('perempuan') ||
    jenisKelamin?.toLowerCase() === 'p' ||
    ['dewi', 'yuni', 'siti', 'maya', 'rina', 'lestari', 'astuti', 'rahmawati', 'sari'].some((n) =>
      nama.toLowerCase().includes(n)
    );

  return (
    <div className="relative flex h-9 sm:h-10 w-9 sm:w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500/20 shadow-sm">
      {isFemale ? (
        // Hijab / Female petugas illustration in green uniform
        <svg viewBox="0 0 36 36" fill="none" className="h-full w-full">
          <circle cx="18" cy="18" r="18" fill="#DCFCE7" />
          {/* Head hijab green */}
          <path d="M10 21C10 13 13 8 18 8C23 8 26 13 26 21C26 25 24 28 18 28C12 28 10 25 10 21Z" fill="#15803D" />
          {/* Face oval */}
          <ellipse cx="18" cy="18" rx="5.5" ry="6.5" fill="#FDDFBD" />
          {/* Green uniform collar */}
          <path d="M7 36C7 29 12 27 18 27C24 27 29 29 29 36H7Z" fill="#16A34A" />
          <path d="M15 27L18 31L21 27H15Z" fill="#E2E8F0" />
        </svg>
      ) : (
        // Male petugas illustration with green cap & shirt
        <svg viewBox="0 0 36 36" fill="none" className="h-full w-full">
          <circle cx="18" cy="18" r="18" fill="#DCFCE7" />
          {/* Green Cap visor & crown */}
          <path d="M11 13C11 9 14 7 18 7C22 7 25 9 25 13L26 15H10L11 13Z" fill="#16A34A" />
          <path d="M8 15C11 15 25 15 28 15C29 16 26 17 23 17H13C10 17 7 16 8 15Z" fill="#15803D" />
          {/* Face */}
          <ellipse cx="18" cy="19" rx="5.5" ry="6" fill="#FAD7A0" />
          {/* Hair sides */}
          <path d="M12 16V19C12 19 12.5 17 13.5 17" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 16V19C24 19 23.5 17 22.5 17" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
          {/* Green Uniform shirt */}
          <path d="M7 36C7 28 12 26 18 26C24 26 29 28 29 36H7Z" fill="#16A34A" />
          <path d="M16 26L18 30L20 26" fill="#DCFCE7" />
        </svg>
      )}
    </div>
  );
}

// Format date into Indonesian readable format e.g. "12 Jan 2024"
function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export default function PetugasPage() {
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<Petugas | null>(null);
  const [deletingPetugas, setDeletingPetugas] = useState<Petugas | null>(null);
  const [selectedPetugas, setSelectedPetugas] = useState<Petugas | null>(null);
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
    if (!editingPetugas) {
      if (!form.password) return 'Password wajib diisi.';
    }
    if (form.password && form.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }
    if (!form.nama_petugas.trim()) return 'Nama petugas wajib diisi.';
    if (!form.no_telepon.trim()) return 'Nomor telepon wajib diisi.';
    if (form.no_telepon.trim().length !== 12) return 'Nomor telepon harus terdiri dari 12 digit.';
    if (!form.alamat.trim()) return 'Alamat wajib diisi.';
    return null;
  };

  const fetchPetugas = useCallback(
    async (page = 1, searchQuery = '', status = '', area = '') => {
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (searchQuery) params.append('search', searchQuery);
        if (status) params.append('status', status);
        if (area) params.append('area', area);

        const res = await apiFetch(`/admin/petugas?${params}`);

        if (!res.ok) {
          throw new Error('Gagal mengambil data dari server.');
        }

        const data = await res.json();
        setPetugasList(data.data || []);
        setPagination({
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || 10,
          total: data.total || 0,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? terjemahkanError(err.message, 'Gagal memuat data petugas.') : 'Gagal memuat data petugas.';
        setMessage({ type: 'error', text: msg });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const params = new URLSearchParams({ page: '1' });
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        if (areaFilter) params.append('area', areaFilter);

        const res = await apiFetch(`/admin/petugas?${params}`);

        if (!res.ok) {
          throw new Error('Gagal mengambil data dari server.');
        }

        const data = await res.json();
        if (!ignore) {
          setPetugasList(data.data || []);
          setPagination({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            per_page: data.per_page || 10,
            total: data.total || 0,
          });
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? terjemahkanError(err.message, 'Gagal memuat data petugas.') : 'Gagal memuat data petugas.';
          setMessage({ type: 'error', text: msg });
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, [search, statusFilter, areaFilter]);

  // Extract unique areas for the Area filter dropdown
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    petugasList.forEach((p) => {
      if (p.alamat && p.alamat.trim()) {
        set.add(p.alamat.trim());
      }
    });
    return Array.from(set);
  }, [petugasList]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const openAddModal = () => {
    setEditingPetugas(null);
    setForm(emptyForm);
    setShowModal(true);
    setModalError(null);
  };

  const openEditModal = (petugas: Petugas) => {
    setEditingPetugas(petugas);
    setForm({
      username: petugas.user?.username || '',
      email: petugas.user?.email || '',
      password: '',
      nama_petugas: petugas.nama_petugas,
      jenis_kelamin: petugas.jenis_kelamin || 'Laki-laki',
      alamat: petugas.alamat || '',
      no_telepon: petugas.no_telepon || '',
      status: petugas.user?.status || 'aktif',
    });
    setShowModal(true);
    setModalError(null);
  };

  const openDetailModal = (petugas: Petugas) => {
    setSelectedPetugas(petugas);
    setShowDetailModal(true);
  };

  const openDeleteModal = (petugas: Petugas) => {
    setDeletingPetugas(petugas);
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
      const url = editingPetugas
        ? `/admin/petugas/${editingPetugas.petugas_id}`
        : `/admin/petugas`;

      const method = editingPetugas ? 'PUT' : 'POST';

      const body: Record<string, string> = { ...form };
      if (editingPetugas && !body.password) {
        delete body.password;
      }

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

      setMessage({
        type: 'success',
        text: editingPetugas ? 'Data petugas berhasil diperbarui.' : 'Petugas dan akun user berhasil ditambahkan.',
      });
      setShowModal(false);
      setModalError(null);
      fetchPetugas(pagination.current_page, search, statusFilter, areaFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? terjemahkanError(err.message) : 'Terjadi kesalahan sistem. Silakan periksa kembali data yang dimasukkan.';
      // Tampilkan notif salah di dalam modal, bukan di halaman belakang
      setModalError(msg);
      scrollModalTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPetugas) return;
    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/admin/petugas/${deletingPetugas.petugas_id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(terjemahkanError(data.message, 'Gagal menghapus petugas.'));
      }

      setMessage({ type: 'success', text: 'Petugas dan akun pengguna berhasil dihapus.' });
      setShowDeleteModal(false);
      setDeletingPetugas(null);
      fetchPetugas(pagination.current_page, search, statusFilter, areaFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? terjemahkanError(err.message) : 'Terjadi kesalahan.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-10">
      {/* Header with Breadcrumb, Notification & Profile */}
      <AdminHeader
        title="Data Petugas"
        subtitle="Kelola data petugas yang bertugas melakukan penjemputan dan penimbangan."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Master Data' },
          { label: 'Petugas' },
        ]}
      />

      {/* Alert Notification */}
      {message && (
        <div
          className={`mb-5 p-4 rounded-lg sm:rounded-xl flex items-start gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar & Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs mb-4 sm:mb-5 lg:mb-6 p-5">
        <div className="flex flex-col gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama petugas, nomor telepon, atau area..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            {/* Status Filter */}
            <div className="w-full sm:w-[180px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchPetugas(1, search, e.target.value, areaFilter);
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#16a34a] focus:ring-3 focus:ring-[#16a34a]/15 transition-all bg-white text-gray-700 cursor-pointer appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Area Tugas Filter */}
          <div className="w-full sm:w-[180px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Area Tugas</label>
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => {
                  setAreaFilter(e.target.value);
                  fetchPetugas(1, search, statusFilter, e.target.value);
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#16a34a] focus:ring-3 focus:ring-[#16a34a]/15 transition-all bg-white text-gray-700 cursor-pointer appearance-none"
              >
                <option value="">Semua Area</option>
                {uniqueAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Add Petugas Button */}
          <div className="shrink-0">
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Tambah Petugas
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Total Summary */}
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            Total {pagination.total || petugasList.length} petugas
          </p>
        </div>

        {/* Desktop Table & Mobile Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16">
                  No.
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Nama Petugas
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  No. Telepon
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Area Tugas
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Tgl. Bergabung
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-36">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">
                    <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-[#16a34a]" />
                    Memuat data petugas...
                  </td>
                </tr>
              ) : petugasList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-9 sm:h-10 w-9 sm:w-10 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-500">Tidak ada data petugas ditemukan.</p>
                      <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                petugasList.map((petugas, idx) => {
                  const rowNumber =
                    (pagination.current_page - 1) * pagination.per_page + idx + 1;
                  const isAktif = petugas.user?.status === 'aktif';

                  return (
                    <tr
                      key={petugas.petugas_id}
                      className="hover:bg-emerald-50/30 transition-colors group"
                    >
                      {/* No. */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm font-medium text-gray-500">
                        {rowNumber}
                      </td>

                      {/* Nama Petugas */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-semibold text-gray-800">
                        {petugas.nama_petugas}
                      </td>

                      {/* No. Telepon */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-600 font-normal">
                        {petugas.no_telepon || '-'}
                      </td>

                      {/* Area Tugas (stored in alamat) */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-600">
                        {petugas.alamat || '-'}
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            isAktif
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {isAktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Tgl. Bergabung */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-600">
                        {formatDate(petugas.created_at)}
                      </td>

                      {/* Aksi */}
                      <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <div className="flex items-center justify-center gap-1.5 relative">
                          {/* View Detail Button */}
                          <button
                            onClick={() => openDetailModal(petugas)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(petugas)}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(petugas)}
                            className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="lg:hidden space-y-4 px-2">
          {isLoading ? (
            <div className="text-center py-16 text-sm text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-[#16a34a]" />
              Memuat data petugas...
            </div>
          ) : petugasList.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400">
              <div className="flex flex-col items-center justify-center">
                <User className="h-9 w-9 text-gray-300 mb-2" />
                <p className="font-medium text-gray-500">Tidak ada data petugas ditemukan.</p>
                <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
              </div>
            </div>
          ) : (
            petugasList.map((petugas, idx) => {
              const rowNumber = (pagination.current_page - 1) * pagination.per_page + idx + 1;
              const isAktif = petugas.user?.status === 'aktif';

              return (
                <div key={petugas.petugas_id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <PetugasAvatar nama={petugas.nama_petugas} jenisKelamin={petugas.jenis_kelamin} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{petugas.nama_petugas}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Petugas #{rowNumber}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                        isAktif ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isAktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">No. Telepon:</span>
                      <span className="text-gray-700 font-medium">{petugas.no_telepon || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jenis Kelamin:</span>
                      <span className="text-gray-700">{petugas.jenis_kelamin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tgl. Bergabung:</span>
                      <span className="text-gray-700">{formatDate(petugas.created_at)}</span>
                    </div>
                    <div className="pt-1">
                      <div className="text-gray-500 mb-1">Area Tugas:</div>
                      <div className="text-gray-700 text-xs leading-relaxed">{petugas.alamat || '-'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openDetailModal(petugas)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detail
                    </button>
                    <button
                      onClick={() => openEditModal(petugas)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(petugas)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t border-gray-100 gap-4">
          <p className="text-xs text-gray-500">
            Menampilkan{' '}
            {pagination.total === 0
              ? 0
              : (pagination.current_page - 1) * pagination.per_page + 1}{' '}
            -{' '}
            {Math.min(
              pagination.current_page * pagination.per_page,
              pagination.total
            )}{' '}
            dari {pagination.total} petugas
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() =>
                fetchPetugas(
                  pagination.current_page - 1,
                  search,
                  statusFilter,
                  areaFilter
                )
              }
              disabled={pagination.current_page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Buttons */}
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() =>
                    fetchPetugas(page, search, statusFilter, areaFilter)
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    pagination.current_page === page
                      ? 'bg-[#16a34a] text-white shadow-sm shadow-emerald-200'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              onClick={() =>
                fetchPetugas(
                  pagination.current_page + 1,
                  search,
                  statusFilter,
                  areaFilter
                )
              }
              disabled={pagination.current_page >= pagination.last_page}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Petugas */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">
                  {editingPetugas ? 'Edit Data Petugas' : 'Tambah Petugas Baru'}
                </h3>
                <p className="text-xs text-gray-400">
                  {editingPetugas
                    ? 'Perbarui informasi dan status akun petugas'
                    : 'Data akun user dan profil petugas akan otomatis tersinkronisasi.'}
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

            {/* Modal Body */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 text-[13.5px] max-h-[70vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 rounded-lg sm:rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-medium">{modalError}</span>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    className="ml-auto flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {/* SECTION: Akun Pengguna */}
              <div className="rounded-lg sm:rounded-xl bg-emerald-50/50 p-4 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Shield className="h-4 w-4 text-[#16a34a]" />
                  Informasi Akun Login (Tabel User)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="contoh: ahmad_petugas"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white"
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
                      placeholder="petugas@trashure.id"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {editingPetugas ? (
                      <>Password Baru <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span></>
                    ) : (
                      <>Password Akun <span className="text-red-500">*</span></>
                    )}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingPetugas ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white"
                  />
                </div>
              </div>

              {/* SECTION: Profil Petugas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <User className="h-4 w-4 text-[#16a34a]" />
                  Informasi Profil Petugas
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Lengkap Petugas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nama_petugas}
                    onChange={(e) => setForm({ ...form, nama_petugas: e.target.value })}
                    placeholder="contoh: Ahmad Fauzi"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.jenis_kelamin}
                      onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white cursor-pointer"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      No. Telepon / WhatsApp (12 digit)
                    </label>
                    <input
                      type="text"
                      value={form.no_telepon}
                      onChange={(e) => setForm({ ...form, no_telepon: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                      placeholder="contoh: 081234567890"
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                      maxLength={12}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Area Tugas / Alamat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    placeholder="contoh: RT 02 / RW 03"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status Petugas
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 bg-white cursor-pointer"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>


              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingPetugas ? 'Simpan Perubahan' : 'Simpan Petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Petugas */}
      {showDetailModal && selectedPetugas && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">Detail Petugas</h3>
                <p className="text-xs text-gray-400">
                  Informasi lengkap data petugas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50">
              <div className="mx-auto flex justify-center mb-3">
                <div className="h-16 w-16">
                  <PetugasAvatar
                    nama={selectedPetugas.nama_petugas}
                    jenisKelamin={selectedPetugas.jenis_kelamin}
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedPetugas.nama_petugas}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Petugas Penjemputan & Penimbangan
              </p>
              <div className="mt-2.5">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedPetugas.user?.status === 'aktif'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {selectedPetugas.user?.status === 'aktif' ? 'Status: Aktif' : 'Status: Nonaktif'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3.5 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 w-24">Username:</span>
                <span className="font-semibold text-gray-800">
                  {selectedPetugas.user?.username || '-'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 w-24">Email Akun:</span>
                <span className="font-semibold text-gray-800">
                  {selectedPetugas.user?.email || '-'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 w-24">No. Telepon:</span>
                <span className="font-semibold text-gray-800">
                  {selectedPetugas.no_telepon || '-'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 w-24">Area Tugas:</span>
                <span className="font-semibold text-gray-800">
                  {selectedPetugas.alamat || '-'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-400 w-24">Bergabung:</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(selectedPetugas.created_at)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Petugas */}
      {showDeleteModal && deletingPetugas && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6" />
              </div>

              <h3 className="text-[17px] font-bold text-gray-900">
                Hapus Data Petugas?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus petugas{' '}
                <strong className="text-gray-800">
                  {deletingPetugas.nama_petugas}
                </strong>
                ? Tindakan ini juga akan menghapus akun user terkait secara permanen.
              </p>
            </div>

            <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
