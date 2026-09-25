import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface DetailSampahItem {
  jenis_sampah: string;
  perkiraan_berat: number;
  satuan: string;
}

export interface JadwalPenjemputan {
  tanggal_penjemputan: string;
  waktu_penjemputan: string;
  status_jadwal: string;
}

export interface PengajuanTerbaru {
  pengajuan_id: number;
  tanggal_pengajuan: string;
  alamat_penjemputan: string;
  perkiraan_total_berat: number;
  status_pengajuan: string;
  status_validasi: string | null;
  created_at: string;
  jadwal: JadwalPenjemputan | null;
  detail_sampah: DetailSampahItem[];
}

export interface DashboardData {
  total_setoran: number;
  total_berat_sampah: number;
  total_poin_aktif: number;
  penjemputan_aktif: number;
  setoran_menunggu_validasi: number;
  pengajuan_terbaru: PengajuanTerbaru[];
}

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  total_setoran: 0,
  total_berat_sampah: 0,
  total_poin_aktif: 0,
  penjemputan_aktif: 0,
  setoran_menunggu_validasi: 0,
  pengajuan_terbaru: [],
};

export async function fetchWargaDashboard(): Promise<DashboardData> {
  try {
    const url = `${getApiUrl()}/warga/dashboard`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard (${res.status})`);
    }

    const json = await res.json();
    return json.data || DEFAULT_DASHBOARD_DATA;
  } catch (err) {
    console.warn('Error fetching warga dashboard:', err);
    return DEFAULT_DASHBOARD_DATA;
  }
}
