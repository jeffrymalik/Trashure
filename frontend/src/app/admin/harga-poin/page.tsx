'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import HargaPoinFilter from '@/components/admin/harga-poin/HargaPoinFilter';
import HargaPoinTable from '@/components/admin/harga-poin/HargaPoinTable';
import HargaPoinFormModal from '@/components/admin/harga-poin/HargaPoinFormModal';
import HargaPoinDetailModal from '@/components/admin/harga-poin/HargaPoinDetailModal';
import HargaPoinDeleteModal from '@/components/admin/harga-poin/HargaPoinDeleteModal';
import { FilterState, HargaPoinItem, JenisSampahDB } from '@/types/harga-poin';
import {
  getHargaSampahFromDB,
  getJenisSampahFromDB,
  createHargaSampahInDB,
  updateHargaSampahInDB,
  deleteHargaSampahFromDB,
} from '@/services/hargaPoinService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function HargaPoinPage() {
  // Pure dynamic data state from Database (no dummy data)
  const [items, setItems] = useState<HargaPoinItem[]>([]);
  const [jenisSampahDB, setJenisSampahDB] = useState<JenisSampahDB[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    jenisSampah: '',
    kategori: '',
    satuan: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HargaPoinItem | null>(null);

  // Flash message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load data dynamically from Database via API
  const loadDatabaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [hargaRes, jenisRes] = await Promise.all([
        getHargaSampahFromDB(),
        getJenisSampahFromDB(),
      ]);
      setItems(hargaRes.items);
      setJenisSampahDB(jenisRes);
    } catch (err: any) {
      console.error('Error fetching database data:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal terhubung ke database backend.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Dropdown options derived dynamically from database items
  const jenisOptions = useMemo(() => {
    const fromDB = jenisSampahDB.map((j) => j.nama);
    const fromItems = items.map((i) => i.namaJenisSampah);
    return Array.from(new Set([...fromDB, ...fromItems])).sort();
  }, [jenisSampahDB, items]);

  const kategoriOptions = useMemo(() => {
    const fromDB = jenisSampahDB.map((j) => j.kategori);
    const fromItems = items.map((i) => i.kategori);
    return Array.from(new Set([...fromDB, ...fromItems])).sort();
  }, [jenisSampahDB, items]);

  const satuanOptions = useMemo(() => {
    const fromDB = jenisSampahDB.map((j) => j.satuan);
    const fromItems = items.map((i) => i.satuan);
    return Array.from(new Set([...fromDB, ...fromItems])).sort();
  }, [jenisSampahDB, items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchName = item.namaJenisSampah.toLowerCase().includes(query);
        const matchCat = item.kategori.toLowerCase().includes(query);
        if (!matchName && !matchCat) return false;
      }

      // Jenis Sampah
      if (filter.jenisSampah && item.namaJenisSampah !== filter.jenisSampah) {
        return false;
      }

      // Kategori
      if (filter.kategori && item.kategori !== filter.kategori) {
        return false;
      }

      // Satuan
      if (filter.satuan && item.satuan !== filter.satuan) {
        return false;
      }

      return true;
    });
  }, [items, filter]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // ID jenis sampah yang sudah punya tarif (tidak boleh dipilih lagi saat tambah)
  const usedJenisSampahIds = useMemo(() => {
    const ids = new Set<number>();
    items.forEach((i) => {
      if (i.jenisSampahId) ids.add(i.jenisSampahId);
    });
    if (formMode === 'edit' && selectedItem?.jenisSampahId) {
      ids.delete(selectedItem.jenisSampahId);
    }
    return Array.from(ids);
  }, [items, formMode, selectedItem]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenEdit = (item: HargaPoinItem) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenView = (item: HargaPoinItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (item: HargaPoinItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Save Item to Database (Create or Update)
  const handleSaveItem = async (formData: Partial<HargaPoinItem>) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      if (formMode === 'create') {
        if (!formData.jenisSampahId) {
          throw new Error('Jenis sampah wajib dipilih dari database.');
        }

        await createHargaSampahInDB({
          jenis_sampah_id: formData.jenisSampahId,
          harga_per_satuan: Number(formData.hargaPerSatuan) || 0,
          nilai_poin_per_satuan: Number(formData.nilaiPoinPerSatuan) || 0,
          berlaku_mulai: formData.berlakuMulai || new Date().toISOString().split('T')[0],
          berlaku_selesai: formData.berlakuSelesai || null,
          status: formData.status || 'aktif',
        });

        setMessage({ type: 'success', text: `Tarif untuk "${formData.namaJenisSampah}" berhasil disimpan ke database.` });
      } else if (formMode === 'edit' && selectedItem) {
        await updateHargaSampahInDB(selectedItem.id, {
          harga_per_satuan: Number(formData.hargaPerSatuan) || 0,
          nilai_poin_per_satuan: Number(formData.nilaiPoinPerSatuan) || 0,
          berlaku_mulai: formData.berlakuMulai || new Date().toISOString().split('T')[0],
          berlaku_selesai: formData.berlakuSelesai || null,
          status: formData.status || 'aktif',
        });

        setMessage({ type: 'success', text: `Perubahan tarif "${selectedItem.namaJenisSampah}" berhasil diperbarui.` });
      }

      // Refresh live data directly from Database
      await loadDatabaseData();
      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data ke database.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete from Database
  const handleConfirmDelete = async (item: HargaPoinItem) => {
    try {
      await deleteHargaSampahFromDB(item.id);
      setMessage({ type: 'success', text: `Data tarif "${item.namaJenisSampah}" berhasil dihapus dari database.` });
      setIsDeleteModalOpen(false);
      await loadDatabaseData();
    } catch (err: any) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data dari database.' });
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Header with Breadcrumbs matching Screenshot */}
      <AdminHeader
        title="Harga & Poin"
        subtitle="Kelola harga per jenis sampah dan nilai poin yang akan didapatkan warga."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Master Data' },
          { label: 'Harga & Poin' },
        ]}
      />

      {/* Filter & Action Section */}
      <HargaPoinFilter
        filter={filter}
        onFilterChange={setFilter}
        jenisOptions={jenisOptions}
        kategoriOptions={kategoriOptions}
        satuanOptions={satuanOptions}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* Flash Message */}
      {message && (
        <div className={`mb-4 p-3.5 rounded-lg sm:rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Table Section with Live Database State */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          Total {filteredItems.length} data harga & poin
        </p>
      </div>
      <HargaPoinTable
        items={paginatedItems}
        totalData={filteredItems.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Modals with Live Database Options */}
      <HargaPoinFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={selectedItem}
        mode={formMode}
        availableJenisSampah={jenisSampahDB}
        usedJenisSampahIds={usedJenisSampahIds}
        isSubmitting={isSubmitting}
      />

      <HargaPoinDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItem}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <HargaPoinDeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedItem}
        isLoading={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
