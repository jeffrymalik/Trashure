'use client';

import React from 'react';
import { X, Edit3, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { JenisSampahItem } from './ModalTambahEdit';

interface ModalDetailProps {
  isOpen: boolean;
  item: JenisSampahItem | null;
  onClose: () => void;
  onEdit: (item: JenisSampahItem) => void;
}

export default function ModalDetail({
  isOpen,
  item,
  onClose,
  onEdit,
}: ModalDetailProps) {
  if (!isOpen || !item) return null;

  const isAktif = item.status === 'aktif';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-[17px] font-bold text-gray-900">Detail Jenis Sampah</h3>
            <p className="text-xs text-gray-400">
              Informasi master data jenis sampah
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

        <div className="p-6 space-y-5 text-[13.5px]">
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 truncate">
              {item.nama_jenis_sampah}
            </h4>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isAktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isAktif ? 'Aktif' : 'Nonaktif'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-gray-700 border border-gray-200">
                Satuan: {item.satuan}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-gray-400" />
                Satuan Penimbangan
              </span>
              <span className="font-semibold text-gray-800">{item.satuan}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                Status Ketersediaan
              </span>
              <span className={`font-semibold ${isAktif ? 'text-green-700' : 'text-gray-500'}`}>
                {isAktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {item.keterangan && (
              <div className="pt-1">
                <span className="text-gray-400 flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Keterangan:
                </span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed text-xs">
                  {item.keterangan}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-lg sm:rounded-xl transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Jenis Sampah
          </button>
        </div>
      </div>
    </div>
  );
}