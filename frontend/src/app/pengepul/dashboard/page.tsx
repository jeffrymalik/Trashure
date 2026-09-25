'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/layout/header';
import { Package, ShoppingBag, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StokSampah {
  stok_id: number;
  jumlah_stok: number;
  satuan: string;
  jenis_sampah: {
    jenis_sampah_id: number;
    nama_jenis_sampah: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const ADMIN_WHATSAPP = '6288213448685'; // Nomor WhatsApp admin

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

export default function PengepulDashboardPage() {
  const [stokList, setStokList] = useState<StokSampah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStok();
  }, []);

  const fetchStok = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/pengepul/stok`, { headers });
      const result = await response.json();
      if (result?.data && Array.isArray(result.data)) {
        setStokList(result.data);
      }
    } catch {
      setStokList([]);
    } finally {
      setLoading(false);
    }
  };

  // Hitung statistik
  const totalStok = stokList.reduce((sum, s) => sum + Number(s.jumlah_stok || 0), 0);
  const jenisSampahCount = stokList.length;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleHubungiAdmin = () => {
    const pesan = encodeURIComponent(
      'Halo Admin Trashure, saya pengepul. Saya ingin menanyakan ketersediaan stok sampah. Terima kasih.'
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${pesan}`, '_blank');
  };

  return (
    <div className="w-full pb-12">
      <AdminHeader
        title="Dashboard Pengepul"
        subtitle="Ringkasan stok sampah yang tersedia di bank sampah."
      />

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Total Stok Sampah</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">
              {loading ? '...' : `${totalStok.toFixed(1).replace('.', ',')} kg`}
            </p>
            <p className="text-[11px] text-gray-400">Keseluruhan</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-lg sm:rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Jenis Sampah</p>
            <p className="text-lg sm:text-xl lg:text-[20px] font-extrabold text-gray-900 leading-none mt-1">
              {loading ? '...' : jenisSampahCount}
            </p>
            <p className="text-[11px] text-gray-400">Jenis Tersedia</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fffbeb] text-[#d97706] flex-shrink-0">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500">Hubungi Admin</p>
            <p className="text-[20px] font-extrabold text-gray-900 leading-none mt-1">WA</p>
            <p className="text-[11px] text-gray-400">Chat Langsung</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href="/pengepul/stok-sampah"
          className="flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb] flex-shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Lihat Stok Sampah</p>
              <p className="text-[11px] text-gray-500">Detail stok dan harga per jenis</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>

        <button
          onClick={handleHubungiAdmin}
          className="flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] flex-shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Hubungi Admin</p>
              <p className="text-[11px] text-gray-500">Tanyakan stok via WhatsApp</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Preview Stok Teratas */}
      {!loading && stokList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-900">Stok Sampah Tersedia</h3>
            <p className="text-[11px] text-gray-500">Jenis sampah yang tersedia di bank sampah</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-[#fafafa]/80 text-[12px] font-bold text-gray-600">
                  <th className="px-5 py-3">Jenis Sampah</th>
                  <th className="px-5 py-3 text-right">Stok Tersedia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stokList.slice(0, 5).map(s => (
                  <tr key={s.stok_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">
                      {s.jenis_sampah?.nama_jenis_sampah || '-'}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 text-right">
                      {Number(s.jumlah_stok).toFixed(1).replace('.', ',')} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stokList.length > 5 && (
            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <Link href="/pengepul/stok-sampah" className="text-[12px] font-semibold text-[#16a34a] hover:underline">
                Lihat Semua →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
