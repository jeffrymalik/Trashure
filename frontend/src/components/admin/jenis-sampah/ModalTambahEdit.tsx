'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export interface JenisSampahItem {
  jenis_sampah_id?: number;
  nama_jenis_sampah: string;
  satuan: string;
  keterangan?: string;
  status: string;
  harga_aktif?: {
    harga_id?: number;
    harga_per_satuan: string | number;
    berlaku_mulai?: string;
  };
}

interface ModalTambahEditProps {
  isOpen: boolean;
  isEdit?: boolean;
  initialData?: JenisSampahItem | null;
  onClose: () => void;
  onSubmit: (formData: {
    nama_jenis_sampah: string;
    satuan: string;
    keterangan?: string;
    status: string;
  }) => Promise<void>;
}

const UNITS = ['Kg', 'Pcs', 'Gram', 'Liter'];

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10';

export default function ModalTambahEdit({
  isOpen,
  isEdit = false,
  initialData,
  onClose,
  onSubmit,
}: ModalTambahEditProps) {
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('Kg');
  const [status, setStatus] = useState('aktif');
  const [keterangan, setKeterangan] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isEdit) {
      setNama(initialData.nama_jenis_sampah || '');
      setSatuan(initialData.satuan || 'Kg');
      setStatus(initialData.status || 'aktif');
      setKeterangan(initialData.keterangan || '');
    } else {
      setNama('');
      setSatuan('Kg');
      setStatus('aktif');
      setKeterangan('');
    }
    setError(null);
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nama.trim()) {
      setError('Nama jenis sampah tidak boleh kosong.');
      return;
    }
    if (!satuan) {
      setError('Satuan sampah wajib dipilih.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        nama_jenis_sampah: nama.trim(),
        satuan,
        keterangan: keterangan.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">
              {isEdit ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah'}
            </h3>
            <p className="text-xs text-gray-400">
              {isEdit
                ? 'Perbarui master data jenis sampah, satuan, status, dan keterangan.'
                : 'Tambahkan data master jenis sampah baru ke dalam sistem.'}
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

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 text-[13.5px] max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Jenis Sampah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={inputClass}
                placeholder="Contoh: Botol Plastik, Kardus, Besi"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className={`${inputClass} bg-white cursor-pointer`}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${inputClass} bg-white cursor-pointer`}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Keterangan / Deskripsi
              </label>
              <textarea
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Deskripsi singkat jenis sampah (misal: kondisi bersih, jenis bahan)..."
              />
            </div>
          </div>

          <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Jenis Sampah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}