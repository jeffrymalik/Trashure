'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import VoucherFilter from '@/components/admin/voucher/VoucherFilter';
import VoucherTable from '@/components/admin/voucher/VoucherTable';
import VoucherFormModal from '@/components/admin/voucher/VoucherFormModal';
import VoucherDetailModal from '@/components/admin/voucher/VoucherDetailModal';
import VoucherDeleteModal from '@/components/admin/voucher/VoucherDeleteModal';
import { FilterState, StatusVoucher, VoucherItem } from '@/types/voucher';
import {
  getVouchersFromDB,
  createVoucherInDB,
  updateVoucherInDB,
  deleteVoucherFromDB,
  labelStatus,
} from '@/services/voucherService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function VoucherPage() {
  // Pure dynamic data state from Database (no dummy data)
  const [items, setItems] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VoucherItem | null>(null);

  // Flash message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load data dynamically from Database via API
  const loadDatabaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getVouchersFromDB();
      setItems(res.items);
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
  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: string[] = [];
    [...new Set(items.map((i) => i.status))].forEach((s) => {
      const label = labelStatus(s as StatusVoucher);
      if (!seen.has(label)) {
        seen.add(label);
        opts.push(label);
      }
    });
    return opts.sort();
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchName = item.namaVoucher.toLowerCase().includes(query);
        const matchDesc = (item.deskripsi || '').toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Status
      if (filter.status) {
        const statusLabel = labelStatus(item.status);
        if (statusLabel !== filter.status) return false;
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

  // Handlers
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenEdit = (item: VoucherItem) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenView = (item: VoucherItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (item: VoucherItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Save Item to Database (Create or Update)
  const handleSaveItem = async (formData: Partial<VoucherItem>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        namaVoucher: formData.namaVoucher || '',
        deskripsi: formData.deskripsi || '',
        poinDibutuhkan: Number(formData.poinDibutuhkan) || 0,
        jumlahTersedia: Number(formData.jumlahTersedia) || 0,
        status: (formData.status || 'tersedia') as StatusVoucher,
      };

      if (formMode === 'create') {
        await createVoucherInDB(payload);
        setMessage({ type: 'success', text: `Voucher "${payload.namaVoucher}" berhasil disimpan ke database.` });
      } else if (formMode === 'edit' && selectedItem) {
        await updateVoucherInDB(selectedItem.id, payload);
        setMessage({ type: 'success', text: `Perubahan voucher "${payload.namaVoucher}" berhasil diperbarui.` });
      }

      // Refresh live data directly from Database
      await loadDatabaseData();
      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error('Save error:', err);
      // Lempar ke modal agar notif tampil di dalam modal, bukan di halaman belakang
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete from Database
  const handleConfirmDelete = async (item: VoucherItem) => {
    try {
      await deleteVoucherFromDB(item.id);
      setMessage({ type: 'success', text: `Data voucher "${item.namaVoucher}" berhasil dihapus dari database.` });
      setIsDeleteModalOpen(false);
      await loadDatabaseData();
    } catch (err: any) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data dari database.' });
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Header with Breadcrumbs */}
      <AdminHeader
        title="Voucher"
        subtitle="Kelola voucher penukaran poin beserta jumlah poin, stok, dan status ketersediaannya."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Master Data' },
          { label: 'Voucher' },
        ]}
      />

      {/* Filter & Action Section */}
      <VoucherFilter
        filter={filter}
        onFilterChange={setFilter}
        statusOptions={statusOptions}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* Flash Message (diatas tabel) */}
      {message && (
        <div className={`mb-4 p-3.5 rounded-lg sm:rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span className="text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Summary Total Count */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs font-semibold text-gray-600">
          Total {filteredItems.length} voucher
        </p>
      </div>

      {/* Table Section with Live Database State */}
      <VoucherTable
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

      {/* Modals */}
      <VoucherFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={selectedItem}
        mode={formMode}
        isSubmitting={isSubmitting}
      />

      <VoucherDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItem}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <VoucherDeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedItem}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}