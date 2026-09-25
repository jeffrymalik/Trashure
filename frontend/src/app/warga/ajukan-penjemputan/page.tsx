'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Leaf,
  MessageCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  Loader2,
  Check,
  Search,
  X,
  Boxes,
  ShieldCheck,
  CalendarCheck,
  ChevronDown
} from 'lucide-react';
import {
  fetchJenisSampah,
  fetchCurrentUser,
  createPengajuan,
  JenisSampahItem,
  DetailSampahInput,
  UserProfile,
} from '@/services/wargaPengajuanService';
import AdminHeader from '@/components/layout/header';


export default function PengajuanPenjemputanPage() {
  const router = useRouter();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Waste items list (initially empty so user can choose themselves)
  const [items, setItems] = useState<DetailSampahInput[]>([]);
  const [catalog, setCatalog] = useState<JenisSampahItem[]>([]);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Step 2 Form state
  const [alamat, setAlamat] = useState('');
  const [patokan, setPatokan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [sesiWaktu, setSesiWaktu] = useState('08:00 - 11:00 (Pagi)');
  const [noTelepon, setNoTelepon] = useState('');
  const [catatan, setCatatan] = useState('');

  // Step 3 Confirmation state
  const [agreed, setAgreed] = useState(false);

  // App / Request states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ id: number; message: string } | null>(null);

  // Set default pickup date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setTanggal(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch catalog & current user profile
  useEffect(() => {
    async function loadInitial() {
      setPageLoading(true);
      try {
        const [fetchedCatalog, user] = await Promise.all([
          fetchJenisSampah(),
          fetchCurrentUser(),
        ]);

        if (fetchedCatalog && fetchedCatalog.length > 0) {
          setCatalog(fetchedCatalog);
        }

        if (user) {
          setUserProfile(user);
          if (user.warga) {
            if (user.warga.alamat) setAlamat(user.warga.alamat);
            if (user.warga.no_telepon) setNoTelepon(user.warga.no_telepon);
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setTimeout(() => {
          setPageLoading(false);
        }, 350);
      }
    }
    loadInitial();
  }, []);

  // Calculate total weight and count
  const totalBerat = useMemo(() => {
    const sum = items.reduce((acc, curr) => acc + (Number(curr.perkiraan_berat) || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [items]);

  const totalJenis = useMemo(() => items.length, [items]);

  // Handlers for item modifications
  const handleWeightChange = (index: number, valStr: string) => {
    const val = parseFloat(valStr);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        perkiraan_berat: isNaN(val) ? 0 : val,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddItemFromCatalog = (catalogItem: JenisSampahItem) => {
    // Check if already in list
    const exists = items.some((i) => i.jenis_sampah_id === catalogItem.jenis_sampah_id);
    if (exists) {
      alert(`"${catalogItem.nama_jenis_sampah}" sudah ada di daftar.`);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        jenis_sampah_id: catalogItem.jenis_sampah_id,
        nama_jenis_sampah: catalogItem.nama_jenis_sampah,
        keterangan: catalogItem.keterangan || 'Kondisi bersih dan terpilah',
        perkiraan_berat: 1.0,
        satuan: catalogItem.satuan || 'kg',
      },
    ]);
    setIsCatalogModalOpen(false);
  };

  // Filter catalog for modal
  const filteredCatalog = useMemo(() => {
    return catalog.filter((c) => {
      const matchesSearch = c.nama_jenis_sampah.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (c.keterangan && c.keterangan.toLowerCase().includes(catalogSearch.toLowerCase()));
      const notAdded = !items.some((i) => i.jenis_sampah_id === c.jenis_sampah_id);
      return matchesSearch && notAdded;
    });
  }, [catalog, catalogSearch, items]);

  // Validation before proceeding to step 2
  const handleNextToStep2 = () => {
    if (items.length === 0) {
      alert('Silakan pilih minimal 1 jenis sampah terlebih dahulu.');
      return;
    }
    const hasZero = items.some((i) => !i.perkiraan_berat || i.perkiraan_berat <= 0);
    if (hasZero) {
      alert('Pastikan perkiraan berat untuk semua jenis sampah lebih dari 0 kg.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validation before proceeding to step 3
  const handleNextToStep3 = () => {
    if (!alamat.trim()) {
      alert('Alamat lengkap penjemputan wajib diisi.');
      return;
    }
    if (!tanggal) {
      alert('Tanggal penjemputan wajib dipilih.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit pengajuan
  const handleSubmitPengajuan = async () => {
    if (!agreed) {
      alert('Silakan centang persetujuan terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Format full address including landmark if present
    const fullAlamat = patokan.trim()
      ? `${alamat.trim()} (Patokan: ${patokan.trim()})`
      : alamat.trim();

    // Format notes with preferred schedule and phone
    const formattedCatatan = [
      `Preferensi Jadwal: ${tanggal} (${sesiWaktu})`,
      noTelepon.trim() ? `Kontak: ${noTelepon.trim()}` : null,
      catatan.trim() ? `Catatan: ${catatan.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const payload = {
      alamat_penjemputan: fullAlamat,
      perkiraan_total_berat: totalBerat,
      catatan: formattedCatatan,
      detail_sampah: items.map((i) => ({
        jenis_sampah_id: i.jenis_sampah_id,
        perkiraan_berat: Number(i.perkiraan_berat),
      })),
    };

    const res = await createPengajuan(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessModalData({
        id: res.data?.pengajuan_id || 1,
        message: res.message || 'Pengajuan penjemputan berhasil dibuat.',
      });
    } else {
      setErrorMessage(res.message || 'Terjadi kesalahan saat memproses permohonan.');
    }
  };

  return (
    <div className="w-full pb-16 font-sans">
      {/* Top Header */}
      <AdminHeader
        title="Pengajuan Penjemputan"
        subtitle="Ajukan penjemputan sampah yang sudah Anda pilah. Petugas kami akan mengambil sesuai jadwal."
      />

      {/* Loading State on Page Mount / Refresh */}
      {pageLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-14 text-center shadow-sm flex flex-col items-center justify-center my-6 min-h-[380px] animate-in fade-in duration-200">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a] border border-emerald-100 mb-4 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            Memuat Formulir Pengajuan Penjemputan...
          </h3>
          <p className="text-xs font-medium text-gray-500 mt-1 max-w-sm">
            Menyiapkan data profil dan katalog jenis sampah untuk penjemputan Anda.
          </p>
        </div>
      ) : (
        /* Main Grid: Left Wizard (approx 68%) + Right Panel (approx 32%) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* LEFT COLUMN: Stepper + Active Step Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stepper Header Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between overflow-x-auto">
                {/* Step 1 */}
                <div
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2 sm:gap-3 cursor-pointer group transition-opacity flex-shrink-0 ${currentStep === 1 ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm transition-all shadow-sm ${currentStep === 1
                      ? 'bg-[#16a34a] text-white ring-4 ring-green-100'
                      : currentStep > 1
                        ? 'bg-green-100 text-[#16a34a]'
                        : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {currentStep > 1 ? <Check className="h-4 w-4 stroke-[2.5]" /> : '1'}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-bold ${currentStep === 1 ? 'text-gray-900' : 'text-gray-600'
                        }`}
                    >
                      Data Sampah
                    </p>
                    <p className="text-xs text-gray-400">Isi jenis & perkiraan berat</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-300 px-1 sm:px-2 font-light select-none flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => {
                    if (items.length > 0) setCurrentStep(2);
                  }}
                  className={`flex items-center gap-3 cursor-pointer group transition-opacity ${currentStep === 2 ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm transition-all shadow-sm ${currentStep === 2
                      ? 'bg-[#16a34a] text-white ring-4 ring-green-100'
                      : currentStep > 2
                        ? 'bg-green-100 text-[#16a34a]'
                        : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {currentStep > 2 ? <Check className="h-4 w-4 stroke-[2.5]" /> : '2'}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-bold ${currentStep === 2 ? 'text-gray-900' : 'text-gray-600'
                        }`}
                    >
                      Alamat & Jadwal
                    </p>
                    <p className="text-xs text-gray-400">Tentukan lokasi & waktu</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-300 px-1 sm:px-2 font-light select-none flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => {
                    if (alamat.trim()) setCurrentStep(3);
                  }}
                  className={`flex items-center gap-3 cursor-pointer group transition-opacity ${currentStep === 3 ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm transition-all shadow-sm ${currentStep === 3
                      ? 'bg-[#16a34a] text-white ring-4 ring-green-100'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    3
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-bold ${currentStep === 3 ? 'text-gray-900' : 'text-gray-600'
                        }`}
                    >
                      Konfirmasi
                    </p>
                    <p className="text-xs text-gray-400">Periksa & kirim pengajuan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: DATA SAMPAH */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 lg:p-6 md:p-7 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">1. Data Sampah</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Masukkan jenis sampah yang telah Anda pilah dan perkiraan beratnya.
                  </p>
                </div>

                {/* Table / List Header */}
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 md:p-10 text-center bg-gray-50/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a] mx-auto mb-3.5 border border-emerald-100 shadow-xs">
                      <Boxes className="h-7 w-7 stroke-[1.8]" />
                    </div>
                    <h4 className="text-base font-bold text-gray-900">
                      Belum Ada Jenis Sampah yang Dipilih
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Silakan klik tombol di bawah untuk memilih jenis sampah yang telah Anda pilah dan tentukan perkiraan beratnya.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSearch('');
                        setIsCatalogModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg sm:rounded-xl text-xs font-semibold shadow-sm transition hover:shadow active:scale-[0.99]"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Pilih Jenis Sampah</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="border border-gray-100 rounded-lg sm:rounded-xl overflow-hidden shadow-xs">
                      <div className="hidden md:grid grid-cols-12 bg-gray-50/80 px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100">
                        <div className="col-span-6">Jenis Sampah</div>
                        <div className="col-span-3 text-left">Perkiraan Berat</div>
                        <div className="col-span-2 text-left">Satuan</div>
                        <div className="col-span-1 text-center">Aksi</div>
                      </div>

                      {/* Rows */}
                      <div className="divide-y divide-gray-100">
                        {items.map((item, index) => (
                          <div
                            key={item.jenis_sampah_id || index}
                            className="md:grid md:grid-cols-12 md:items-center px-4 py-3.5 hover:bg-gray-50/40 transition-colors"
                          >
                            {/* Jenis Sampah with Icon */}
                            <div className="md:col-span-6 flex items-center gap-3 pr-3">
                              <div className="truncate flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {item.nama_jenis_sampah}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  {item.keterangan || 'Sampah siap jemput'}
                                </p>
                              </div>
                            </div>

                            {/* Perkiraan Berat Input */}
                            <div className="md:col-span-3 pr-4 mt-2 md:mt-0">
                              <label className="text-[10px] text-gray-400 md:hidden mb-1 block">Perkiraan Berat</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={item.perkiraan_berat === 0 ? '' : item.perkiraan_berat}
                                  onChange={(e) => handleWeightChange(index, e.target.value)}
                                  placeholder="0.00"
                                  className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                                />
                              </div>
                            </div>

                            {/* Satuan Select / Display */}
                            <div className="md:col-span-2 pr-2 mt-2 md:mt-0">
                              <label className="text-[10px] text-gray-400 md:hidden mb-1 block">Satuan</label>
                              <select
                                value={item.satuan}
                                disabled
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 text-xs font-medium text-gray-600 appearance-none cursor-default"
                              >
                                <option value="kg">kg</option>
                              </select>
                            </div>

                            {/* Aksi / Delete Button */}
                            <div className="md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                title="Hapus baris"
                                className="flex h-9 w-9 items-center justify-center rounded-lg sm:rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* + Tambah Jenis Sampah Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogSearch('');
                          setIsCatalogModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 hover:border-[#16a34a] hover:bg-green-50/30 text-[#16a34a] rounded-lg sm:rounded-xl text-sm font-semibold transition-all duration-200 shadow-xs"
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Tambah Jenis Sampah Lainnya</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Catatan Alert Box */}
                <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg sm:rounded-xl p-4 text-gray-700 shadow-xs">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0 mt-0.5">
                    <Info className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-emerald-900">
                    <span className="font-bold">Catatan: </span>
                    Pastikan sampah sudah dipilah dan dalam kondisi bersih agar memudahkan proses penimbangan.
                  </div>
                </div>

                {/* Bottom Action: Selanjutnya -> */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={items.length === 0}
                    onClick={handleNextToStep2}
                    className={`flex items-center gap-2 px-7 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition shadow-sm ${items.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow active:scale-[0.99]'
                      }`}
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ALAMAT & JADWAL */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 lg:p-6 md:p-7 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">2. Alamat & Jadwal Penjemputan</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Tentukan lokasi pengambilan sampah dan waktu kedatangan petugas kami.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Alamat Lengkap */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Alamat Lengkap Penjemputan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Masukkan alamat lengkap rumah/kantor Anda (jalan, RT/RW, nomor rumah, kelurahan)..."
                        className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                      />
                    </div>
                  </div>

                  {/* Patokan Lokasi */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Patokan / Catatan Lokasi (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patokan}
                        onChange={(e) => setPatokan(e.target.value)}
                        placeholder="Contoh: Pagar hitam depan musholla, dekat pos ronda RT 02"
                        className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                      />
                    </div>
                  </div>

                  {/* Tanggal & Sesi Waktu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Pilihan Tanggal Penjemputan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Pilihan Sesi Waktu Penjemputan
                      </label>
                      <select
                        value={sesiWaktu}
                        onChange={(e) => setSesiWaktu(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                      >
                        <option value="08:00 - 11:00 (Pagi)">08:00 - 11:00 (Pagi)</option>
                        <option value="13:00 - 15:00 (Siang)">13:00 - 15:00 (Siang)</option>
                        <option value="15:00 - 17:00 (Sore)">15:00 - 17:00 (Sore)</option>
                      </select>
                    </div>
                  </div>

                  {/* Kontak WhatsApp & Catatan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Nomor Telepon / WhatsApp Aktif
                      </label>
                      <input
                        type="text"
                        value={noTelepon}
                        onChange={(e) => setNoTelepon(e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Catatan Tambahan untuk Petugas
                      </label>
                      <input
                        type="text"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Contoh: Sampah diletakkan di teras depan"
                        className="w-full bg-white border border-gray-200 rounded-lg sm:rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-[#16a34a] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextToStep3}
                    className="flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-7 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition shadow-sm hover:shadow"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: KONFIRMASI */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 lg:p-6 md:p-7 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">3. Konfirmasi Pengajuan</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Tinjau kembali seluruh rincian permohonan penjemputan sampah Anda sebelum dikirimkan.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg sm:rounded-xl text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Review Section: Detail Sampah */}
                <div className="bg-gray-50/70 rounded-lg sm:rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Daftar Sampah Terpilah
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-[#16a34a] hover:underline"
                    >
                      Ubah
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="font-medium text-gray-800">{item.nama_jenis_sampah}</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {item.perkiraan_berat.toFixed(2)} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Section: Lokasi & Waktu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/70 rounded-lg sm:rounded-xl p-4 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Lokasi Penjemputan
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-800">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{alamat}</p>
                        {patokan && (
                          <p className="text-xs text-gray-500 mt-0.5">Patokan: {patokan}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 rounded-lg sm:rounded-xl p-4 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Jadwal Penjemputan
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline"
                      >
                        Ubah
                      </button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{tanggal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{sesiWaktu}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 p-3.5 bg-green-50/50 border border-green-200/60 rounded-lg sm:rounded-xl cursor-pointer hover:bg-green-50 transition">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded text-[#16a34a] focus:ring-green-500 border-gray-300"
                    />
                    <span className="text-xs text-gray-700 leading-relaxed select-none">
                      Saya menyatakan bahwa data jenis sampah yang diajukan sudah sesuai dengan kondisi aktual, telah dipilah dengan bersih, dan siap untuk ditimbang saat petugas tiba.
                    </span>
                  </label>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    disabled={!agreed || isSubmitting}
                    onClick={handleSubmitPengajuan}
                    className={`flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-7 py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition shadow-sm ${!agreed || isSubmitting
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:shadow active:scale-[0.99]'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Kirim Pengajuan Penjemputan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Summary & Guidance Cards */}
          <div className="lg:col-span-4 space-y-5 sticky top-6">
            {/* Card 1: Ringkasan Pengajuan */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Ringkasan Pengajuan
              </h3>

              {/* Green Badge Encouragement */}
              <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg sm:rounded-xl p-3.5 text-emerald-950">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e] text-white flex-shrink-0 mt-0.5 shadow-sm">
                  <Leaf className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-emerald-900">
                    Sampah dipilah dengan baik
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                    Terima kasih sudah berkontribusi untuk lingkungan yang lebih bersih!
                  </p>
                </div>
              </div>

              {/* Total Perkiraan Berat */}
              <div className="pt-1 border-b border-gray-100 pb-4">
                <p className="text-xs text-gray-500 font-medium">Total Perkiraan Berat</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 mt-0.5 tracking-tight">
                  {totalBerat.toFixed(2)} kg
                </p>
              </div>

              {/* Jumlah Jenis */}
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs text-gray-500 font-medium">Jumlah Jenis</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {totalJenis} jenis
                </p>
              </div>

              {/* Catatan */}
              <div>
                <p className="text-xs text-gray-500 font-medium">Catatan</p>
                <p className="text-sm text-gray-700 mt-0.5 break-words">
                  {catatan.trim() ? catatan : '-'}
                </p>
              </div>
            </div>

            {/* Card 2: Tips Memilah Sampah */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3.5">
              <h3 className="text-sm font-bold text-gray-900">Tips Memilah Sampah</h3>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <span>Pisahkan sampah sesuai jenisnya</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <span>Bersihkan dari sisa makanan/minuman</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <span>Keringkan sampah sebelum dikemas</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <span>Gunakan wadah atau karung tertutup</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Butuh bantuan? (Cream/Yellow Tint) */}
            <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Butuh bantuan?</h3>
                <p className="text-xs text-gray-600 mt-0.5">Hubungi kami melalui WhatsApp</p>
              </div>
              <a
                href="https://wa.me/6288213448685?text=Halo%20Trashure,%20saya%20ingin%20bertanya%20tentang%20pengajuan%20penjemputan%20sampah."
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-[#16a34a] border border-emerald-200 rounded-lg sm:rounded-xl py-2 px-4 text-xs font-semibold shadow-xs transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Hubungi Kami</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Jenis Sampah dari Katalog */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 lg:p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Pilih Jenis Sampah</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pilih jenis sampah yang ingin ditambahkan ke permohonan.
                </p>
              </div>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Cari jenis sampah (misal: Kardus, Botol, Kaca)..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Waste List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Tidak ada jenis sampah yang cocok atau semua sudah ditambahkan.
                </div>
              ) : (
                filteredCatalog.map((c) => (
                  <div
                    key={c.jenis_sampah_id}
                    onClick={() => handleAddItemFromCatalog(c)}
                    className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50/40 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#16a34a] transition">
                          {c.nama_jenis_sampah}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {c.keterangan || `Satuan: ${c.satuan}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#16a34a] text-gray-500 group-hover:text-white transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Berhasil Terkirim */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 lg:p-6 shadow-2xl border border-gray-100 text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#16a34a] mx-auto">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Pengajuan Berhasil Dikirim!
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                ID Pengajuan Anda: <span className="font-bold text-gray-800">#{successModalData.id}</span>. Petugas kami akan segera memverifikasi dan menjadwalkan penjemputan sesuai jadwal yang Anda ajukan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600 text-left space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-400">Total Berat:</span>
                <span className="font-semibold text-gray-800">{totalBerat.toFixed(2)} kg</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Jadwal:</span>
                <span className="font-semibold text-gray-800">{tanggal}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-bold text-amber-600 uppercase">Diajukan</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessModalData(null);
                  setCurrentStep(1);
                  setItems([]);
                }}
                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg sm:rounded-xl font-medium text-xs transition"
              >
                Buat Pengajuan Baru
              </button>
              <Link
                href="/warga/dashboard"
                className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white py-2.5 rounded-lg sm:rounded-xl font-medium text-xs transition shadow-sm text-center"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
