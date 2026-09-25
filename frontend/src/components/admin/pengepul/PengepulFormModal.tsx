'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { PengepulFormData, PengepulItem, StatusUser } from '@/types/pengepul';

interface PengepulFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: number | string;
    payload: PengepulFormData;
    status?: StatusUser;
  }) => Promise<void>;
  initialItem?: PengepulItem | null;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: { value: StatusUser; label: string }[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10';

// Terjemahkan sisa pesan error berbahasa Inggris ke bahasa Indonesia
function terjemahkanErrorLokal(pesan?: string, fallback = 'Gagal menyimpan data. Silakan periksa kembali isian Anda.'): string {
  if (!pesan) return fallback;
  const p = pesan.trim();
  if (/the given data was invalid/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  if (/failed to fetch|networkerror|network request failed/i.test(p)) return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  if (/unauthenticated/i.test(p)) return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  if (/no query results for model/i.test(p)) return 'Data tidak ditemukan.';
  if (/^the .* (field|must|is|has|should)/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  return p;
}

export default function PengepulFormModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  mode,
  isSubmitting = false,
}: PengepulFormModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaPengepul, setNamaPengepul] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [status, setStatus] = useState<StatusUser>('aktif');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Kembali ke atas modal agar notifikasi terlihat (seperti form warga)
  const scrollModalTop = () => {
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setUsername(initialItem.user?.username || '');
      setEmail(initialItem.user?.email || '');
      setPassword('');
      setNamaPengepul(initialItem.namaPengepul);
      setAlamat(initialItem.alamat || '');
      setNoTelepon(initialItem.noTelepon || '');
      setStatus(initialItem.user?.status ?? 'aktif');
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setNamaPengepul('');
      setAlamat('');
      setNoTelepon('');
      setStatus('aktif');
    }
    setErrors({});
    setServerError(null);
  }, [initialItem, mode, isOpen]);

  if (!isOpen) return null;

  const susunErrorValidasi = () => {
    const err: Record<string, string> = {};
    if (!username.trim()) {
      err.username = 'Username wajib diisi.';
    }
    if (!email.trim()) {
      err.email = 'Email wajib diisi.';
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = 'Format email tidak valid.';
    }
    if (mode === 'create' && !password) {
      err.password = 'Password wajib diisi.';
    } else if (password && password.length < 6) {
      err.password = 'Password minimal 6 karakter.';
    }
    if (!namaPengepul.trim()) {
      err.namaPengepul = 'Nama pengepul wajib diisi.';
    }
    if (!noTelepon.trim()) {
      err.noTelepon = 'Nomor telepon wajib diisi.';
    } else if (noTelepon.trim().length !== 12) {
      err.noTelepon = 'Nomor telepon harus terdiri dari 12 digit.';
    }
    if (!alamat.trim()) {
      err.alamat = 'Alamat wajib diisi.';
    }
    return err;
  };

  const validate = () => {
    const err = susunErrorValidasi();
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const err = susunErrorValidasi();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      // Tampilkan di banner atas seperti form warga + kembali ke atas modal
      const pertama = Object.values(err)[0];
      if (pertama) setServerError(pertama);
      scrollModalTop();
      return;
    }

    const payload: PengepulFormData = {
      username: username.trim(),
      email: email.trim(),
      password: mode === 'create' ? password : password || undefined,
      namaPengepul: namaPengepul.trim(),
      alamat: alamat.trim(),
      noTelepon: noTelepon.trim(),
    };

    try {
      await onSave({
        ...(initialItem ? { id: initialItem.id } : {}),
        payload,
        ...(mode === 'edit' ? { status } : {}),
      });
      // Modal ditutup oleh parent setelah simpan sukses.
      // Jangan tutup di sini agar notif salah bisa tampil di dalam modal.
    } catch (err: unknown) {
      const mentah = err instanceof Error ? err.message : '';
      const msg = terjemahkanErrorLokal(mentah);
      setServerError(msg);
      scrollModalTop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">
              {mode === 'create' ? 'Tambah Pengepul' : 'Edit Pengepul'}
            </h3>
            <p className="text-xs text-gray-400">
              {mode === 'create'
                ? 'Akun pengguna (users) dibuat otomatis saat pengepul ditambahkan.'
                : 'Anda dapat mengubah username, email, dan password akun pengepul.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 text-[13.5px] max-h-[70vh] overflow-y-auto">
          {serverError && (
            <div className="p-3 rounded-lg flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-medium">{serverError}</span>
              <button type="button" onClick={() => setServerError(null)} className="ml-auto flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: pengepul2"
                />
                {errors.username && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="contoh@trashure.test"
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </>
          )}

          {mode === 'edit' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    placeholder="Username akun"
                  />
                  {errors.username && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="email@trashure.test"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password Baru <span className="text-gray-400">(opsional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Kosongkan jika tidak diubah"
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status Akun
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusUser)}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Pengepul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaPengepul}
              onChange={(e) => setNamaPengepul(e.target.value)}
              className={inputClass}
              placeholder="Contoh: Pengepul Trashure"
            />
            {errors.namaPengepul && (
              <p className="text-[11px] text-red-500 mt-1">{errors.namaPengepul}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              No. Telepon (12 digit)
            </label>
            <input
              type="text"
              value={noTelepon}
              onChange={(e) => setNoTelepon(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className={inputClass}
              placeholder="Contoh: 081234567892"
              maxLength={12}
              inputMode="numeric"
            />
            {errors.noTelepon && (
              <p className="text-[11px] text-red-500 mt-1">{errors.noTelepon}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Alamat lokasi pengepul..."
            />
            {errors.alamat && (
              <p className="text-[11px] text-red-500 mt-1">{errors.alamat}</p>
            )}
          </div>
        </form>

        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl disabled:opacity-60 transition-colors"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Tambah' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}