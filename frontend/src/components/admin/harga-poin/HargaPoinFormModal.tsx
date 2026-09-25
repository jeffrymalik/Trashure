'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { HargaPoinItem, JenisSampahDB, StatusHarga } from '@/types/harga-poin';
import { DB_JENIS_SAMPAH_LIST } from '@/data/harga-poin-initial';

interface HargaPoinFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<HargaPoinItem>) => void;
  initialItem?: HargaPoinItem | null;
  mode: 'create' | 'edit';
  availableJenisSampah?: JenisSampahDB[];
  usedJenisSampahIds?: number[];
  isSubmitting?: boolean;
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10';

export default function HargaPoinFormModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  mode,
  availableJenisSampah = DB_JENIS_SAMPAH_LIST,
  usedJenisSampahIds = [],
  isSubmitting = false,
}: HargaPoinFormModalProps) {
  const [selectedJenisId, setSelectedJenisId] = useState<number | ''>('');
  const [hargaPerSatuan, setHargaPerSatuan] = useState<number | ''>('');
  const [nilaiPoinPerSatuan, setNilaiPoinPerSatuan] = useState<number | ''>('');
  const [berlakuMulai, setBerlakuMulai] = useState('');
  const [status, setStatus] = useState<StatusHarga>('Aktif');
  const [keterangan, setKeterangan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Kembali ke atas modal agar notifikasi terlihat
  const scrollModalTop = () => {
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedJenis = availableJenisSampah.find((j) => j.id === Number(selectedJenisId));

  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setSelectedJenisId(initialItem.jenisSampahId);
      setHargaPerSatuan(initialItem.hargaPerSatuan);
      setNilaiPoinPerSatuan(initialItem.nilaiPoinPerSatuan);
      setBerlakuMulai(initialItem.berlakuMulai);
      setStatus(initialItem.status);
      setKeterangan(initialItem.keterangan || '');
    } else {
      setSelectedJenisId('');
      setHargaPerSatuan('');
      setNilaiPoinPerSatuan('');
      const today = new Date();
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      setBerlakuMulai(`${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`);
      setStatus('Aktif');
      setKeterangan('');
    }
    setErrors({});
    setFormError(null);
  }, [initialItem, mode, isOpen]);

  if (!isOpen) return null;

  const susunErrorValidasi = () => {
    const err: Record<string, string> = {};
    if (!selectedJenisId) {
      err.jenisSampah = 'Silakan pilih jenis sampah dari database.';
    } else if (mode === 'create' && usedJenisSampahIds.includes(Number(selectedJenisId))) {
      err.jenisSampah = 'Jenis sampah ini sudah memiliki tarif. Pilih jenis sampah lain.';
    }
    if (hargaPerSatuan === '' || Number(hargaPerSatuan) <= 0) {
      err.hargaPerSatuan = 'Harga per satuan harus lebih dari 0.';
    }
    if (nilaiPoinPerSatuan === '' || Number(nilaiPoinPerSatuan) < 0) {
      err.nilaiPoinPerSatuan = 'Nilai poin tidak boleh negatif.';
    }
    if (!berlakuMulai.trim()) {
      err.berlakuMulai = 'Tanggal berlaku wajib diisi.';
    }
    return err;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const err = susunErrorValidasi();
    setErrors(err);
    if (Object.keys(err).length > 0) {
      // Tampilkan notif di banner atas + kembali ke atas modal
      const pertama = Object.values(err)[0];
      if (pertama) setFormError(pertama);
      scrollModalTop();
      return;
    }
    if (!selectedJenis) return;

    onSave({
      ...(initialItem ? { id: initialItem.id } : {}),
      jenisSampahId: selectedJenis.id,
      namaJenisSampah: selectedJenis.nama,
      kategori: selectedJenis.kategori,
      satuan: selectedJenis.satuan,
      hargaPerSatuan: Number(hargaPerSatuan),
      nilaiPoinPerSatuan: Number(nilaiPoinPerSatuan),
      berlakuMulai: berlakuMulai.trim(),
      status,
      keterangan: keterangan.trim(),
      iconType: selectedJenis.iconType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">
              {mode === 'create' ? 'Tambah Harga & Poin' : 'Edit Harga & Poin'}
            </h3>
            <p className="text-xs text-gray-400">
              {mode === 'create'
                ? 'Pilih jenis sampah untuk menetapkan harga dan poin.'
                : `Perbarui harga dan poin untuk ${selectedJenis?.nama || initialItem?.namaJenisSampah}.`}
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
          {formError && (
            <div className="p-3 rounded-lg sm:rounded-xl flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs font-medium">{formError}</span>
              <button type="button" onClick={() => setFormError(null)} className="ml-auto flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pilih Jenis Sampah (Database) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedJenisId}
              disabled={mode === 'edit'}
              onChange={(e) => {
                setSelectedJenisId(e.target.value ? Number(e.target.value) : '');
              }}
              className={`${inputClass} ${mode === 'edit' ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''} ${errors.jenisSampah ? 'border-red-400' : ''}`}
            >
              <option value="">-- Pilih Jenis Sampah --</option>
              {availableJenisSampah.map((jenis) => {
                const sudahDipakai = mode === 'create' && usedJenisSampahIds.includes(Number(jenis.id));
                return (
                  <option key={jenis.id} value={jenis.id} disabled={sudahDipakai}>
                    {jenis.nama} ({jenis.kategori} - {jenis.satuan})
                    {sudahDipakai ? ' (sudah ada harga)' : ''}
                  </option>
                );
              })}
            </select>
            {errors.jenisSampah && (
              <p className="text-[11px] text-red-500 mt-1">{errors.jenisSampah}</p>
            )}
          </div>

          {selectedJenis ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-gray-800">
                    {selectedJenis.nama}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-green-200 text-green-700">
                    {selectedJenis.kategori}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Satuan ukur: <strong className="text-gray-700">{selectedJenis.satuan}</strong>
                  {selectedJenis.keterangan && ` • ${selectedJenis.keterangan}`}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-700 flex-shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
              <Package className="h-4 w-4 text-gray-400" />
              <span>Pilih jenis sampah di atas untuk melihat kategori dan satuan yang berlaku.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Harga per {selectedJenis?.satuan || 'Satuan'} (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={hargaPerSatuan}
                  onChange={(e) =>
                    setHargaPerSatuan(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={`pl-9 ${inputClass} ${errors.hargaPerSatuan ? 'border-red-400' : ''}`}
                  placeholder="2000"
                />
              </div>
              {errors.hargaPerSatuan && (
                <p className="text-[11px] text-red-500 mt-1">{errors.hargaPerSatuan}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nilai Poin per {selectedJenis?.satuan || 'Satuan'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={nilaiPoinPerSatuan}
                onChange={(e) =>
                  setNilaiPoinPerSatuan(e.target.value === '' ? '' : Number(e.target.value))
                }
                className={`${inputClass} ${errors.nilaiPoinPerSatuan ? 'border-red-400' : ''}`}
                placeholder="2"
              />
              {errors.nilaiPoinPerSatuan && (
                <p className="text-[11px] text-red-500 mt-1">{errors.nilaiPoinPerSatuan}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Berlaku Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={berlakuMulai}
                onChange={(e) => setBerlakuMulai(e.target.value)}
                className={`${inputClass} ${errors.berlakuMulai ? 'border-red-400' : ''}`}
                placeholder="Contoh: 1 Agustus 2024"
              />
              {errors.berlakuMulai && (
                <p className="text-[11px] text-red-500 mt-1">{errors.berlakuMulai}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusHarga)}
                className={inputClass}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Keterangan / Catatan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Catatan ketentuan penetapan harga (opsional)..."
            />
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
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}