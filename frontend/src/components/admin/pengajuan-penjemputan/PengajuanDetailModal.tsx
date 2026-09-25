'use client';
import React from 'react';
import { X, MapPin, Phone, FileText, User as UserIcon, HardHat } from 'lucide-react';
import WasteIcon from '@/components/common/WasteIcon';
import { PengajuanPenjemputan } from '@/services/adminPengajuanService';
interface PengajuanDetailModalProps {
  isOpen: boolean;
  item: PengajuanPenjemputan | null;
  onClose: () => void;
  onSchedule: () => void;
}
export default function PengajuanDetailModal({ isOpen, item, onClose, onSchedule }: PengajuanDetailModalProps) {
  if (!isOpen || !item) return null;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const statusBadgeClass: Record<string, string> = {
    diajukan: 'text-[#2563eb] bg-[#eff6ff] border-[#dbeafe]',
    dijadwalkan: 'text-[#2563eb] bg-[#eff6ff] border-[#dbeafe]',
    diproses: 'text-[#d97706] bg-[#fef3c7] border-[#fde68a]',
    selesai: 'text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0]',
    dibatalkan: 'text-[#dc2626] bg-[#fef2f2] border-[#fecaca]',
    ditolak: 'text-[#dc2626] bg-[#fef2f2] border-[#fecaca]',
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Detail Pengajuan Penjemputan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5 text-[13.5px]">
          {/* Pengajuan Info Card */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <span className="text-xs text-gray-500 font-medium">Tanggal Pengajuan</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {formatDate(item.tanggal_pengajuan)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">Estimasi Total Berat</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {item.perkiraan_total_berat} kg
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Status Pengajuan</span>
              <span className={`inline-block px-3.5 py-1 rounded-full text-[12px] font-semibold border ${statusBadgeClass[item.status_pengajuan] || 'text-gray-600 bg-gray-100 border-gray-200'}`}>{item.status_pengajuan}</span>
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
                  {item.warga?.nama_warga || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Nomor Telepon:</span>
                <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  {item.warga?.no_telepon || '-'}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-400">Alamat Lengkap:</span>
              <p className="font-medium text-gray-700 text-xs mt-0.5 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{item.warga?.alamat || '-'}</span>
              </p>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-400">Alamat Penjemputan:</span>
              <p className="font-medium text-gray-700 text-xs mt-0.5 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{item.alamat_penjemputan}</span>
              </p>
            </div>
          </div>

          {/* Petugas Info */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
              <HardHat className="h-4 w-4 text-[#16a34a]" />
              <span>Informasi Petugas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Nama Petugas:</span>
                <p className="font-semibold text-gray-800 text-sm">
                  {item.jadwalPenjemputan?.petugas?.nama_petugas || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Nomor Telepon:</span>
                <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  {item.jadwalPenjemputan?.petugas?.no_telepon || '-'}
                </p>
              </div>
            </div>
          </div>

          {item.detailPengajuanSampah && item.detailPengajuanSampah.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#16a34a]" />
                  <span>Rincian Jenis Sampah</span>
                </h4>
                <span className="text-xs text-gray-500">
                  Est. Total: {item.perkiraan_total_berat} kg
                </span>
              </div>
              <div className="space-y-2">
                {item.detailPengajuanSampah.map((detail) => (
                  <div
                    key={detail.detail_pengajuan_id}
                    className="flex items-center justify-between p-3 rounded-lg sm:rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <WasteIcon type={detail.jenis_sampah?.nama_jenis_sampah || 'Sampah'} size={18} />
                      <div>
                        <span className="font-semibold text-gray-800">{detail.jenis_sampah?.nama_jenis_sampah || '-'}</span>
                        <p className="text-[11px] text-gray-400">{detail.jenis_sampah?.satuan || 'kg'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{detail.perkiraan_berat} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {item.catatan && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg sm:rounded-xl text-xs text-blue-900">
              <span className="font-bold block mb-0.5">Catatan Pengajuan:</span>
              <p>{item.catatan}</p>
            </div>
          )}
          {item.jadwalPenjemputan && (
            <div className="p-3 bg-green-50/70 border border-green-100 rounded-lg sm:rounded-xl text-xs text-green-900 space-y-1">
              <span className="font-bold block mb-0.5">Informasi Jadwal:</span>
              <p><span className="font-medium">Petugas:</span> {item.jadwalPenjemputan.petugas?.nama_petugas || '-'}</p>
              <p><span className="font-medium">Tanggal Penjemputan:</span> {new Date(item.jadwalPenjemputan.tanggal_penjemputan).toLocaleDateString('id-ID')}</p>
              <p><span className="font-medium">Waktu Penjemputan:</span> {item.jadwalPenjemputan.waktu_penjemputan}</p>
              {item.jadwalPenjemputan.catatan && (<p><span className="font-medium">Catatan Jadwal:</span> {item.jadwalPenjemputan.catatan}</p>)}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          >
            Tutup
          </button>
          {item.status_pengajuan === 'diajukan' && (<button type="button" onClick={onSchedule} className="px-5 py-2 bg-yellow-600 text-white rounded-lg sm:rounded-xl text-xs font-bold hover:bg-yellow-700 transition-colors">Jadwalkan Penjemputan</button>)}
        </div>
      </div>
    </div>
  );
}
