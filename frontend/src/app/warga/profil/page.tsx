'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/layout/header';
import {
  fetchProfile,
  updateProfile,
  CurrentUserProfile,
  UpdateWargaPayload,
} from '@/services/profileService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Save,
  RotateCcw,
  IdCard,
} from 'lucide-react';

export default function WargaProfilPage() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [namaWarga, setNamaWarga] = useState('');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P' | ''>('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const populateForm = (data: CurrentUserProfile) => {
    setProfile(data);
    setUsername(data.username || '');
    setEmail(data.email || '');
    if (data.warga) {
      setNamaWarga(data.warga.nama_warga || '');
      setNik(data.warga.nik || '');
      setJenisKelamin((data.warga.jenis_kelamin as 'L' | 'P') || '');
      setNoTelepon(data.warga.no_telepon || '');
      setAlamat(data.warga.alamat || '');
    }
    setPassword('');
    setPasswordConfirmation('');
    setFieldErrors({});
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProfile();
      if (data) {
        populateForm(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleReset = () => {
    if (profile) {
      populateForm(profile);
      setToast(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setFieldErrors({});

    // Client-side validations
    const errors: Record<string, string> = {};
    if (!namaWarga.trim()) {
      errors.nama_warga = 'Nama lengkap wajib diisi.';
    }
    if (!username.trim()) {
      errors.username = 'Username wajib diisi.';
    }
    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format email tidak valid.';
    }
    if (password) {
      if (password.length < 6) {
        errors.password = 'Password minimal 6 karakter.';
      }
      if (password !== passwordConfirmation) {
        errors.password_confirmation = 'Konfirmasi password tidak cocok.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setToast({
        type: 'error',
        message: 'Mohon periksa kembali kolom isian yang belum sesuai.',
      });
      return;
    }

    setSaving(true);
    const payload: UpdateWargaPayload = {
      nama_warga: namaWarga.trim(),
      nik: nik.trim() || undefined,
      jenis_kelamin: jenisKelamin || '',
      no_telepon: noTelepon.trim() || '',
      alamat: alamat.trim() || '',
      username: username.trim(),
      email: email.trim(),
      password: password || undefined,
      password_confirmation: passwordConfirmation || undefined,
    };

    const res = await updateProfile(payload);
    setSaving(false);

    if (res.success && res.data) {
      setProfile(res.data);
      setPassword('');
      setPasswordConfirmation('');
      setToast({
        type: 'success',
        message: res.message || 'Profil berhasil diperbarui.',
      });
      setTimeout(() => setToast(null), 5000);
    } else {
      if (res.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(res.errors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            mapped[key] = msgs[0];
          }
        }
        setFieldErrors(mapped);
      }
      setToast({
        type: 'error',
        message: res.message || 'Gagal memperbarui profil.',
      });
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    })
    : '2024';

  return (
    <div className="max-w-[1440px] mx-auto pb-16 font-sans">
      <AdminHeader
        title="Profil Saya"
        subtitle="Kelola informasi data pribadi dan keamanan akun Anda."
        breadcrumbs={[
          { label: 'Beranda', href: '/warga/dashboard' },
          { label: 'Profil Saya' },
        ]}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl p-4 shadow-sm transition-all duration-300 ${toast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[380px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#16a34a] border border-emerald-100 mb-4 shadow-xs">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Memuat Data Profil...</h3>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Mengambil informasi akun dan data warga Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm overflow-hidden relative">
              {/* Header Decorative Background */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#22c55e] to-[#16a34a]" />

              {/* Avatar & Basic Info */}
              <div className="relative pt-8 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-emerald-400 to-[#16a34a] flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden">
                    <span className="select-none">
                      {(namaWarga || username || 'W').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Akun Aktif">
                    <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mt-3.5 leading-tight">
                  {namaWarga || profile?.username || 'Warga Bank Sampah'}
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  @{username || profile?.username}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#16a34a] border border-emerald-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                    Warga Terdaftar
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Status: {profile?.status || 'Aktif'}
                  </span>
                </div>
              </div>

              {/* Meta details list */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3.5 text-xs">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 border border-gray-200/60 text-gray-500 flex-shrink-0">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">NIK KTP</p>
                    <p className="font-semibold text-gray-800 truncate">{nik || 'Belum diisi'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 border border-gray-200/60 text-gray-500 flex-shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">Email</p>
                    <p className="font-semibold text-gray-800 truncate">{email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 border border-gray-200/60 text-gray-500 flex-shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">Telepon / WhatsApp</p>
                    <p className="font-semibold text-gray-800 truncate">{noTelepon || 'Belum diisi'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 border border-gray-200/60 text-gray-500 flex-shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium">Bergabung Sejak</p>
                    <p className="font-semibold text-gray-800 truncate">{memberSince}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-green-50/30 rounded-2xl border border-emerald-200/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-[#16a34a] flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Tips Data Akun</h4>
                  <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                    Pastikan nomor WhatsApp dan alamat selalu yang terbaru agar memudahkan petugas saat penjemputan sampah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Personal Data */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#16a34a]">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Data Pribadi</h3>
                    <p className="text-[11px] text-gray-400">Informasi identitas kependudukan Anda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaWarga}
                      onChange={(e) => setNamaWarga(e.target.value)}
                      placeholder="Masukkan nama lengkap sesuai KTP"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.nama_warga
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.nama_warga && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.nama_warga}</p>
                    )}
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      NIK (Nomor Induk Kependudukan)
                    </label>
                    <input
                      type="text"
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={16}
                      placeholder="16 digit NIK KTP"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.nik
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.nik && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.nik}</p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Jenis Kelamin
                    </label>
                    <select
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P' | '')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 focus:border-[#16a34a] focus:ring-green-100 bg-white"
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  {/* No Telepon */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={noTelepon}
                      onChange={(e) => setNoTelepon(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Contoh: 081234567890"
                      maxLength={12}
                      inputMode="numeric"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.no_telepon
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.no_telepon && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.no_telepon}</p>
                    )}
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Alamat Lengkap Rumah
                    </label>
                    <textarea
                      rows={3}
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Tuliskan nama jalan, RT/RW, nomor rumah, dan patokan agar mudah ditemukan petugas"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 resize-none ${fieldErrors.alamat
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.alamat && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.alamat}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Account & Security */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#16a34a]">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Akun & Keamanan</h3>
                    <p className="text-[11px] text-gray-400">Pengaturan kredensial untuk masuk ke aplikasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username akun"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.username
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.username && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.email
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Password Baru <span className="text-[11px] font-normal text-gray-400">(Opsional)</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak diubah"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.password
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.password && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Konfirmasi Password Baru */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Ulangi password baru"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-gray-800 transition-all focus:outline-none focus:ring-2 ${fieldErrors.password_confirmation
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-[#16a34a] focus:ring-green-100'
                        }`}
                    />
                    {fieldErrors.password_confirmation && (
                      <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.password_confirmation}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded border-gray-300 text-[#16a34a] focus:ring-green-200"
                      />
                      <span>Tampilkan Password</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Minimal 6 karakter jika ingin mengganti</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#16a34a] text-white text-xs font-bold hover:bg-[#15803d] shadow-sm shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
