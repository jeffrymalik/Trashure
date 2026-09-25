'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface PengajuanFilterProps {
  filter: {
    search: string;
    status: string;
    tanggalDari: string;
    tanggalSampai: string;
  };
  onFilterChange: (filter: { search: string; status: string; tanggalDari: string; tanggalSampai: string }) => void;
}

export default function PengajuanFilter({
  filter,
  onFilterChange,
}: PengajuanFilterProps) {
  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'diajukan', label: 'Diajukan' },
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama warga atau alamat..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filter.search}
            onChange={(e) =>
              onFilterChange({ ...filter, search: e.target.value })
            }
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filter.status}
            onChange={(e) =>
              onFilterChange({ ...filter, status: e.target.value })
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Range Tanggal Pengajuan */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xs font-medium text-gray-500">Dari</span>
            <input
              type="date"
              value={filter.tanggalDari}
              max={filter.tanggalSampai || undefined}
              onChange={(e) =>
                onFilterChange({ ...filter, tanggalDari: e.target.value })
              }
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-xs font-medium text-gray-500">Sampai</span>
            <input
              type="date"
              value={filter.tanggalSampai}
              min={filter.tanggalDari || undefined}
              onChange={(e) =>
                onFilterChange({ ...filter, tanggalSampai: e.target.value })
              }
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {(filter.search || filter.status || filter.tanggalDari || filter.tanggalSampai) && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', status: '', tanggalDari: '', tanggalSampai: '' })}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
