'use client';
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PengajuanPenjemputan, Petugas, jadwalkanPenjemputan } from '@/services/adminPengajuanService';
interface JadwalModalProps {
  isOpen: boolean;
  item: PengajuanPenjemputan | null;
  petugasList: Petugas[];
  isLoading: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
export default function JadwalModal({ isOpen, item, petugasList, isLoading, onClose, onSuccess }: JadwalModalProps) {
  const [formData, setFormData] = useState({ petugas_id: '', tanggal_penjemputan: '', waktu_penjemputan: '', catatan: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setFormData({ petugas_id: '', tanggal_penjemputan: today.toISOString().split('T')[0], waktu_penjemputan: '09:00', catatan: '' });
      setMessage(null);
    }
  }, [isOpen]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petugas_id || !formData.tanggal_penjemputan || !formData.waktu_penjemputan) {
      setMessage({ type: 'error', text: 'Petugas, tanggal, dan waktu penjemputan harus diisi.' });
      return;
    }
    if (formData.waktu_penjemputan > '17:00') {
      setMessage({ type: 'error', text: 'Waktu penjemputan maksimal jam 17:00.' });
      return;
    }
    if (!item) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await jadwalkanPenjemputan(item.pengajuan_id, {
        petugas_id: parseInt(formData.petugas_id),
        tanggal_penjemputan: formData.tanggal_penjemputan,
        waktu_penjemputan: formData.waktu_penjemputan,
        catatan: formData.catatan || undefined,
      });
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Penjemputan berhasil dijadwalkan.' });
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Gagal menjadwalkan penjemputan.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan saat menjadwalkan penjemputan.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen || !item) return null;
  const today = new Date();
  const minDateString = today.toISOString().split('T')[0];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Jadwalkan Penjemputan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-[13.5px] max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 space-y-1 text-[13px]">
              <p className="text-gray-700"><span className="text-xs text-gray-500 font-medium">Warga: </span><span className="font-bold text-gray-900">{item.warga?.nama_warga}</span></p>
              <p className="text-gray-700"><span className="text-xs text-gray-500 font-medium">Alamat: </span><span className="font-medium">{item.alamat_penjemputan}</span></p>
              {item.catatan && (
                <p className="text-gray-700"><span className="text-xs text-gray-500 font-medium">Catatan Warga: </span><span className="font-medium text-amber-600">{item.catatan}</span></p>
              )}
            </div>
            {message && (
              <div className={`p-3.5 rounded-lg flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Petugas <span className="text-red-600">*</span></label>
              <select name="petugas_id" value={formData.petugas_id} onChange={handleInputChange} disabled={isSubmitting || isLoading} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" required>
                <option value="">-- Pilih Petugas --</option>
                {petugasList.map((petugas) => (<option key={petugas.petugas_id} value={petugas.petugas_id}>{petugas.nama_petugas} ({petugas.no_telepon})</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penjemputan <span className="text-red-600">*</span></label>
              <input type="date" name="tanggal_penjemputan" value={formData.tanggal_penjemputan} onChange={handleInputChange} min={minDateString} disabled={isSubmitting} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Penjemputan <span className="text-red-600">*</span></label>
              <input type="time" name="waktu_penjemputan" value={formData.waktu_penjemputan} onChange={handleInputChange} min="08:00" max="17:00" disabled={isSubmitting} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" required />
              <p className="text-xs text-gray-500 mt-1">Jam operasional: 08:00 - 17:00</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
              <textarea name="catatan" value={formData.catatan} onChange={handleInputChange} disabled={isSubmitting} placeholder="Contoh: Harap bawa karung tambahan, akses dari pintu samping, dll." rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 resize-none" />
            </div>
          <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#16a34a] text-white rounded-lg sm:rounded-xl text-xs font-bold hover:bg-[#15803d] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</>) : ('Simpan Jadwal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
