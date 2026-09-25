'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import PengajuanFilter from '@/components/admin/pengajuan-penjemputan/PengajuanFilter';
import PengajuanTable from '@/components/admin/pengajuan-penjemputan/PengajuanTable';
import PengajuanDetailModal from '@/components/admin/pengajuan-penjemputan/PengajuanDetailModal';
import JadwalModal from '@/components/admin/pengajuan-penjemputan/JadwalModal';
import { PengajuanPenjemputan, Petugas, fetchPengajuanList, fetchPetugasList } from '@/services/adminPengajuanService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function PengajuanPenjemputanPage() {
  const [items, setItems] = useState<PengajuanPenjemputan[]>([]);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingPetugas, setIsLoadingPetugas] = useState<boolean>(false);

  const [filter, setFilter] = useState({ search: '', status: '', tanggalDari: '', tanggalSampai: '' });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PengajuanPenjemputan | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPengajuanData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPengajuanList();
      setItems(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching pengajuan list:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal mengambil data pengajuan penjemputan.' });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPetugasData = useCallback(async () => {
    setIsLoadingPetugas(true);
    try {
      const data = await fetchPetugasList();
      setPetugasList(data);
    } catch (err: any) {
      console.error('Error fetching petugas list:', err);
    } finally {
      setIsLoadingPetugas(false);
    }
  }, []);

  useEffect(() => {
    loadPengajuanData();
    loadPetugasData();
  }, [loadPengajuanData, loadPetugasData]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchName = item.warga?.nama_warga.toLowerCase().includes(query) || false;
        const matchAddress = item.alamat_penjemputan.toLowerCase().includes(query) || false;
        if (!matchName && !matchAddress) return false;
      }

      if (filter.status && item.status_pengajuan !== filter.status) {
        return false;
      }

      // Filter rentang tanggal pengajuan (berdasarkan tanggal saja, abaikan jam)
      if (filter.tanggalDari || filter.tanggalSampai) {
        const tanggalItem = item.tanggal_pengajuan?.slice(0, 10);
        if (!tanggalItem) return false;
        if (filter.tanggalDari && tanggalItem < filter.tanggalDari) return false;
        if (filter.tanggalSampai && tanggalItem > filter.tanggalSampai) return false;
      }

      return true;
    });
  }, [items, filter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleOpenView = (item: PengajuanPenjemputan) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenSchedule = (item: PengajuanPenjemputan) => {
    setSelectedItem(item);
    setIsJadwalModalOpen(true);
  };

  const handleScheduleSuccess = async () => {
    const data = await loadPengajuanData();
    const fresh = data.find((d) => d.pengajuan_id === selectedItem?.pengajuan_id);
    if (fresh) setSelectedItem(fresh);
    setMessage({ type: 'success', text: 'Penjemputan berhasil dijadwalkan. Data akan diperbarui.' });
  };

  const handleOpenScheduleFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsJadwalModalOpen(true);
  };

  return (
    <div className="w-full pb-12">
      <AdminHeader
        title="Pengajuan Penjemputan"
        subtitle="Kelola semua pengajuan penjemputan sampah dari warga. Jadwalkan penjemputan dan pantau statusnya."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Transaksi' },
          { label: 'Pengajuan Penjemputan' },
        ]}
      />

      <PengajuanFilter
        filter={filter}
        onFilterChange={setFilter}
      />

      {message && (
        <div className={`mb-4 p-3.5 rounded-lg sm:rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">Total {filteredItems.length} data pengajuan penjemputan</p>
      </div>

      <PengajuanTable
        items={paginatedItems}
        totalData={filteredItems.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onView={handleOpenView}
        onSchedule={handleOpenSchedule}
      />

      <PengajuanDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItem}
        onClose={() => setIsDetailModalOpen(false)}
        onSchedule={handleOpenScheduleFromDetail}
      />

      <JadwalModal
        isOpen={isJadwalModalOpen}
        item={selectedItem}
        petugasList={petugasList}
        isLoading={isLoadingPetugas}
        onClose={() => setIsJadwalModalOpen(false)}
        onSuccess={handleScheduleSuccess}
      />
    </div>
  );
}
