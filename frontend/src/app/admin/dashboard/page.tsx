'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/layout/header';
import StatsCards from '@/components/admin/StatsCards';
import { SetoranChart, KomposisiChart } from '@/components/admin/Charts';
import { PengajuanTable, SetoranValidasiList } from '@/components/admin/DashboardTables';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

interface GrafikItem {
  name: string;
  value: number;
}

interface KomposisiItem {
  name: string;
  value: number;
  percentage: string;
}

interface PengajuanRow {
  no: string;
  warga: string;
  tanggal_ajukan: string;
  jadwal: string;
  petugas: string;
  status: string;
  status_color: string;
}

interface SetoranRow {
  nama: string;
  tanggal: string;
  berat: string;
  jenis: string;
  status: string;
  status_color: string;
}

export default function DashboardPage() {
  const [grafikSetoran, setGrafikSetoran] = useState<GrafikItem[]>([]);
  const [komposisi, setKomposisi] = useState<KomposisiItem[]>([]);
  const [totalKomposisi, setTotalKomposisi] = useState(0);
  const [pengajuan, setPengajuan] = useState<PengajuanRow[]>([]);
  const [setoranMenunggu, setSetoranMenunggu] = useState<SetoranRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const headers: HeadersInit = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
        if (res.ok) {
          const json = await res.json();
          const d = json.data;
          setGrafikSetoran(d.grafik_setoran || []);
          setKomposisi(d.komposisi_sampah || []);
          setTotalKomposisi(d.total_komposisi || 0);
          setPengajuan(d.pengajuan_terbaru || []);
          setSetoranMenunggu(d.setoran_menunggu || []);
        }
      } catch {
        // ignore
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full">
      <AdminHeader
        title="Dashboard Admin"
        subtitle="Ringkasan aktivitas pengelolaan bank sampah secara keseluruhan."
      />

      <StatsCards />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <SetoranChart data={grafikSetoran} />
        <KomposisiChart data={komposisi} total={totalKomposisi} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <PengajuanTable data={pengajuan} />
        <SetoranValidasiList data={setoranMenunggu} />
      </div>
    </div>
  );
}
