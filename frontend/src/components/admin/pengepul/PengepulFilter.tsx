'use client';

import React from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { FilterState } from '@/types/pengepul';

interface PengepulFilterProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  statusOptions: string[];
  onOpenCreateModal: () => void;
}

export default function PengepulFilter({
  filter,
  onFilterChange,
  statusOptions,
  onOpenCreateModal,
}: PengepulFilterProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm mb-6">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) =>
              onFilterChange({ ...filter, search: e.target.value })
            }
            placeholder="Cari nama pengepul atau no. telepon..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-wrap items-end gap-3.5">

          {/* Status Dropdown */}
          <div className="min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                value={filter.status}
                onChange={(e) =>
                  onFilterChange({ ...filter, status: e.target.value })
                }
                className="w-full h-11 appearance-none bg-white border border-gray-200 rounded-xl px-3.5 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 focus:border-[#16a34a] cursor-pointer transition-all"
              >
                <option value="">Semua Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Tambah Pengepul Button — di sebelah Status */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="h-11 px-5 rounded-xl bg-[#057a44] hover:bg-[#04683a] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span>Tambah Pengepul</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}