'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/layout/header';
import PengepulFilter from '@/components/admin/pengepul/PengepulFilter';
import PengepulTable from '@/components/admin/pengepul/PengepulTable';
import PengepulFormModal from '@/components/admin/pengepul/PengepulFormModal';
import PengepulDetailModal from '@/components/admin/pengepul/PengepulDetailModal';
import PengepulDeleteModal from '@/components/admin/pengepul/PengepulDeleteModal';
import { FilterState, PengepulFormData, PengepulItem, StatusUser } from '@/types/pengepul';
import {
  getPengepulFromDB,
  createPengepulInDB,
  updatePengepulInDB,
  deletePengepulFromDB,
} from '@/services/pengepulService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { terjemahkanErrorPengepul } from '@/services/pengepulService';

const STATUS_OPTIONS = ['aktif', 'nonaktif'];

export default function PengepulPage() {
  const [items, setItems] = useState<PengepulItem[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
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
  const [selectedItem, setSelectedItem] = useState<PengepulItem | null>(null);

  // Flash message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load data from Database via API (server-side pagination + filter)
  const loadData = useCallback(async (page: number, filterState: FilterState) => {
    setIsLoading(true);
    try {
      const res = await getPengepulFromDB({
        search: filterState.search || undefined,
        status: filterState.status || undefined,
        page,
        per_page: 10,
      });
      setItems(res.items);
      setTotalData(res.pagination.total);
      setCurrentPage(res.pagination.current_page);
    } catch (err: unknown) {
      console.error('Error fetching pengepul data:', err);
      const message = err instanceof Error ? terjemahkanErrorPengepul(err.message, 'Gagal memuat data pengepul.') : 'Gagal memuat data pengepul.';
      setMessage({ type: 'error', text: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search then reload
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1, filter);
    }, 400);
    return () => clearTimeout(timer);
  }, [filter, loadData]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenEdit = (item: PengepulItem) => {
    setSelectedItem(item);
    setFormMode('edit');
    setIsFormModalOpen(true);
    setMessage(null);
  };

  const handleOpenView = (item: PengepulItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (item: PengepulItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Save Item to Database (Create or Update)
  const handleSaveItem = async (data: {
    id?: number | string;
    payload: PengepulFormData;
    status?: StatusUser;
  }) => {
    setIsSubmitting(true);
    try {
      const payload = data.payload;
      if (formMode === 'create') {
        await createPengepulInDB(payload);
        setMessage({ type: 'success', text: `Pengepul "${payload.namaPengepul}" beserta akun pengguna berhasil ditambahkan.` });
      } else if (formMode === 'edit' && data.id) {
        await updatePengepulInDB(data.id, {
          username: payload.username,
          email: payload.email,
          namaPengepul: payload.namaPengepul,
          alamat: payload.alamat,
          noTelepon: payload.noTelepon,
          ...(payload.password ? { password: payload.password } : {}),
          ...(data.status ? { status: data.status } : {}),
        });
        setMessage({ type: 'success', text: `Perubahan pengepul "${payload.namaPengepul}" berhasil diperbarui.` });
      }

      setIsFormModalOpen(false);
      setIsDetailModalOpen(false);
      await loadData(currentPage, filter);
    } catch (err: unknown) {
      console.error('Save error:', err);
      // Lempar ke modal agar notif salah tampil di dalam modal, bukan di halaman belakang
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete from Database
  const handleConfirmDelete = async (item: PengepulItem) => {
    try {
      await deletePengepulFromDB(item.id);
      setMessage({ type: 'success', text: `Data pengepul "${item.namaPengepul}" beserta akunnya berhasil dihapus.` });
      setIsDeleteModalOpen(false);
      const nextPage = items.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadData(nextPage, filter);
    } catch (err: unknown) {
      console.error('Delete error:', err);
      const message = err instanceof Error ? terjemahkanErrorPengepul(err.message, 'Gagal menghapus data pengepul.') : 'Gagal menghapus data pengepul.';
      setMessage({ type: 'error', text: message });
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Header with Breadcrumbs */}
      <AdminHeader
        title="Data Pengepul"
        subtitle="Kelola data pengepul bank sampah. Akun pengguna dibuat otomatis saat pengepul ditambahkan."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Pengguna' },
          { label: 'Pengepul' },
        ]}
      />

      {/* Filter & Action Section */}
      <PengepulFilter
        filter={filter}
        onFilterChange={(f) => {
          setFilter(f);
          setCurrentPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
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
          Total {totalData} pengepul
        </p>
      </div>

      {/* Table Section */}
      <PengepulTable
        items={items}
        totalData={totalData}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={(page) => loadData(page, filter)}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Modals */}
      <PengepulFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveItem}
        initialItem={selectedItem}
        mode={formMode}
        isSubmitting={isSubmitting}
      />

      <PengepulDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItem}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEdit}
      />

      <PengepulDeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedItem}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}